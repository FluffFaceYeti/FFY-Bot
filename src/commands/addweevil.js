const fs = require("fs");
const path = require("path");

const permPath = path.join(__dirname, "../data/weevilPermissions.json");

module.exports = {
name: "addweevil",

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

if (!user && !role) {
    return message.reply("Mention a user or role.");
}

if (user) {

    if (!perms.users.includes(user.id)) {
        perms.users.push(user.id);
    }

    fs.writeFileSync(permPath, JSON.stringify(perms, null, 2));

    return message.reply(`✅ ${user.tag} can now use !weevil`);
}

if (role) {

    if (!perms.roles.includes(role.id)) {
        perms.roles.push(role.id);
    }

    fs.writeFileSync(permPath, JSON.stringify(perms, null, 2));

    return message.reply(`✅ Role **${role.name}** can now use !weevil`);
}


}
};
