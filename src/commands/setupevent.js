const { ChannelSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    name: "setupevent",

    async execute(message) {

        const menu = new ChannelSelectMenuBuilder()
            .setCustomId("event_channel_select")
            .setPlaceholder("Select voice channels for event alerts")
            .setMinValues(1)
            .setMaxValues(10)
            .addChannelTypes(2); // voice channels

        const row = new ActionRowBuilder().addComponents(menu);

        message.reply({
            content: "Select the voice channels for event alerts:",
            components: [row]
        });

    }
};