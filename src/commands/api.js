const https = require("https");

const apiCommands = [
 "pirate"
];

module.exports = {

 name: "api",
 aliases: apiCommands,

 async execute(message, client, args) {

  const prefix = "!"; // change if your prefix changes

  const commandUsed = message.content
   .slice(prefix.length)
   .split(" ")[0]
   .toLowerCase();

  if (!apiCommands.includes(commandUsed)) return;

  const username = message.author.username;

  const url =
   `https://flufffaceyeti.twitch.socdesigns.com/?sender=${username}&type=${commandUsed}`;

  https.get(url, (res) => {

   let data = "";

   res.on("data", chunk => {
    data += chunk;
   });

   res.on("end", () => {
    message.channel.send(data.trim());
   });

  }).on("error", (err) => {

   console.error(err);
   message.reply("The pirate oracle is lost at sea.");

  });

 }

};