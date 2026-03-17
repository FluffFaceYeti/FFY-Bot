const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const allowedUsers = [
  "883760946814783499",
  "118142105620054016"
];

client.on("messageCreate", async (message) => {

  if (message.content !== "!pookie") return;

  if (!allowedUsers.includes(message.author.id)) {
    return message.reply("you are not the pookie.");
  }

  const channel = message.member.voice.channel;
  if (!channel) {
    return message.reply("you must be in a voice channel.");
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  const stream = ytdl("https://www.youtube.com/watch?v=1ZX1vEDTfY4", {
    filter: "audioonly"
  });

  const player = createAudioPlayer();
  const resource = createAudioResource(stream);

  player.play(resource);
  connection.subscribe(player);

});