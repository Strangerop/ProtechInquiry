const fetch = global.fetch || require('node-fetch');

const API_URL = 'http://localhost:5000/api/leads'; // Hardcoded check

console.log(`Fetching from ${API_URL}...`);

fetch(API_URL)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('API Error:', data);
        } else {
            console.log(`Success! Found ${data.data.length} leads.`);
            data.data.forEach(item => {
                console.log(`- ID: ${item._id}, Name: ${item.name}, Priority: ${item.priority}, Type: ${item.type}`);
            });
        }
    })
    .catch(err => console.error('Request failed:', err));
