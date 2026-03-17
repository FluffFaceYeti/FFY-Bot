const { playEventAudio } = require("../services/eventAudio");

module.exports = {
  name: "pookie",

  async execute(message) {
    await playEventAudio(message, "pookie.mp3");
  }
};