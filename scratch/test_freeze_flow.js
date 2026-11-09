// scratch/test_freeze_flow.js
const drh = require('../src/handlers/dailyRewardHandler');
const dataManager = require('../src/dataManager');

async function test() {
    console.log('--- TEST 1: 1 GÜN KAÇIRILDI (CAN SİMİDİ TEKLİFİ) ---');
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const uData1 = {
        username: 'test_freeze_user',
        money: 5000,
        diamonds: 30,
        dailyReward: {
            currentDay: 5,
            lastClaimDate: twoDaysAgo,
            freezesUsed: 0,
            totalClaims: 5
        }
    };

    const status1 = drh.getUserRewardStatus(uData1);
    console.log('Status 1:', {
        canClaim: status1.canClaim,
        isStreakBroken: status1.isStreakBroken,
        canFreeze: status1.canFreeze,
        freezeCost: status1.freezeCost,
        nextDay: status1.nextDay,
        missedDays: status1.missedDays,
        hardReset: status1.hardReset
    });

    console.log('\n--- TEST 2: 3+ GÜN KAÇIRILDI (HAK YANDI - 1. GÜNE SIFIRLAMA) ---');
    const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0];
    const uData2 = {
        username: 'test_hardreset_user',
        money: 5000,
        diamonds: 30,
        dailyReward: {
            currentDay: 12,
            lastClaimDate: fourDaysAgo,
            freezesUsed: 0,
            totalClaims: 12
        }
    };

    const status2 = drh.getUserRewardStatus(uData2);
    console.log('Status 2:', {
        canClaim: status2.canClaim,
        isStreakBroken: status2.isStreakBroken,
        canFreeze: status2.canFreeze,
        nextDay: status2.nextDay,
        missedDays: status2.missedDays,
        hardReset: status2.hardReset
    });

    console.log('\n--- TEST 3: 2. KEZ CAN SİMİDİ (20 ELMAS) ---');
    const uData3 = {
        username: 'test_second_freeze',
        money: 5000,
        diamonds: 30,
        dailyReward: {
            currentDay: 15,
            lastClaimDate: twoDaysAgo,
            freezesUsed: 1, // 1 tane kullanılmış
            totalClaims: 15
        }
    };

    const status3 = drh.getUserRewardStatus(uData3);
    console.log('Status 3 (2. Can Simidi 20 Elmas olmalı):', {
        canClaim: status3.canClaim,
        canFreeze: status3.canFreeze,
        freezeCost: status3.freezeCost,
        nextDay: status3.nextDay
    });

    console.log('\n--- TEST 4: CAN SİMİDİ HAKLARI BİTMİŞ (2/2) VE GÜN KAÇIRILDI ---');
    const uData4 = {
        username: 'test_no_freeze_left',
        money: 5000,
        diamonds: 30,
        dailyReward: {
            currentDay: 20,
            lastClaimDate: twoDaysAgo,
            freezesUsed: 2, // 2'si de kullanılmış
            totalClaims: 20
        }
    };

    const status4 = drh.getUserRewardStatus(uData4);
    console.log('Status 4 (Hak kalmadığı için hardReset true ve 1. gün olmalı):', {
        canClaim: status4.canClaim,
        canFreeze: status4.canFreeze,
        hardReset: status4.hardReset,
        nextDay: status4.nextDay
    });
}

test();

