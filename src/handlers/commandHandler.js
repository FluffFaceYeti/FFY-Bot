const fs = require("fs");
const path = require("path");

module.exports = (client) => {

 const commandsPath = path.join(__dirname, "..", "commands");

 const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

 for (const file of commandFiles) {

  const command = require(`../commands/${file}`);

  client.commands.set(command.name, command);

  console.log(`Loaded command: ${command.name}`);

  // Load aliases if they exist
  if (command.aliases) {

   command.aliases.forEach(alias => {

    client.commands.set(alias, command);

    console.log(`Loaded alias: ${alias}`);

   });

  }

 }

};