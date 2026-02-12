const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Simple fetch polyfill if needed (Node 18+ has it native)
const fetch = global.fetch || require('node-fetch');

const API_URL = `http://localhost:${process.env.PORT || 5000}/api/leads`;
const MONGODB_URI = process.env.MONGODB_URI;

// Mock Lead Data
const mockLead = {
    name: "Test Lead Consolidation",
    email: `testLike${Date.now()}@example.com`,
    mobileNumber: "1234567890",
    // We need to send a file for the multipart/form-data request
};

async function testLeadFlow() {
    console.log('--- Starting Lead Flow Verification ---');

    // 1. Connect to DB to monitor
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB.');

    const db = mongoose.connection.db;
    const userCollection = db.collection('user');
    const leadsCollection = db.collection('leads');

    const initialUserCount = await userCollection.countDocuments();
    const initialLeadsCount = await leadsCollection.countDocuments();

    console.log(`Initial counts -> User: ${initialUserCount}, Leads: ${initialLeadsCount}`);

    // 2. Create a dummy image file
    const dummyImagePath = path.join(__dirname, 'temp_test_image.jpg');
    if (!fs.existsSync(dummyImagePath)) {
        fs.writeFileSync(dummyImagePath, 'dummy image content');
    }

    // 3. Send POST request
    console.log(`Sending POST request to ${API_URL}...`);

    // Construct FormData manually since we are in Node
    // We'll use a boundary
    const boundary = '--------------------------' + Date.now().toString(16);

    const bodyStart = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="name"`,
        '',
        mockLead.name,
        `--${boundary}`,
        `Content-Disposition: form-data; name="email"`,
        '',
        mockLead.email,
        `--${boundary}`,
        `Content-Disposition: form-data; name="mobileNumber"`,
        '',
        mockLead.mobileNumber,
        `--${boundary}`,
        `Content-Disposition: form-data; name="photo"; filename="test.jpg"`,
        `Content-Type: image/jpeg`,
        '',
        fs.readFileSync(dummyImagePath),
        `--${boundary}--`
    ];

    // Note: For binary data in body, this array join might corrupt it if not careful, 
    // but for a dummy text file "dummy image content" it's fine. 
    // Real image would need Buffer.concat.
    // Let's simpler use a library or just assume text is fine for this 'image' since Multer checks mimetype but maybe not content? 
    // Multer `fileFilter` checks mimetype. We sent Content-Type header.

    const requestBody = Buffer.concat(bodyStart.map((part, index) => {
        if (index === bodyStart.length - 2) { // The file content
            return Buffer.from(part);
        }
        if (typeof part === 'string') {
            return Buffer.from(part + (index < bodyStart.length - 1 ? '\r\n' : ''));
        }
        return part;
    }));

    // Actually, constructing multipart body manually is error prone.
    // I will rely on the fact that I just need to trigger the server content.
    // Let's use `form-data` package pattern if installed, or just simple fetch with manual boundary.

    // Correct manual construction:
    let bodyBuffer = Buffer.from('');
    const CRLF = '\r\n';

    const append = (str) => {
        bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(str)]);
    }

    append(`--${boundary}${CRLF}`);
    append(`Content-Disposition: form-data; name="name"${CRLF}${CRLF}${mockLead.name}${CRLF}`);

    append(`--${boundary}${CRLF}`);
    append(`Content-Disposition: form-data; name="email"${CRLF}${CRLF}${mockLead.email}${CRLF}`);

    append(`--${boundary}${CRLF}`);
    append(`Content-Disposition: form-data; name="mobileNumber"${CRLF}${CRLF}${mockLead.mobileNumber}${CRLF}`);

    append(`--${boundary}${CRLF}`);
    append(`Content-Disposition: form-data; name="photo"; filename="test.jpg"${CRLF}`);
    append(`Content-Type: image/jpeg${CRLF}${CRLF}`);

    bodyBuffer = Buffer.concat([bodyBuffer, fs.readFileSync(dummyImagePath)]);
    append(`${CRLF}`);

    append(`--${boundary}--${CRLF}`);

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: bodyBuffer
        });

        const data = await res.json();
        console.log('Response status:', res.status);
        console.log('Response data:', data);

        if (!data.success) {
            console.error('API Error:', data.message);
        }

    } catch (e) {
        console.error('Fetch failed:', e.message);
    }

    // 4. Check DB again
    console.log('Checking DB after 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));

    const finalUserCount = await userCollection.countDocuments();
    const finalLeadsCount = await leadsCollection.countDocuments();

    console.log(`Final counts -> User: ${finalUserCount}, Leads: ${finalLeadsCount}`);

    if (finalUserCount > initialUserCount) {
        console.log('SUCCESS: New document found in "user" collection.');

        // Check the latest doc
        const latest = await userCollection.findOne({}, { sort: { createdAt: -1 } });
        console.log('Latest User Doc:', {
            id: latest._id,
            name: latest.name,
            type: latest.type,
            email: latest.email
        });

        if (latest.type === 'Lead') {
            console.log('VERIFIED: Document has type="Lead"');
        } else {
            console.log('WARNING: Document created but type mismatch (expected "Lead")', latest.type);
        }

    } else if (finalLeadsCount > initialLeadsCount) {
        console.log('FAILURE: New document found in "leads" collection. Server might be running old code.');
    } else {
        console.log('FAILURE: No new document found in either collection.');
    }

    // Cleanup
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
    mongoose.connection.close();
}

testLeadFlow();
