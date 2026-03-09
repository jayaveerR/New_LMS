
require('dotenv').config();
const https = require('https');

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function testZoom() {
    console.log("Testing Zoom credentials...");
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const options = {
        hostname: 'zoom.us',
        path: `/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Length': 0
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log("\x1b[32mSUCCESS: Zoom Credentials are valid!\x1b[0m");
                console.log("Access Token received successfully.");
            } else {
                console.log("\x1b[31mFAILED: Zoom Credentials are invalid.\x1b[0m");
                console.log("Status:", res.statusCode);
                console.log("Error Details:", response);
            }
        });
    });

    req.on('error', (e) => {
        console.error("Network Error:", e);
    });

    req.end();
}

testZoom();
