const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMore() {
    console.log('Checking deeper for URL:', supabaseUrl);
    
const { data: courses } = await supabase.from('courses').select('id, title, instructor_id').limit(5);
console.log('Courses sample:', JSON.stringify(courses, null, 2));

    const tables = ['profiles', 'user_roles', 'course_enrollments', 'course_videos', 'course_modules', 'course_resources'];
    
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(3);
        if (error) {
            console.log(`Table [${table}] Error:`, error.message);
        } else {
            console.log(`Table [${table}] Count:`, data.length);
        }
    }
}

checkMore();
