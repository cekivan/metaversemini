require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function test() {
    console.log('Connecting to Mongo URI from .env...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const count = await User.countDocuments();
    console.log('Total users in MongoDB:', count);

    const users = await User.find({ level: { $gte: 2 } }, 'username level totalXP money diamonds').sort({ level: -1 }).lean();
    console.log(`Users with level >= 2 (${users.length} users):`, users.slice(0, 20));

    const checkUsers = ['10kasım', 'yasin', 'ahmet', 'kadın', '123'];
    for (const uname of checkUsers) {
        const u = await User.findOne({ username: new RegExp(`^${uname}$`, 'i') }).lean();
        console.log(`User ${uname}:`, u ? { username: u.username, level: u.level, totalXP: u.totalXP, jammerCount: u.jammerCount, zeusCount: u.zeusCount, mugKnifeCount: u.mugKnifeCount } : 'NOT FOUND');
    }

    await mongoose.connection.close();
    console.log('Done.');
}
test().catch(console.error);

