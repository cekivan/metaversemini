// scratch/test_coordinators_health.js
const batak = require('../src/coordinators/batakCoordinator');
const billiard = require('../src/coordinators/billiardCoordinator');
const board = require('../src/coordinators/boardGameCoordinator');
const dostKazigi = require('../src/coordinators/dostKazigiCoordinator');
const okey101 = require('../src/coordinators/okey101Coordinator');

console.log('Batak Coordinator keys:', Object.keys(batak));
console.log('Billiard Coordinator keys:', Object.keys(billiard));
console.log('Board Coordinator keys:', Object.keys(board));
console.log('Dost Kazigi Coordinator keys:', Object.keys(dostKazigi));
console.log('Okey 101 Coordinator keys:', Object.keys(okey101));

console.log('All coordinators loaded successfully without errors!');

