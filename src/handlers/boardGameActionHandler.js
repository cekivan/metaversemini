// src/handlers/boardGameActionHandler.js - Masa Oyunları Hamle ve Dinleyici Yöneticisi
const dataManager = require('../dataManager');
const gameCoordinator = require('../gameCoordinator');

/**
 * Masa içi oyun hamlelerini ve eylemlerini dinler:
 * - Batak (İhale, Koz, Kart atma, Rövanş)
 * - Dost Kazığı (Kart oynama, El bitirme, Rövanş)
 * - Bilardo (Atış, Beyaz top yerleştirme, Rövanş)
 * - Tavla (Zar atma, Hamle yapma, Geçerli hamleler)
 * - XOX (Kare seçme, Rövanş)
 * - Amiral Battı (Gemi yerleştirme, Atış, Rövanş)
 * - Satranç (Hamle, Terk, Rövanş)
 * - 101 Okey (Taş çekme, Yandan alma, El açma, Taş işleme, Taş atma, Gösterge)
 */
function registerBoardGameActionHandlers(io, socket, players) {

    // ==========================================
    // 1. BATAK DİNLEYİCİLERİ
    // ==========================================
    socket.on('placeBid', (bidValue) => {
        let instance = gameCoordinator.getBatakInstance(socket.id);
        if (instance && instance.engine.handleBid(instance.game, socket.id, bidValue)) {
            gameCoordinator.sendBatakUpdate(instance.game, io, players);
        }
    });

    socket.on('selectTrump', (suit) => {
        let instance = gameCoordinator.getBatakInstance(socket.id);
        if (instance && instance.engine.setTrump(instance.game, socket.id, suit)) {
            gameCoordinator.sendBatakUpdate(instance.game, io, players);
        }
    });

    socket.on('discardCards', (indices) => {
        let instance = gameCoordinator.getBatakInstance(socket.id);
        if (instance && instance.engine.discardCards(instance.game, socket.id, indices)) {
            gameCoordinator.sendBatakUpdate(instance.game, io, players);
        }
    });

    socket.on('playCard', (cardIndex) => {
        let instance = gameCoordinator.getBatakInstance(socket.id);
        if (instance) {
            let color = players[socket.id]?.color || instance.game.playerProfiles[socket.id]?.color || '#fff';
            let res = instance.engine.playCard(instance.game, socket.id, cardIndex, color);
            if (res.success) {
                gameCoordinator.handleBatakCardPlayed(instance.game, instance.engine, res, io, players);
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('batakVoteRematch', () => {
        let instance = gameCoordinator.getBatakInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleBatakVoteRematch(instance.game, socket.id, true, io, players);
        }
    });

    // ==========================================
    // 2. DOST KAZIĞI DİNLEYİCİLERİ
    // ==========================================
    socket.on('dostKazigiPlayCard', (data) => {
        let instance = gameCoordinator.getDostKazigiInstance(socket.id);
        if (instance && instance.game) {
            let cardIndex = (data && typeof data === 'object') ? data.cardIndex : data;
            let actionType = (data && typeof data === 'object') ? data.actionType : 'discard_center';
            let targetSeat = (data && typeof data === 'object') ? (data.targetSeat !== undefined ? data.targetSeat : data.targetPid) : null;
            let extraParam = (data && typeof data === 'object') ? (data.extraParam !== undefined ? data.extraParam : (data.centerCardIndex !== undefined ? data.centerCardIndex : data.sourceSeat)) : null;
            let res = instance.engine.playCardMove(instance.game, socket.id, cardIndex, actionType, targetSeat, extraParam);
            if (res.success) {
                gameCoordinator.handleDostKazigiCardPlayed(instance.game, io, players);
            } else {
                socket.emit('gameError', res.error || 'Geçersiz kart hamlesi!');
            }
        }
    });

    socket.on('dostKazigiNextHand', () => {
        let instance = gameCoordinator.getDostKazigiInstance(socket.id);
        if (instance && instance.game && instance.game.phase === 'hand_over') {
            gameCoordinator.startNextDostKazigiHand(instance.game, io, players);
        }
    });

    socket.on('dostKazigiVoteRematch', (vote) => {
        let instance = gameCoordinator.getDostKazigiInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleDostKazigiVoteRematch(instance.game, socket.id, vote || 'yes', io, players);
        }
    });

    // ==========================================
    // 3. BİLARDO DİNLEYİCİLERİ
    // ==========================================
    socket.on('billiardShoot', (data) => {
        let instance = gameCoordinator.getBilliardInstance(socket.id);
        if (instance && data) {
            let ok = instance.engine.shootBall(instance.game, socket.id, data.angle, data.power, 0, 0);
            if (ok) {
                instance.game._forceUpdate = true;
            }
        }
    });

    socket.on('billiardPlaceWhite', (pos) => {
        let instance = gameCoordinator.getBilliardInstance(socket.id);
        if (instance && pos && instance.engine.placeWhiteBall(instance.game, socket.id, pos.x, pos.y)) {
            socket.emit('billiardBallPlaced');
        }
    });

    socket.on('billiardVoteRematch', () => {
        let instance = gameCoordinator.getBilliardInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleBilliardVoteRematch(instance.game, socket.id, true, io, players);
        }
    });

    // ==========================================
    // 4. TAVLA DİNLEYİCİLERİ
    // ==========================================
    socket.on('tavlaRoll', () => {
        let instance = gameCoordinator.getTavlaInstance(socket.id);
        if (instance && instance.engine.rollDice(instance.game, socket.id)) {
            gameCoordinator.sendTavlaUpdate(instance.game, io);
        }
    });

    socket.on('getTavlaValidMoves', (data) => {
        let instance = gameCoordinator.getTavlaInstance(socket.id);
        if (instance && data) {
            let moves = instance.engine.getValidMovesForPoint(instance.game, socket.id, data.fromPoint);
            socket.emit('tavlaValidMovesResponse', { moves: moves });
        }
    });

    socket.on('tavlaMove', (data) => {
        let instance = gameCoordinator.getTavlaInstance(socket.id);
        if (instance && data && instance.engine.makeMove(instance.game, socket.id, data.fromPoint, data.toPoint, data.usedDie)) {
            gameCoordinator.sendTavlaUpdate(instance.game, io);
            if (instance.game.gameOver && instance.game.winner && !instance.game.winnerRecorded) {
                instance.game.winnerRecorded = true;
                const isBotPlayer = (pid, prof) => !pid || pid.startsWith('bot_') || prof?.isBot || (typeof prof?.name === 'string' && (prof.name.startsWith('🤖') || prof.name.includes('🤖')));
                const bothHumans = !isBotPlayer(instance.game.players[0], instance.game.playerProfiles?.[instance.game.players[0]]) && !isBotPlayer(instance.game.players[1], instance.game.playerProfiles?.[instance.game.players[1]]);
                if (bothHumans) {
                    instance.game.players.forEach(pid => {
                        let pName = instance.game.playerProfiles?.[pid]?.name;
                        if (pName) dataManager.recordGamePlayed(pName, 'tavla', 1);
                    });
                }

                let wName = instance.game.playerProfiles?.[instance.game.winner]?.name;
                let isHuman = typeof wName === 'string' && wName.length > 0 && !isBotPlayer(instance.game.winner, instance.game.playerProfiles?.[instance.game.winner]);
                if (wName) {
                    if (isHuman) {
                        dataManager.persistentData.leaderboard.tavla[wName] = (dataManager.persistentData.leaderboard.tavla[wName] || 0) + 1;
                    }
                    instance.game.players.forEach(pid => {
                        let pName = instance.game.playerProfiles[pid]?.name;
                        if (pName && !isBotPlayer(pid, instance.game.playerProfiles[pid])) {
                            dataManager.recordQuestProgress(pName, 'tavla_play', 1);
                        }
                    });
                    let winPrize = 20;
                    if (instance.game.pot && instance.game.pot > 0) {
                        winPrize += instance.game.pot;
                        let potMsg = `💰 TEBRİKLER! ${wName} tavla masasındaki ${instance.game.pot} TL'lik potu kazandı!`;
                        instance.game.players.forEach(pid => io.to(pid).emit('systemMessage', potMsg));
                        if (instance.game.spectators) instance.game.spectators.forEach(sid => io.to(sid).emit('systemMessage', potMsg));
                        instance.game.pot = 0;
                    }
                    if (isHuman && dataManager.persistentData.users[wName]) {
                        dataManager.persistentData.users[wName].money = (dataManager.persistentData.users[wName].money || 100) + winPrize;
                        io.to(instance.game.winner).emit('moneyUpdate', dataManager.persistentData.users[wName].money);
                    }
                    dataManager.savePersistentData();
                }
            }
        }
    });

    // ==========================================
    // 5. XOX DİNLEYİCİLERİ
    // ==========================================
    socket.on('xoxMove', (data) => {
        let instance = gameCoordinator.getXoxInstance(socket.id);
        if (instance) {
            let cellIndex = data;
            if (typeof data === 'object' && data !== null) {
                cellIndex = data.index !== undefined ? data.index : data.cellIndex;
            }
            let res = instance.engine.makeXoxMove(instance.game, socket.id, cellIndex);
            if (res.success) {
                gameCoordinator.sendXoxUpdate(instance.game, io);
            } else {
                socket.emit('gameError', res.message || "Geçersiz kare.");
            }
        }
    });

    socket.on('xoxVoteRematch', () => {
        let instance = gameCoordinator.getXoxInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleXoxVoteRematch(instance.game, socket.id, true, io, players);
        }
    });

    // ==========================================
    // 6. AMİRAL BATTI DİNLEYİCİLERİ
    // ==========================================
    socket.on('amiralReady', (data) => {
        let instance = gameCoordinator.getAmiralInstance(socket.id);
        if (instance) {
            let ships = data ? data.ships : null;
            let grid = data ? data.grid : null;
            instance.engine.setPlayerFleet(instance.game, socket.id, ships, grid);
            gameCoordinator.sendAmiralUpdate(instance.game, io);
        }
    });

    socket.on('amiralFire', (data) => {
        let instance = gameCoordinator.getAmiralInstance(socket.id);
        if (instance && data && typeof data.r === 'number' && typeof data.c === 'number') {
            let res = instance.engine.makeAmiralShot(instance.game, socket.id, data.r, data.c);
            if (res.success) {
                gameCoordinator.sendAmiralUpdate(instance.game, io);
            } else {
                socket.emit('gameError', res.message || "Geçersiz atış.");
            }
        }
    });

    socket.on('amiralVoteRematch', () => {
        let instance = gameCoordinator.getAmiralInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleAmiralVoteRematch(instance.game, socket.id, true, io, players);
        }
    });

    // ==========================================
    // 7. SATRANÇ DİNLEYİCİLERİ
    // ==========================================
    socket.on('chessMove', (data) => {
        let instance = gameCoordinator.getChessInstance(socket.id);
        if (instance && instance.game && data) {
            let res = instance.engine.makeChessMove(instance.game, socket.id, data);
            if (res.success) {
                gameCoordinator.sendChessUpdate(instance.game, io);
            } else {
                socket.emit('gameError', res.message || "Geçersiz satranç hamlesi.");
            }
        }
    });

    socket.on('chessResign', () => {
        let instance = gameCoordinator.getChessInstance(socket.id);
        if (instance && instance.game) {
            let res = instance.engine.resignChessGame(instance.game, socket.id);
            if (res.success) {
                gameCoordinator.sendChessUpdate(instance.game, io);
            }
        }
    });

    socket.on('chessVoteRematch', () => {
        let instance = gameCoordinator.getChessInstance(socket.id);
        if (instance && instance.game) {
            gameCoordinator.handleChessVoteRematch(instance.game, socket.id, true, io, players);
        }
    });

    // ==========================================
    // 8. 101 OKEY DİNLEYİCİLERİ
    // ==========================================
    socket.on('okey101DrawTile', () => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance) {
            let drawFn = instance.engine.drawTileFromDeck || instance.engine.drawTile;
            let res = drawFn(instance.game, socket.id);
            if (res.success) {
                gameCoordinator.sendOkey101Update(instance.game, io, players);
            } else {
                if (res.roundEnded || res.finished) {
                    gameCoordinator.sendOkey101Update(instance.game, io, players);
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101TakeDiscard', () => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance) {
            let takeFn = instance.engine.takeDiscardedTile || instance.engine.takeDiscardTile;
            let res = takeFn(instance.game, socket.id);
            if (res.success) {
                gameCoordinator.sendOkey101Update(instance.game, io, players);
            } else {
                if (res.roundEnded || res.finished) {
                    gameCoordinator.sendOkey101Update(instance.game, io, players);
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101ReturnDiscard', () => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance) {
            let returnFn = instance.engine.returnDiscardTile || instance.engine.returnTakenDiscard;
            let res = returnFn(instance.game, socket.id);
            if (res.success) {
                gameCoordinator.sendOkey101Update(instance.game, io, players);
                if (res.roundEnded || res.finished) {
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
            } else {
                if (res.roundEnded || res.finished) {
                    gameCoordinator.sendOkey101Update(instance.game, io, players);
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101OpenHand', (payload) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance && payload) {
            let res = instance.engine.openHand(instance.game, socket.id, payload, payload.type);
            if (res.success) {
                if (res.msg) socket.emit('systemMessage', res.msg);
                gameCoordinator.sendOkey101Update(instance.game, io, players);
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101AddTileToPer', (data) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance && data) {
            let tileIds = data.tileIds || (data.tileId ? [data.tileId] : []);
            let targetIdx = (data.targetPerIndex !== undefined) ? data.targetPerIndex : data.perIndex;
            let position = data.position || (data.addToFront ? 'start' : 'end');
            let res = instance.engine.addTileToTablePer(instance.game, socket.id, tileIds, targetIdx, position);
            if (res.success) {
                socket.emit('systemMessage', res.msg);
                gameCoordinator.sendOkey101Update(instance.game, io, players);
                if (res.finished || res.roundEnded) {
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101DiscardTile', (tileId) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance) {
            let res = instance.engine.discardTile(instance.game, socket.id, tileId);
            if (res.success) {
                gameCoordinator.sendOkey101Update(instance.game, io, players);
                if (res.finished || res.roundEnded) {
                    gameCoordinator.checkOkey101RoundEnd(instance.game, io, players);
                }
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101NextRound', () => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance && instance.game) {
            if (instance.game.gameOver) {
                gameCoordinator.startNextOkey101Round(instance.game, io, players);
            }
        }
    });

    socket.on('okey101TakeOkey', (data) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance && data) {
            let res = instance.engine.takeOkeyFromTablePer(instance.game, socket.id, data.perIndex, data.tileId);
            if (res.success) {
                socket.emit('systemMessage', res.msg);
                gameCoordinator.sendOkey101Update(instance.game, io, players);
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });

    socket.on('okey101RevealGosterge', (data) => {
        let instance = gameCoordinator.getOkey101Instance(socket.id);
        if (instance) {
            let tileId = data ? data.tileId : null;
            let res = instance.engine.revealGosterge(instance.game, socket.id, tileId);
            if (res.success) {
                let pName = players[socket.id]?.name || "Oyuncu";
                let t = res.tile;
                let broadcastMsg = `📢 ${pName} elindeki GÖSTERGE taşını (${t.color.toUpperCase()} ${t.value}) gösterdi! Çifte giderken tek başına 1 çift sayılacak.`;

                instance.game.players.forEach(pid => {
                    io.to(pid).emit('systemMessage', broadcastMsg);
                    io.to(pid).emit('okey101GostergeRevealed', {
                        playerId: socket.id,
                        playerName: pName,
                        tile: t
                    });
                });
                if (instance.game.spectators) {
                    instance.game.spectators.forEach(sid => {
                        io.to(sid).emit('systemMessage', broadcastMsg);
                        io.to(sid).emit('okey101GostergeRevealed', {
                            playerId: socket.id,
                            playerName: pName,
                            tile: t
                        });
                    });
                }
                gameCoordinator.sendOkey101Update(instance.game, io, players);
            } else {
                socket.emit('gameError', res.msg);
            }
        }
    });
}

module.exports = { registerBoardGameActionHandlers };

