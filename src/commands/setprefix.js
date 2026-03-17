const { setPrefix } = require("../utils/prefixManager");

module.exports = {
    name: "setprefix",

    execute(message, client, args) {

        if (!message.member.permissions.has("Administrator")) {
            return message.reply("You must be an administrator to change the prefix.");
        }

        const newPrefix = args[0];

        if (!newPrefix) {
            return message.reply("Please provide a new prefix.");
        }

        setPrefix(message.guild.id, newPrefix);

        message.reply(`Prefix updated to \`${newPrefix}\``);
    }
};