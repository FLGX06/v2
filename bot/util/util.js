class Util {
  constructor (client) {
    this.client = client;
  }

  // Simple check to see if someone is a developer or not
  isDeveloper (userID) {
    let isDev = false;
    const developers = this.client.config.ownerIDs;

    developers.forEach(devID => {
      if (devID === userID) {
        isDev = true;
      }
    });

    console.log(isDev);
    return isDev;
  }

  // Cleans output and removes sensitive information, used by eval
  async clean (text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(this.client.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  }

  // Return random integer between two given integers
  intBetween (min, max) {
    return Math.round((Math.random() * (max - min))+min);
  }


}

module.exports = Util;