require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
    intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

require("./handlers/commandHandler")(client);
require("./handlers/eventHandler")(client);

client.login(process.env.TOKEN);