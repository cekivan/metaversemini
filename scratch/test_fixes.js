const assert = require('assert');
const dataManager = require('../src/dataManager');
const tableManager = require('../src/tableManager');
const User = require('../src/models/User');

console.log('--- BAŞLATILIYOR: DÜZELTME TESTLERİ ---');

// TEST 1: escapeRegex işlevi
console.log('1. escapeRegex testi...');
const dangerousNames = ['test+1', 'Ahmet(Pro)', 'user[name]', 'hello.*world', 'admin$'];
dangerousNames.forEach(name => {
    assert.doesNotThrow(() => {
        const escaped = dataManager.escapeRegex(name);
        new RegExp(`^${escaped}$`, 'i');
    }, `escapeRegex failed for ${name}`);
});
console.log('✅ escapeRegex başarılı.');

// TEST 2: User.findByUsername regex güvenliği
console.log('2. User.findByUsername regex güvenliği testi...');
assert.doesNotThrow(() => {
    // MongoDB'ye bağlı olmasa bile findOne çağrısı syntax error vermemeli
    User.findByUsername('user+test(1)');
});
console.log('✅ User.findByUsername regex güvenliği başarılı.');

// TEST 3: tableManager.closeTable bot temizliği
console.log('3. closeTable bot temizliği testi...');
const mockPlayers = {
    'socket_human_1': { name: 'Ali', isBot: false },
    'bot_123_456': { name: '🤖 Test Bot', isBot: true }
};

tableManager.tables['test_table_1'] = {
    id: 'test_table_1',
    baseType: 'batak',
    name: 'Test Masası',
    players: ['socket_human_1', 'bot_123_456'],
    spectators: [],
    pot: 100
};

tableManager.closeTable('test_table_1', mockPlayers);
assert.strictEqual(mockPlayers['bot_123_456'], undefined, 'Bot oyuncusu players havuzundan silinmeliydi');
assert.strictEqual(mockPlayers['socket_human_1'].name, 'Ali', 'İnsan oyuncu silinmemeliydi');
console.log('✅ closeTable bot temizliği başarılı.');

// TEST 4: getPlayersInRoom null-safe testi
console.log('4. getPlayersInRoom null-safe testi...');
const { getPlayersInRoom } = require('../src/utils/playerHelpers');
const faultyPlayers = {
    's1': { name: 'Player1', room: 'kafe' },
    's2': undefined,
    's3': { name: 'Player3' } // no room property
};
assert.doesNotThrow(() => {
    const res = getPlayersInRoom(faultyPlayers, 'kafe');
    assert.strictEqual(Object.keys(res).length, 1);
    assert.strictEqual(res['s1'].name, 'Player1');
});
console.log('✅ getPlayersInRoom null-safe testi başarılı.');

console.log('\n🎉 TÜM DÜZELTME TESTLERİ BAŞARIYLA GEÇTİ!');
