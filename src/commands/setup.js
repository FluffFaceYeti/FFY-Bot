const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const eventPath = path.join(__dirname, "../data/eventChannels.json");
const twitchPath = path.join(__dirname, "../data/twitchConfig.json");
const prefixPath = path.join(__dirname, "../data/prefixes.json");

module.exports = {
name: "setup",


execute(message) {

    if (!message.member.permissions.has("Administrator")) {
        return message.reply("You must be an administrator to use setup.");
    }

    let eventChannels = [];
    let twitchChannel = "Not set";
    let prefix = "!";

    try {
        const data = JSON.parse(fs.readFileSync(eventPath));
        eventChannels = data.channels || [];
    } catch {}

    try {
        const config = JSON.parse(fs.readFileSync(twitchPath));
        const channelId = config[message.guild.id];

        if (channelId) {
            const channel = message.guild.channels.cache.get(channelId);
            if (channel) twitchChannel = `#${channel.name}`;
        }
    } catch {}

    try {
        const prefixes = JSON.parse(fs.readFileSync(prefixPath));
        prefix = prefixes[message.guild.id] || "!";
    } catch {}

    const channelNames = eventChannels
        .map(id => message.guild.channels.cache.get(id))
        .filter(ch => ch)
        .map(ch => `• ${ch.name}`)
        .join("\n") || "None configured";

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("setup_event_channels")
            .setLabel("Change Event Channels")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("setup_twitch_channel")
            .setLabel("Change Twitch Channel")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("setup_prefix")
            .setLabel("Change Prefix")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("reset_config")
            .setLabel("Reset Config")
            .setStyle(ButtonStyle.Danger)
    );

    message.reply({
        content:


`⚙️ **Bot Setup Panel**

🔊 **Event Voice Channels**
${channelNames}

📡 **Twitch Alert Channel**
${twitchChannel}

⌨️ **Prefix**
${prefix}

──────────────
Select an option below to update settings.`,
components: [row]
});


}


};
