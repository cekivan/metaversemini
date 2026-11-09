// src/handlers/gameActionHandler.js - Masa, Lobi ve Tüm Masa Oyunu Aksiyonları Yöneticisi
const dataManager = require('../dataManager');
const tableManager = require('../tableManager');
const gameCoordinator = require('../gameCoordinator');
const { checkRateLimit } = require('../utils/securityUtils');
const { registerBoardGameActionHandlers } = require('./boardGameActionHandler');
const { addPlayerXP } = require('../utils/levelSystem');

/**
 * Masa oyunu tamamlandığında XP ve rozet sayacı dağıtımı:
 * - Masada en az 2 gerçek insan yoksa XP ve rozet sayacı İŞLEME ALINMAZ.
 * - Gerçek katılımcıların her biri için uData.gamerGamesCount artırılır.
 * - XP Dağıtımı:
 *   - batak, okey, okey101, dostkazigi: Kazanan 15 XP, Kaybeden 6 XP
 *   - chess, tavla, billiard: Kazanan 8 XP, Kaybeden 4 XP
 *   - xox, amiral: Kazanan 2 XP, Kaybeden 1 XP
 * - addPlayerXP(io, players, socketId, uData, xp, 'masa_oyunu') çağrılır.
 */
function handleTableGameEndXP(io, players, gameType, playerParticipants, winnerIdentifiers = []) {
    if (!playerParticipants || !Array.isArray(playerParticipants) || playerParticipants.length === 0) return;

    // Bot Kontrolü
    const isBot = (p) => {
        if (!p) return true;
        const pid = typeof p === 'string' ? p : (p.socketId || p.pid || p.id);
        const prof = typeof p === 'object' ? p : null;
        const name = (prof && prof.name) || (players && pid && players[pid] && players[pid].name) || '';
        return !pid || pid.startsWith('bot_') || (prof && prof.isBot) || name.startsWith('🤖') || name.includes('🤖');
    };

    const realHumans = playerParticipants.filter(p => !isBot(p));
    if (realHumans.length < 2) {
        // Masada en az 2 gerçek insan yoksa XP ve rozet sayacı işleme alınmaz!
        return;
    }

    const winners = Array.isArray(winnerIdentifiers) ? winnerIdentifiers : [winnerIdentifiers];

    realHumans.forEach(p => {
        const socketId = typeof p === 'string' ? p : (p.socketId || p.pid || p.id);
        const name = (typeof p === 'object' && p.name) || (players && socketId && players[socketId] && players[socketId].name) || (typeof p === 'string' ? p : '');
        const uKey = dataManager.findUserKey(name) || name;
        const uData = (uKey && dataManager.persistentData.users[uKey]);
        if (!uData) return;

        // Rozet kontrolü ve senkronizasyonu
        if (typeof dataManager.checkAndAwardBadgeLevelUp === 'function') {
            dataManager.checkAndAwardBadgeLevelUp(name, 'gamer');
        }
        if (players && socketId && players[socketId]) {
            players[socketId].gamerGamesCount = uData.gamerGamesCount;
        }

        // Kazanan tespiti
        const isWinner = winners.some(w => {
            if (!w) return false;
            if (typeof w === 'string') {
                return w === socketId || w.toLowerCase() === name.toLowerCase();
            }
            if (typeof w === 'object') {
                return (w.socketId && w.socketId === socketId) || (w.name && w.name.toLowerCase() === name.toLowerCase());
            }
            return false;
        });

        // XP Puanlaması
        let xp = 0;
        const g = (gameType || '').toLowerCase();
        if (['batak', 'okey', 'okey101', 'dostkazigi'].includes(g)) {
            xp = isWinner ? 15 : 6;
        } else if (['chess', 'tavla', 'billiard'].includes(g)) {
            xp = isWinner ? 8 : 4;
        } else if (['xox', 'amiral', 'amiralbatti'].includes(g)) {
            xp = isWinner ? 2 : 1;
        } else {
            xp = isWinner ? 8 : 4;
        }

        addPlayerXP(io, players, socketId, uData, xp, 'masa_oyunu');
    });

    dataManager.savePersistentData();
}

// YARDIMCI: Oyuncuyu mevcut tüm lobi ve masalardan temizce çıkarma (Aynı anda 2 masaya girmeyi 100% önler)
function handlePlayerLeaveTable(io, players, targetSocket, silent = false) {
    if (!targetSocket) return;
    let sid = targetSocket.id;
    let pName = players[sid] ? players[sid].name : "Oyuncu";
    let activeGames = gameCoordinator.getActiveGames();
    let tables = tableManager.getTables();

    for (let gid in activeGames) {
        let g = activeGames[gid];
        if (g && g.players && g.players.includes(sid)) {
            let isDuel = (g.players && g.players.length === 2) || (tables[gid] && tables[gid].min === 2) || gid.startsWith('xox') || gid.startsWith('amiral') || gid.startsWith('chess') || gid.startsWith('tavla') || gid.startsWith('billiard');

            let isPaidGame = (g.bet && g.bet > 0) || (g.pot && g.pot > 0);

            if (isDuel && !isPaidGame) {
                // Ücretsiz 2 kişilik düello veya mini oyunlarda biri ayrıldığında oyun sonlanır:
                if (g.voidHandVote) {
                    gameCoordinator.cancelVoidHandVote(g, `⚠️ ${pName} masadan ayrıldığı için oylama iptal edildi.`, io, players);
                }

                // Zamanlayıcıları temizle
                if (gameCoordinator.billiardBotTimers && gameCoordinator.billiardBotTimers[gid]) {
                    clearTimeout(gameCoordinator.billiardBotTimers[gid]);
                    delete gameCoordinator.billiardBotTimers[gid];
                }
                if (gameCoordinator.xoxBotTimers && gameCoordinator.xoxBotTimers[gid]) {
                    clearTimeout(gameCoordinator.xoxBotTimers[gid]);
                    delete gameCoordinator.xoxBotTimers[gid];
                }
                if (gameCoordinator.amiralBotTimers && gameCoordinator.amiralBotTimers[gid]) {
                    clearTimeout(gameCoordinator.amiralBotTimers[gid]);
                    delete gameCoordinator.amiralBotTimers[gid];
                }
                if (gameCoordinator.tavlaBotTimers && gameCoordinator.tavlaBotTimers[gid]) {
                    clearTimeout(gameCoordinator.tavlaBotTimers[gid]);
                    delete gameCoordinator.tavlaBotTimers[gid];
                }
                if (gameCoordinator.clearChessTimers) {
                    gameCoordinator.clearChessTimers(gid);
                }
                if (gameCoordinator.tableCleanupTimers && gameCoordinator.tableCleanupTimers[gid]) {
                    clearTimeout(gameCoordinator.tableCleanupTimers[gid]);
                    delete gameCoordinator.tableCleanupTimers[gid];
                }

                // Kalan rakibe bildirim gönder ve masasını sıfırla
                g.players.forEach(pid => {
                    if (pid !== sid && !pid.startsWith('bot_')) {
                        io.to(pid).emit('opponentLeft', { message: "Rakip masadan ayrıldı", tableId: gid });
                        io.to(pid).emit('systemMessage', `⚠️ Rakip masadan ayrıldı.`);
                        io.to(pid).emit('tableLeft');
                    }
                });

                if (g.spectators) {
                    g.spectators.forEach(specId => {
                        io.to(specId).emit('systemMessage', `⚠️ Oyunculardan biri masadan ayrıldığı için oyun sonlandırıldı.`);
                        io.to(specId).emit('tableLeft');
                    });
                }

                if (g && g.players) {
                    g.players.forEach(pid => {
                        if (typeof pid === 'string' && pid.startsWith('bot_') && players[pid]) {
                            delete players[pid];
                        }
                    });
                }
                delete activeGames[gid];
                tableManager.closeTable(gid, players);
                io.emit('tableClosed', { tableId: gid });
            } else {
                // ÜCRETLİ OYUNLAR (2, 3 veya 4 kişilik) ve 3-4 KİŞİLİK OYUNLAR:
                // Bir oyuncu çıktığında para ödenmiş olduğu için oyun bitmez, yerini anında bota devreder!
                if (g.voidHandVote) {
                    gameCoordinator.cancelVoidHandVote(g, `⚠️ ${pName} masadan ayrıldığı için el bozma oylaması iptal edildi.`, io, players);
                }
                if (!g.disconnectedPlayers) g.disconnectedPlayers = {};
                let seatIdx = g.players.indexOf(sid);
                g.disconnectedPlayers[sid] = {
                    name: pName,
                    seatIndex: seatIdx
                };

                let remainingHumans = g.players.filter(pid => pid !== sid && !pid.startsWith('bot_') && (!g.disconnectedPlayers || !g.disconnectedPlayers[pid]));
                if (remainingHumans.length === 0) {
                    // Masada hiç gerçek oyuncu kalmadıysa masayı temizle ve kapat
                    if (gameCoordinator.okey101AfkTimers && gameCoordinator.okey101AfkTimers[gid]) {
                        clearTimeout(gameCoordinator.okey101AfkTimers[gid]);
                        delete gameCoordinator.okey101AfkTimers[gid];
                    }
                    if (gameCoordinator.batakAfkTimers && gameCoordinator.batakAfkTimers[gid]) {
                        clearTimeout(gameCoordinator.batakAfkTimers[gid]);
                        delete gameCoordinator.batakAfkTimers[gid];
                    }
                    if (gameCoordinator.dostKazigiAfkTimers && gameCoordinator.dostKazigiAfkTimers[gid]) {
                        clearTimeout(gameCoordinator.dostKazigiAfkTimers[gid]);
                        delete gameCoordinator.dostKazigiAfkTimers[gid];
                    }
                    if (gameCoordinator.billiardBotTimers && gameCoordinator.billiardBotTimers[gid]) {
                        clearTimeout(gameCoordinator.billiardBotTimers[gid]);
                        delete gameCoordinator.billiardBotTimers[gid];
                    }
                    if (gameCoordinator.xoxBotTimers && gameCoordinator.xoxBotTimers[gid]) {
                        clearTimeout(gameCoordinator.xoxBotTimers[gid]);
                        delete gameCoordinator.xoxBotTimers[gid];
                    }
                    if (gameCoordinator.amiralBotTimers && gameCoordinator.amiralBotTimers[gid]) {
                        clearTimeout(gameCoordinator.amiralBotTimers[gid]);
                        delete gameCoordinator.amiralBotTimers[gid];
                    }
                    if (gameCoordinator.tavlaBotTimers && gameCoordinator.tavlaBotTimers[gid]) {
                        clearTimeout(gameCoordinator.tavlaBotTimers[gid]);
                        delete gameCoordinator.tavlaBotTimers[gid];
                    }
                    if (gameCoordinator.clearChessTimers) {
                        gameCoordinator.clearChessTimers(gid);
                    }
                    if (gameCoordinator.tableCleanupTimers && gameCoordinator.tableCleanupTimers[gid]) {
                        clearTimeout(gameCoordinator.tableCleanupTimers[gid]);
                        delete gameCoordinator.tableCleanupTimers[gid];
                    }
                    if (g && g.players) {
                        g.players.forEach(pid => {
                            if (typeof pid === 'string' && pid.startsWith('bot_') && players[pid]) {
                                delete players[pid];
                            }
                        });
                    }
                    delete activeGames[gid];
                    tableManager.closeTable(gid, players);
                    io.emit('tableClosed', { tableId: gid });
                } else {
                    // Masada hala en az bir aktif insan oyuncu var -> ayrılan oyuncunun yerini BOT devralır
                    let botId = `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    let botNames = ["Ahmet Dayı", "Mehmet Emmi", "Hüseyin Dayı", "Ali", "Can", "Burak", "Kıvrak", "Kadir", "Cemil"];
                    let botName = "🤖 " + botNames[Math.floor(Math.random() * botNames.length)];

                    players[botId] = {
                        name: botName,
                        isBot: true,
                        color: '#38bdf8',
                        skinColor: '#ffe0bd',
                        gender: 'male',
                        money: 99999,
                        room: 'kafe'
                    };

                    if (seatIdx !== -1) {
                        g.players[seatIdx] = botId;
                    }
                    if (tables[gid] && tables[gid].players) {
                        let tIdx = tables[gid].players.indexOf(sid);
                        if (tIdx !== -1) tables[gid].players[tIdx] = botId;
                    }

                    if (!g.playerProfiles) g.playerProfiles = {};
                    g.playerProfiles[botId] = {
                        name: botName,
                        color: '#38bdf8',
                        isBot: true
                    };
                    delete g.playerProfiles[sid];
                    if (g.disconnectedPlayers) delete g.disconnectedPlayers[sid];

                    // Kart ve el durumlarını bota aktar (Batak, 101 Okey, Dost Kazığı)
                    if (g.hands && g.hands[sid]) {
                        g.hands[botId] = g.hands[sid];
                        delete g.hands[sid];
                    }
                    if (g.tricksTaken && g.tricksTaken[sid] !== undefined) {
                        g.tricksTaken[botId] = g.tricksTaken[sid];
                        delete g.tricksTaken[sid];
                    }
                    if (g.scores && g.scores[sid] !== undefined) {
                        g.scores[botId] = g.scores[sid];
                        delete g.scores[sid];
                    }
                    if (g.playerSuits && g.playerSuits[sid] !== undefined) {
                        g.playerSuits[botId] = g.playerSuits[sid];
                        delete g.playerSuits[sid];
                    }
                    if (g.bid && g.bid.highestBidder === sid) {
                        g.bid.highestBidder = botId;
                    }
                    if (g.passedPlayers) {
                        g.passedPlayers = g.passedPlayers.map(p => p === sid ? botId : p);
                    }
                    if (g.tableCards) {
                        g.tableCards.forEach(tc => { if (tc.playerId === sid) tc.playerId = botId; });
                    }
                    if (g.hasOpened && g.hasOpened[sid] !== undefined) {
                        g.hasOpened[botId] = g.hasOpened[sid];
                        delete g.hasOpened[sid];
                    }
                    if (g.openedType && g.openedType[sid] !== undefined) {
                        g.openedType[botId] = g.openedType[sid];
                        delete g.openedType[sid];
                    }
                    if (g.roundPenalties && g.roundPenalties[sid] !== undefined) {
                        g.roundPenalties[botId] = g.roundPenalties[sid];
                        delete g.roundPenalties[sid];
                    }

                    // Düello / Masa oyunları durum aktarımı (Tavla, XOX, Amiral, Satranç, Bilardo)
                    if (g.playerColors && g.playerColors[sid] !== undefined) {
                        g.playerColors[botId] = g.playerColors[sid];
                        delete g.playerColors[sid];
                    }
                    if (g.playerSymbols && g.playerSymbols[sid] !== undefined) {
                        g.playerSymbols[botId] = g.playerSymbols[sid];
                        delete g.playerSymbols[sid];
                    }
                    if (g.boards && g.boards[sid]) {
                        g.boards[botId] = g.boards[sid];
                        delete g.boards[sid];
                    }
                    if (g.ships && g.ships[sid]) {
                        g.ships[botId] = g.ships[sid];
                        delete g.ships[sid];
                    }
                    if (g.grids && g.grids[sid]) {
                        g.grids[botId] = g.grids[sid];
                        delete g.grids[sid];
                    }
                    if (g.shots && g.shots[sid]) {
                        g.shots[botId] = g.shots[sid];
                        delete g.shots[sid];
                    }
                    if (g.ready && g.ready[sid] !== undefined) {
                        g.ready[botId] = g.ready[sid];
                        delete g.ready[sid];
                    }
                    if (g.stats && g.stats[sid]) {
                        g.stats[botId] = g.stats[sid];
                        delete g.stats[sid];
                    }
                    if (g.solids === sid) g.solids = botId;
                    if (g.stripes === sid) g.stripes = botId;

                    let potTotal = g.pot || ((g.bet || 0) * (g.players ? g.players.length : 2));
                    let leaveNotice = isPaidGame
                        ? `⚠️ ${pName} oyundan ayrıldı, yerini ${botName} devraldı. Bahis potu (${potTotal} TL) geçerlidir, oyun devam ediyor!`
                        : `⚠️ ${pName} masadan ayrıldı, yerine ${botName} eklendi.`;

                    g.players.forEach(pid => {
                        if (pid !== sid && !pid.startsWith('bot_')) {
                            io.to(pid).emit('systemMessage', leaveNotice);
                        }
                    });
                    if (g.spectators) {
                        g.spectators.forEach(specId => io.to(specId).emit('systemMessage', leaveNotice));
                    }

                    // Oyun türüne göre güncelleme ve bot sırası tetikleme
                    if (gid.startsWith('batak')) {
                        gameCoordinator.sendBatakUpdate(g, io, players);
                        if (g.players[g.turnIndex] === botId) {
                            gameCoordinator.startBatakAfkTimer(g, io, players);
                        }
                    } else if (gid.startsWith('okey101')) {
                        gameCoordinator.sendOkey101Update(g, io, players);
                        if (g.players[g.turnIndex] === botId) {
                            gameCoordinator.startOkey101AfkTimer(g, io, players);
                        }
                    } else if (gid.startsWith('dost_kazigi')) {
                        gameCoordinator.sendDostKazigiUpdate(g, io, players);
                        if (g.players[g.turnIndex] === botId) {
                            gameCoordinator.startDostKazigiAfkTimer(g, io, players);
                        }
                    } else if (gid.startsWith('tavla')) {
                        gameCoordinator.sendTavlaUpdate(g, io);
                    } else if (gid.startsWith('xox')) {
                        gameCoordinator.sendXoxUpdate(g, io);
                    } else if (gid.startsWith('amiral')) {
                        gameCoordinator.sendAmiralUpdate(g, io);
                    } else if (gid.startsWith('chess')) {
                        gameCoordinator.sendChessUpdate(g, io);
                    } else if (gid.startsWith('billiard')) {
                        io.to(gid).emit('billiardUpdate', g);
                    }
                }
            }
        }
    }

    // İzleyicilikten çıkış
    for (let gid in activeGames) {
        let g = activeGames[gid];
        if (g && g.spectators) {
            g.spectators = g.spectators.filter(specId => specId !== sid);
        }
    }

    // Lobiden çıkış
    let affected = tableManager.removePlayerFromLobbies(sid);
    affected.forEach(t => {
        let isDuelTable = t.min === 2 || ['xox', 'amiral', 'chess', 'tavla', 'billiard'].includes(t.baseType);
        if (isDuelTable) {
            t.players.forEach(pid => {
                if (!pid.startsWith('bot_')) {
                    io.to(pid).emit('opponentLeft', { message: "Rakip masadan ayrıldı", tableId: t.id });
                    io.to(pid).emit('systemMessage', `⚠️ Rakip masadan ayrıldı.`);
                    io.to(pid).emit('tableLeft');
                }
            });
            tableManager.closeTable(t.id);
            io.emit('tableClosed', { tableId: t.id });
        } else {
            if (t.players.length > 0 && (!t.bet || t.bet === 0)) {
                let res = tableManager.addBotToTable(t.id, activeGames, players);
                if (res && res.success) {
                    t.players.forEach(pid => {
                        if (!pid.startsWith('bot_')) {
                            io.to(pid).emit('systemMessage', `⚠️ ${pName} lobiden ayrıldı, yerine ${res.botName} eklendi.`);
                        }
                    });
                    if (res.isFull) {
                        gameCoordinator.startGameForTable(t.id, t, "kafe", io, players);
                    }
                }
            }
            t.players.forEach(pid => io.to(pid).emit('updateTableLobby', { name: t.name, count: t.players.length, min: t.min, tableId: t.id, bet: t.bet || 0 }));
        }
    });

    if (!silent) {
        targetSocket.emit('tableLeft');
    }
}

function registerGameActionHandlers(io, socket, players) {
    const leaveTable = (target = socket, silent = false) => handlePlayerLeaveTable(io, players, target, silent);

    // 1. MASA SEÇENEKLERİ SORGULAMA
    socket.on('requestTableOptions', (baseType) => {
        if (!players[socket.id]) return;
        let res = tableManager.getTableOptionsList(baseType, gameCoordinator.getActiveGames(), players);
        if (res) {
            socket.emit('tableOptionsModal', res);
        }
    });

    // TEST & ROZET İLERLEME SİMÜLASYONU
    socket.on('devSimulateBadgeProgress', (data) => {
        if (!players[socket.id] || !data) return;
        const targetUser = players[socket.id].name;
        const badgeKey = data.badgeKey || 'botanic';
        const amount = Number(data.amount) || 1;
        dataManager.recordGamePlayed(targetUser, badgeKey, amount);
    });

    // 2. MASAYA OTURMA
    socket.on('joinTable', (tableId) => {
        if (!players[socket.id]) return;
        let table = tableManager.getTable(tableId);
        let room = players[socket.id].room;
        if (!table) return;

        // Eğer zaten bu masadaysa mükerrer işlem yapma
        if (table.players.includes(socket.id)) return;

        // Önceki herhangi bir masadan veya lobiden temizce çıkış yap
        leaveTable(socket, true);

        if (gameCoordinator.getActiveGame(tableId)) {
            socket.emit('gameError', "Bu masada şu anda oyun oynanıyor! İzlemek veya boş koltuk varsa devralmak için masa menüsünü kullanın.");
            return;
        }

        let requiredBet = table.bet || 0;
        let pMoney = players[socket.id].money !== undefined ? players[socket.id].money : 0;
        if (requiredBet > 0 && pMoney < requiredBet) {
            socket.emit('gameError', `Yetersiz bakiye! Bu masanın bahsi ${requiredBet} TL, sizin bakiyeniz: ${pMoney} TL.`);
            return;
        }

        if (!table.players.includes(socket.id) && table.players.length < table.min) {
            table.players.push(socket.id);

            table.players.forEach(pid => {
                io.to(pid).emit('updateTableLobby', { name: table.name, count: table.players.length, min: table.min, tableId: tableId, bet: requiredBet });
            });

            if (table.players.length === table.min) {
                gameCoordinator.startGameForTable(tableId, table, room, io, players);
            }
        }
    });

    // 3. BOT EKLEME
    socket.on('addBotToTable', (tableId) => {
        if (!players[socket.id]) return;
        let res = tableManager.addBotToTable(tableId, gameCoordinator.getActiveGames(), players);
        if (!res.success) {
            socket.emit('gameError', res.message);
            return;
        }

        let table = res.table;
        table.players.forEach(pid => {
            io.to(pid).emit('updateTableLobby', { name: table.name, count: table.players.length, min: table.min, tableId: tableId, bet: table.bet || 0 });
        });

        let curRoom = players[socket.id]?.room || "kafe";
        io.to(curRoom).emit('systemMessage', `🤖 ${res.botName} masaya katıldı!`);

        if (res.isFull) {
            gameCoordinator.startGameForTable(tableId, table, curRoom, io, players);
        }
    });

    // 4. YENİ MASA AÇMA (Spam Korumalı & Tekil Kurucu Limiti)
    socket.on('createNewTable', (payload) => {
        if (!players[socket.id]) return;
        const p = players[socket.id];
        const creator = {
            socketId: socket.id,
            userId: p.name || socket.id,
            name: p.name || 'Oyuncu'
        };

        // Önce aynı oyun türünde zaten açık masa olup olmadığını kontrol et
        let res = tableManager.createNewTable(payload, gameCoordinator.getActiveGames(), creator);
        if (!res.success) {
            socket.emit('gameError', res.message);
            socket.emit('tableCreateError', { 
                message: res.message, 
                baseType: payload?.baseType,
                code: res.code || 'TABLE_CREATE_ERROR'
            });
            return;
        }

        // Başarılıysa önceki masasından temizce ayrıl
        leaveTable(socket, true);

        let table = res.table;
        table.players.push(socket.id);

        let curRoom = players[socket.id]?.room || "kafe";
        socket.emit('updateTableLobby', {
            name: table.name,
            count: 1,
            min: table.min,
            tableId: table.id,
            bet: table.bet,
            mode: table.mode
        });
        io.to(curRoom).emit('systemMessage', `📢 ${players[socket.id].name} yeni bir ${table.name} masası açtı!`);
    });

    // 4.1. MASA KAPATMA (Manuel, Kurucu veya Katılımcı İsteği)
    socket.on('closeTable', (data) => {
        let tableId = typeof data === 'object' ? data?.tableId : data;
        if (!tableId || !players[socket.id]) return;
        let table = tableManager.getTable(tableId);
        let game = gameCoordinator.getActiveGame(tableId);
        if (!table && !game) return;

        let isOwner = (
            (table && (
                table.creatorId === socket.id ||
                (table.creatorUserId && String(table.creatorUserId).toLowerCase() === String(players[socket.id].name).toLowerCase())
            )) ||
            players[socket.id].isAdmin
        );

        let isDuel = (
            (game && (game.players.length === 2 || game.tableId?.startsWith('xox') || game.tableId?.startsWith('amiral') || game.tableId?.startsWith('chess') || game.tableId?.startsWith('tavla') || game.tableId?.startsWith('billiard'))) ||
            (table && (table.min === 2 || ['xox', 'amiral', 'chess', 'tavla', 'billiard'].includes(table.baseType) || table.id?.startsWith('xox') || table.id?.startsWith('amiral') || table.id?.startsWith('chess') || table.id?.startsWith('tavla') || table.id?.startsWith('billiard')))
        );

        let isParticipant = (
            (table && table.players && table.players.includes(socket.id)) ||
            (game && game.players && game.players.includes(socket.id))
        );

        // Host veya misafir fark etmeksizin masadaki herhangi bir oyuncu masayı kapatıp çıkabilir
        if (isOwner || (isDuel && isParticipant)) {
            handlePlayerLeaveTable(io, players, socket, false);
            tableManager.closeTable(tableId);
            io.emit('tableClosed', { tableId });
            socket.emit('systemMessage', `Masa başarıyla kapatıldı.`);
        } else if (isParticipant) {
            handlePlayerLeaveTable(io, players, socket, false);
        }
    });

    // 5. OYUNU İZLE
    socket.on('spectateTable', (tableId) => {
        leaveTable(socket, true);
        let game = gameCoordinator.getActiveGame(tableId);
        if (!game) {
            socket.emit('gameError', "Bu masada şu anda izlenebilecek bir oyun yok.");
            return;
        }

        if (!game.spectators) game.spectators = [];
        if (!game.spectators.includes(socket.id)) game.spectators.push(socket.id);

        let gameType = tableId.startsWith('billiard') ? 'billiard' : (tableId.startsWith('chess') ? 'chess' : (tableId.startsWith('tavla') ? 'tavla' : (tableId.startsWith('okey101') ? 'okey101' : (tableId.startsWith('xox') ? 'xox' : (tableId.startsWith('amiral') ? 'amiral' : 'batak')))));
        socket.emit('startGame', gameType);

        if (gameType === 'batak') {
            gameCoordinator.sendBatakUpdate(game, io, players);
        } else if (gameType === 'billiard') {
            socket.emit('billiardUpdate', {
                balls: game.balls,
                turnIndex: game.turnIndex,
                players: game.players,
                playerSuits: game.playerSuits,
                playerProfiles: game.playerProfiles || {},
                ballInHand: game.ballInHand,
                winner: game.winner,
                gameOver: game.gameOver,
                isSpectator: true,
                tableId: game.tableId,
                turnTimeout: 30,
                disconnectedPlayers: game.disconnectedPlayers || {}
            });
        } else if (gameType === 'tavla') {
            gameCoordinator.sendTavlaUpdate(game, io);
        } else if (gameType === 'okey101') {
            gameCoordinator.sendOkey101Update(game, io, players);
        } else if (gameType === 'xox') {
            gameCoordinator.sendXoxUpdate(game, io);
        } else if (gameType === 'amiral') {
            gameCoordinator.sendAmiralUpdate(game, io);
        } else if (gameType === 'chess') {
            gameCoordinator.sendChessUpdate(game, io);
        }

        io.to(tableId).emit('systemMessage', `👁️ ${players[socket.id]?.name || "Biri"} masayı izlemeye başladı.`);
    });

    // 6. MASA REAKSİYONU
    socket.on('tableReaction', (data) => {
        if (!data || !data.tableId) return;
        let tableId = data.tableId;
        let game = gameCoordinator.getActiveGame(tableId);
        if (game) {
            let senderName = players[socket.id]?.name || "Biri";
            let reactionObj = { sender: senderName, text: dataManager.sanitizeString(data.reaction, 50) };
            game.players.forEach(pid => io.to(pid).emit('showReaction', reactionObj));
            if (game.spectators) {
                game.spectators.forEach(sid => io.to(sid).emit('showReaction', reactionObj));
            }
        }
    });

    // 7. MASA OYUNLARI HAMLELERİ (src/handlers/boardGameActionHandler.js)
    // Batak, Dost Kazığı, Bilardo, Tavla, XOX, Amiral Battı, Satranç, 101 Okey
    registerBoardGameActionHandlers(io, socket, players);

    socket.on('assignBotToVacantSeat', (data) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance && instance.game) {
            let targetPid = data ? data.targetPlayerId : null;
            let game = instance.game;
            let dPlayers = game.disconnectedPlayers || {};
            let seatIdx = -1;
            if (targetPid && dPlayers[targetPid]) {
                seatIdx = dPlayers[targetPid].seatIndex;
            } else if (data && data.seatIndex !== undefined) {
                seatIdx = data.seatIndex;
                targetPid = game.players[seatIdx];
            } else {
                // Herhangi bir boş/ayrılmış koltuğu bul
                let firstDPid = Object.keys(dPlayers)[0];
                if (firstDPid) {
                    targetPid = firstDPid;
                    seatIdx = dPlayers[firstDPid].seatIndex;
                }
            }

            if (seatIdx !== -1 && seatIdx < game.players.length) {
                let botId = `bot_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                let botNames = [
                    "🤖 Çaycı İsmail", "🤖 Mahmut Emmi", "🤖 Dayı Recep", "🤖 Berber Niyazi", 
                    "🤖 Muhtar Remzi", "🤖 Kasap Şevket", "🤖 Kahveci Veli", "🤖 Taksici Hayri"
                ];
                let usedNames = Object.values(game.playerProfiles || {}).map(p => p.name);
                let available = botNames.filter(n => !usedNames.includes(n));
                let botName = available.length > 0 ? available[Math.floor(Math.random()*available.length)] : `🤖 Bot ${Math.floor(Math.random()*90)+10}`;

                let oldPid = game.players[seatIdx];
                game.players[seatIdx] = botId;

                if (game.hands && game.hands[oldPid]) {
                    game.hands[botId] = game.hands[oldPid];
                    delete game.hands[oldPid];
                }
                if (game.discardPiles && game.discardPiles[oldPid]) {
                    game.discardPiles[botId] = game.discardPiles[oldPid];
                    delete game.discardPiles[oldPid];
                }
                if (game.hasOpened) {
                    game.hasOpened[botId] = game.hasOpened[oldPid] || false;
                    delete game.hasOpened[oldPid];
                }
                if (game.openedType) {
                    game.openedType[botId] = game.openedType[oldPid] || null;
                    delete game.openedType[oldPid];
                }
                if (game.scores) {
                    game.scores[botId] = game.scores[oldPid] || 0;
                    delete game.scores[oldPid];
                }
                if (game.roundPenalties) {
                    game.roundPenalties[botId] = game.roundPenalties[oldPid] || 0;
                    delete game.roundPenalties[oldPid];
                }

                if (!game.playerProfiles) game.playerProfiles = {};
                game.playerProfiles[botId] = {
                    name: botName,
                    isBot: true,
                    color: "#8b5cf6"
                };

                if (game.disconnectedPlayers) {
                    delete game.disconnectedPlayers[oldPid];
                }

                players[botId] = {
                    name: botName,
                    isBot: true,
                    color: "#8b5cf6"
                };

                let alertMsg = `🤖 Boş koltuğu ${botName} devraldı ve oyuna dahil oldu!`;
                game.players.forEach(pid => io.to(pid).emit('systemMessage', alertMsg));
                if (game.spectators) game.spectators.forEach(sid => io.to(sid).emit('systemMessage', alertMsg));

                gameCoordinator.sendOkey101Update(game, io, players);

                // Eğer sıra bottaysa hemen hamle zamanlayıcısını tetikle
                if (game.players[game.turnIndex] === botId) {
                    gameCoordinator.startOkey101AfkTimer(game, io, players);
                }
            }
        }
    });

    // 11. MASADAN AYRILMA (LEAVE TABLE)
    socket.on('leaveTable', () => {
        leaveTable(socket, false);
    });

    // 12. RECONNECT (Kendi Eski Koltuğuna Geri Dönüş)
    socket.on('acceptReconnect', (tableId) => {
        if (typeof tableId === 'object' && tableId !== null) tableId = tableId.tableId;
        let game = gameCoordinator.getActiveGame(tableId);
        if (!game || !players[socket.id]) return;

        let myName = players[socket.id].name.toLowerCase();
        let oldPid = null;

        for (let pid in game.disconnectedPlayers) {
            if (game.disconnectedPlayers[pid].name.toLowerCase() === myName) {
                oldPid = pid;
                break;
            }
        }
        if (!oldPid) {
            for (let pid in game.playerProfiles) {
                if (game.playerProfiles[pid].name.toLowerCase() === myName) {
                    oldPid = pid;
                    break;
                }
            }
        }

        if (!oldPid || !game.players.includes(oldPid)) {
            socket.emit('gameError', "Eski koltuğunuz artık mevcut değil veya başka biri devraldı.");
            return;
        }

        let pIndex = game.players.indexOf(oldPid);
        if (pIndex !== -1) game.players[pIndex] = socket.id;

        gameCoordinator.clearTableCleanupTimer(tableId);

        // Kullanıcı masadan düştüğünde geri geldiğinde tekrar para vermesin:
        if (!game.paidPlayers) game.paidPlayers = {};
        game.paidPlayers[myName] = true;

        game.playerProfiles[socket.id] = game.playerProfiles[oldPid];
        delete game.playerProfiles[oldPid];

        if (game.disconnectedPlayers) delete game.disconnectedPlayers[oldPid];

        if (game.hands && game.hands[oldPid]) {
            game.hands[socket.id] = game.hands[oldPid];
            delete game.hands[oldPid];
        }
        if (game.tricksTaken && game.tricksTaken[oldPid] !== undefined) {
            game.tricksTaken[socket.id] = game.tricksTaken[oldPid];
            delete game.tricksTaken[oldPid];
        }
        if (game.scores && game.scores[oldPid] !== undefined) {
            game.scores[socket.id] = game.scores[oldPid];
            delete game.scores[oldPid];
        }
        if (game.playerSuits && game.playerSuits[oldPid] !== undefined) {
            game.playerSuits[socket.id] = game.playerSuits[oldPid];
            delete game.playerSuits[oldPid];
        }
        if (game.bid && game.bid.highestBidder === oldPid) {
            game.bid.highestBidder = socket.id;
        }
        if (game.passedPlayers) {
            game.passedPlayers = game.passedPlayers.map(p => p === oldPid ? socket.id : p);
        }
        if (game.tableCards) {
            game.tableCards.forEach(tc => { if (tc.playerId === oldPid) tc.playerId = socket.id; });
        }
        if (game.hasOpened && game.hasOpened[oldPid] !== undefined) {
            game.hasOpened[socket.id] = game.hasOpened[oldPid];
            delete game.hasOpened[oldPid];
        }
        if (game.openedType && game.openedType[oldPid] !== undefined) {
            game.openedType[socket.id] = game.openedType[oldPid];
            delete game.openedType[oldPid];
        }
        if (game.roundPenalties && game.roundPenalties[oldPid] !== undefined) {
            game.roundPenalties[socket.id] = game.roundPenalties[oldPid];
            delete game.roundPenalties[oldPid];
        }
        if (game.discardPiles && game.discardPiles[oldPid]) {
            game.discardPiles[socket.id] = game.discardPiles[oldPid];
            delete game.discardPiles[oldPid];
        }
        if (game.initialGostergeOwners && game.initialGostergeOwners[oldPid]) {
            game.initialGostergeOwners[socket.id] = game.initialGostergeOwners[oldPid];
            delete game.initialGostergeOwners[oldPid];
        }
        if (game.revealedGosterge && game.revealedGosterge[oldPid]) {
            game.revealedGosterge[socket.id] = game.revealedGosterge[oldPid];
            delete game.revealedGosterge[oldPid];
        }
        if (game.hasDrawnEver && game.hasDrawnEver[oldPid] !== undefined) {
            game.hasDrawnEver[socket.id] = game.hasDrawnEver[oldPid];
            delete game.hasDrawnEver[oldPid];
        }
        if (game.lastDrawnTileId && game.lastDrawnTileId[oldPid]) {
            game.lastDrawnTileId[socket.id] = game.lastDrawnTileId[oldPid];
            delete game.lastDrawnTileId[oldPid];
        }
        if (game.lastDrawnTile && game.lastDrawnTile[oldPid]) {
            game.lastDrawnTile[socket.id] = game.lastDrawnTile[oldPid];
            delete game.lastDrawnTile[oldPid];
        }
        if (game.playerSymbols && game.playerSymbols[oldPid]) {
            game.playerSymbols[socket.id] = game.playerSymbols[oldPid];
            delete game.playerSymbols[oldPid];
        }
        if (game.ships && game.ships[oldPid]) {
            game.ships[socket.id] = game.ships[oldPid];
            delete game.ships[oldPid];
        }
        if (game.grids && game.grids[oldPid]) {
            game.grids[socket.id] = game.grids[oldPid];
            delete game.grids[oldPid];
        }
        if (game.shots && game.shots[oldPid]) {
            game.shots[socket.id] = game.shots[oldPid];
            delete game.shots[oldPid];
        }
        if (game.ready && game.ready[oldPid] !== undefined) {
            game.ready[socket.id] = game.ready[oldPid];
            delete game.ready[oldPid];
        }
        if (game.stats && game.stats[oldPid]) {
            game.stats[socket.id] = game.stats[oldPid];
            delete game.stats[oldPid];
        }
        if (game.frontStacks && game.frontStacks[oldPid]) {
            game.frontStacks[socket.id] = game.frontStacks[oldPid];
            delete game.frontStacks[oldPid];
        }

        players[socket.id].room = "kafe";
        socket.join("kafe");

        let gameType = tableId.startsWith('billiard') ? 'billiard' : (tableId.startsWith('chess') ? 'chess' : (tableId.startsWith('tavla') ? 'tavla' : (tableId.startsWith('okey101') ? 'okey101' : (tableId.startsWith('xox') ? 'xox' : (tableId.startsWith('amiral') ? 'amiral' : (tableId.startsWith('dost_kazigi') ? 'dost_kazigi' : 'batak'))))));
        socket.emit('startGame', gameType);

        if (gameType === 'batak') {
            gameCoordinator.sendBatakUpdate(game, io, players);
        } else if (gameType === 'tavla') {
            gameCoordinator.sendTavlaUpdate(game, io);
        } else if (gameType === 'okey101') {
            gameCoordinator.sendOkey101Update(game, io, players);
        } else if (gameType === 'xox') {
            gameCoordinator.sendXoxUpdate(game, io);
        } else if (gameType === 'amiral') {
            gameCoordinator.sendAmiralUpdate(game, io);
        } else if (gameType === 'chess') {
            gameCoordinator.sendChessUpdate(game, io);
        } else if (gameType === 'dost_kazigi') {
            gameCoordinator.sendDostKazigiUpdate(game, io, players);
        } else if (gameType === 'billiard') {
            socket.emit('billiardUpdate', {
                balls: game.balls,
                turnIndex: game.turnIndex,
                players: game.players,
                playerSuits: game.playerSuits,
                playerProfiles: game.playerProfiles || {},
                ballInHand: game.ballInHand,
                winner: game.winner,
                gameOver: game.gameOver,
                tableId: game.tableId,
                turnTimeout: 30,
                disconnectedPlayers: game.disconnectedPlayers || {}
            });
        }

        io.to("kafe").emit('systemMessage', `✅ ${players[socket.id].name} masaya geri döndü!`);
        game.players.forEach(pid => {
            if (pid !== socket.id) io.to(pid).emit('systemMessage', `✅ ${players[socket.id].name} masaya geri döndü, oyun devam ediyor!`);
        });
    });

    socket.on('declineReconnect', (tableId) => {
        let game = gameCoordinator.getActiveGame(tableId);
        if (game && players[socket.id]) {
            let myName = players[socket.id].name;
            game.players.forEach(pid => {
                if (pid !== socket.id) io.to(pid).emit('systemMessage', `ℹ️ ${myName} masaya dönmedi.`);
            });
        }
    });

    // 13. BOŞALAN VEYA BOT KOLTUĞU DEVRALMA (Bot Yerine Otur)
    socket.on('takeoverSeat', (data) => {
        if (!data || !data.tableId || !players[socket.id]) return;
        let tableId = data.tableId;
        leaveTable(socket, true);

        let game = gameCoordinator.getActiveGame(tableId);

        // Henüz başlamamış, lobide bekleyen masada bot yerine oturma:
        if (!game) {
            let table = tableManager.getTable(tableId);
            if (!table) return;

            let targetPid = data.oldPid;
            let botIdx = -1;
            if (targetPid) {
                botIdx = table.players.findIndex(p => p === targetPid);
            }
            if (botIdx === -1) {
                botIdx = table.players.findIndex(p => p.startsWith('bot_') || players[p]?.isBot);
            }

            if (botIdx !== -1) {
                let replacedBotPid = table.players[botIdx];
                let botName = players[replacedBotPid]?.name || "Bot";
                table.players[botIdx] = socket.id;
                delete players[replacedBotPid];

                table.players.forEach(pid => {
                    io.to(pid).emit('updateTableLobby', { name: table.name, count: table.players.length, min: table.min, tableId: tableId, bet: table.bet || 0 });
                });
                io.to("kafe").emit('systemMessage', `🪑 ${players[socket.id].name}, ${botName} yerine masaya oturdu!`);

                if (table.players.length === table.min) {
                    gameCoordinator.startGameForTable(tableId, table, "kafe", io, players);
                }
                return;
            }
            return;
        }

        let oldPid = data.oldPid;
        let isBotSeat = false;

        if (oldPid && (oldPid.startsWith('bot_') || game.playerProfiles?.[oldPid]?.isBot)) {
            isBotSeat = true;
        } else if (!oldPid || !game.disconnectedPlayers || !game.disconnectedPlayers[oldPid]) {
            let discKeys = Object.keys(game.disconnectedPlayers || {});
            if (discKeys.length > 0) {
                oldPid = discKeys[0];
            } else {
                let botPid = game.players.find(p => p.startsWith('bot_') || game.playerProfiles?.[p]?.isBot);
                if (botPid) {
                    oldPid = botPid;
                    isBotSeat = true;
                }
            }
        }

        if (!oldPid || !game.players.includes(oldPid)) {
            socket.emit('gameError', "Devralınabilecek boş veya bot koltuğu bulunamadı.");
            return;
        }

        let newName = players[socket.id].name;
        let oldName = game.playerProfiles[oldPid]?.name || (isBotSeat ? "Bot" : "Eski Oyuncu");

        // Masa bahsi kontrolü ve mükerrer para kesimini engelleme:
        if (!game.paidPlayers) game.paidPlayers = {};
        let alreadyPaid = !!game.paidPlayers[newName.toLowerCase()];

        if (!alreadyPaid && game.bet && game.bet > 0) {
            let userKey = dataManager.findUserKey(newName);
            let userObj = userKey ? dataManager.persistentData.users[userKey] : null;
            let currentMoney = userObj ? (userObj.money || 0) : 0;
            if (currentMoney < game.bet) {
                socket.emit('gameError', `Yetersiz bakiye! Bu masanın bahsi ${game.bet} TL, sizin bakiyeniz: ${currentMoney} TL.`);
                return;
            }
            if (userObj) {
                userObj.money -= game.bet;
                players[socket.id].money = userObj.money;
                socket.emit('moneyUpdate', userObj.money);
            }
            game.pot = (game.pot || 0) + game.bet;
            game.paidPlayers[newName.toLowerCase()] = true;
            dataManager.savePersistentData();
        } else {
            game.paidPlayers[newName.toLowerCase()] = true;
        }

        let pIndex = game.players.indexOf(oldPid);
        if (pIndex !== -1) game.players[pIndex] = socket.id;

        gameCoordinator.clearTableCleanupTimer(tableId);

        game.playerProfiles[socket.id] = {
            name: newName,
            color: players[socket.id].color || "#fff",
            isBot: false
        };
        delete game.playerProfiles[oldPid];
        if (isBotSeat && players[oldPid]) delete players[oldPid];

        if (game.disconnectedPlayers) delete game.disconnectedPlayers[oldPid];

        if (game.hands && game.hands[oldPid]) {
            game.hands[socket.id] = game.hands[oldPid];
            delete game.hands[oldPid];
        }
        if (game.tricksTaken && game.tricksTaken[oldPid] !== undefined) {
            game.tricksTaken[socket.id] = game.tricksTaken[oldPid];
            delete game.tricksTaken[oldPid];
        }
        if (game.scores && game.scores[oldPid] !== undefined) {
            game.scores[socket.id] = game.scores[oldPid];
            delete game.scores[oldPid];
        }
        if (game.playerSuits && game.playerSuits[oldPid] !== undefined) {
            game.playerSuits[socket.id] = game.playerSuits[oldPid];
            delete game.playerSuits[oldPid];
        }
        if (game.bid && game.bid.highestBidder === oldPid) {
            game.bid.highestBidder = socket.id;
        }
        if (game.passedPlayers) {
            game.passedPlayers = game.passedPlayers.map(p => p === oldPid ? socket.id : p);
        }
        if (game.tableCards) {
            game.tableCards.forEach(tc => { if (tc.playerId === oldPid) tc.playerId = socket.id; });
        }
        if (game.hasOpened && game.hasOpened[oldPid] !== undefined) {
            game.hasOpened[socket.id] = game.hasOpened[oldPid];
            delete game.hasOpened[oldPid];
        }
        if (game.openedType && game.openedType[oldPid] !== undefined) {
            game.openedType[socket.id] = game.openedType[oldPid];
            delete game.openedType[oldPid];
        }
        if (game.roundPenalties && game.roundPenalties[oldPid] !== undefined) {
            game.roundPenalties[socket.id] = game.roundPenalties[oldPid];
            delete game.roundPenalties[oldPid];
        }
        if (game.discardPiles && game.discardPiles[oldPid]) {
            game.discardPiles[socket.id] = game.discardPiles[oldPid];
            delete game.discardPiles[oldPid];
        }
        if (game.revealedGosterge && game.revealedGosterge[oldPid]) {
            game.revealedGosterge[socket.id] = game.revealedGosterge[oldPid];
            delete game.revealedGosterge[oldPid];
        }
        if (game.lastDrawnTileId && game.lastDrawnTileId[oldPid]) {
            game.lastDrawnTileId[socket.id] = game.lastDrawnTileId[oldPid];
            delete game.lastDrawnTileId[oldPid];
        }
        if (game.lastDrawnTile && game.lastDrawnTile[oldPid]) {
            game.lastDrawnTile[socket.id] = game.lastDrawnTile[oldPid];
            delete game.lastDrawnTile[oldPid];
        }
        if (game.hasDrawnEver && game.hasDrawnEver[oldPid]) {
            game.hasDrawnEver[socket.id] = game.hasDrawnEver[oldPid];
            delete game.hasDrawnEver[oldPid];
        }
        if (game.playerColors && game.playerColors[oldPid]) {
            game.playerColors[socket.id] = game.playerColors[oldPid];
            delete game.playerColors[oldPid];
        }
        if (game.playerSymbols && game.playerSymbols[oldPid]) {
            game.playerSymbols[socket.id] = game.playerSymbols[oldPid];
            delete game.playerSymbols[oldPid];
        }
        if (game.ships && game.ships[oldPid]) {
            game.ships[socket.id] = game.ships[oldPid];
            delete game.ships[oldPid];
        }
        if (game.grids && game.grids[oldPid]) {
            game.grids[socket.id] = game.grids[oldPid];
            delete game.grids[oldPid];
        }
        if (game.shots && game.shots[oldPid]) {
            game.shots[socket.id] = game.shots[oldPid];
            delete game.shots[oldPid];
        }
        if (game.ready && game.ready[oldPid] !== undefined) {
            game.ready[socket.id] = game.ready[oldPid];
            delete game.ready[oldPid];
        }
        if (game.stats && game.stats[oldPid]) {
            game.stats[socket.id] = game.stats[oldPid];
            delete game.stats[oldPid];
        }
        if (game.yazboz && game.yazboz.players && game.yazboz.players[oldPid]) {
            game.yazboz.players[socket.id] = game.yazboz.players[oldPid];
            game.yazboz.players[socket.id].id = socket.id;
            delete game.yazboz.players[oldPid];
        }
        if (game.spectators) {
            game.spectators = game.spectators.filter(sid => sid !== socket.id);
        }
        if (game.frontStacks && game.frontStacks[oldPid]) {
            game.frontStacks[socket.id] = game.frontStacks[oldPid];
            delete game.frontStacks[oldPid];
        }

        players[socket.id].room = "kafe";
        socket.join("kafe");

        let gameType = tableId.startsWith('billiard') ? 'billiard' : (tableId.startsWith('chess') ? 'chess' : (tableId.startsWith('tavla') ? 'tavla' : (tableId.startsWith('okey101') ? 'okey101' : (tableId.startsWith('xox') ? 'xox' : (tableId.startsWith('amiral') ? 'amiral' : (tableId.startsWith('dost_kazigi') ? 'dost_kazigi' : 'batak'))))));
        socket.emit('startGame', gameType);

        if (gameType === 'batak') {
            gameCoordinator.sendBatakUpdate(game, io, players);
        } else if (gameType === 'tavla') {
            gameCoordinator.sendTavlaUpdate(game, io);
        } else if (gameType === 'okey101') {
            gameCoordinator.sendOkey101Update(game, io, players);
        } else if (gameType === 'xox') {
            gameCoordinator.sendXoxUpdate(game, io);
        } else if (gameType === 'amiral') {
            gameCoordinator.sendAmiralUpdate(game, io);
        } else if (gameType === 'chess') {
            gameCoordinator.sendChessUpdate(game, io);
        } else if (gameType === 'dost_kazigi') {
            gameCoordinator.sendDostKazigiUpdate(game, io, players);
        } else if (gameType === 'billiard') {
            io.to(socket.id).emit('billiardUpdate', {
                balls: game.balls,
                turnIndex: game.turnIndex,
                players: game.players,
                playerSuits: game.playerSuits,
                playerProfiles: game.playerProfiles || {},
                ballInHand: game.ballInHand,
                winner: game.winner,
                gameOver: game.gameOver,
                tableId: game.tableId,
                turnTimeout: 30,
                disconnectedPlayers: game.disconnectedPlayers || {}
            });
        }

        let takeoverMsg = isBotSeat
            ? `🤖 ${newName}, ${oldName} yerine masadaki koltuğa oturdu!`
            : `🪑 ${newName}, ${oldName} yerine masadaki boş koltuğa oturdu!`;
        io.to("kafe").emit('systemMessage', takeoverMsg);
    });

    // 14. EL BOZMA OYLAMASI BAŞLATMA (BATAK & 101 OKEY)
    socket.on('requestVoidHand', (data) => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'requestVoidHand', 1, 8000)) {
            socket.emit('gameError', "Lütfen tekrar el bozma oylaması başlatmak için birkaç saniye bekleyin.");
            return;
        }

        let tableId = (typeof data === 'object' && data ? data.tableId : data) || null;
        let game = null;
        if (tableId) {
            game = gameCoordinator.getActiveGame(tableId);
        }
        if (!game) {
            let batakInst = gameCoordinator.getBatakInstance(socket.id);
            if (batakInst) game = batakInst.game;
        }
        if (!game) {
            let okeyInst = gameCoordinator.getOkey101Instance(socket.id);
            if (okeyInst) game = okeyInst.game;
        }

        if (!game || !game.players || !game.players.includes(socket.id)) {
            socket.emit('gameError', "Aktif bir Batak veya 101 Okey masasında değilsiniz!");
            return;
        }

        let isBatak = (game.isBatak4 !== undefined || game.hiddenCards !== undefined || (game.tableId && game.tableId.startsWith('batak')));
        let isOkey = (game.mode !== undefined || (game.tableId && game.tableId.startsWith('okey101')));

        if (!isBatak && !isOkey) {
            socket.emit('gameError', "El bozma özelliği yalnızca Batak ve 101 Okey masalarında geçerlidir!");
            return;
        }

        if (game.gameOver || game.setEnded) {
            socket.emit('gameError', "Oyun tamamlandığında el bozulamaz!");
            return;
        }

        if (game.voidHandVote) {
            socket.emit('gameError', "Masanızda zaten aktif bir el bozma oylaması sürüyor!");
            return;
        }

        gameCoordinator.startVoidHandVote(game, socket.id, io, players);
    });

    // 15. EL BOZMA OYLAMASINA YANIT VERME (KABUL / RET)
    socket.on('respondVoidHandVote', (data) => {
        if (!players[socket.id] || !data) return;
        let accept = !!data.accept;
        let tableId = data.tableId || null;

        let game = null;
        if (tableId) {
            game = gameCoordinator.getActiveGame(tableId);
        }
        if (!game) {
            let batakInst = gameCoordinator.getBatakInstance(socket.id);
            if (batakInst) game = batakInst.game;
        }
        if (!game) {
            let okeyInst = gameCoordinator.getOkey101Instance(socket.id);
            if (okeyInst) game = okeyInst.game;
        }

        if (!game || !game.voidHandVote || !game.players.includes(socket.id)) return;

        gameCoordinator.handleVoidHandVoteResponse(game, socket.id, accept, io, players);
    });
}

module.exports = { registerGameActionHandlers, handlePlayerLeaveTable, handleTableGameEndXP };
