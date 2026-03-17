module.exports = {
name: "commands",

execute(message, client) {

    const commandList = [];

    client.commands.forEach(cmd => {
        commandList.push(`• ${cmd.name}`);
    });

    message.reply(


`📜 **Available Commands**

${commandList.join("\n")}

Use your server prefix before each command.`
);

}

};
