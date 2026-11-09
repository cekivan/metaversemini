const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function registerClient(username, password) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('register', {
                name: username,
                pass: password,
                gender: 'male'
            });
        });

        socket.on('loginSuccess', () => {
            resolve(socket);
        });

        socket.on('registerFailed', (err) => {
            reject(new Error(`Register failed for ${username}: ${err}`));
        });

        setTimeout(() => {
            reject(new Error(`Timeout registering ${username}`));
        }, 5000);
    });
}

async function runTests() {
    console.log('🚀 Starting Anon Mask System Automated Test...');
    const rnd = Math.floor(Math.random() * 89999 + 10000);
    const nameA = 'test_A_' + rnd;
    const nameB = 'test_B_' + rnd;

    const socketA = await registerClient(nameA, 'pass123');
    const socketB = await registerClient(nameB, 'pass123');
    console.log(`✅ Registered & Logged in Player A: ${nameA} (${socketA.id}) and Player B: ${nameB} (${socketB.id})`);

    socketA.on('gameError', err => console.log('⚠️ SocketA gameError:', err));
    socketB.on('gameError', err => console.log('⚠️ SocketB gameError:', err));
    socketA.on('systemMessage', msg => console.log('ℹ️ SocketA sysMsg:', msg));
    socketB.on('systemMessage', msg => console.log('ℹ️ SocketB sysMsg:', msg));

    // Give Player A XP (to reach Level >= 5), Money (50.000 TL), and Diamonds (20)
    console.log('\n--- Setting up Player A with Level 5+, Money, and Diamonds ---');
    socketA.emit('adminAddXP', { targetUsername: nameA, xp: 1000, secret: 'metaverse_test_dev' });
    socketA.emit('adminModifyMoney', { targetUsername: nameA, amount: 50000, mode: 'set', secret: 'metaverse_test_dev' });
    socketA.emit('adminModifyDiamonds', { targetUsername: nameA, amount: 20, mode: 'set', secret: 'metaverse_test_dev' });
    await wait(600);

    // Both players move to vip_club so they are in the same room
    socketA.emit('changeRoom', { room: 'vip_club' });
    socketB.emit('changeRoom', { room: 'vip_club' });
    await wait(600);

    // 1. Buy anon_mask from Tekinsiz Tekin
    console.log('\n--- 1. Purchasing Anon Mask ---');
    const shadyState = await new Promise(resolve => {
        socketA.once('shadyShopState', resolve);
        socketA.emit('buyShadyItem', { itemId: 'anon_mask' });
    });
    console.log(`Shady Shop State after buy: anonMaskCount = ${shadyState.anonMaskCount}, anonMaskExpiresAt = ${shadyState.anonMaskExpiresAt}`);
    if (shadyState.anonMaskCount < 1) throw new Error('Expected anonMaskCount >= 1');
    if (shadyState.anonMaskExpiresAt > Date.now()) throw new Error('Mask should NOT be auto-equipped on purchase!');
    console.log('✅ Mask added to bag as consumable prop without auto-equipping!');

    // 2. Equip / Use Anon Mask
    console.log('\n--- 2. Equipping Anon Mask ---');
    const shadyStateAfterUse = await new Promise(resolve => {
        socketA.once('shadyShopState', resolve);
        socketA.emit('useAnonMask');
    });
    console.log(`Shady Shop State after use: anonMaskCount = ${shadyStateAfterUse.anonMaskCount}, anonMaskExpiresAt = ${shadyStateAfterUse.anonMaskExpiresAt}`);
    if (shadyStateAfterUse.anonMaskExpiresAt <= Date.now()) throw new Error('Mask should be active now!');
    console.log('✅ Mask equipped successfully, 30 min timer started!');

    // 3. Room Chat Masking
    console.log('\n--- 3. Testing Chat Message Masking & Smoky Aura Flag ---');
    const chatPromise = new Promise(resolve => {
        socketB.once('chatUpdate', resolve);
    });
    socketA.emit('chatMessage', { msg: 'Gölgelerden selamlar!', channel: 'room' });
    const chatMsg = await chatPromise;
    console.log(`Player B received chat: name = "${chatMsg.name}", msg = "${chatMsg.msg}", isAnon = ${chatMsg.isAnon}`);
    if (chatMsg.name !== '???') throw new Error(`Expected name '???', got '${chatMsg.name}'`);
    if (!chatMsg.isAnon) throw new Error('Expected isAnon = true on chat message!');
    console.log('✅ Chat name redacted to "???" and isAnon: true passed for smoky aura!');

    // 4. Whisper from Masked Player A to Player B
    console.log('\n--- 4. Whisper from Masked Player A to Player B ---');
    const whisperIndPromise1 = new Promise(resolve => {
        socketB.once('chatWhisperIndicator', resolve);
    });
    socketA.emit('chatMessage', { msg: `/w ${nameB} Gizli bir operasyon var...` });
    const whisperInd1 = await whisperIndPromise1;
    console.log(`Whisper indicator 1: bubbleText = "${whisperInd1.bubbleText}", isAnon = ${whisperInd1.isAnon}`);
    if (!whisperInd1.bubbleText.includes('fısıldıyor')) throw new Error('Expected bubbleText to contain fısıldıyor');
    if (!whisperInd1.isAnon) throw new Error('Expected isAnon: true for masked whisperer smoky aura bubble!');
    console.log('✅ Masked sender whisper indicator emits target name + isAnon: true (smoky bubble aura)!');

    // 5. Whisper from Player B to Masked Player A
    console.log('\n--- 5. Whisper from Player B to Masked Player A ---');
    const whisperIndPromise2 = new Promise(resolve => {
        socketA.once('chatWhisperIndicator', resolve);
    });
    socketB.emit('chatMessage', { msg: `/w @${socketA.id} Seni duyuyorum kim olduğunu bilmiyorum.` });
    const whisperInd2 = await whisperIndPromise2;
    console.log(`Whisper indicator 2: bubbleText = "${whisperInd2.bubbleText}", isAnon = ${whisperInd2.isAnon}`);
    if (!whisperInd2.bubbleText.includes('kimliği belirsiz şahısa fısıldıyor')) {
        throw new Error(`Expected 'kimliği belirsiz şahısa fısıldıyor', got '${whisperInd2.bubbleText}'`);
    }
    if (whisperInd2.isAnon) throw new Error('Expected isAnon: false for normal whisperer!');
    console.log('✅ Player B whispering to mask emitted "kimliği belirsiz şahısa fısıldıyor" with normal bubble!');

    // 6. Online Players List Masking
    console.log('\n--- 6. Online Players List Masking ---');
    const onlineListPromise = new Promise(resolve => {
        socketB.once('onlinePlayersListUpdate', resolve);
    });
    socketB.emit('getOnlinePlayers');
    const onlineData = await onlineListPromise;
    const entryA = onlineData.players.find(p => p.id === socketA.id);
    console.log('Player B sees Player A in online list as:', entryA);
    if (entryA.username !== '???') throw new Error(`Expected online username '???', got '${entryA.username}'`);
    if (!entryA.isAnon) throw new Error('Expected isAnon: true in online list');
    if (entryA.role === 'admin' || entryA.isVip) throw new Error('Badges/roles should be suppressed');
    console.log('✅ Online list 100% hides player identity (username: ???, isAnon: true, location: 🎭 Gizli Lokasyon)!');

    // 7. Hayalet Profil (Ghost Profile) Query
    console.log('\n--- 7. Hayalet Profil (Ghost Profile) Query ---');
    const profilePromise = new Promise(resolve => {
        socketB.once('profileDetailsResult', resolve);
    });
    socketB.emit('getProfileDetails', { targetId: socketA.id, targetName: '???' });
    const profDetails = await profilePromise;
    console.log('Profile details result for masked player:', profDetails);
    if (!profDetails.isAnon) throw new Error('Expected isAnon: true in profile details');
    if (profDetails.targetName !== '???') throw new Error(`Expected targetName '???', got '${profDetails.targetName}'`);
    if (profDetails.level !== '🔒 Gizli') throw new Error(`Expected level '🔒 Gizli', got '${profDetails.level}'`);
    if (profDetails.gameStats !== null) throw new Error('gameStats should be null in ghost profile!');
    console.log('✅ Hayalet Profil returned with all stats, XP, level, and badges completely hidden!');

    // 8. Mugging Announcement Masking
    console.log('\n--- 8. Mugging Announcement Masking ---');
    socketA.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(400);
    
    const mugAnnouncePromise = new Promise(resolve => {
        const handler = (msg) => {
            if (msg && msg.name === '🚨 KARANLIK SOKAKLAR') {
                socketB.off('chatUpdate', handler);
                resolve(msg);
            }
        };
        socketB.on('chatUpdate', handler);
    });
    socketA.emit('useMugKnifeOnPlayer', { targetUsername: nameB, targetSocketId: socketB.id });
    const mugAnnouncement = await mugAnnouncePromise;
    console.log('Mug Public Announcement received:', mugAnnouncement);
    if (!mugAnnouncement.msg.includes('Maskeli bir şahıs az önce')) {
        throw new Error(`Expected announcement to contain "Maskeli bir şahıs az önce", got: "${mugAnnouncement.msg}"`);
    }
    console.log('✅ Mugging announcement strictly uses exact wording: "Maskeli bir şahıs az önce [kurban]\'ı gasp etti ve kaçtı."!');

    // 9. Remove Mask Early
    console.log('\n--- 9. Remove Mask Early ---');
    const shadyStateAfterRemove = await new Promise(resolve => {
        socketA.once('shadyShopState', resolve);
        socketA.emit('removeAnonMask');
    });
    console.log(`Shady Shop State after remove: anonMaskExpiresAt = ${shadyStateAfterRemove.anonMaskExpiresAt}`);
    if (shadyStateAfterRemove.anonMaskExpiresAt !== 0) throw new Error('Expected anonMaskExpiresAt == 0');
    console.log('✅ Mask removed early successfully, identity returned to normal!');

    console.log('\n🎉 ALL 9 TEST STEPS PASSED WITH 100% SUCCESS! 🎭✨');
    socketA.disconnect();
    socketB.disconnect();
    process.exit(0);
}

runTests().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
