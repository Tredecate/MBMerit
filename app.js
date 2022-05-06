const { resolve } = require("path");
const {  readdirSync, readFileSync } = require("fs");
const { Discord, Collection, Client, Intents } = require("discord.js");
const {isAvailable, instance} = require("gcp-metadata");
const {log} = require("./utils/replFunctions");




const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ["CHANNEL"]
});

bot.commands = new Collection();
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

//// REGISTER COMMON EVENT HANDLERS AND PERFORM COMMON BOT STARTUP ROUTINE ////


async function startBots() {

    await bot.login(await getToken());

    bot.on("ready", () => {
        log(`Logged in as ${bot.user.tag}!`);
    });

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        bot.commands.set(command.data.name, command);
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
