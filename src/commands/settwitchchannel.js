const { ChannelSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
name: "twitch",


execute(message) {

    if (!message.member.permissions.has("Administrator")) {
        return message.reply("You must be an administrator to use this command.");
    }

    const menu = new ChannelSelectMenuBuilder()
        .setCustomId("twitch_channel_select")
        .setPlaceholder("Select the Twitch alert channel")
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(0); // text channels only

    const row = new ActionRowBuilder().addComponents(menu);

    message.reply({
        content: "📡 Select the channel where Twitch alerts should be sent:",
        components: [row]
    });

}

};
