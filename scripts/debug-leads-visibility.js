const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
    console.log('CONNECTED');
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));

    // Check 'user' collection
    const users = await mongoose.connection.db.collection('user').find().toArray();
    console.log(`\nUSER COLLECTION (${users.length}):`);
    users.forEach(u => {
        console.log(`ID: ${u._id}, Name: ${u.name}, Type: ${u.type}, Pri: ${u.priority}`);
    });

    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
