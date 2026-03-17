const { playEventAudio } = require("../services/eventAudio");

module.exports = {
  name: "5",

  async execute(message) {
    await playEventAudio(message, "5.wav");
  }
};