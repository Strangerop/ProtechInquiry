const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Connecting to MongoDB...');

mongoose.connect(uri)
    .then(async () => {
        console.log('✅ Connected!');

        const dbName = mongoose.connection.db.databaseName;
        console.log(`Current DB: ${dbName}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:');

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count}`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
