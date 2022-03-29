exports.run = (client, message) => {
    message.channel.send("bong!").catch(console.error);
}

exports.name = "bong";