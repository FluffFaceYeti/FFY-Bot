const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "../data/eventState.json");
const channelsPath = path.join(__dirname, "../data/eventChannels.json");

module.exports = {
name: "eventstatus",


execute(message) {

    let state;
    let channelsData;

    try {
        state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
        state = { running: false };
    }

    try {
        channelsData = JSON.parse(fs.readFileSync(channelsPath, "utf8"));
    } catch {
        channelsData = { channels: [] };
    }

    const channelIds = channelsData.channels || [];

    // Convert IDs to channel names
    const channelNames = channelIds
        .map(id => message.guild.channels.cache.get(id))
        .filter(ch => ch)
        .map(ch => `• ${ch.name}`);

    const channelList = channelNames.length
        ? channelNames.join("\n")
        : "None configured";

    if (!state.running) {

        return message.reply(


`📢 **Event Status**

❌ No event is currently running

🔊 **Event Voice Channels**
${channelList}`
);


    }

    let remaining = "Manual Event";
    let nextAlert = "None";
    let endTime = "N/A";

    if (state.endTime) {

        const diff = state.endTime - Date.now();

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        remaining = `${minutes}m ${seconds}s`;

        const endDate = new Date(state.endTime);
        endTime = endDate.toLocaleTimeString();

        const totalMinutes = Math.ceil(diff / 60000);

        if (totalMinutes > 60) {
            nextAlert = `1 Hour Remaining (in ${totalMinutes - 60} minutes)`;
        }
        else if (totalMinutes > 30) {
            nextAlert = `30 Minutes Remaining (in ${totalMinutes - 30} minutes)`;
        }
        else if (totalMinutes > 5) {
            nextAlert = `5 Minutes Remaining (in ${totalMinutes - 5} minutes)`;
        }
        else {
            nextAlert = "Event Starting Soon";
        }

    }

    message.reply(


`📢 **Event Status**

✅ Event Running

⚙️ Mode: ${state.mode}
⏳ Time Remaining: ${remaining}
🕒 Event Ends: ${endTime}

🔔 Next Alert: ${nextAlert}

🔊 **Event Voice Channels**
${channelList}`
);


}


};
