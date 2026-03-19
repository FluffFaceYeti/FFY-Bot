const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const configPath = path.join(__dirname, "../../userdata/arcEvents.json");
const imageFolder = path.join(__dirname, "../../userdata/data");

let announcedEvents = new Set();
let activeEventMessages = new Map();

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

    // =============================
    // 🔥 POST EVENTS
    // =============================
    for (const event of events) {
      const eventName = event.name;
      const mapName = event.map;
      const start = event.startTime;

      if (!start) continue;

      const uniqueId = `${mapName}-${eventName}-${start}`;

      if (now >= start && now <= start + 60000) {
        if (announcedEvents.has(uniqueId)) continue;

        announcedEvents.add(uniqueId);
        console.log("ARC EVENT:", uniqueId);

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
        } else {
          console.log("Image not found:", imagePath);
        }

        for (const guild of client.guilds.cache.values()) {
          const channelId = config[guild.id];

          if (!channelId) {
            console.log("No channel configured for guild:", guild.id);
            continue;
          }

          const channel = await guild.channels.fetch(channelId).catch(err => {
            console.error("CHANNEL FETCH ERROR:", err);
            return null;
          });

          if (!channel || !channel.isTextBased()) {
            console.log("Invalid channel:", channelId);
            continue;
          }

          console.log("Sending to guild:", guild.id, "channel:", channelId);

          const sent = await channel.send({
            embeds: [embed],
            files
          }).catch(err => {
            console.error("SEND ERROR:", err);
            return null;
          });

          if (sent) {
            console.log("Message sent:", sent.id);

            if (!activeEventMessages.has(uniqueId)) {
              activeEventMessages.set(uniqueId, []);
            }

            activeEventMessages.get(uniqueId).push({
              guildId: guild.id,
              messageId: sent.id
            });
          }
        }
      }
    }

    // =============================
    // 🧹 CLEANUP OLD EVENTS
    // =============================
    for (const [uniqueId, messages] of activeEventMessages.entries()) {
      const parts = uniqueId.split("-");
      const start = Number(parts[parts.length - 1]);
      const endTime = start + 15 * 60 * 1000;

      if (now > endTime) {
        console.log("Deleting expired event:", uniqueId);

        for (const msgData of messages) {
          const guild = client.guilds.cache.get(msgData.guildId);
          if (!guild) continue;

          const channelId = config[guild.id];
          if (!channelId) continue;

          const channel = await guild.channels.fetch(channelId).catch(err => {
            console.error("FETCH DELETE CHANNEL ERROR:", err);
            return null;
          });

          if (!channel) continue;

          const msg = await channel.messages.fetch(msgData.messageId).catch(err => {
            console.error("FETCH MESSAGE ERROR:", err);
            return null;
          });

          if (msg) {
            await msg.delete().catch(err => {
              console.error("DELETE ERROR:", err);
            });
          }
        }

        activeEventMessages.delete(uniqueId);
      }
    }

    console.log("Tracked events:", activeEventMessages.size);

  } catch (err) {
    console.error("ARC event error:", err);
  }
}

module.exports = { checkArcEvents };