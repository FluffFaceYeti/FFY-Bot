const fs = require("fs");
const path = require("path");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require("@discordjs/voice");

const dataPath = path.join(__dirname, "../data/alertChannels.json");

module.exports = {
    name: "startalert",

    async execute(message) {

        const data = JSON.parse(fs.readFileSync(dataPath));

        const audioPath = path.join(__dirname, "../audio/startalert.mp3");

        for (const channelId of data.channels) {

            const channel = message.guild.channels.cache.get(channelId);
            if (!channel) continue;

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();

            const resource = createAudioResource(audioPath);

            player.play(resource);

            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

        }

        message.channel.send("🔔 Alert started!");
    }
};