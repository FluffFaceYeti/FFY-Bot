const fs = require("fs");
const path = require("path");
const { ChannelSelectMenuBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

// ✅ NEW BASE PATH
const basePath = path.join(__dirname, "../../userdata");

// ✅ FILE PATHS
const eventPath = path.join(basePath, "eventChannels.json");
const twitchPath = path.join(basePath, "twitchConfig.json");
const prefixPath = path.join(basePath, "prefixes.json");

// ✅ ENSURE FOLDER EXISTS
if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
}

module.exports = {
name: "interactionCreate",

async execute(interaction, client) {


// BUTTON HANDLER
if (interaction.isButton()) {

    if (interaction.customId === "setup_event_channels") {

        const menu = new ChannelSelectMenuBuilder()
            .setCustomId("event_channel_select")
            .setPlaceholder("Select event voice channels")
            .setMinValues(1)
            .setMaxValues(10)
            .addChannelTypes(2);

        const row = new ActionRowBuilder().addComponents(menu);

        return interaction.reply({
            content: "Select the voice channels used for event alerts:",
            components: [row],
            flags: 64
        });
    }

    if (interaction.customId === "setup_twitch_channel") {

        const menu = new ChannelSelectMenuBuilder()
            .setCustomId("twitch_channel_select")
            .setPlaceholder("Select Twitch alert channel")
            .setMinValues(1)
            .setMaxValues(1)
            .addChannelTypes(0);

        const row = new ActionRowBuilder().addComponents(menu);

        return interaction.reply({
            content: "Select the channel where Twitch alerts should be sent:",
            components: [row],
            flags: 64
        });
    }

    if (interaction.customId === "setup_prefix") {

        const modal = new ModalBuilder()
            .setCustomId("prefix_modal")
            .setTitle("Change Bot Prefix");

        const prefixInput = new TextInputBuilder()
            .setCustomId("prefix_input")
            .setLabel("Enter the new prefix")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3);

        const row = new ActionRowBuilder().addComponents(prefixInput);
        modal.addComponents(row);

        return interaction.showModal(modal);
    }

    if (interaction.customId === "reset_config") {

        fs.writeFileSync(eventPath, JSON.stringify({ channels: [] }, null, 2));
        fs.writeFileSync(twitchPath, JSON.stringify({}, null, 2));
        fs.writeFileSync(prefixPath, JSON.stringify({}, null, 2));

        return interaction.reply({
            content: "⚠️ Bot configuration has been reset.",
            flags: 64
        });
    }
}


// CHANNEL SELECT
if (interaction.isChannelSelectMenu()) {

    if (interaction.customId === "event_channel_select") {

        const selectedChannels = interaction.values;
        const data = { channels: selectedChannels };

        fs.writeFileSync(eventPath, JSON.stringify(data, null, 2));

        return interaction.reply({
            content: "✅ Event voice channels saved!",
            flags: 64
        });
    }

    if (interaction.customId === "twitch_channel_select") {

        let config = {};

        try {
            if (fs.existsSync(twitchPath)) {
                config = JSON.parse(fs.readFileSync(twitchPath));
            }
        } catch {}

        const channelId = interaction.values[0];

        config[interaction.guild.id] = channelId;

        fs.writeFileSync(twitchPath, JSON.stringify(config, null, 2));

        return interaction.reply({
            content: "📡 Twitch alert channel saved!",
            flags: 64
        });
    }
}


// PREFIX MODAL
if (interaction.isModalSubmit()) {

    if (interaction.customId === "prefix_modal") {

        let prefixes = {};

        try {
            if (fs.existsSync(prefixPath)) {
                prefixes = JSON.parse(fs.readFileSync(prefixPath));
            }
        } catch {}

        const newPrefix = interaction.fields.getTextInputValue("prefix_input");

        prefixes[interaction.guild.id] = newPrefix;

        fs.writeFileSync(prefixPath, JSON.stringify(prefixes, null, 2));

        return interaction.reply({
            content: `✅ Prefix updated to \`${newPrefix}\``,
            flags: 64
        });
    }
}


// SLASH COMMANDS
if (!interaction.isChatInputCommand()) return;

const command = client.commands.get(interaction.commandName);
if (!command) return;

try {
    await command.execute(interaction, client);
} catch (error) {
    console.error(error);

    await interaction.reply({
        content: "There was an error executing this command.",
        flags: 64
    });
}

}
};