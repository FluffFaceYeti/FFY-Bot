const fs = require("fs");
const path = require("path");

const permPath = path.join(__dirname, "../data/weevilPermissions.json");

module.exports = {
name: "removeweevil",

execute(message) {


if (!message.member.permissions.has("Administrator")) {
    return message.reply("🚫 Only admins can modify Weevil permissions.");
}

let perms = { users: [], roles: [] };

try {
    perms = JSON.parse(fs.readFileSync(permPath));
} catch {}

const user = message.mentions.users.first();
const role = message.mentions.roles.first();

if (user) {
    perms.users = perms.users.filter(id => id !== user.id);
    fs.writeFileSync(permPath, JSON.stringify(perms, null, 2));
    return message.reply(`❌ ${user.tag} removed from Weevil permissions.`);
}

if (role) {
    perms.roles = perms.roles.filter(id => id !== role.id);
    fs.writeFileSync(permPath, JSON.stringify(perms, null, 2));
    return message.reply(`❌ Role **${role.name}** removed from Weevil permissions.`);
}

message.reply("Mention a user or role to remove.");


}
};
