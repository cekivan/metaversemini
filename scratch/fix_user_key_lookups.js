// scratch/fix_user_key_lookups.js
const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    for (const [target, replacement] of replacements) {
        if (content.includes(target)) {
            content = content.replace(target, replacement);
            modified = true;
            console.log(`[REPLACED] in ${file}: ${target.slice(0, 40).replace(/\r?\n/g, ' ')}...`);
        } else {
            console.error(`[TARGET NOT FOUND] in ${file}: ${target.slice(0, 40).replace(/\r?\n/g, ' ')}...`);
        }
    }
    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
    }
}

// 1. economyHandler.js
replaceInFile('src/handlers/economyHandler.js', [
    [
        "        let username = players[socket.id].name;\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\n        let userData = dataManager.persistentData.users[uKey];"
    ],
    [
        "        let username = players[socket.id].name;\r\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\r\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\r\n        let userData = dataManager.persistentData.users[uKey];"
    ]
]);

// 2. rouletteHandler.js
replaceInFile('src/handlers/rouletteHandler.js', [
    [
        "        let username = players[socket.id].name;\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\n        let userData = dataManager.persistentData.users[uKey];"
    ],
    [
        "        let username = players[socket.id].name;\r\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\r\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\r\n        let userData = dataManager.persistentData.users[uKey];"
    ]
]);

// 3. slotHandler.js
replaceInFile('src/handlers/slotHandler.js', [
    [
        "        let username = players[socket.id].name;\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\n        let userData = dataManager.persistentData.users[uKey];"
    ],
    [
        "        let username = players[socket.id].name;\r\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\r\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\r\n        let userData = dataManager.persistentData.users[uKey];"
    ]
]);

// 4. petShopHandler.js
replaceInFile('src/handlers/petShopHandler.js', [
    [
        "        const uData = dataManager.persistentData.users[player.name] || {};",
        "        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(player.name) : null) || player.name;\n        const uData = dataManager.persistentData.users[uKey] || {};"
    ]
]);

// 5. socialHandler.js
replaceInFile('src/handlers/socialHandler.js', [
    [
        "        let senderName = players[socket.id].name;\n        let uData = dataManager.persistentData.users[senderName];",
        "        let senderName = players[socket.id].name;\n        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(senderName) : null) || senderName;\n        let uData = dataManager.persistentData.users[senderKey];"
    ],
    [
        "        let senderName = players[socket.id].name;\r\n        let uData = dataManager.persistentData.users[senderName];",
        "        let senderName = players[socket.id].name;\r\n        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(senderName) : null) || senderName;\r\n        let uData = dataManager.persistentData.users[senderKey];"
    ],
    [
        "        let sender = players[socket.id];\n        let senderData = dataManager.persistentData.users[sender.name];",
        "        let sender = players[socket.id];\n        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(sender.name) : null) || sender.name;\n        let senderData = dataManager.persistentData.users[senderKey];"
    ],
    [
        "        let sender = players[socket.id];\r\n        let senderData = dataManager.persistentData.users[sender.name];",
        "        let sender = players[socket.id];\r\n        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(sender.name) : null) || sender.name;\r\n        let senderData = dataManager.persistentData.users[senderKey];"
    ],
    [
        "        let username = players[socket.id].name;\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\n        let userData = dataManager.persistentData.users[uKey];"
    ],
    [
        "        let username = players[socket.id].name;\r\n        let userData = dataManager.persistentData.users[username];",
        "        let username = players[socket.id].name;\r\n        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;\r\n        let userData = dataManager.persistentData.users[uKey];"
    ],
    [
        "        let requester = players[socket.id];\n        let requesterName = requester.name;\n        let requesterData = dataManager.persistentData.users[requesterName] || {};",
        "        let requester = players[socket.id];\n        let requesterName = requester.name;\n        let requesterKey = (dataManager.findUserKey ? dataManager.findUserKey(requesterName) : null) || requesterName;\n        let requesterData = dataManager.persistentData.users[requesterKey] || {};"
    ],
    [
        "        let requester = players[socket.id];\r\n        let requesterName = requester.name;\r\n        let requesterData = dataManager.persistentData.users[requesterName] || {};",
        "        let requester = players[socket.id];\r\n        let requesterName = requester.name;\r\n        let requesterKey = (dataManager.findUserKey ? dataManager.findUserKey(requesterName) : null) || requesterName;\r\n        let requesterData = dataManager.persistentData.users[requesterKey] || {};"
    ],
    [
        "            let uData = dataManager.persistentData.users[p.name] || {};",
        "            let pKey = (dataManager.findUserKey ? dataManager.findUserKey(p.name) : null) || p.name;\n            let uData = dataManager.persistentData.users[pKey] || {};"
    ]
]);

