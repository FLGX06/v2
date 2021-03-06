// Check that the runtime is up to date
if (Number(process.version.slice(1).split(".")[0]) < 12) {
  console.error(`Node v12.0.0 or higher is required. You have Node ${process.version}. Please update Node on your system.`);
  process.exit(1);
}

// Load up the discord.js library
const { Collection, Client } = require("discord.js");
const sentry = require("@sentry/node");

// Our custom client, extends the standard Discord client with things we will need.
class Custom extends Client {
  constructor (options) {
    super(options);

    this.config = require("../config.json");
    this.dev = true;
    if (this.config.devmode === false) {
      this.dev = false;
      //sentry.init({ dsn: this.config.keys.sentry });
    }

    this.path = __dirname;
    this.logger = require("./util/logger");
    this.util = new (require("./util/util"))(this);
    this.messageUtil = new (require("./util/messageUtil"))(this);
    this.db = new (require("./util/redis"))(this)
  
    // Create collections to store loaded commands and aliases in
    this.commands = new Collection();
    this.aliases = new Collection();

    const handlers = require("./util/handlers");
    this.commandHandler = new handlers.CommandHandler(this);
    this.eventHandler = new handlers.EventHandler(this);

    // Basically just an async shortcut to using a setTimeout. Nothing fancy!
    this.wait = require("util").promisify(setTimeout);
  }
}

// Initialization function, so we can use async/await
const init = async () => {
  // Initialize client
  const client = new Custom();

  // Load all commands/events
  await client.commandHandler.loadAll();
  await client.eventHandler.loadAll();

  // Connect to Redis database
  await client.db.init();
  client.logger.info("Connected to Redis.")

  if (client.dev === true) {
    client.logger.warn("Development mode is on. Some features (such as Sentry) are disabled.");
    client.login(client.config.devtoken);
  } else {
    client.login(client.config.token);
  }
}

init();

// Catch exceptions/rejections and give more details on the stack trace
process.on("uncaughtException", (err) => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./")
	console.error("Uncaught Exception: ", errorMsg)
	process.exit(1)
});

process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: ", err)
});

