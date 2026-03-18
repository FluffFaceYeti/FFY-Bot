const { ChannelSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "setarcevents",

  async execute(message) {

    // 🔒 Admin only
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You must be an administrator to use this command.");
    }

    // 🎮 Channel selector
    const menu = new ChannelSelectMenuBuilder()
      .setCustomId("arc_event_channel_select")
      .setPlaceholder("Select ARC event alert channel")
      .setMinValues(1)
      .setMaxValues(1)
      .addChannelTypes(0); // text channels only

    const row = new ActionRowBuilder().addComponents(menu);

    return message.reply({
      content: "🎮 Select the channel for ARC event alerts:",
      components: [row]
    });
  }
};