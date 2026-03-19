const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../userdata/birthdayChannels.json");

// ensure file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

module.exports = {
    name: "birthdaychannel",

    async execute(message) {

        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ You need admin to set the birthday channel.");
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply("❌ Mention a channel.\nExample: `!birthdaychannel #general`");
        }

        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(filePath));
        } catch {}

        data[message.guild.id] = channel.id;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        message.reply(`🎂 Birthday messages will now be sent in ${channel}`);
    }
};