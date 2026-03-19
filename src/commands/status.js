const fs = require("fs");
const path = require("path");

module.exports = {

 name: "status",

 async execute(message, client, args) {

  const allowedUsers = [
   "118142105620054016"
  ];

  if (!allowedUsers.includes(message.author.id)) return;

  if (!args.length) {
   return message.reply("Usage: !status <text>");
  }

  const statusText = args.join(" ");

  try {

   client.user.setPresence({
    activities: [{
     name: statusText,
     type: 0
    }],
    status: "online"
   });

   const file = path.join(__dirname, "..", "data", "status.json");

   fs.writeFileSync(file, JSON.stringify({
    text: statusText
   }, null, 2));

   console.log("Status updated to:", statusText);

   message.react("✅");

  } catch (err) {

   console.error(err);
   message.reply("Failed to update status.");

  }

 }

};