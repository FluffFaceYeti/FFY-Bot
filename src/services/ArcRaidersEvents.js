const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const configPath = path.join(__dirname, "../../userdata/arcEvents.json");
const imageFolder = path.join(__dirname, "../../userdata/data");

// 🧠 Cache
let lastEventIds = new Set();
let initialized = false;

function getImageName(mapName) {
  return mapName.replace(/\s+/g, "").toLowerCase() + ".jpg";
}

async function checkArcEvents(client) {

  try {
    const res = await axios.get("https://metaforge.app/api/arc-raiders/events-schedule");

    // ✅ HANDLE API STRUCTURE
    let maps = res.data;

    if (!Array.isArray(maps)) {
      maps = maps.data || maps.maps || [];
    }

    if (!Array.isArray(maps) || maps.length === 0) {
      console.error("ARC API returned unexpected format:", res.data);
      return;
    }

    // ✅ SAFE CONFIG LOAD
    let config = {};
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf8");
        if (raw.trim().length > 0) {
          config = JSON.parse(raw);
        }
      }
    } catch (err) {
      console.error("ARC config load error:", err);
    }

    const currentIds = new Set();
    const now = Date.now();

    // 🔍 COLLECT ACTIVE EVENTS
    for (const map of maps) {

      const mapName = map.name || map.mapName || "Unknown Map";
      const events = map.events || [];

      for (const event of events) {

        const eventName = event.name || event.title || "Unknown Event";

        const start = new Date(event.startTime || event.start).getTime();
        const end = new Date(event.endTime || event.end).getTime();

        // only active events
        if (now >= start && now <= end) {
          currentIds.add(`${mapName}-${eventName}`);
        }
      }
    }

    // 🚫 FIRST RUN (no spam)
    if (!initialized) {
      lastEventIds = currentIds;
      initialized = true;
      console.log("ARC events initialized (no alerts sent)");
      return;
    }

    // 🔥 DETECT NEW ACTIVE EVENTS
    for (const map of maps) {

      const mapName = map.name || map.mapName || "Unknown Map";
      const events = map.events || [];

      for (const event of events) {

        const eventName = event.name || event.title || "Unknown Event";

        const start = new Date(event.startTime || event.start).getTime();
        const end = new Date(event.endTime || event.end).getTime();

        if (now < start || now > end) continue;

        const uniqueId = `${mapName}-${eventName}`;

        if (lastEventIds.has(uniqueId)) continue;

        console.log("New ACTIVE ARC event:", uniqueId);

        const imageName = getImageName(mapName);
        const imagePath = path.join(imageFolder, imageName);

        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setAuthor({
            name: "ARC RAIDERS",
            iconURL: "https://i.imgur.com/arcicon.png"
          })
          .setTitle(mapName)
          .setDescription(`🚨 **NEW EVENT STARTED**\n**${eventName}**`)
          .addFields(
            {
              name: "Ends",
              value: new Date(end).toLocaleString(),
              inline: true
            }
          )
          .setFooter({ text: "ARC Event Tracker" })
          .setTimestamp();

        let files = [];

        // 🖼️ Attach image
        if (fs.existsSync(imagePath)) {
          embed.setImage(`attachment://${imageName}`);
          files.push(imagePath);
        } else {
          console.log("Missing image for:", mapName);
        }

        // 📡 Send to configured servers
        for (const guild of client.guilds.cache.values()) {

          const channelId = config[guild.id];
          if (!channelId) continue;

          const channel = await guild.channels.fetch(channelId).catch(() => null);
          if (!channel) continue;

          channel.send({
            embeds: [embed],
            files
          });
        }
      }
    }

    // update cache
    lastEventIds = currentIds;

  } catch (err) {
    console.error("ARC event error:", err.message);
  }
}

module.exports = { checkArcEvents };