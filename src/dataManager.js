// src/dataManager.js - Mongoose & MongoDB Destekli Kalıcı Veri ve Kimlik Doğrulama Katmanı
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');

const DATA_FILE = config.DATA_FILE;
const BACKUP_FILE = config.BACKUP_FILE;

// --- 0. DIRTY TRACKING (SADECE DEĞİŞEN VERİLERİ YAZMA) & PROXY MOTORU ---
const dirtyUsers = new Set();

function markUserDirty(username) {
    if (!username || typeof username !== 'string') return;
    const uKey = findUserKey(username) || username;
    dirtyUsers.add(uKey);
}

function createDeepDirtyProxy(targetObj, rootUsername) {
    if (!targetObj || typeof targetObj !== 'object' || targetObj instanceof Date || targetObj instanceof RegExp || Buffer.isBuffer(targetObj)) return targetObj;
    return new Proxy(targetObj, {
        get(target, prop) {
            const val = target[prop];
            if (val && typeof val === 'object' && !(val instanceof Date) && !(val instanceof RegExp) && !Buffer.isBuffer(val)) {
                return createDeepDirtyProxy(val, rootUsername);
            }
            if (typeof val === 'function') {
                return val.bind(target);
            }
            return val;
        },
        set(target, prop, value) {
            target[prop] = value;
            dirtyUsers.add(rootUsername);
            return true;
        },
        deleteProperty(target, prop) {
            delete target[prop];
            dirtyUsers.add(rootUsername);
            return true;
        }
    });
}

function createUsersProxy(rawObj = {}) {
    return new Proxy(rawObj, {
        get(target, prop) {
            const val = target[prop];
            if (val && typeof val === 'object' && typeof prop === 'string' && !(val instanceof Date)) {
                return createDeepDirtyProxy(val, prop);
            }
            return val;
        },
        set(target, prop, value) {
            target[prop] = value;
            if (typeof prop === 'string') {
                dirtyUsers.add(prop);
            }
            return true;
        },
        deleteProperty(target, prop) {
            delete target[prop];
            if (typeof prop === 'string') {
                dirtyUsers.delete(prop);
            }
            return true;
        }
    });
}

// Bellek İçi Hızlı Erişim & Çalışma Zamanı Havuzu
let persistentData = {
    users: createUsersProxy({}),
    leaderboard: {
        billiard: {},
        batak: {},
        tavla: {},
        okey101: {},
        xox: {},
        amiral: {}
    },
    botanicMarketStock: {
        papatya: 20,
        lale: 20,
        gul: 20,
        lavanta: 20,
        orkide: 20,
        aycicegi: 20
    }
};

let diskBackupTimer = null;
function flushNowSync() {
    if (diskBackupTimer) {
        clearTimeout(diskBackupTimer);
        diskBackupTimer = null;
    }
    try {
        const dataToSave = {
            users: persistentData.users,
            leaderboard: persistentData.leaderboard,
            botanicMarketStock: persistentData.botanicMarketStock || { papatya: 20, lale: 20, gul: 20, lavanta: 20, orkide: 20, aycicegi: 20 }
        };
        const tempFile = DATA_FILE + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
        fs.renameSync(tempFile, DATA_FILE);
    } catch (e) {
        console.warn('Disk backup sync hatası:', e.message);
    }
}

function scheduleDiskBackup(immediate = false) {
    if (immediate) {
        flushNowSync();
        return;
    }
    if (diskBackupTimer) return;
    diskBackupTimer = setTimeout(() => {
        diskBackupTimer = null;
        flushNowSync();
    }, 400); // 1500ms'den 400ms'ye indirilerek veri kaybı riski minimize edildi
}

// Süreç aniden kapansa bile verileri diske kesin kaydet
process.on('exit', () => flushNowSync());
process.on('SIGINT', () => { flushNowSync(); process.exit(0); });
process.on('SIGTERM', () => { flushNowSync(); process.exit(0); });

// --- 1. KRİPTOGRAFİK ŞİFRELEME (SCRYPT İLE GÜVENLİ HASH) ---
function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.scryptSync(password, salt, 32).toString('hex');
    return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
    if (!storedHash || !salt || typeof password !== 'string') return false;
    try {
        const hash = crypto.scryptSync(password, salt, 32).toString('hex');
        const bufA = Buffer.from(hash, 'hex');
        const bufB = Buffer.from(storedHash, 'hex');
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch (e) {
        return false;
    }
}

function escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- 2. MONGOOSE İLE VERİ TABANINA ASENKRON ANLIK KAYIT ---
async function saveUserData(username, updateFields = null) {
    if (!username) return;
    const uKey = findUserKey(username) || username;
    if (updateFields && persistentData.users[uKey]) {
        Object.assign(persistentData.users[uKey], updateFields);
    }
    const dataToSave = updateFields || persistentData.users[uKey];
    if (!dataToSave) return;

    if (mongoose.connection.readyState === 1) {
        try {
            const updateDoc = { ...dataToSave };
            delete updateDoc._id;
            delete updateDoc.__v;
            updateDoc.username = uKey;

            const safePattern = escapeRegex(uKey);
            await User.updateOne(
                { username: { $regex: new RegExp(`^${safePattern}$`, 'i') } },
                { $set: updateDoc },
                { upsert: true }
            );
            dirtyUsers.delete(uKey);
        } catch (err) {
            console.error(`❌ [MONGODB HATA]: ${username} kullanıcısı kaydedilemedi:`, err.message);
        }
    }

    // Yerel data.json yedeğini daima senkronize tut
    try {
        scheduleDiskBackup();
    } catch (_) { }
}

async function savePersistentData(targetUsername = null, forceAll = false) {
    if (targetUsername) {
        await saveUserData(targetUsername);
        return;
    }

    if (mongoose.connection.readyState === 1) {
        try {
            // Yalnızca verisi değişen ("dirty") kullanıcıları kaydet, değişmemiş yüzlerce kullanıcıyı yazma
            const usersToSave = forceAll ? Object.keys(persistentData.users) : Array.from(dirtyUsers);
            if (usersToSave.length > 0) {
                const bulkOps = [];
                for (const uname of usersToSave) {
                    const uData = persistentData.users[uname];
                    if (!uData) continue;
                    const doc = { ...uData };
                    delete doc._id;
                    delete doc.__v;
                    doc.username = uname;
                    const safePattern = escapeRegex(uname);
                    bulkOps.push({
                        updateOne: {
                            filter: { username: { $regex: new RegExp(`^${safePattern}$`, 'i') } },
                            update: { $set: doc },
                            upsert: true
                        }
                    });
                }
                if (bulkOps.length > 0) {
                    await User.bulkWrite(bulkOps, { ordered: false });
                }
                for (const u of usersToSave) {
                    dirtyUsers.delete(u);
                }
            }
        } catch (err) {
            console.error('❌ [MONGODB HATA]: Toplu kayıt hatası:', err.message);
        }
    }

    // Yerel data.json yedeğini ve liderlik tablosunu (leaderboard) daima senkronize tut
    try {
        scheduleDiskBackup();
    } catch (_) { }
}

// Geriye dönük uyumluluk aliasları
function savePersistentDataAtomic() {
    return savePersistentData();
}

function flushNow() {
    return savePersistentData();
}

// --- 3. VERİ YÜKLEME VE İLK KURULUMDA DATA.JSON'DAN MONGODB'YE AKTARMA ---
async function loadPersistentData() {
    if (mongoose.connection.readyState === 1) {
        try {
            const users = await User.find({}).lean();
            const rawMap = {};
            for (const u of users) {
                rawMap[u.username] = u;
            }
            persistentData.users = createUsersProxy(rawMap);
            dirtyUsers.clear();
            console.log(`🍃 [MONGODB]: Kalıcı veriler MongoDB'den yüklendi (${users.length} kullanıcı).`);
            return;
        } catch (err) {
            console.error('❌ [MONGODB]: Veriler MongoDB\'den yüklenemedi:', err.message);
        }
    }

    // MongoDB bağlantısı henüz aktif değilse yerel önbellek dosyasından yükle
    if (fs.existsSync(DATA_FILE)) {
        try {
            const content = fs.readFileSync(DATA_FILE, 'utf-8');
            const parsed = JSON.parse(content);
            persistentData.users = createUsersProxy(parsed.users || {});
            dirtyUsers.clear();
            persistentData.botanicMarketStock = parsed.botanicMarketStock || { papatya: 20, lale: 20, gul: 20, lavanta: 20, orkide: 20, aycicegi: 20 };
            persistentData.leaderboard = parsed.leaderboard || { billiard: {}, batak: {}, tavla: {}, okey101: {}, xox: {}, amiral: {} };
            console.log(`📁 Yerel önbellekten veriler yüklendi (${Object.keys(persistentData.users).length} kullanıcı).`);
        } catch (e) {
            console.warn("Yerel veri okuma uyarısı:", e.message);
        }
    }
}

// MongoDB'ye ilk bağlantıda data.json'daki kullanıcıları içe aktarma
async function syncDataJsonToMongo() {
    if (mongoose.connection.readyState !== 1) return;
    try {
        console.log('🍃 [MONGODB]: data.json ve MongoDB iki yönlü senkronize ediliyor...');

        // 1. data.json'daki kullanıcıları kontrol et:
        // KURAL: Kullanıcı hem localde hem MongoDB'de varsa MongoDB'deki veri DAİMA GERÇEKTİR ve ÖNCELİKLİDİR.
        // MongoDB'deki mevcut kullanıcılara data.json'dan ASLA veri ezme/aktarma yapılmaz.
        // Yalnızca MongoDB'de hiç var olmayan (yerelde yeni açılmış) kullanıcılar MongoDB'ye eklenir.
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            const localUsers = parsed.users || {};
            let addedCount = 0;

            for (const [uname, u] of Object.entries(localUsers)) {
                try {
                    const existing = await User.findByUsername(uname);
                    if (!existing) {
                        const doc = { ...u, username: uname };
                        delete doc._id;
                        delete doc.__v;
                        await User.create(doc);
                        addedCount++;
                    }
                    // Kullanıcı MongoDB'de zaten varsa HİÇBİR ŞEY YAPMA:
                    // MongoDB'deki veriler (seviye, totalXP, para, elmas, envanter vb.) daima esastır ve dokunulmaz.
                } catch (userErr) {
                    // Tek bir kullanıcının hatası diğerlerini engellemesin
                }
            }
            if (addedCount > 0) {
                console.log(`✅ [MONGODB]: data.json içindeki ${addedCount} adet yeni kullanıcı MongoDB'ye başarıyla aktarıldı!`);
            }
        }

        // 2. Güncel kullanıcı listesini doğrudan MongoDB'den çek ve belleği güncelle (MongoDB Tek Gerçek Kaynak)
        const allUsers = await User.find({}).lean();
        const rawMap = {};
        for (const u of allUsers) {
            rawMap[u.username] = u;
        }
        persistentData.users = createUsersProxy(rawMap);
        dirtyUsers.clear();

        // Canlı moderatör rolü güvencesi (Elyesa)
        let elyesaKey = findUserKey('elyesa') || 'Elyesa';
        if (persistentData.users[elyesaKey]) {
            persistentData.users[elyesaKey].role = 'mod';
            persistentData.users[elyesaKey].isMod = true;
            await User.updateOne({ username: /^elyesa$/i }, { $set: { role: 'mod', isMod: true } }).catch(() => { });
        }

        // 3. Yerel data.json dosyasını da MongoDB'deki gerçek verilerle güncelle (MongoDB öncelikli tam senkronizasyon)
        flushNowSync();
        console.log(`🍃 [MONGODB]: Canlı veriler MongoDB ile senkronize edildi (${allUsers.length} kullanıcı aktif, MongoDB öncelikli).`);
    } catch (err) {
        console.error('❌ [MONGODB]: Senkronizasyon hatası:', err.message);
    }
}

// İlk başlatma
loadPersistentData();

// --- 3.1 ADMİN KULLANICILARI VE YETKİ KONTROLÜ ---
const ADMIN_USERS = ['yasin', 'maltoroz', 'elyesa'];
const MOD_USERS = [];

function isUserAdmin(name) {
    if (!name || typeof name !== 'string') return false;
    return ADMIN_USERS.includes(name.toLowerCase().trim());
}

function isUserMod(name) {
    if (!name || typeof name !== 'string') return false;
    let lower = name.toLowerCase().trim();
    if (MOD_USERS.includes(lower)) return true;
    let uKey = findUserKey(name);
    let u = uKey ? persistentData.users[uKey] : null;
    return !!(u && (u.role === 'mod' || u.role === 'moderator' || u.isMod === true));
}

// --- 4. KULLANICI ARAMA & EV / ODA AYRIŞTIRICILARI ---
function findUserKey(name) {
    if (!name || typeof name !== 'string') return null;
    let lower = name.toLowerCase().trim();
    return Object.keys(persistentData.users).find(k => k.toLowerCase() === lower) || null;
}

function parseHouseRoom(roomName) {
    if (!roomName || !roomName.toLowerCase().startsWith('house_')) return null;
    let parts = roomName.substring(6).split('_');
    let last = parts[parts.length - 1]?.toLowerCase();
    let houseType = (last === 'standart' || last === 'garden' || last === 'pool') ? last : null;
    let rawOwner = houseType ? parts.slice(0, -1).join('_') : parts.join('_');
    let owner = findUserKey(rawOwner) || rawOwner;
    return { owner, houseType };
}

function getFriendListData(username, playersOnline = {}) {
    let uKey = findUserKey(username) || username;
    let uData = persistentData.users[uKey];
    if (!uData || !uData.friends) return [];
    return uData.friends.map(fName => {
        let fKey = findUserKey(fName) || fName;
        let onlinePlayer = Object.values(playersOnline).find(p => p.name && p.name.toLowerCase() === fKey.toLowerCase());
        let fData = persistentData.users[fKey];
        return {
            username: fKey,
            isOnline: !!onlinePlayer,
            room: onlinePlayer ? onlinePlayer.room : null,
            house: fData ? fData.house : null
        };
    });
}

// --- 5. GÜVENLİ GİRİŞ, KAYIT VE ŞİFRE DEĞİŞTİRME (ASYNC / MONGOOSE) ---
async function loginUser(rawName, password, playersOnline = {}) {
    if (!rawName || typeof rawName !== 'string') {
        return { success: false, message: "❌ Kullanıcı adı boş olamaz!" };
    }
    const cleanName = rawName.trim();
    if (!password || typeof password !== 'string' || password.length < 3) {
        return { success: false, message: "❌ Şifre en az 3 karakter olmalıdır!" };
    }

    let uData = null;
    let existingKey = null;

    if (mongoose.connection.readyState === 1) {
        try {
            const dbUser = await User.findByUsername(cleanName);
            if (dbUser) {
                uData = dbUser.toObject ? dbUser.toObject() : dbUser;
                existingKey = uData.username;
                persistentData.users[existingKey] = uData;
            }
        } catch (e) {
            console.error('MongoDB loginUser sorgu hatası:', e.message);
        }
    }

    if (!uData) {
        existingKey = findUserKey(cleanName);
        if (existingKey) {
            uData = persistentData.users[existingKey];
        }
    }

    if (!existingKey || !uData) {
        return {
            success: false,
            message: "❌ Böyle bir hesap bulunamadı! Henüz hesabınız yoksa lütfen 'Kayıt Ol' sekmesini kullanın."
        };
    }

    // Çevrimiçi Çift Giriş Kontrolü (Aynı hesapla 2. giriş engeli)
    const isAlreadyOnline = Object.values(playersOnline).some(
        p => p && p.name && p.name.toLowerCase() === existingKey.toLowerCase()
    );
    if (isAlreadyOnline) {
        return {
            success: false,
            message: "⚠️ Bu hesap şu anda oyunda aktif! Eğer bu sizseniz diğer sekmeyi kapatın veya birkaç saniye bekleyin."
        };
    }

    // Şifre Doğrulama
    if (uData.auth && uData.auth.hash && uData.auth.salt) {
        const isValid = verifyPassword(password, uData.auth.hash, uData.auth.salt);
        if (!isValid) {
            return { success: false, message: "❌ Şifre hatalı!" };
        }
        if (isUserAdmin(existingKey)) {
            uData.role = 'admin';
            uData.isAdmin = true;
        } else if (isUserMod(existingKey)) {
            uData.role = 'mod';
            uData.isMod = true;
        }
        return {
            success: true,
            username: existingKey,
            userData: uData,
            isNew: false
        };
    }

    // Eski (legacy) hesap ilk girişte şifresini bağlar
    const { hash, salt } = hashPassword(password);
    uData.auth = { hash, salt };
    if (isUserAdmin(existingKey)) {
        uData.role = 'admin';
        uData.isAdmin = true;
    } else if (isUserMod(existingKey)) {
        uData.role = 'mod';
        uData.isMod = true;
    }
    persistentData.users[existingKey] = uData;
    await saveUserData(existingKey, uData);

    return {
        success: true,
        username: existingKey,
        userData: uData,
        isNew: false,
        upgraded: true
    };
}

async function registerUser(rawName, password, gender = 'male') {
    if (!rawName || typeof rawName !== 'string') {
        return { success: false, message: "❌ Kullanıcı adı boş olamaz!" };
    }
    const cleanName = rawName.trim();
    if (cleanName.length < 2 || cleanName.length > 20) {
        return { success: false, message: "❌ Kullanıcı adı 2-20 karakter arasında olmalıdır!" };
    }
    const USERNAME_REGEX = /^[a-zA-Z0-9_çÇğĞıİöÖşŞüÜ-]+( [a-zA-Z0-9_çÇğĞıİöÖşŞüÜ-]+)*$/;
    if (!USERNAME_REGEX.test(cleanName)) {
        return { success: false, message: "❌ Kullanıcı adı yalnızca harf, rakam, boşluk, tire ve alt çizgi içerebilir!" };
    }
    if (!password || typeof password !== 'string' || password.length < 3) {
        return { success: false, message: "❌ Şifre en az 3 karakter olmalıdır!" };
    }

    if (mongoose.connection.readyState === 1) {
        const existing = await User.findByUsername(cleanName);
        if (existing) {
            return {
                success: false,
                message: "❌ Bu kullanıcı adı zaten alınmış! Lütfen başka bir ad seçin veya 'Giriş Yap' sekmesini kullanın."
            };
        }
    } else if (findUserKey(cleanName)) {
        return {
            success: false,
            message: "❌ Bu kullanıcı adı zaten alınmış! Lütfen başka bir ad seçin veya 'Giriş Yap' sekmesini kullanın."
        };
    }

    const isFem = (gender === 'female');
    const { hash, salt } = hashPassword(password);

    const newUser = {
        username: cleanName,
        money: 1000,
        diamonds: 0,
        level: 1,
        totalXP: 0,
        dailyReward: {
            currentDay: 0,
            lastClaimDate: null,
            freezesUsed: 0,
            totalClaims: 0
        },
        gender: gender || 'male',
        auth: { hash, salt },
        role: isUserAdmin(cleanName) ? 'admin' : (isUserMod(cleanName) ? 'mod' : 'user'),
        isAdmin: isUserAdmin(cleanName),
        isMod: isUserMod(cleanName),
        badgeUnlockOrder: ['resident'],
        minedRocksCount: 0,
        botanicHarvestCount: 0,
        gamerGamesCount: 0,
        avatar: {
            model: 'karakter_2',
            hat: 'none',
            hair: isFem ? 'hair_k2_hime_cut' : 'hair_k2_fade_pompadour',
            face: 'none',
            skinColor: '#ffd1a4',
            shirtColor: isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street',
            color: isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street',
            shirt: isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street',
            pants: isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger',
            shoes: isFem ? 'shoes_k2_chunky_sneaker' : 'shoes_k2_skate_pro',
            heldItem: 'none'
        },
        inventory: isFem
            ? ['hair_k2_hime_cut', 'hair_hair_k2_hime_cut', 'skins_#ffd1a4', 'shirts_top_k2_pastel_hoodie', 'top_k2_pastel_hoodie', 'pants_pants_k2_cargo_mini', 'pants_k2_cargo_mini', 'shoes_shoes_k2_chunky_sneaker', 'shoes_k2_chunky_sneaker', 'face_none', 'props_none']
            : ['hair_k2_fade_pompadour', 'hair_hair_k2_fade_pompadour', 'skins_#ffd1a4', 'shirts_k2_cyber_street', 'k2_cyber_street', 'pants_pants_k2_tactical_jogger', 'pants_k2_tactical_jogger', 'shoes_shoes_k2_skate_pro', 'shoes_k2_skate_pro', 'face_none', 'props_none'],
        friends: [],
        friendRequests: [],
        house: null,
        houses: {},
        furnitureInventory: [],
        propInventory: {},
        likes: 0,
        dislikes: 0,
        ratings: {},
        motto: "",
        mood: 'happy',
        fishCaughtCount: 0,
        minedCount: 0,
        botanicHarvestPoints: 0,
        batakGamesCount: 0,
        okeyGamesCount: 0,
        tavlaGamesCount: 0,
        billiardGamesCount: 0,
        chessGamesCount: 0,
        amiralBattiGamesCount: 0,
        xoxGamesCount: 0,
        standupCount: 0,
        ganyanBetsCount: 0,
        createdAt: Date.now()
    };

    if (mongoose.connection.readyState === 1) {
        try {
            await User.create(newUser);
        } catch (dbErr) {
            console.error('MongoDB registerUser hatası:', dbErr.message);
            return { success: false, message: "❌ Veritabanına kayıt sırasında bir hata oluştu!" };
        }
    }

    persistentData.users[cleanName] = newUser;

    return {
        success: true,
        username: cleanName,
        userData: newUser,
        isNew: true
    };
}

async function changeUserPassword(username, oldPassword, newPassword) {
    if (!username || !oldPassword || !newPassword) {
        return { success: false, message: "❌ Lütfen tüm şifre alanlarını doldurun!" };
    }
    const cleanName = username.trim();
    let uData = null;
    let uKey = null;

    if (mongoose.connection.readyState === 1) {
        const userDoc = await User.findByUsername(cleanName);
        if (userDoc) {
            uData = userDoc;
            uKey = userDoc.username;
        }
    }

    if (!uData) {
        uKey = findUserKey(cleanName);
        if (uKey) uData = persistentData.users[uKey];
    }

    if (!uKey || !uData) {
        return { success: false, message: "❌ Kullanıcı bulunamadı!" };
    }

    if (!uData.auth || !uData.auth.hash) {
        return { success: false, message: "❌ Hesabın şifresi doğrulanamadı!" };
    }

    const isOldValid = verifyPassword(oldPassword, uData.auth.hash, uData.auth.salt);
    if (!isOldValid) {
        return { success: false, message: "❌ Mevcut eski şifrenizi yanlış girdiniz!" };
    }

    if (newPassword.length < 3) {
        return { success: false, message: "❌ Yeni şifre en az 3 karakter olmalıdır!" };
    }

    if (oldPassword === newPassword) {
        return { success: false, message: "❌ Yeni şifre eski şifrenizle aynı olamaz!" };
    }

    const { hash, salt } = hashPassword(newPassword);
    uData.auth = { hash, salt };

    if (persistentData.users[uKey]) {
        persistentData.users[uKey].auth = { hash, salt };
    }

    await saveUserData(uKey, { auth: { hash, salt } });

    return { success: true, message: "✅ Şifreniz başarıyla değiştirildi!" };
}

function authenticateOrRegister(rawName, password, gender = 'male', playersOnline = {}) {
    const existingKey = findUserKey(rawName);
    if (existingKey) {
        return loginUser(rawName, password, playersOnline);
    } else {
        return registerUser(rawName, password, gender);
    }
}

// --- 6. GİRDİ SANİTİZASYON VE DOĞRULAMA (INPUT SANITIZATION) ---
function sanitizeAmount(val, min = 0, max = 100000000) {
    let num = parseInt(val, 10);
    if (isNaN(num) || !Number.isFinite(num)) return null;
    if (num < min || num > max) return null;
    return num;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizeString(str, maxLen = 100, doEscape = true) {
    if (typeof str !== 'string') return '';
    let clean = str.trim().slice(0, maxLen);
    return doEscape ? escapeHtml(clean) : clean;
}

// --- 7. GÜNLÜK GÖREVLER (DAILY QUESTS) SİSTEMİ ---
function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_DAILY_QUESTS_DEF = [
    { id: 'okey101_play', title: '🀄 101 Okey Partisi', desc: "101 Okey masasında 1 el tamamla", target: 1, reward: config.DAILY_QUEST_REWARDS.okey101_play },
    { id: 'batak_play', title: '🃏 Koz Batak Ustası', desc: "Batak masasında 1 el tamamla", target: 1, reward: config.DAILY_QUEST_REWARDS.batak_play },
    { id: 'tavla_play', title: '🎲 Tavla Mücadelesi', desc: "Tavla masasında 1 oyun tamamla", target: 1, reward: config.DAILY_QUEST_REWARDS.tavla_play },
    { id: 'drink_tea', title: '☕ Tavşan Kanlı Çay', desc: "Kıraathane çay ocağından taze çay iç", target: 1, reward: config.DAILY_QUEST_REWARDS.drink_tea },
    { id: 'go_fishing', title: '🎣 Göl Kenarı Balıkçısı', desc: "Göl kenarında 1 kez olta atıp balık tut", target: 1, reward: config.DAILY_QUEST_REWARDS.go_fishing }
];

async function getUserDailyQuests(username) {
    const uKey = findUserKey(username) || username;
    let uData = persistentData.users[uKey];

    if (!uData && mongoose.connection.readyState === 1) {
        const dbU = await User.findByUsername(username);
        if (dbU) {
            uData = dbU.toObject ? dbU.toObject() : dbU;
            persistentData.users[uData.username] = uData;
        }
    }

    if (!uData) return [];
    const today = getTodayDateString();

    if (!uData.dailyQuests || uData.dailyQuests.date !== today) {
        uData.dailyQuests = {
            date: today,
            quests: DEFAULT_DAILY_QUESTS_DEF.map(q => ({
                id: q.id,
                title: q.title,
                desc: q.desc,
                target: q.target,
                reward: q.reward,
                current: 0,
                claimed: false
            }))
        };
        await saveUserData(uKey, { dailyQuests: uData.dailyQuests });
    } else {
        let rewardsUpdated = false;
        for (const quest of uData.dailyQuests.quests) {
            const definition = DEFAULT_DAILY_QUESTS_DEF.find(q => q.id === quest.id);
            if (definition && quest.reward !== definition.reward) {
                quest.reward = definition.reward;
                rewardsUpdated = true;
            }
        }
        if (rewardsUpdated) {
            await saveUserData(uKey, { dailyQuests: uData.dailyQuests });
        }
    }

    return uData.dailyQuests.quests;
}

async function recordQuestProgress(username, questId, amount = 1) {
    const uKey = findUserKey(username) || username;
    let uData = persistentData.users[uKey];
    if (!uData) return null;
    const quests = await getUserDailyQuests(uKey);
    const quest = quests.find(q => q.id === questId);
    if (!quest) return null;

    if (quest.current < quest.target) {
        quest.current = Math.min(quest.target, quest.current + amount);
        await saveUserData(uKey, { dailyQuests: uData.dailyQuests });
        return quest;
    }
    return null;
}

async function claimQuestReward(username, questId) {
    const uKey = findUserKey(username) || username;
    let uData = persistentData.users[uKey];
    if (!uData) return { success: false, msg: "Kullanıcı bulunamadı!" };
    const quests = await getUserDailyQuests(uKey);
    const quest = quests.find(q => q.id === questId);

    if (!quest) return { success: false, msg: "Görev bulunamadı!" };
    if (quest.current < quest.target) return { success: false, msg: "Bu görevi henüz tamamlamadınız!" };
    if (quest.claimed) return { success: false, msg: "Bu görevin ödülünü zaten aldınız!" };

    quest.claimed = true;
    uData.money = (uData.money || 100) + quest.reward;
    await saveUserData(uKey, { money: uData.money, dailyQuests: uData.dailyQuests });

    return {
        success: true,
        reward: quest.reward,
        newMoney: uData.money,
        quests: uData.dailyQuests.quests,
        msg: `🎉 Tebrikler! "${quest.title}" görevinden ${quest.reward} TL kazandınız!`
    };
}

let serverContext = {
    io: null,
    players: null
};

function setServerContext(io, players) {
    serverContext.io = io;
    serverContext.players = players;
}

const BADGE_TIER_TABLES = {
    gamer: [
        { level: 1, min: 1, max: 9, title: "Acemi Oyuncu" },
        { level: 2, min: 10, max: 24, title: "Masa yancısı" },
        { level: 3, min: 25, max: 49, title: "Kıdemli Oyuncu" },
        { level: 4, min: 50, max: 99, title: "Uzman Oyuncu" },
        { level: 5, min: 100, max: 199, title: "Usta Oyuncu" },
        { level: 6, min: 200, max: 349, title: "Büyük Usta" },
        { level: 7, min: 350, max: 599, title: "Racon Kesici" },
        { level: 8, min: 600, max: 999, title: "Şampiyon" },
        { level: 9, min: 1000, max: 1499, title: "Hükümdar" },
        { level: 10, min: 1500, max: 9999999, title: "Oyunbaz" }
    ],
    botanic: [
        { level: 1, min: 1, max: 14, title: "Acemi Bahçıvan" },
        { level: 2, min: 15, max: 49, title: "Çırak Bahçıvan" },
        { level: 3, min: 50, max: 99, title: "Kıdemli Bahçıvan" },
        { level: 4, min: 100, max: 199, title: "Uzman Bahçıvan" },
        { level: 5, min: 200, max: 399, title: "Usta Bahçıvan" },
        { level: 6, min: 400, max: 749, title: "Botanik Uzmanı" },
        { level: 7, min: 750, max: 1249, title: "Çiçek Üstadı" },
        { level: 8, min: 1250, max: 1999, title: "Botanik Şampiyonu" },
        { level: 9, min: 2000, max: 3499, title: "Flora Hükümdarı" },
        { level: 10, min: 3500, max: 9999999, title: "Efsanevi Botanikçi" }
    ],
    fish: [
        { level: 1, min: 1, max: 24, title: "Acemi Balıkçı" },
        { level: 2, min: 25, max: 99, title: "Çırak Balıkçı" },
        { level: 3, min: 100, max: 199, title: "Kıdemli Balıkçı" },
        { level: 4, min: 200, max: 399, title: "Uzman Balıkçı" },
        { level: 5, min: 400, max: 799, title: "Usta Balıkçı" },
        { level: 6, min: 800, max: 1599, title: "Kaptan Balıkçı" },
        { level: 7, min: 1600, max: 3199, title: "Deniz Kurdu" },
        { level: 8, min: 3200, max: 5999, title: "Okyanus Avcısı" },
        { level: 9, min: 6000, max: 9999, title: "Denizler Hükümdarı" },
        { level: 10, min: 10000, max: 9999999, title: "Poseidon'un Varisi" }
    ],
    mining: [
        { level: 1, min: 1, max: 24, title: "Acemi Madenci" },
        { level: 2, min: 25, max: 99, title: "Çırak Madenci" },
        { level: 3, min: 100, max: 199, title: "Kıdemli Madenci" },
        { level: 4, min: 200, max: 399, title: "Uzman Madenci" },
        { level: 5, min: 400, max: 799, title: "Usta Madenci" },
        { level: 6, min: 800, max: 1599, title: "Cevher Avcısı" },
        { level: 7, min: 1600, max: 3199, title: "Derin Kazıcı" },
        { level: 8, min: 3200, max: 5999, title: "Maden Şampiyonu" },
        { level: 9, min: 6000, max: 9999, title: "Yeraltı Hükümdarı" },
        { level: 10, min: 10000, max: 9999999, title: "Efsanevi Kazıcı" }
    ],
    resident: [
        { level: 1, min: 1, max: 3, title: "Yeni Sakin" },
        { level: 2, min: 4, max: 7, title: "1 Haftalık" },
        { level: 3, min: 8, max: 14, title: "2 Haftalık" },
        { level: 4, min: 15, max: 30, title: "1 Aylık" },
        { level: 5, min: 31, max: 60, title: "2 Aylık" },
        { level: 6, min: 61, max: 90, title: "3 Aylık" },
        { level: 7, min: 91, max: 180, title: "Kıdemli Sakin" },
        { level: 8, min: 181, max: 270, title: "Vatandaş" },
        { level: 9, min: 271, max: 365, title: "Onursal Sakin" },
        { level: 10, min: 366, max: 9999999, title: "Metaverse Kurucusu" }
    ]
};
BADGE_TIER_TABLES.fishing = BADGE_TIER_TABLES.fish;

function getBadgeThresholdList(badgeKey, isSeniority = false) {
    if (isSeniority || badgeKey === 'resident') return BADGE_TIER_TABLES.resident;
    if (badgeKey && BADGE_TIER_TABLES[badgeKey]) return BADGE_TIER_TABLES[badgeKey];
    return BADGE_TIER_TABLES.gamer;
}

const UNIVERSAL_THRESHOLDS = BADGE_TIER_TABLES.gamer;
const SENIORITY_THRESHOLDS = BADGE_TIER_TABLES.resident;

const BADGE_CONFIG = {
    botanic: {
        id: 'botanic',
        name: 'Botanik Rozeti',
        shortName: 'Botanik',
        icon: '🌿',
        statKey: 'botanicHarvestCount',
        unit: 'Hasat',
        isSeniority: false
    },
    gamer: {
        id: 'gamer',
        name: 'Oyunbaz',
        shortName: 'Oyunbaz',
        icon: '🎮',
        statKey: 'gamerGamesCount',
        unit: 'El',
        isSeniority: false
    },
    mining: {
        id: 'mining',
        name: 'Madencilik',
        shortName: 'Madencilik',
        icon: '⛏️',
        statKey: 'minedRocksCount',
        unit: 'Kaya',
        isSeniority: false
    },
    fish: {
        id: 'fish',
        name: 'Balıkçılık',
        shortName: 'Balıkçılık',
        icon: '🎣',
        statKey: 'fishCaughtCount',
        unit: 'Balık',
        isSeniority: false
    },
    standup: {
        id: 'standup',
        name: 'Stand-Up Yıldızı',
        shortName: 'Stand-Up',
        icon: '🎙️',
        statKey: 'standupCount',
        unit: 'Gösteri',
        isSeniority: false
    },
    ganyan: {
        id: 'ganyan',
        name: 'Ganyan Şampiyonu',
        shortName: 'Ganyan',
        icon: '🏇',
        statKey: 'ganyanBetsCount',
        unit: 'Kupon',
        isSeniority: false
    },
    resident: {
        id: 'resident',
        name: 'Metaverse Sakini',
        shortName: 'Sakin',
        icon: '⭐',
        statKey: 'totalXP',
        unit: 'XP',
        isSeniority: false,
        isLevel: true
    }
};
BADGE_CONFIG.fishing = BADGE_CONFIG.fish;

function calculateBadgeTier(count, isSeniority = false, badgeKey = null) {
    count = Number(count) || 0;
    if (count <= 0) return 0;
    const list = getBadgeThresholdList(badgeKey, isSeniority);
    for (const t of list) {
        if (count >= t.min && count <= t.max) {
            return t.level;
        }
    }
    return 10;
}

function getBadgeThresholdInfo(level, isSeniority = false, badgeKey = null) {
    const list = getBadgeThresholdList(badgeKey, isSeniority);
    return list.find(t => t.level === level) || list[list.length - 1];
}

function checkAndAwardBadgeLevelUp(username, badgeKey, oldCount, newCount) {
    if (!username) return;
    const userKey = findUserKey(username) || username;
    const user = persistentData.users[userKey];
    if (!user) return;

    if (badgeKey === 'fishing') badgeKey = 'fish';

    const badgeCfg = BADGE_CONFIG[badgeKey] || BADGE_CONFIG.fish;
    if (!badgeCfg) return;

    // Oyuncunun mevcut sayacını belirle
    let currentCount = (newCount !== undefined && newCount !== null) ? Number(newCount) : Number(user[badgeCfg.statKey] || 0);
    if (badgeKey === 'mining') {
        currentCount = Math.max(Number(user.minedRocksCount || 0), Number(user.minedCount || 0), currentCount);
    } else if (badgeKey === 'botanic') {
        currentCount = Math.max(Number(user.botanicHarvestCount || 0), Number(user.botanicHarvestPoints || 0), currentCount);
    } else if (badgeKey === 'gamer') {
        currentCount = Math.max(Number(user.gamerGamesCount || 0), currentCount);
    } else if (badgeKey === 'fish' || badgeKey === 'fishing') {
        currentCount = Math.max(Number(user.fishCaughtCount || 0), currentCount);
    }

    const targetLevel = calculateBadgeTier(currentCount, badgeCfg.isSeniority, badgeKey);
    if (targetLevel < 1) return;

    if (!user.claimedBadgeLevels) user.claimedBadgeLevels = {};
    if (!Array.isArray(user.claimedBadgeLevels[badgeKey])) {
        user.claimedBadgeLevels[badgeKey] = [];
    }

    // badgeUnlockOrder'a ekle (Rozet vitrininde yer alması için)
    if (!Array.isArray(user.badgeUnlockOrder)) {
        user.badgeUnlockOrder = ['resident'];
    }
    const bUnlockKey = (badgeKey === 'fish') ? 'fishing' : badgeKey;
    if (!user.badgeUnlockOrder.includes(bUnlockKey)) {
        user.badgeUnlockOrder.push(bUnlockKey);
    }

    let hasAwarded = false;
    // 1'den hedef seviyeye kadar henüz alınmamış TÜM seviye ödüllerini eksiksiz ver (1. seviye dahil!)
    for (let lvl = 1; lvl <= targetLevel; lvl++) {
        if (user.claimedBadgeLevels[badgeKey].includes(lvl)) continue;
        user.claimedBadgeLevels[badgeKey].push(lvl);
        hasAwarded = true;

        // Kullanıcı kuralı: 1. seviye 1000 TL & 5 elmas; katlanarak gider (lvl * 1000 TL ve lvl * 5 elmas)
        const rewardMoney = lvl * 1000;
        const rewardDiamonds = lvl * 5;

        user.money = (Number(user.money) || 0) + rewardMoney;
        user.diamonds = (Number(user.diamonds) || 0) + rewardDiamonds;

        const info = getBadgeThresholdInfo(lvl, badgeCfg.isSeniority, badgeKey);
        const rankTitle = info ? info.title : `${lvl}. Seviye`;

        const payload = {
            badgeId: bUnlockKey,
            badgeName: badgeCfg.name,
            shortName: badgeCfg.shortName,
            badgeIcon: badgeCfg.icon,
            level: lvl,
            rankTitle: rankTitle,
            rewardMoney: rewardMoney,
            rewardDiamonds: rewardDiamonds,
            newMoney: user.money,
            newDiamonds: user.diamonds
        };

        let targetSocket = null;
        if (serverContext.players) {
            for (let sId in serverContext.players) {
                const p = serverContext.players[sId];
                if (p && (p.name === username || p.username === username)) {
                    p.money = user.money;
                    p.diamonds = user.diamonds;
                    if (serverContext.io && serverContext.io.sockets && serverContext.io.sockets.sockets) {
                        targetSocket = serverContext.io.sockets.sockets.get(sId);
                    }
                    break;
                }
            }
        }

        if (targetSocket) {
            targetSocket.emit('badgeLevelUp', payload);
            targetSocket.emit('moneyUpdate', user.money);
            targetSocket.emit('diamondUpdate', user.diamonds);
            targetSocket.emit('systemMessage', `🎉 TEBRİKLER! ${badgeCfg.name} ${lvl}. Seviyeye ulaştınız! Ödülünüz: +${rewardMoney.toLocaleString('tr-TR')} TL & +${rewardDiamonds} Elmas!`);
        } else {
            if (!user.pendingBadgeLevelUps) user.pendingBadgeLevelUps = [];
            user.pendingBadgeLevelUps.push(payload);
        }
    }

    if (hasAwarded) {
        savePersistentData();
    }
}

function checkAndAwardResidentLevel(username, seniorityDays) {
    if (!username) return;
    const userKey = findUserKey(username) || username;
    const user = persistentData.users[userKey];
    if (!user) return;

    const days = Math.max(1, Number(seniorityDays) || 1);
    const lastCheckedDays = user.lastCheckedSeniorityDays !== undefined ? user.lastCheckedSeniorityDays : 0;
    
    checkAndAwardBadgeLevelUp(username, 'resident', lastCheckedDays, days);
    user.lastCheckedSeniorityDays = days;
}

function recordGamePlayed(username, gameKey, countMultiplier = 1) {
    if (!username || typeof username !== 'string') return;
    const userKey = findUserKey(username) || username;
    const user = persistentData.users[userKey];
    if (!user) return;

    const multiplier = Math.max(1, Number(countMultiplier) || 1);

    const boardGameKeys = ['gamer', 'batak', 'okey', 'okey101', 'tavla', 'billiard', 'chess', 'amiral', 'amiralbatti', 'xox', 'dostkazigi'];
    const isBoardGame = boardGameKeys.includes(gameKey);

    let oldGamerCount = 0;
    let newGamerCount = 0;

    if (isBoardGame) {
        if (user.gamerGamesCount === undefined || user.gamerGamesCount === null) {
            user.gamerGamesCount = (Number(user.batakGamesCount) || 0) +
                                  (Number(user.okeyGamesCount) || 0) +
                                  (Number(user.tavlaGamesCount) || 0) +
                                  (Number(user.billiardGamesCount) || 0) +
                                  (Number(user.chessGamesCount) || 0) +
                                  (Number(user.amiralBattiGamesCount) || 0) +
                                  (Number(user.xoxGamesCount) || 0) +
                                  (Number(user.dostKazigiGamesCount) || 0);
        }
        oldGamerCount = Number(user.gamerGamesCount) || 0;
        user.gamerGamesCount = oldGamerCount + multiplier;
        newGamerCount = user.gamerGamesCount;
    }

    const fieldMap = {
        'batak': 'batakGamesCount',
        'okey': 'okeyGamesCount',
        'okey101': 'okeyGamesCount',
        'tavla': 'tavlaGamesCount',
        'billiard': 'billiardGamesCount',
        'chess': 'chessGamesCount',
        'amiral': 'amiralBattiGamesCount',
        'amiralbatti': 'amiralBattiGamesCount',
        'xox': 'xoxGamesCount',
        'dostkazigi': 'dostKazigiGamesCount',
        'standup': 'standupCount',
        'ganyan': 'ganyanBetsCount',
        'fish': 'fishCaughtCount',
        'fishing': 'fishCaughtCount',
        'mining': 'minedRocksCount',
        'botanic': 'botanicHarvestCount'
    };

    let oldSpecificCount = 0;
    let newSpecificCount = 0;

    if (fieldMap[gameKey]) {
        const field = fieldMap[gameKey];
        oldSpecificCount = Number(user[field]) || 0;
        user[field] = oldSpecificCount + multiplier;
        newSpecificCount = user[field];
        if (gameKey === 'mining') {
            user.minedCount = Number(user.minedCount || 0) + multiplier;
        } else if (gameKey === 'botanic') {
            user.botanicHarvestPoints = Number(user.botanicHarvestPoints || 0) + multiplier;
        }
    }

    // Rozet kilit açma sırasını kaydet (Level/Resident daima ilk yuva)
    if (!Array.isArray(user.badgeUnlockOrder)) {
        user.badgeUnlockOrder = ['resident'];
    } else {
        // Eski 'fish' ve tahta oyunlarını normalize et
        const legacyKeys = ['batak', 'okey', 'okey101', 'tavla', 'billiard', 'chess', 'amiral', 'amiralbatti', 'xox', 'dostkazigi'];
        const normalized = [];
        let gamerFound = false;
        user.badgeUnlockOrder.forEach(k => {
            if (k === 'fish') {
                if (!normalized.includes('fishing')) normalized.push('fishing');
            } else if (legacyKeys.includes(k) || k === 'gamer') {
                if (!gamerFound) {
                    normalized.push('gamer');
                    gamerFound = true;
                }
            } else if (!normalized.includes(k)) {
                normalized.push(k);
            }
        });
        if (!normalized.includes('resident')) {
            normalized.unshift('resident');
        }
        user.badgeUnlockOrder = normalized;
    }
    const badgeKey = isBoardGame ? 'gamer' : (gameKey === 'fish' ? 'fishing' : gameKey);
    if (!user.badgeUnlockOrder.includes(badgeKey)) {
        user.badgeUnlockOrder.push(badgeKey);
    }

    savePersistentData();

    // Seviye Atlama ve Katlamalı Ödül Sistemi
    if (isBoardGame) {
        checkAndAwardBadgeLevelUp(username, 'gamer', oldGamerCount, newGamerCount);
    } else if (BADGE_CONFIG[gameKey]) {
        checkAndAwardBadgeLevelUp(username, gameKey, oldSpecificCount, newSpecificCount);
    }
}

module.exports = {
    dirtyUsers,
    markUserDirty,
    recordGamePlayed,
    setServerContext,
    checkAndAwardBadgeLevelUp,
    checkAndAwardResidentLevel,
    calculateBadgeTier,
    BADGE_CONFIG,
    BADGE_TIER_TABLES,
    persistentData,
    loadPersistentData,
    syncDataJsonToMongo,
    savePersistentData,
    saveUserData,
    savePersistentDataAtomic,
    flushNow,
    flushNowSync,
    findUserKey,
    parseHouseRoom,
    getFriendListData,
    loginUser,
    registerUser,
    changeUserPassword,
    authenticateOrRegister,
    hashPassword,
    verifyPassword,
    sanitizeAmount,
    sanitizeString,
    escapeHtml,
    getUserDailyQuests,
    recordQuestProgress,
    claimQuestReward,
    isUserAdmin,
    ADMIN_USERS,
    isUserMod,
    MOD_USERS,
    escapeRegex
};
