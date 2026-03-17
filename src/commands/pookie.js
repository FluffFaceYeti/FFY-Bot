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
    return message.reply("Join a voice channel first.");
}

const audioPath = path.join(__dirname, "../audio/pookie.mp3");

if (!fs.existsSync(audioPath)) {
    return message.reply("Pookie audio file missing.");
}

// send message and store it
const statusMessage = await message.channel.send("💖 POOKIE TIME 💖");

const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
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

player.once(AudioPlayerStatus.Idle, async () => {
    connection.destroy();

    // delete the message when finished
    try {
        await statusMessage.delete();
    } catch (err) {
        console.error("Failed to delete message:", err);
    }
});

}
};