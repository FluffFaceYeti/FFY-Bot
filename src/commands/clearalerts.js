const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/alertChannels.json");

module.exports = {
  name: "clearalerts",

  execute(message) {

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need admin permission.");
    }

    const data = { channels: [] };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    message.reply("✅ All alert channels cleared.");

  }
};