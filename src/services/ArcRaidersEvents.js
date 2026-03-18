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

    // ✅ FIXED API HANDLING
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

    // collect current events
    for (const map of maps) {
      for (const event of (map.currentEvents || [])) {
        currentIds.add(`${map.name}-${event.name}`);
      }
    }

    // 🚫 FIRST RUN (no spam)
    if (!initialized) {
      lastEventIds = currentIds;
      initialized = true;
      console.log("ARC events initialized (no alerts sent)");
      return;
    }

    // 🔥 CHECK FOR NEW EVENTS
    for (const map of maps) {

      const currentEvents = map.currentEvents || [];

      for (const event of currentEvents) {

        const uniqueId = `${map.name}-${event.name}`;

        if (lastEventIds.has(uniqueId)) continue;

        console.log("New ARC event:", uniqueId);

        const imageName = getImageName(map.name);
        const imagePath = path.join(imageFolder, imageName);

        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setAuthor({
            name: "ARC RAIDERS",
            iconURL: "https://i.imgur.com/arcicon.png"
          })
          .setTitle(map.name)
          .setDescription(`🚨 **NEW EVENT STARTED**\n**${event.name}**`)
          .addFields(
            {
              name: "Ends In",
              value: event.endsIn || "Unknown",
              inline: true
            }
          )
          .setFooter({ text: "ARC Event Tracker" })
          .setTimestamp();

        let files = [];

        // 🖼️ Attach image if exists
        if (fs.existsSync(imagePath)) {
          embed.setImage(`attachment://${imageName}`);
          files.push(imagePath);
        } else {
          console.log("Missing image for:", map.name);
        }

        // 📡 Send to configured channels
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