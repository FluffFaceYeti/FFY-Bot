const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const configPath = path.join(__dirname, "../../userdata/arcEvents.json");
const imageFolder = path.join(__dirname, "../../userdata/data");

let announcedEvents = new Set();

// store messages in order
let recentMessages = []; 
// [{ uniqueId, guildId, messageId }]

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
    } catch (err) {
      console.error("CONFIG LOAD ERROR:", err);
    }

    const now = Date.now();
    const TWO_MIN = 2 * 60 * 1000;

    for (const event of events) {
      const eventName = event.name;
      const mapName = event.map;
      const start = event.startTime;

      if (!start) continue;

      const uniqueId = `${mapName}-${eventName}-${start}`;

      // ✅ ONLY VERY RECENT EVENTS (last 2 mins)
      if (now < start || now > start + TWO_MIN) continue;

      if (announcedEvents.has(uniqueId)) continue;
      announcedEvents.add(uniqueId);

      console.log("NEW LIVE EVENT:", uniqueId);

      const imageName = getImageName(mapName);
      const imagePath = path.join(imageFolder, imageName);

      const unix = Math.floor(start / 1000);

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle(mapName)
        .setDescription(`🚨 **EVENT STARTED**\n**${eventName}**`)
        .addFields({
          name: "Start Time",
          value: `<t:${unix}:F>\n<t:${unix}:R>`,
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
        if (!channel || !channel.isTextBased()) continue;

        const sent = await channel.send({
          embeds: [embed],
          files
        }).catch(err => {
          console.error("SEND ERROR:", err);
          return null;
        });

        if (!sent) continue;

        console.log("Posted event:", sent.id);

        // store message
        recentMessages.push({
          uniqueId,
          guildId: guild.id,
          messageId: sent.id
        });

        // =============================
        // 🧹 KEEP ONLY LAST 3 EVENTS
        // =============================
        while (recentMessages.length > 3) {
          const old = recentMessages.shift();

          const oldGuild = client.guilds.cache.get(old.guildId);
          if (!oldGuild) continue;

          const oldChannelId = config[old.guildId];
          if (!oldChannelId) continue;

          const oldChannel = await oldGuild.channels.fetch(oldChannelId).catch(() => null);
          if (!oldChannel) continue;

          const oldMsg = await oldChannel.messages.fetch(old.messageId).catch(() => null);
          if (oldMsg) {
            console.log("Deleting old event:", old.messageId);
            await oldMsg.delete().catch(() => {});
          }
        }
      }
    }

    console.log("Active messages:", recentMessages.length);

  } catch (err) {
    console.error("ARC event error:", err);
  }
}

module.exports = { checkArcEvents };