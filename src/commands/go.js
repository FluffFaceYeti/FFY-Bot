const { playEventAudio } = require("../services/eventAudio");

module.exports = {
  name: "go",

  async execute(message) {
    await playEventAudio(message, "go.wav");
  }
};