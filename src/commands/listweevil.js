const fs = require("fs");
const path = require("path");

const permPath = path.join(__dirname, "../data/weevilPermissions.json");

module.exports = {
name: "listweevil",

execute(message) {


let perms = { users: [], roles: [] };

try {
    perms = JSON.parse(fs.readFileSync(permPath));
} catch {}

const users = perms.users.map(id => `<@${id}>`).join("\n") || "None";
const roles = perms.roles.map(id => `<@&${id}>`).join("\n") || "None";

message.reply(


`🐛 **Weevil Permissions**

Users:
${users}

Roles:
${roles}`
);

}
};
