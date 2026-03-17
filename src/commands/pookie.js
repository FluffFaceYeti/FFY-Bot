const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");
const prism = require("prism-media");

const allowedUsers = [
  "883760946814783499",
  "118142105620054016"
];

module.exports = {
name: "pookie",

async execute(message) {

if (!allowedUsers.includes(message.author.id)) {
    return message.reply("you are not the pookie.");
}

const voiceChannel = message.member.voice.channel;

if (!voiceChannel) {
    return message.reply("You must be in a voice channel.");
}

const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
});

const player = createAudioPlayer();

const stream = ytdl("https://www.youtube.com/watch?v=1ZX1vEDTfY4", {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25
});

const ffmpeg = new prism.FFmpeg({
    args: [
        "-analyzeduration", "0",
        "-loglevel", "0",
        "-f", "s16le",
        "-ar", "48000",
        "-ac", "2"
    ]
});

const resource = createAudioResource(stream.pipe(ffmpeg), {
    inputType: StreamType.Raw
});

connection.subscribe(player);
player.play(resource);

player.on("error", error => {
    console.error("Audio error:", error);
});

player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
});

}
};