const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "../data/eventState.json");

let timers = [];

module.exports = {
name: "startevent",


async execute(message, client, args) {

    const minutes = parseInt(args[0]);

    let state = {
        running: false,
        mode: null,
        endTime: null
    };

    try {
        state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {}

    if (state.running) {
        return message.reply("⚠️ An event is already running.");
    }

    if (!minutes) {

        state.running = true;
        state.mode = "manual";

        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return message.reply("✅ Event started in manual mode.");

    }

    const ms = minutes * 60000;

    state.running = true;
    state.mode = "automatic";
    state.endTime = Date.now() + ms;

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    message.reply(`⏳ Event timer started: ${minutes} minutes`);

    // GO immediately
    const goCmd = client.commands.get("go");
    if (goCmd) goCmd.execute(message, client, []);

    // 1 HOUR remaining
    if (minutes >= 60) {

        timers.push(setTimeout(() => {

            const cmd = client.commands.get("hour");
            if (cmd) cmd.execute(message, client, []);

        }, (minutes - 60) * 60000));

    }

    // 30 minutes remaining
    if (minutes >= 30) {

        timers.push(setTimeout(() => {

            const cmd = client.commands.get("30");
            if (cmd) cmd.execute(message, client, []);

        }, (minutes - 30) * 60000));

    }

    // 5 minutes remaining
    if (minutes >= 5) {

        timers.push(setTimeout(() => {

            const cmd = client.commands.get("5");
            if (cmd) cmd.execute(message, client, []);

        }, (minutes - 5) * 60000));

    }

    // FINAL TIME
    timers.push(setTimeout(() => {

        const cmd = client.commands.get("time");
        if (cmd) cmd.execute(message, client, []);

        state.running = false;
        state.mode = null;
        state.endTime = null;

        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    }, ms));

}

};

module.exports.timers = timers;
