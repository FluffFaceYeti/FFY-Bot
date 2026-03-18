const fs = require("fs");
const path = require("path");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  StreamType
} = require("@discordjs/voice");

const dataPath = path.join(__dirname, "../../userdata/eventChannels.json");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playEventAudio(message, audioFile) {

  const data = JSON.parse(fs.readFileSync(dataPath));

  const audioPath = path.join(__dirname, "../audio", audioFile);

  if (!fs.existsSync(audioPath)) {
    return message.reply("Audio file not found.");
  }

  const channels = [...new Set(data.channels)];

  message.channel.send(`🔔 Playing event alert: **${audioFile}**`);

  await sleep(3000);

  for (const channelId of channels) {

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) continue;

    try {

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 15000);

      const player = createAudioPlayer();

      const resource = createAudioResource(
        fs.createReadStream(audioPath),
        { inputType: StreamType.Arbitrary }
      );

      connection.subscribe(player);

      player.play(resource);

      await new Promise(resolve => {
        player.once(AudioPlayerStatus.Idle, resolve);
      });

      connection.destroy();

      await sleep(500);

    } catch (err) {

      console.error("Voice error:", err);

    }

  }

  message.channel.send("🔔 Alert finished!");

}

module.exports = { playEventAudio };