const { createInterface } = require("readline");
const { inspect } = require("util");
const { CLIENTS, evalInContext, defineBots, startBots } = require("../app.js");


//// PRIMARY EXPORTED HELPER FUNCTIONS ////


function sendMessage(bot, channelID, fullMessage, queue=false) {

    fullMessage = (typeof fullMessage == "string") ? fullMessage : inspect(fullMessage);

    let messages = [];
    let maxLength = 2000;
    let codeStart = "";
    let codeEnd = "";

    if (fullMessage.startsWith("```") && fullMessage.length > 2000) {

        codeStart = fullMessage.substring(0, fullMessage.indexOf("\n") + 1);
        codeEnd = "```";
        maxLength = 2000 - codeEnd.length - codeStart.length;

    }

    while (fullMessage.length > maxLength) {

        let lastNewLine = fullMessage.lastIndexOf("\n", maxLength) > 0 ? fullMessage.lastIndexOf("\n", maxLength) : maxLength;

        messages.push(codeStart + fullMessage.substring(fullMessage.startsWith(codeStart) ? codeStart.length : 0, lastNewLine) + codeEnd);
        fullMessage = fullMessage.substring(lastNewLine);

    }

    messages.push(codeStart + fullMessage.substring(0, fullMessage.length - codeEnd.length) + codeEnd);

    if (!queue) {

        messages.forEach(msg => bot.client.channels.fetch(channelID).then(ch => ch.send(msg)).catch(err => console.error(err.toString().substring(0, 2000))));

    } else {

        messages.forEach(msg => (bot.messageQueue.messages[channelID] || (bot.messageQueue.messages[channelID] = [])).push(msg));
        clearTimeout(bot.messageQueue.timers[channelID]);
        bot.messageQueue.timers[channelID] = setTimeout((timerbot, chanID) => {

            sendMessage(timerbot, chanID, timerbot.messageQueue.messages[chanID].reduce((bigMsg, curMsg) => bigMsg + "\n" + curMsg));
            timerbot.messageQueue.messages[chanID] = [];

        }, 2000, bot, channelID);

    }

}

function replyMessage(bot, channelID, messageID, message) {

    bot.client.channels.fetch(channelID).then(ch => ch.messages.fetch(messageID).then(msg => msg.reply(message)));

}

function quit() {

    process.abort();

}

function log(msg, codeBlock=true) {

    console.log(msg);
    sendMessage(CLIENTS.Merit, CLIENTS.Merit.config.ids.logChannel, (codeBlock ? "```json\n" : "") + (typeof msg == 'string' ? msg : inspect(msg)) + (codeBlock ? "\n```" : ""), true);

}

async function restartBots() {
    
    for (let bot of Object.values(CLIENTS)) {

        await bot.client.destroy();
        console.log(`Took down ${bot.client.user.tag}`);

    }

    defineBots();
    await startBots();

}


//// PRIMARY EXPORTED REPL FUNCTIONS ////


function makeRepl() {

    readLn = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readLn.on('line', line => {

        try{
            evalInContext(line.toString().trim());
        } catch (err) {
            console.log(err);
        }

    });

}

function destroyRepl() {

    readLn.close();

}

function makeHooks() {

    destroyOutHook = hookWriteStream(process.stdout, evalOut);
    destroyErrHook = hookWriteStream(process.stderr, evalOut);

}

function destroyHooks() {
    
    destroyOutHook();
    destroyErrHook();

}


//// DEFINE SOME PRIVATE REPL-ENABLING FUCKERY ////


let oldWrite;
let destroyOutHook;
let destroyErrHook;
let readLn;

function evalOut(string, encoding, fd) {

    if (!string.startsWith("CONONLY")) {
        sendMessage(CLIENTS.Merit, CLIENTS.Merit.config.ids.logChannel, "```json\n" + string + "```");
    }

}

// Thank u stackoverflow, I barely understand how the fuck this works but it does. Don't worry about it
function hookWriteStream(stream, callback) {

    oldWrite = stream.write;

    stream.write = (function(write) {
        
        return function(string, encoding, fd) {

            write.apply(stream, arguments);
            callback(string, encoding, fd);

        };

    })(stream.write);

    return function() {
        stream.write = oldWrite;
    };
    
}


//// EXPORT STUFF ////


Object.assign(module.exports, {makeHooks, destroyHooks, makeRepl, destroyRepl, quit, restartBots, sendMessage, replyMessage, log});