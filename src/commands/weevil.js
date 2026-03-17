const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");

const permPath = path.join(__dirname, "../data/weevilPermissions.json");
const blacklistPath = path.join(__dirname, "../data/weevilBlacklist.json");

module.exports = {
name: "weevil",

async execute(message) {


// LOAD BLACKLIST
let blacklist = { blocked: {} };

try {
    blacklist = JSON.parse(fs.readFileSync(blacklistPath));
} catch {}

// CHECK IF USER IS BLOCKED
const blockedMessage = blacklist.blocked[message.author.id];

if (blockedMessage) {
    return message.reply(blockedMessage);
}

// LOAD PERMISSIONS
let perms = { users: [], roles: [] };

try {
    perms = JSON.parse(fs.readFileSync(permPath));
} catch {}

const allowedUser = perms.users.includes(message.author.id);
const allowedRole = message.member.roles.cache.some(role => perms.roles.includes(role.id));

if (!allowedUser && !allowedRole && !message.member.permissions.has("Administrator")) {
    return message.reply("🚫 You don't have permission to use this command.");
}

const targetUserId = "461842426613465089";
const trollChannelId = "1475273097996406784";

const member = message.guild.members.cache.get(targetUserId);

if (!member) {
    return message.reply("Target user not found.");
}

const voiceChannel = member.voice.channel;

if (!voiceChannel) {
    return message.reply("Target user is not in a voice channel.");
}

const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
});

const player = createAudioPlayer();

const resource = createAudioResource(
    path.join(__dirname, "../audio/weevil.wav")
);

connection.subscribe(player);
player.play(resource);

player.on(AudioPlayerStatus.Idle, () => {

    const trollChannel = message.guild.channels.cache.get(trollChannelId);

    if (trollChannel) {
        member.voice.setChannel(trollChannel);
    }

    connection.destroy();
});


}
};
