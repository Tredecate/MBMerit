const { resolve } = require("path");
const {  readdirSync, readFileSync } = require("fs");
const { Client, Intents, CommandInteraction} = require("discord.js");
const Discord = require('discord.js');
const {isAvailable, instance} = require("gcp-metadata");
const {log} = require("./utils/replFunctions");
const fs = require("fs");

const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ["CHANNEL", "MESSAGE"]
});

module.exports = bot;
//// REGISTER COMMON EVENT HANDLERS AND PERFORM COMMON BOT STARTUP ROUTINE ////
bot.commands = new Discord.Collection();

async function startBots() {

    await bot.login(await getToken());

    const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commands) {
        let command = require(`./commands/${file}`);
        await bot.commands.set(command.name, command);
        console.log(`Command loaded: ${command.name}`);
    }

    const eventFiles = fs.readdirSync("./events/").filter(file => file.endsWith(".js"));
    for (const file of eventFiles) {
        const eventName = file.split(".")[0];
        let event = require(`./events/${file}`);

        bot.on(eventName, () => event);
    }

}

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

        return JSON.parse(readFileSync(resolve(__dirname, "./tokens.json"), "utf8"));

    } catch {

        console.log(`Unable to read token for ${botName} from file: tokens.json`);

    }

}



//// START THINGS ////

startBots();


//// IMPORTS/EXPORTS FOR REPL AND STDOUT HOOKING ////
Object.assign(module.exports, {startBots});
