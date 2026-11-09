require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function topup() {
    await mongoose.connect(process.env.MONGO_URI);
    const u = await User.findOne({ username: "10kasım" });
    if (u) {
        u.jammerCount = 5;
        u.zeusCount = 5;
        u.mugKnifeCount = 5;
        u.propInventory = u.propInventory || {};
        u.propInventory["props_jammer"] = 5;
        u.propInventory["props_zeus_yildirimi"] = 5;
        u.propInventory["props_mug_knife"] = 5;
        await u.save();
        console.log("10kasım successfully saved to MongoDB Atlas with 5 each!");
    }
    await mongoose.connection.close();
}
topup().catch(console.error);

