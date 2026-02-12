const fetch = require('node-fetch');

async function testGetLeads() {
    try {
        console.log('Fetching leads from http://localhost:5000/api/leads...');
        const response = await fetch('http://localhost:5000/api/leads');

        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('✅ Response is valid JSON');
            console.log('Lead Count:', data.data.length);
            if (data.data.length > 0) {
                console.log('First Lead:', data.data[0]);
            }
        } catch (e) {
            console.error('❌ Response is NOT JSON:', text.substring(0, 500)); // Print first 500 chars
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testGetLeads();
