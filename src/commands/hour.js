const { playEventAudio } = require("../services/eventAudio");

module.exports = {
  name: "hour",

  async execute(message) {
    await playEventAudio(message, "hour.wav");
  }
};