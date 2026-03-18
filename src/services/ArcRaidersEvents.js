const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const configPath = path.join(__dirname, "../../userdata/arcEvents.json");
const imageFolder = path.join(__dirname, "../../userdata/data");

let announcedEvents = new Set();

function getImageName(mapName) {
  return mapName.replace(/\s+/g, "").toLowerCase() + ".jpg";
}

async function checkArcEvents(client) {

  try {
    const res = await axios.get("https://metaforge.app/api/arc-raiders/events-schedule");

    const events = res.data.data;

    if (!Array.isArray(events)) {
      console.error("ARC API format error");
      return;
    }

    // load config
    let config = {};
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf8");
        if (raw.trim()) {
          config = JSON.parse(raw);
        }
      }
    } catch {}

    const now = Date.now();

    for (const event of events) {

      const eventName = event.name;
      const mapName = event.map;
      const start = event.startTime;

      if (!start) continue;

      const uniqueId = `${mapName}-${eventName}-${start}`;

      // 🔥 clean detection window (1 min)
      if (now >= start && now <= start + 60000) {

        if (announcedEvents.has(uniqueId)) continue;

        announcedEvents.add(uniqueId);

        console.log("ARC EVENT:", uniqueId);

        const imageName = getImageName(mapName);
        const imagePath = path.join(imageFolder, imageName);

        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle(mapName)
          .setDescription(`🚨 **EVENT STARTED**\n**${eventName}**`)
          .addFields({
            name: "Start Time",
            value: new Date(start).toLocaleString(),
            inline: true
          })
          .setTimestamp();

        let files = [];

        if (fs.existsSync(imagePath)) {
          embed.setImage(`attachment://${imageName}`);
          files.push(imagePath);
        }

        for (const guild of client.guilds.cache.values()) {

          const channelId = config[guild.id];
          if (!channelId) continue;

          const channel = await guild.channels.fetch(channelId).catch(() => null);
          if (!channel) continue;

          channel.send({
            embeds: [embed],
            files
          }).catch(() => {});
        }
      }
    }

  } catch (err) {
    console.error("ARC event error:", err.message);
  }
}

module.exports = { checkArcEvents };