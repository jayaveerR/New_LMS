
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { generateUploadUrl, generateViewUrl, deleteObject } = require('./utils/s3');
const axios = require('axios'); // Note: Added axios for easier Zoom API calls

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = process.env.PORT || 5000;

// Zoom Credentials
const ZOOM_ACCOUNT_ID = process.env.ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.CLIENT_SECRET;

/**
 * Zoom OAuth Header Helper
 */
const getZoomAuthHeader = () => {
    return Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
};

/**
 * Get Zoom Access Token using Server-to-Server OAuth
 */
const getZoomAccessToken = async () => {
    try {
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
            {},
            {
                headers: {
                    'Authorization': `Basic ${getZoomAuthHeader()}`
                }
            }
        );
        return response.data.access_token;
    } catch (err) {
        console.error('Zoom Auth Token Error:', err.response?.data || err.message);
        throw new Error('Failed to authenticate with Zoom');
    }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get authenticated Supabase client
const getAuthClient = (supabaseToken) => {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: { Authorization: `Bearer ${supabaseToken}` },
        },
    });
};

// JWT Helpers
const generateToken = (user, supabaseAccessToken) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            supabaseToken: supabaseAccessToken
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Auth token required' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        if (!decoded.supabaseToken) return res.status(401).json({ error: 'Legacy token detected. Please log out and back in.' });

        req.user = decoded;
        req.supabaseToken = decoded.supabaseToken;
        next();
    });
};

// Admin check middleware
const requireAdmin = async (req, res, next) => {
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .eq('role', 'admin')
            .single();

        if (error || !data) {
            console.warn(`[Auth] User ${req.user.id} denied admin access. (No admin role found in table)`);
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
};

const requireManager = async (req, res, next) => {
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (error || !['admin', 'manager'].includes(data?.role)) {
            console.warn(`[Auth] User ${req.user.id} denied manager access.`);
            return res.status(403).json({ error: 'Manager access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
};

const requireInstructor = async (req, res, next) => {
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .single();

        if (error || !['admin', 'instructor', 'manager'].includes(data?.role)) {
            console.warn(`[Auth] No instructor role for ${req.user.id}, checking ownership context...`);
            return res.status(403).json({ error: 'Instructor access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
};

// Error handler helper
const handleSupabaseError = (res, error, table = '') => {
    if (!error) return false;

    console.error(`Supabase error [${table}]:`, error);

    if (error.code === 'PGRST205') {
        // Table not found
        console.warn(`[Supabase] Table not found: ${table}.`);
        res.json([]);
        return true;
    }

    if (['PGRST301', 'PGRST302', 'PGRST303'].includes(error.code)) {
        res.status(403).json({ error: 'Permission denied by Row Level Security', code: error.code });
        return true;
    }

    res.status(500).json({ error: error.message || 'Internal server error' });
    return true;
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, fullName } = req.body;
    try {
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, avatar_url: avatarUrl },
            },
        });
        if (error) throw error;

        // Automatically store the profile in public.profiles just in case database trigger fails
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                avatar_url: avatarUrl,
                approval_status: 'pending'
            }).select().single();

            // Store default role
            await supabase.from('user_roles').upsert({
                user_id: data.user.id,
                role: 'student'
            });
        }

        // Generate custom JWT
        const token = generateToken(data.user, data.session?.access_token);

        res.json({
            user: data.user,
            session: {
                access_token: token,
                expires_in: 604800, // 7 days in seconds
                refresh_token: data.session?.refresh_token || null
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        // Generate custom JWT
        const token = generateToken(data.user, data.session?.access_token);

        const { data: profile } = await supabase.from('profiles').select('approval_status').eq('id', data.user.id).single();
        res.json({
            user: { ...data.user, approval_status: profile?.approval_status || 'pending' },
            session: {
                access_token: token,
                expires_in: 604800, // 7 days in seconds
                refresh_token: data.session?.refresh_token || null
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(401).json({ error: err.message });
    }
});

app.put('/api/admin/update-user-role', authenticateToken, requireAdmin, async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ error: 'userId and role are required' });

    try {
        // 1. Update/Upsert user role
        const { error: roleError } = await supabase
            .from('user_roles')
            .upsert(
                { user_id: userId, role: role, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,role' }
            );

        if (roleError) throw roleError;

        // Force single role — remove any other roles
        await supabase.from('user_roles').delete().eq('user_id', userId).neq('role', role);

        // 2. Auto-approve if role is admin or manager, otherwise keep existing status
        const shouldAutoApprove = ['admin', 'manager'].includes(role);
        if (shouldAutoApprove) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ approval_status: 'approved' })
                .eq('id', userId);

            if (profileError) {
                console.warn(`[Admin] Profile approval update failed for ${userId}:`, profileError.message);
            }
        }

        res.json({
            message: 'User role updated successfully',
            userId,
            role,
            status: shouldAutoApprove ? 'approved' : 'unchanged'
        });
    } catch (err) {
        console.error('Admin role update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin endpoint to block/reject user
app.put('/api/admin/update-user-status', authenticateToken, requireAdmin, async (req, res) => {
    const { userId, status } = req.body; // status: 'approved', 'rejected', 'suspended'
    if (!userId || !status) return res.status(400).json({ error: 'userId and status are required' });

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ approval_status: status })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: `User status updated to ${status}`, user: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/send-approval-email', authenticateToken, requireAdmin, async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        // Fetch profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!profile) throw new Error('Profile not found for this user ID');

        // Fetch role
        const { data: userRole } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
        const roleName = userRole?.role || 'student';

        // Trigger N8N (Important: remove "-test" if you want permanent production access)
        const n8nUrl = 'https://aotms.app.n8n.cloud/webhook-test/Email';

        await axios.post(n8nUrl, {
            event: 'user_approved',
            user_id: userId,
            email: profile.email || 'N/A',
            full_name: profile.full_name || 'User',
            role: roleName,
            approved_at: new Date().toISOString()
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json({ message: 'Approval email sent successfully via N8N' });
    } catch (err) {
        const errorMsg = err.response?.data || err.message;
        console.error('N8N Trigger Error:', errorMsg);
        res.status(500).json({
            error: 'N8N Webhook failed. Is the N8N workflow active?',
            details: errorMsg
        });
    }
});

// --- Question Bank & Exam Management Endpoints ---

// Admin: Approve/Reject Question Bank
app.put('/api/admin/approve-question-bank', authenticateToken, requireAdmin, async (req, res) => {
    const { topic, status } = req.body; // status: 'approved', 'rejected'
    if (!topic || !status) return res.status(400).json({ error: 'topic and status are required' });

    try {
        const { data, error } = await supabase
            .from('question_bank')
            .update({ approval_status: status, is_active: status === 'approved' })
            .eq('topic', topic)
            .select();

        if (error) throw error;
        res.json({ message: `Question bank for topic "${topic}" ${status}`, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manager: Get approved question bank topics for student access granting
app.get('/api/manager/approved-question-banks', authenticateToken, requireManager, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('question_bank')
            .select('topic, created_by, created_at, difficulty')
            .eq('approval_status', 'approved');

        if (error) throw error;

        // Group by topic
        const grouped = (data || []).reduce((acc, q) => {
            if (!acc[q.topic]) {
                acc[q.topic] = {
                    topic: q.topic,
                    count: 0,
                    created_by: q.created_by,
                    created_at: q.created_at,
                    difficulties: []
                };
            }
            acc[q.topic].count++;
            if (q.difficulty && !acc[q.topic].difficulties.includes(q.difficulty)) {
                acc[q.topic].difficulties.push(q.difficulty);
            }
            return acc;
        }, {});

        res.json(Object.values(grouped));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manager: Grant student access to approved question bank topic
app.post('/api/manager/grant-question-bank-access', authenticateToken, requireManager, async (req, res) => {
    const { studentId, topic } = req.body;
    if (!studentId || !topic) return res.status(400).json({ error: 'studentId and topic are required' });

    try {
        const { data, error } = await supabase
            .from('student_exam_access')
            .upsert({
                student_id: studentId,
                question_bank_topic: topic,
                assigned_by: req.user.id,
                access_type: 'question_bank',
                granted_at: new Date().toISOString()
            }, { onConflict: 'student_id,question_bank_topic' })
            .select();

        if (error) throw error;
        res.json({ message: `Access to "${topic}" granted to student`, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manager: Search student by UUID
app.get('/api/manager/lookup-student/:studentId', authenticateToken, requireManager, async (req, res) => {
    const { studentId } = req.params;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, full_name, email, approval_status')
            .eq('id', studentId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Student not found or incorrect UUID' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manager: Grant Student Access to Exam/Mock
app.post('/api/manager/grant-exam-access', authenticateToken, requireManager, async (req, res) => {
    const { studentId, examId, mockPaperId } = req.body;
    if (!studentId || (!examId && !mockPaperId)) {
        return res.status(400).json({ error: 'studentId and either examId or mockPaperId required' });
    }

    try {
        const { data, error } = await supabase
            .from('student_exam_access')
            .upsert({
                student_id: studentId,
                exam_id: examId || null,
                mock_paper_id: mockPaperId || null,
                assigned_by: req.user.id
            }, { onConflict: 'student_id,exam_id,mock_paper_id' });

        if (error) throw error;
        res.json({ message: 'Access granted successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student: Get my accessible exams/mocks
app.get('/api/student/accessible-exams', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('student_exam_access')
            .select('*, exam_schedules(*), mock_papers(*)')
            .eq('student_id', req.user.id);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

    try {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token });
        if (error) throw error;

        const token = generateToken(data.user, data.session?.access_token);

        res.json({
            user: data.user,
            session: {
                access_token: token,
                expires_in: 604800,
                refresh_token: data.session?.refresh_token || null
            }
        });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(401).json({ error: 'Failed to refresh token' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const authClient = getAuthClient(token);
        await authClient.auth.signOut();
    }
    res.json({ message: 'Logged out successfully' });
});

// User Routes
app.get('/api/user/role', authenticateToken, async (req, res) => {
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.json({ role: 'student' });
        }

        // Priority order
        const roles = data.map(r => r.role);
        let highestRole = 'student';
        if (roles.includes('admin')) highestRole = 'admin';
        else if (roles.includes('manager')) highestRole = 'manager';
        else if (roles.includes('instructor')) highestRole = 'instructor';

        res.json({ role: highestRole });
    } catch (err) {
        console.error('Get role error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({
            profile: data || null,
            user: {
                id: req.user.id,
                email: req.user.email,
                approval_status: data?.approval_status || data?.status || 'pending',
                user_metadata: { avatar_url: data?.avatar_url, full_name: data?.full_name }
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const updates = req.body;

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({ ...updates, id: req.user.id });

        if (error) throw error;

        if (updates.full_name || updates.avatar_url) {
            // Must use admin/service role or strict RLS context
            // Here we use the user's auth context client which should work if they can update themselves
            await authClient.auth.updateUser({
                data: {
                    full_name: updates.full_name,
                    avatar_url: updates.avatar_url
                }
            });
        }

        res.json({ message: 'Profile updated' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('AOTMS LMS Backend is running');
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.single('file');

app.post('/api/upload/:bucket', authenticateToken, uploadMiddleware, async (req, res) => {
    const { bucket } = req.params;
    const file = req.file;
    const token = req.headers.authorization?.split(' ')[1];

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await authClient.storage
            .from(bucket)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) throw uploadError;

        const { data } = authClient.storage
            .from(bucket)
            .getPublicUrl(fileName);

        res.json({ url: data.publicUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Instructor Routes
app.post('/api/instructor/register', upload.single('resume'), async (req, res) => {
    const { email, password, fullName, areaOfExpertise, customExpertise, experience } = req.body;
    const resumeFile = req.file;

    try {
        // 1. Sign Up User
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: 'http://localhost:5173/instructor', // Backend URL or specific redirect
            },
        });

        if (signUpError) throw signUpError;
        const userId = authData.user?.id;
        if (!userId) throw new Error('User registration failed');

        // 2. Upload Resume if exists
        let resumeUrl = null;
        if (resumeFile) {
            const fileExt = resumeFile.originalname.split('.').pop();
            const filePath = `${userId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('instructor-resumes')
                .upload(filePath, resumeFile.buffer, {
                    contentType: resumeFile.mimetype
                });

            if (uploadError) {
                console.error('Resume upload error:', uploadError);
            } else {
                resumeUrl = filePath;
            }
        }

        // 3. Create Application Record
        const { error: insertError } = await supabase
            .from('instructor_applications')
            .insert({
                user_id: userId,
                full_name: fullName,
                email,
                area_of_expertise: areaOfExpertise === 'Other' ? customExpertise : areaOfExpertise,
                custom_expertise: areaOfExpertise === 'Other' ? customExpertise : null,
                experience,
                resume_url: resumeUrl
            });

        if (insertError) {
            console.error('Application insert error:', insertError);
            // We don't rollback user creation here for simplicity, but in prod we might want to.
        }

        res.json({ message: 'Instructor application submitted successfully', user: authData.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/instructor/courses', authenticateToken, requireInstructor, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data, error } = await authClient
            .from('courses')
            .select('*')
            .eq('instructor_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generic Course Sub-resources (Topics, Videos, Resources, etc)
const createCourseResourceRoutes = (resourceName, tableName) => {
    app.get(`/api/courses/:courseId/${resourceName}`, async (req, res) => {
        const { courseId } = req.params;
        try {
            const { data, error } = await supabase // Public read or use authClient if private
                .from(tableName)
                .select('*')
                .eq('course_id', courseId)
                // Try ordering by common fields, ignore if not present in specific table logic for now
                .order(tableName === 'course_timeline' ? 'scheduled_date' : (tableName === 'course_announcements' ? 'created_at' : 'order_index'), { ascending: tableName !== 'course_announcements' });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post(`/api/courses/:courseId/${resourceName}`, authenticateToken, requireInstructor, async (req, res) => {
        try {
            const authClient = getAuthClient(req.supabaseToken);

            // Log incoming data for debugging
            console.log(`Inserting into ${tableName}:`, req.body);

            const { data, error } = await authClient
                .from(tableName)
                .insert(req.body)
                .select()
                .single();

            if (error) {
                console.error(`Supabase error inserting into ${tableName}:`, error);
                return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
            }

            res.json(data);
        } catch (err) {
            console.error(`Internal server error for ${tableName}:`, err);
            res.status(500).json({ error: err.message });
        }
    });

    // Add PUT/DELETE similarly if needed, for brevity adding DELETE
    app.delete(`/api/${resourceName}/:id`, authenticateToken, requireInstructor, async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        const { id } = req.params;
        try {
            const authClient = getAuthClient(req.supabaseToken);
            const { error } = await authClient
                .from(tableName)
                .delete()
                .eq('id', id);
            if (error) throw error;
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Add PUT
    app.put(`/api/${resourceName}/:id`, authenticateToken, requireInstructor, async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        const { id } = req.params;
        try {
            const authClient = getAuthClient(req.supabaseToken);
            const { data, error } = await authClient
                .from(tableName)
                .update(req.body)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

createCourseResourceRoutes('topics', 'course_topics');
createCourseResourceRoutes('modules', 'course_modules');
createCourseResourceRoutes('videos', 'course_videos');
createCourseResourceRoutes('resources', 'course_resources');
createCourseResourceRoutes('timeline', 'course_timeline');
createCourseResourceRoutes('announcements', 'course_announcements');


// Chat API Routes (Example)
app.get('/api/chat/rooms/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('chat_rooms')
            .select(`
        *,
        participants:chat_participants!inner(user_id)
      `)
            .eq('participants.user_id', userId);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generic CRUD Routes for legitimate tables
const ALLOWED_TABLES = [
    // Auth & users
    'profiles', 'user_roles',
    // Courses & content
    'courses', 'course_topics', 'course_modules', 'course_videos', 'course_resources',
    'course_timeline', 'course_announcements', 'course_enrollments',
    // Exams & tests
    'exams', 'question_bank', 'exam_schedules', 'exam_rules',
    'mock_test_configs', 'mock_test_assignments', 'student_exam_results',
    'live_exams', 'live_exam_attempts', 'mock_papers',
    // Leaderboard & analytics
    'leaderboard', 'leaderboard_stats', 'leaderboard_audit', 'instructor_progress',
    // Applications & admin
    'instructor_applications', 'instructor_profiles',
    'security_events', 'system_logs', 'guest_credentials',
    'announcements',
    'playlists', 'playlist_videos',
    'assignments', 'assignment_submissions',
    'live_classes'
];

// Parse Supabase-style filter params: ?col=eq.value  ?col=gt.5  etc.
function applyQueryFilters(query, rawQuery) {
    const RESERVED = new Set(['sort', 'order', 'limit', 'select', 'offset']);
    const OPS = { eq: 'eq', neq: 'neq', gt: 'gt', gte: 'gte', lt: 'lt', lte: 'lte', like: 'like', ilike: 'ilike', is: 'is', in: 'in' };

    let currentQuery = query;

    for (const [key, val] of Object.entries(rawQuery)) {
        if (RESERVED.has(key)) continue;
        const dotIdx = String(val).indexOf('.');
        if (dotIdx !== -1) {
            const op = String(val).slice(0, dotIdx);
            let value = String(val).slice(dotIdx + 1);

            if (OPS[op] && typeof currentQuery[OPS[op]] === 'function') {
                if (op === 'in') {
                    // Handle in.(val1,val2) syntax
                    const parsedValue = value.replace(/^\(|\)$/g, '').split(',');
                    currentQuery = currentQuery.in(key, parsedValue);
                } else {
                    currentQuery = currentQuery[OPS[op]](key, value === 'null' ? null : value);
                }
            }
        } else {
            currentQuery = currentQuery.eq(key, val);
        }
    }
    return currentQuery;
}

const ADMIN_ONLY_TABLES = [
    'user_roles', 'platform_settings', 'system_logs', 'security_events', 'user_suspensions'
];

// --- S3 Presigned URL Routes ---

app.post('/api/s3/upload-url', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { fileName, fileType, folder } = req.body;
        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'fileName and fileType are required' });
        }

        // Use requested folder or default to user.id
        const folderPath = folder ? `${folder}/` : `${req.user.id}/`;
        const uploadFileName = `${folderPath}${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const uploadUrl = await generateUploadUrl(uploadFileName, fileType);
        res.json({ uploadUrl, fileName: uploadFileName });
    } catch (err) {
        console.error('S3 Upload URL Error:', err);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

app.post('/api/s3/view-url', authenticateToken, async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) return res.status(400).json({ error: 'fileName is required' });
        const viewUrl = await generateViewUrl(fileName);
        res.json({ viewUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate view URL' });
    }
});

// Proxy route for <img> and <video> tags to automatically resolve presigned URLs
app.use('/api/s3/public', async (req, res) => {
    try {
        const fileName = req.path.substring(1); // removing leading slash
        if (!fileName) return res.status(400).send('File name required');
        const viewUrl = await generateViewUrl(fileName);
        res.redirect(viewUrl);
    } catch (err) {
        res.status(500).send('Image redirect failed');
    }
});

app.delete('/api/s3/delete', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({ error: 'fileName is required' });
        }
        await deleteObject(fileName);
        res.json({ success: true });
    } catch (err) {
        console.error('S3 Delete Error:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.get('/api/data/:table', authenticateToken, async (req, res) => {
    const { table } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: `Access denied to table: ${table}` });

    // Check admin-only tables
    if (ADMIN_ONLY_TABLES.includes(table)) {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: roleData } = await authClient.from('user_roles').select('role').eq('user_id', req.user.id).eq('role', 'admin').single();
        if (!roleData) return res.status(403).json({ error: 'Admin access required for this table' });
    }

    try {
        const authClient = getAuthClient(req.supabaseToken);
        let query = authClient.from(table).select(req.query.select || '*');

        const { sort, order, limit, offset } = req.query;
        query = applyQueryFilters(query, req.query);
        if (sort) query = query.order(sort, { ascending: order !== 'desc' });
        if (limit) query = query.limit(parseInt(limit));
        if (offset) query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || 100) - 1);

        const { data, error } = await query;
        if (error) return handleSupabaseError(res, error, table);
        res.json(data);
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

// Generic PUT /api/data/:table/:id — used by admin to update records like courses
app.put('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: `Access denied to table: ${table}` });

    // Only admin can update admin-only tables
    if (ADMIN_ONLY_TABLES.includes(table)) {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: roleData } = await authClient.from('user_roles').select('role').eq('user_id', req.user.id).eq('role', 'admin').single();
        if (!roleData) return res.status(403).json({ error: 'Admin access required for this table' });
    }

    // For courses, require admin or the owning instructor
    if (table === 'courses') {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: userRoleData } = await authClient.from('user_roles').select('role').eq('user_id', req.user.id).single();
        const userRole = userRoleData?.role;
        if (!['admin', 'manager'].includes(userRole)) {
            // Instructors can only update their own courses
            const { data: courseData } = await supabase.from('courses').select('instructor_id').eq('id', id).single();
            if (!courseData || courseData.instructor_id !== req.user.id) {
                return res.status(403).json({ error: 'Permission denied: you do not own this course' });
            }
        }
    }

    try {
        // Use service role for admin updates to bypass RLS
        const { data, error } = await supabase
            .from(table)
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleSupabaseError(res, error, table);
        res.json(data);
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

// Generic DELETE /api/data/:table/:id
app.delete('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: `Access denied to table: ${table}` });

    if (ADMIN_ONLY_TABLES.includes(table)) {
        const authClient = getAuthClient(req.supabaseToken);
        const { data: roleData } = await authClient.from('user_roles').select('role').eq('user_id', req.user.id).eq('role', 'admin').single();
        if (!roleData) return res.status(403).json({ error: 'Admin access required for this table' });
    }

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { error } = await authClient.from(table).delete().eq('id', id);
        if (error) return handleSupabaseError(res, error, table);
        res.json({ success: true });
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

// Dedicated course approval endpoint (uses service role to bypass RLS)
app.put('/api/admin/approve-course', authenticateToken, requireAdmin, async (req, res) => {
    const { courseId, status, rejectionReason } = req.body;
    if (!courseId || !status) return res.status(400).json({ error: 'courseId and status are required' });

    try {
        const updatePayload = {
            status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: req.user.id,
            updated_at: new Date().toISOString(),
        };
        if (rejectionReason) updatePayload.rejection_reason = rejectionReason;

        const { data, error } = await supabase
            .from('courses')
            .update(updatePayload)
            .eq('id', courseId)
            .select()
            .single();

        if (error) throw error;

        // Log the action
        await supabase.from('system_logs').insert({
            log_type: 'audit',
            module: 'Course',
            action: `Course ${status}`,
            user_id: req.user.id,
            details: { course_id: courseId, status }
        }).single();

        res.json({ message: `Course ${status} successfully`, data });
    } catch (err) {
        console.error('[Admin] Course approval error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Global Error Handler for PayloadTooLarge and other middleware errors
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request entity too large. Please reduce the size of your data or upload images via the dedicated endpoint.' });
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.post('/api/data/course_enrollments', authenticateToken, async (req, res) => {
    const { course_id, user_id } = req.body;
    if (!course_id || !user_id) return res.status(400).json({ error: 'course_id and user_id are required' });

    console.log(`[Enrollment] Instructor ${req.user.id} enrolling student ${user_id} in course ${course_id}`);

    try {
        // 1. Verify this instructor actually owns the course
        // We use the service role client 'supabase' to be sure we can read the course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, instructor_id, status')
            .eq('id', course_id)
            .single();

        if (courseError || !course) {
            console.error('[Enrollment Error] Course not found:', course_id);
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.instructor_id !== req.user.id) {
            console.warn(`[Enrollment Warning] Unauthorized attempt by ${req.user.id} to enroll in ${course_id}`);
            return res.status(403).json({ error: 'You do not have permission to enroll students in this course' });
        }

        // 2. Create the enrollment
        // Use service role 'supabase' to bypass RLS issues for the instructor inserting for a student
        const { data, error } = await supabase
            .from('course_enrollments')
            .insert({
                user_id,
                course_id,
                status: 'active',
                progress_percentage: 0
            })
            .select()
            .single();

        if (error) {
            console.error('[Enrollment Error] Insert failed:', error);
            return handleSupabaseError(res, error, 'course_enrollments');
        }

        // 3. Automatically ensure the course is "published" so the student can see it via RLS
        // We force this using the service role client
        if (course.status !== 'published') {
            const { error: updateError } = await supabase
                .from('courses')
                .update({ status: 'published' })
                .eq('id', course_id);

            if (updateError) {
                console.error('[Enrollment Error] Failed to publish course:', updateError);
            } else {
                console.log(`[Enrollment] Course ${course_id} auto-published for student access.`);
            }
        }

        console.log(`[Enrollment Success] Student ${user_id} enrolled in ${course_id}`);
        res.json(data);
    } catch (err) {
        console.error('[Enrollment Internal Error]:', err);
        handleSupabaseError(res, err, 'course_enrollments');
    }
});

app.post('/api/data/:table', authenticateToken, async (req, res) => {
    const { table } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: 'Access denied to table' });

    const token = req.headers.authorization?.split(' ')[1];

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const isArray = Array.isArray(req.body);

        let query = authClient.from(table).insert(req.body).select();

        // Only use .single() if we are inserting a single object
        if (!isArray) {
            query = query.single();
        }

        const { data, error } = await query;
        if (error) return handleSupabaseError(res, error, table);
        res.json(data);
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

app.put('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: 'Access denied to table' });

    const token = req.headers.authorization?.split(' ')[1];

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient
            .from(table)
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleSupabaseError(res, error, table);
        res.json(data);
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

app.delete('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: 'Access denied to table' });

    const token = req.headers.authorization?.split(' ')[1];

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { error } = await authClient
            .from(table)
            .delete()
            .eq('id', id);

        if (error) return handleSupabaseError(res, error, table);
        res.json({ success: true });
    } catch (err) {
        handleSupabaseError(res, err, table);
    }
});

app.post('/api/rpc/:function', authenticateToken, async (req, res) => {
    const { function: rpcFunction } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const authClient = getAuthClient(req.supabaseToken);
        const { data, error } = await authClient.rpc(rpcFunction, req.body);
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// --- ZOOM API ENDPOINTS ---

/**
 * Create a new Zoom meeting (Live Class)
 */
app.post('/api/zoom/meetings', authenticateToken, requireInstructor, async (req, res) => {
    const { topic, startTime, duration, agenda } = req.body;

    if (!topic || !startTime) {
        return res.status(400).json({ error: 'Topic and start time are required' });
    }

    try {
        const accessToken = await getZoomAccessToken();

        // Use user:read:admin scope to find a host if needed, but for Server-to-Server OAuth, 
        // we usually create a meeting for the default 'me' (the account owner)
        // or a specific email/userId if provided.
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic,
                type: 2, // Scheduled meeting
                start_time: startTime,
                duration: duration || 60,
                agenda: agenda || 'AOTMS LMS Live Session',
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                    mute_upon_entry: true,
                    waiting_room: false,
                    auto_recording: 'cloud'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            meetingId: response.data.id,
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password,
            meetingDetails: response.data
        });
    } catch (err) {
        console.error('Create Meeting Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to create Zoom meeting', details: err.response?.data });
    }
});

/**
 * Get details of a specific Zoom meeting
 */
app.get('/api/zoom/meetings/:meetingId', authenticateToken, async (req, res) => {
    const { meetingId } = req.params;

    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.get(
            `https://api.zoom.us/v2/meetings/${meetingId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        res.json(response.data);
    } catch (err) {
        console.error('Get Meeting Details Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch meeting details' });
    }
});

/**
 * Generate Zoom Meeting SDK Signature (For joining meetings from UI)
 */
const crypto = require('crypto');
app.post('/api/zoom/signature', authenticateToken, async (req, res) => {
    const { meetingNumber, role } = req.body; // role: 0 for participant, 1 for host

    if (!meetingNumber) {
        return res.status(400).json({ error: 'Meeting number is required' });
    }

    try {
        // Signatures for Meeting SDK are still typically needed using the older 
        // SDK Key/Secret (Meeting SDK credentials) OR the new OAuth flow.
        // If the user has CLIENT_ID and CLIENT_SECRET, they work for both REST API and SDK.

        const iat = Math.round(new Date().getTime() / 1000) - 300; // 5 min buffer
        const exp = iat + 60 * 60 * 2;

        const oHeader = { alg: 'HS256', typ: 'JWT' };
        const oPayload = {
            sdkKey: ZOOM_CLIENT_ID,
            appKey: ZOOM_CLIENT_ID, // Use both for maximum compatibility
            mn: meetingNumber,
            role: role || 0,
            iat: iat,
            exp: exp,
            tokenExp: iat + 60 * 60 * 2,
            video_webrtc_mode: 1 // For better performance and Gallery View support
        };

        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);

        const base64Header = Buffer.from(sHeader).toString('base64url');
        const base64Payload = Buffer.from(sPayload).toString('base64url');

        const signature = crypto
            .createHmac('sha256', ZOOM_CLIENT_SECRET)
            .update(`${base64Header}.${base64Payload}`)
            .digest('base64url');

        const finalSignature = `${base64Header}.${base64Payload}.${signature}`;

        res.json({ signature: finalSignature });
    } catch (err) {
        console.error('Signature Generation Error:', err);
        res.status(500).json({ error: 'Failed to generate SDK signature' });
    }
});

