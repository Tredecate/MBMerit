const { isAvailable, instance } = require("gcp-metadata");
const { resolve } = require("path");
const { readFileSync } = require("fs");
const Discord = require("discord.js");


//// DEFINE AND BEGIN BOT INITIALIZATION ////

//const client = new Client();
const CLIENTS = {};

async function defineBots() {

    const CONFIG = JSON.parse(readFileSync(resolve(__dirname, "./config.json"), "utf8"));

    Object.assign(CLIENTS, {

        Merit: {
            config: CONFIG.BOTS.Merit,
            messageQueue: {messages: {}, timers: {}}
        }
        
    });

}


//// REGISTER COMMON EVENT HANDLERS AND PERFORM COMMON BOT STARTUP ROUTINE ////


async function startBots() {

    for (let bot of Object.values(CLIENTS)) {

        bot.client = new Discord.Client({
            intents: [Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES], 
            partials: ["CHANNEL"]
        });

        bot.client.on("ready", () => {

            console.log(`Logged in as ${bot.client.user.tag}!`);

        });

        await bot.client.login(await getToken(bot.config.name));

        const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
        const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
        bot.client.commands = new Discord.Collection();

        //event initialization
        for (const file of events) {
            const eventName = file.split(".")[0];
            const event = require(`./events/${file}`);
            bot.client.on(eventName, event.bind(null, client));
        }
        //command initialization
        for (const file of commands) {
            const commandName = file.split(".")[0];
            const command = require(`./commands/${file}`);
            bot.client.commands.set(commandName, command);
        }
    }

    clientSpecificEvents();

}


//// CLIENT SPECIFIC EVENT TRIGGERS ////

/*
function clientSpecificEvents() {

    // Establish *e eval listener. This is an archaic mess, pls no hate. The rest of the code isn't like this I promise
    CLIENTS.Merit.client.on("messageCreate", message => {

        const args = message.content.split(" ").slice(1);
    
        if (message.content.startsWith("*" + "e ") && CLIENTS.Merit.config.ids.evalUsers.some(userId => message.author.id == userId)) {

            try {

                eval(args.join(" "));

            } catch (err) {

                let clean = (text) => {

                    if (typeof (text) === "string") {
                        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                    } else {
                        return text;
                    }

                }

                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);

            }

        }

    });

}
*/

//// HELPER FUNCTIONS ////


async function getToken(botName) {

    if (await isAvailable()) {

        try {

            return await instance(`${botName}DiscordBotToken`);

        } catch {

            console.log(`Couldn't fetch bot token from VM metadata using name: ${botName}DiscordBotToken`);

        }

    }

    console.log("Google Cloud instance metadata unavailable, checking for tokens.json in root project directory...");

    try {

        return JSON.parse(readFileSync(resolve(__dirname, "./tokens.json"), "utf8"))[botName];

    } catch {

        console.log(`Unable to read token for ${botName} from file: tokens.json`);

    }

}

function evalInContext(toRun) {

    eval(toRun);

}


//// START THINGS ////


defineBots();
startBots();


//// IMPORTS/EXPORTS FOR REPL AND STDOUT HOOKING ////


Object.assign(module.exports, {CLIENTS, evalInContext, defineBots, startBots});
const repl = require("./utils/replFunctions.js");
const fs = require("fs");