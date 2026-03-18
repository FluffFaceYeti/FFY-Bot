const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  StreamType
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");

module.exports = {
  name: "play",

  async execute(message, args) {

    const query = args.join(" ");
    if (!query) return message.reply("Give me a YouTube link!");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Join a voice channel first!");

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 15000);

    const player = createAudioPlayer();

    const stream = ytdl(query, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary
    });

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on("error", err => {
      console.error(err);
      message.reply("Error playing audio.");
    });

  }
};