require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function run() {
    console.log('--- RESTORING LEVEL UPDATES & SYNCING TO MONGODB ATLAS ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB Atlas');

    // 1. Get data.json from commit 37b7dfe
    console.log('Reading data.json from commit 37b7dfe...');
    const rawGit = execSync('git show 37b7dfe:data.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
    const gitData = JSON.parse(rawGit);
    const gitUsers = gitData.users || {};
    console.log(`Found ${Object.keys(gitUsers).length} users in commit 37b7dfe.`);

    let updatedMongoCount = 0;
    let createdMongoCount = 0;

    for (const [uname, u] of Object.entries(gitUsers)) {
        try {
            const existing = await User.findOne({ username: new RegExp(`^${uname}$`, 'i') });
            if (!existing) {
                const doc = { ...u, username: uname };
                delete doc._id;
                delete doc.__v;
                await User.create(doc);
                createdMongoCount++;
            } else {
                // Merge logic: preserve highest level, totalXP, money, diamonds, items
                const updateDoc = {};
                if (u.level !== undefined && (existing.level === undefined || u.level > (existing.level || 1))) {
                    updateDoc.level = u.level;
                }
                if (u.totalXP !== undefined && (existing.totalXP === undefined || u.totalXP > (existing.totalXP || 0))) {
                    updateDoc.totalXP = u.totalXP;
                }
                if (u.money !== undefined && u.money > (existing.money || 0)) {
                    updateDoc.money = u.money;
                }
                if (u.diamonds !== undefined && u.diamonds > (existing.diamonds || 0)) {
                    updateDoc.diamonds = u.diamonds;
                }
                if (u.jammerCount !== undefined && u.jammerCount > (existing.jammerCount || 0)) {
                    updateDoc.jammerCount = u.jammerCount;
                }
                if (u.zeusCount !== undefined && u.zeusCount > (existing.zeusCount || 0)) {
                    updateDoc.zeusCount = u.zeusCount;
                }
                if (u.mugKnifeCount !== undefined && u.mugKnifeCount > (existing.mugKnifeCount || 0)) {
                    updateDoc.mugKnifeCount = u.mugKnifeCount;
                }
                if (u.hasMugKnife && !existing.hasMugKnife) {
                    updateDoc.hasMugKnife = true;
                }
                if (u.propInventory && Object.keys(u.propInventory).length > 0) {
                    updateDoc.propInventory = Object.assign({}, existing.propInventory || {}, u.propInventory);
                }
                if (u.inventory && Array.isArray(u.inventory)) {
                    const combined = Array.from(new Set([...(existing.inventory || []), ...u.inventory]));
                    updateDoc.inventory = combined;
                }
                if (u.avatar && Object.keys(u.avatar).length > 0) {
                    updateDoc.avatar = Object.assign({}, existing.avatar || {}, u.avatar);
                }
                if (u.dailyReward) {
                    updateDoc.dailyReward = u.dailyReward;
                }

                if (Object.keys(updateDoc).length > 0) {
                    await User.updateOne({ _id: existing._id }, { $set: updateDoc });
                    updatedMongoCount++;
                }
            }
        } catch (err) {
            console.warn(`User ${uname} skipped due to error:`, err.message);
        }
    }

    console.log(`✓ Migration Complete: ${createdMongoCount} created, ${updatedMongoCount} updated in MongoDB Atlas.`);

    // 2. Fetch all users from MongoDB Atlas and rewrite data.json
    const allMongoUsers = await User.find({}).lean();
    const finalMap = {};
    for (const doc of allMongoUsers) {
        finalMap[doc.username] = doc;
    }

    const currentData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    currentData.users = finalMap;
    fs.writeFileSync('data.json', JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`✓ Saved ${allMongoUsers.length} users from MongoDB Atlas into data.json`);

    await mongoose.connection.close();
    console.log('All done!');
}

run().catch(console.error);
