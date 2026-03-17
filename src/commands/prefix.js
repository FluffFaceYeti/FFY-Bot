const { getPrefix } = require("../utils/prefixManager");

module.exports = {
    name: "prefix",

    execute(message) {

        const prefix = getPrefix(message.guild.id);

        message.reply(`The prefix for this server is: \`${prefix}\``);
    }
};