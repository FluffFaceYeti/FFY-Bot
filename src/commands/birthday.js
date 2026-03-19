const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../userdata/birthdays.json");

// ensure file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

module.exports = {
    name: "birthday",

    async execute(message, args) {

        if (args.length < 2) {
            return message.reply("🏴‍☠️ Use: `!birthday <day> <month>`\nExample: `!birthday 19 3`");
        }

        const day = parseInt(args[0]);
        const month = parseInt(args[1]);

        if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
            return message.reply("❌ Invalid date. Example: `!birthday 19 3`");
        }

        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(filePath));
        } catch {}

        data[message.author.id] = { day, month };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        message.reply(`🎂 Yer birthday be set to **${day}/${month}**!`);
    }
};