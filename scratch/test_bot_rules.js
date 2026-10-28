// scratch/test_bot_rules.js
const assert = require('assert');
const tableManager = require('../src/tableManager');
const playerHelpers = require('../src/utils/playerHelpers');

console.log('=== TEST 1: BAHİSLİ MASAYA OYUN BAŞINDA BOT EKLEME ENGELİ ===');
// Ücretsiz masa aç
const freeTableRes = tableManager.createNewTable({ baseType: 'batak', bet: 0, name: 'Ücretsiz Test' }, {}, { socketId: 'test_creator_1' });
assert(freeTableRes.success, 'Ücretsiz masa açılabilmeli');
const freeBotRes = tableManager.addBotToTable(freeTableRes.tableId, {}, {});
assert(freeBotRes.success, 'Ücretsiz masaya bot eklenebilmeli');
console.log('[PASS] Ücretsiz masaya başarıyla bot eklendi.');

// Bahisli masa aç (1000 TL)
const betTableRes = tableManager.createNewTable({ baseType: 'batak4', bet: 1000, name: 'Bahisli Test' }, {}, { socketId: 'test_creator_2' });
assert(betTableRes.success, 'Bahisli masa açılabilmeli');
const betBotRes = tableManager.addBotToTable(betTableRes.tableId, {}, {});
assert(!betBotRes.success, 'Bahisli masaya oyun başında bot eklenememeli');
assert(betBotRes.message.includes('Bahisli masalara oyun başında bot eklenemez'), 'Hata mesajı doğru olmalı');
console.log('[PASS] Bahisli masaya bot ekleme engellendi: ' + betBotRes.message);

console.log('=== TEST 2: ADMİN PANELİNDE BOTLARIN GÖZÜKMEMESİ ===');
const mockPlayers = {
    'sock_real_1': { name: 'Ahmet123', money: 500, room: 'kafe', isBot: false },
    'sock_real_2': { name: 'Mehmet456', money: 1200, room: 'sokak', isBot: false },
    'bot_173000_1': { name: '🤖 Çaycı İsmail', money: 99999, room: 'kafe', isBot: true },
    'bot_173000_2': { name: '🤖 Hasan Dayı', money: 99999, room: 'kafe', isBot: true }
};

const adminUsers = playerHelpers.getAdminOnlineUsers(mockPlayers);
const botNamesFound = adminUsers.filter(u => u.username.startsWith('🤖') || u.username.startsWith('bot_') || u.isBot);
assert.strictEqual(botNamesFound.length, 0, 'Admin kullanıcı listesinde kesinlikle bot bulunmamalı!');
assert.strictEqual(adminUsers.length, 2, 'Yalnızca 2 gerçek kullanıcı listelenmeli');
console.log('[PASS] Admin panelinde sadece gerçek kullanıcılar listelendi (Bot sayısı: 0):', adminUsers.map(u => u.username));

// Temizlik
tableManager.closeTable(freeTableRes.tableId);
tableManager.closeTable(betTableRes.tableId);

console.log('>>> TÜM TESTLER BAŞARIYLA GEÇTİ! <<<');
