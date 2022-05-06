const { CLIENTS } = require("../app.js");

module.exports = (bot, message) => {
    // Ignore all bots
    if (message.author.bot) return;

    if (message.content.indexOf(CLIENTS.Merit.config.prefix) !== 0) return;

    const args = message.content.slice(CLIENTS.Merit.config.prefix).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
   // const cmd = bot.commands.fetch(command);
    const cmd = bot.commands.get

    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;

    // Run the command
    cmd.run(bot, message, args);
};