const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Should be service role for this, but let's see
const supabase = createClient(supabaseUrl, supabaseKey);

const INSTRUCTOR_ID = '84e3fe6e-dcdf-4c95-84e7-bc8db0c31d5c';

async function fixUser() {
    console.log('Fixing user data for:', INSTRUCTOR_ID);
    
    // 1. Ensure profile exists
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: INSTRUCTOR_ID,
        email: 'instructor@example.com',
        full_name: 'Main Instructor',
        approval_status: 'approved'
    });
    if (profileError) console.error('Profile Error:', profileError);
    else console.log('Profile ensured.');

    // 2. Ensure role exists
    const { error: roleError } = await supabase.from('user_roles').upsert({
        user_id: INSTRUCTOR_ID,
        role: 'instructor'
    });
    if (roleError) console.error('Role Error:', roleError);
    else console.log('Instructor role assigned.');
}

fixUser();
