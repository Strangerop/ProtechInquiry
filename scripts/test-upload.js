const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple script to test the /api/leads endpoint
// It creates a dummy multipart/form-data request using built-in modules to avoid external deps if possible,
// but since we are in node, using 'axios' or 'form-data' would be easier if installed.
// However, I'll stick to 'fetch' if available (Node 18+) or custom http request to be safe.
// Actually, let's just use a simple fetch script since Node 18+ has it.

async function testUpload() {
    try {
        // 1. Create a dummy image (1x1 pixel transparent PNG)
        const dummyImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

        // 2. Prepare form data
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

        let body = '';
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="name"\r\n\r\nTest User\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="email"\r\n\r\ntest@example.com\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="mobileNumber"\r\n\r\n1234567890\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="photo"; filename="test.png"\r\n';
        body += 'Content-Type: image/png\r\n\r\n';

        const bodyHead = Buffer.from(body, 'utf-8');
        const bodyTail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');

        const fullBody = Buffer.concat([bodyHead, dummyImageBuffer, bodyTail]);

        console.log('Sending request to http://localhost:5000/api/leads...');

        const response = await fetch('http://localhost:5000/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': fullBody.length
            },
            body: fullBody
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok && data.success) {
            console.log('✅ Test Passed: Image uploaded and lead saved.');
        } else {
            console.error('❌ Test Failed:', data.message);
        }

    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

testUpload();
