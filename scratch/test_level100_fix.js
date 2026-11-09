// scratch/test_level100_fix.js
const { calculateLevel, getRequiredTotalXP, getDeltaXP, MAX_LEVEL } = require('../src/utils/levelSystem');
const { calculateUniversalBadgeTier } = require('../public/js/badgeConfig');

console.log('--- TEST 1: Level Math for Level 100 ---');
const totalXPFor100 = getRequiredTotalXP(100);
console.log('Total XP for Level 100:', totalXPFor100);
console.log('Calculated Level for totalXP:', calculateLevel(totalXPFor100));
console.log('Calculated Level for totalXP + 50000:', calculateLevel(totalXPFor100 + 50000));
console.log('Delta XP for Level 100 -> 101:', getDeltaXP(101));

console.log('--- TEST 2: Badge Tier for Level 100 ---');
const tier100 = calculateUniversalBadgeTier(100, 'level', null, false);
console.log('Title:', tier100.title);
console.log('CountText:', tier100.countText);
console.log('ProgressPct:', tier100.progressPct);
console.log('NextGoalText:', tier100.nextGoalText);
console.log('GlowClass:', tier100.glowClass);

if (tier100.title === 'Yaşayan Efsane' && tier100.countText === 'Maksimum Seviye' && tier100.progressPct === 100) {
  console.log('✅ Level 100 Unit Test PASSED!');
} else {
  console.error('❌ Level 100 Unit Test FAILED!');
  process.exit(1);
}
