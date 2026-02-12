const http = require('http');

const options = {
    hostname: '192.168.1.2',
    port: 5000,
    path: '/api/exhibitions/TestExhibition',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk.substring(0, 100)}...`); // Print start of body
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
