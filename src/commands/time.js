const { playEventAudio } = require("../services/eventAudio");

module.exports = {
  name: "time",

  async execute(message) {
    await playEventAudio(message, "time.wav");
  }
};