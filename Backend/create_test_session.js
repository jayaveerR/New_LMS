
const axios = require('axios');
require('dotenv').config();

async function createTestSession() {
    const { ACCOUNT_ID, CLIENT_ID, CLIENT_SECRET, SUPABASE_URL, SUPABASE_KEY } = process.env;

    console.log('--- AOTMS Zoom Integration Test ---');

    try {
        // 1. Get Zoom Token
        console.log('1. Fetching Zoom Access Token...');
        const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const tokenRes = await axios.post(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`, {}, {
            headers: { 'Authorization': `Basic ${authHeader}` }
        });
        const accessToken = tokenRes.data.access_token;
        console.log('✅ Access Token obtained.');

        // 2. Create Zoom Meeting
        console.log('2. Creating Zoom Meeting via API...');
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1); // 1 hour from now

        const meetingRes = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic: 'Masterclass: React Advanced Patterns (Test)',
            type: 2,
            start_time: startTime.toISOString(),
            duration: 60,
            agenda: 'This is a test session to verify the LMS integration.',
            settings: { join_before_host: true, mute_upon_entry: true, waiting_room: false }
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const meeting = meetingRes.data;
        console.log(`✅ Zoom Meeting Created: ${meeting.id}`);
        console.log(`Join URL: ${meeting.join_url}`);

        // 3. Save to Supabase (SIMULATION)
        // Note: This might fail if RLS is enabled and we're not using service role key,
        // but it's the best way to "Do It" and show the user.
        console.log('3. Attempting to save to Supabase live_classes table...');

        const testInstructorId = '84e3fe6e-dcdf-4c95-84e7-bc8db0c31d5c'; // From existing course

        const supabaseRes = await axios.post(`${SUPABASE_URL}/rest/v1/live_classes`, {
            instructor_id: testInstructorId,
            title: meeting.topic,
            description: meeting.agenda,
            scheduled_at: meeting.start_time,
            duration_minutes: meeting.duration,
            meeting_id: meeting.id.toString(),
            meeting_url: meeting.join_url,
            start_url: meeting.start_url,
            status: 'scheduled'
        }, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });

        console.log('✅ Data saved to Supabase!');
        console.log('Result:', JSON.stringify(supabaseRes.data, null, 2));

    } catch (error) {
        console.error('❌ Error during test session creation:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        console.log('\nTip: If you see "403 Forbidden" or "relation live_classes does not exist", make sure to run the SQL script in your Supabase Editor.');
    }
}

createTestSession();
