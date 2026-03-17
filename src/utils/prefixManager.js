const fs = require("fs");
const path = require("path");

const prefixPath = path.join(__dirname, "../data/prefixes.json");

function getPrefixes() {
    if (!fs.existsSync(prefixPath)) {
        fs.writeFileSync(prefixPath, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(prefixPath));
}

function getPrefix(guildId) {
    const prefixes = getPrefixes();
    return prefixes[guildId] || "!";
}

function setPrefix(guildId, prefix) {
    const prefixes = getPrefixes();
    prefixes[guildId] = prefix;

    fs.writeFileSync(prefixPath, JSON.stringify(prefixes, null, 2));
}

module.exports = {
    getPrefix,
    setPrefix
};