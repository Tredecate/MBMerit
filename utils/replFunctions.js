const { createInterface } = require("readline");
const { inspect } = require("util");
const { evalInContext, defineBots, startBots, bot } = require("../app.js");


//// PRIMARY EXPORTED HELPER FUNCTIONS ////

function quit() {

    process.abort();

}

function log(msg, codeBlock=true) {

    console.log(msg);

}

async function restartBots() {



    await bot.client.destroy();
        console.log(`Took down ${bot.client.user.tag}`);

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

    destroyOutHook = hookWriteStream(process.stdout);
    destroyErrHook = hookWriteStream(process.stderr);

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

/*function evalOut(string, encoding, fd) {

    if (!string.startsWith("CONONLY")) {
        sendMessage(CLIENTS.Merit, CLIENTS.Merit.config.ids.logChannel, "```json\n" + string + "```");
    }

}
*/
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


Object.assign(module.exports, {makeHooks, destroyHooks, makeRepl, destroyRepl, quit, restartBots, log});