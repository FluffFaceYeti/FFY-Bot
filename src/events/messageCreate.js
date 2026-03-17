const { getPrefix } = require("../utils/prefixManager");

module.exports = {
    name: "messageCreate",

    async execute(message, client) {

        if (message.author.bot) return;
        if (!message.guild) return;

        const prefix = getPrefix(message.guild.id);

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(message, client, args);
        } catch (error) {
            console.error(error);
            message.reply("There was an error running that command.");
        }
    }
};