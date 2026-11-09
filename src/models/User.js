// src/models/User.js - Mini Metaverse Kullanıcı Mongoose Veritabanı Modeli
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı zorunludur!'],
        unique: true,
        trim: true,
        minlength: [2, 'Kullanıcı adı en az 2 karakter olmalıdır!'],
        maxlength: [20, 'Kullanıcı adı en fazla 20 karakter olabilir!']
    },
    money: {
        type: Number,
        default: 1000
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'male'
    },
    auth: {
        hash: { type: String, default: null },
        salt: { type: String, default: null }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'mod', 'moderator'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isMod: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({
            model: 'classic_2',
            hat: 'bere',
            hair: 'none',
            face: 'none',
            skinColor: '#ffd1a4',
            shirtColor: '#3b82f6',
            color: '#3b82f6',
            heldItem: 'none',
            shoes: 'sneakers',
            shirt: null,
            pants: 'pants_classic_jeans',
            outfit: null,
            costume: null,
            watch: 'none'
        })
    },
    inventory: {
        type: [String],
        default: ['hats_bere', 'skins_#facc15', 'shirts_#3b82f6', 'shoes_sneakers', 'face_none', 'props_none']
    },
    propInventory: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    furnitureInventory: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    friends: {
        type: [String],
        default: []
    },
    friendRequests: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    house: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    houses: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    skinSets: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    dailyQuests: {
        date: { type: String, default: '' },
        quests: [{
            id: { type: String },
            title: { type: String },
            desc: { type: String },
            target: { type: Number, default: 1 },
            reward: { type: Number, default: 0 },
            current: { type: Number, default: 0 },
            claimed: { type: Boolean, default: false }
        }]
    },
    dailyReward: {
        currentDay: { type: Number, default: 0 },
        lastClaimDate: { type: String, default: null },
        freezesUsed: { type: Number, default: 0 },
        totalClaims: { type: Number, default: 0 }
    },
    teaExpiresAt: { type: Number, default: null },
    horseExpiresAt: { type: Number, default: null },
    horseModel: { type: String, default: 'royal_sprite' },
    banExpiresAt: { type: Number, default: null },
    banReason: { type: String, default: null },
    bannedBy: { type: String, default: null },
    muteExpiresAt: { type: Number, default: null },
    muteReason: { type: String, default: null },
    diamonds: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalXP: { type: Number, default: 0 },
    bodyguardCount: { type: Number, default: 0 },
    bodyguardsEquipped: { type: Number, default: 0 },
    hasDoberman: { type: Boolean, default: false },
    dobermanEquipped: { type: Boolean, default: false },
    jammerCount: { type: Number, default: 0 },
    jammerExpiresAt: { type: Number, default: 0 },
    anonMaskCount: { type: Number, default: 0 },
    anonMaskExpiresAt: { type: Number, default: 0 },
    anonMaskRemainingMs: { type: Number, default: 0 },
    hasMugKnife: { type: Boolean, default: false },
    mugKnifeCount: { type: Number, default: 0 },
    lastMugTime: { type: Number, default: 0 },
    muggedTargets: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    zeusCount: { type: Number, default: 0 },
    zeusStrikes: { type: mongoose.Schema.Types.Mixed, default: () => ({ date: '', count: 0 }) },
    neonRedNickExpiresAt: { type: Number, default: 0 },
    invisibilityExpiresAt: { type: Number, default: 0 }
}, {
    timestamps: true,
    strict: false, // Yeni ve dinamik tüm alanların eksiksiz saklanmasını garanti eder
    minimize: false // Boş nesnelerin ({}) MongoDB'ye kaydedilmesini garanti eder
});



// Kolay yardımcı statik metod: Kullanıcı adına göre arama
UserSchema.statics.findByUsername = function(uname) {
    if (!uname || typeof uname !== 'string') return Promise.resolve(null);
    const clean = uname.trim();
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.findOne({ username: { $regex: new RegExp(`^${escaped}$`, 'i') } });
};

module.exports = mongoose.model('User', UserSchema);
