const fs = require("fs");
const path = require("path");

const birthdayPath = path.join(__dirname, "../../userdata/birthdays.json");
const configPath = path.join(__dirname, "../../userdata/birthdayChannels.json");

let announcedToday = new Set();

function checkBirthdays(client) {

    if (!fs.existsSync(birthdayPath)) return;

    let birthdays = {};
    let channelConfig = {};

    try {
        birthdays = JSON.parse(fs.readFileSync(birthdayPath));
    } catch {}

    try {
        if (fs.existsSync(configPath)) {
            channelConfig = JSON.parse(fs.readFileSync(configPath));
        }
    } catch {}

    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;

    // 🔥 LOOP THROUGH USERS
    for (const [userId, data] of Object.entries(birthdays)) {

        if (data.day === todayDay && data.month === todayMonth) {

            const key = `${userId}-${todayDay}-${todayMonth}`;
            if (announcedToday.has(key)) continue;

            announcedToday.add(key);

            // 🔥 SEND TO EACH GUILD THAT HAS A CHANNEL SET
            for (const guild of client.guilds.cache.values()) {

                const channelId = channelConfig[guild.id];
                if (!channelId) continue;

                const channel = guild.channels.cache.get(channelId);
                if (!channel) continue;

                channel.send(
`🏴‍☠️ Ahoy <@${userId}>!

🎉 Ye be celebratin' another voyage 'round the sun!

Raise the grog, sound the cannons, and let the seas roar! 🌊💥

All hands at **FluffFaceYeti** wish ye a legendary birthday! ⚓🍻`
                );
            }
        }
    }
}

module.exports = { checkBirthdays };