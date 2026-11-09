const MAX_LEVEL = 100;
function getDeltaXP(level) {
    if (level <= 1) return 0;
    return Math.floor(20 * Math.pow(level - 1, 1.42));
}
function getRequiredTotalXP(level) {
    if (level <= 1) return 0;
    let total = 0;
    for (let l = 2; l <= level; l++) {
        total += getDeltaXP(l);
    }
    return total;
}
function calculateLevel(totalXP) {
    totalXP = Number(totalXP) || 0;
    if (totalXP <= 0) return 1;
    for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
        if (totalXP >= getRequiredTotalXP(lvl)) return lvl;
    }
    return 1;
}
console.log('Lvl 1 Total:', getRequiredTotalXP(1));
console.log('Lvl 2 Delta:', getDeltaXP(2), 'Total:', getRequiredTotalXP(2));
console.log('Lvl 3 Delta:', getDeltaXP(3), 'Total:', getRequiredTotalXP(3));
console.log('Lvl 4 Delta:', getDeltaXP(4), 'Total:', getRequiredTotalXP(4));
console.log('Lvl 100 Total:', getRequiredTotalXP(100));
console.log('Calc XP 0:', calculateLevel(0));
console.log('Calc XP 19:', calculateLevel(19));
console.log('Calc XP 20:', calculateLevel(20));
console.log('Calc XP 72:', calculateLevel(72));
console.log('Calc XP 73:', calculateLevel(73));
