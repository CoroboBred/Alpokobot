const tmi = require('tmi.js');
const config = require('./config.json');

// Create a client with our options
const client = new tmi.client(config);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
  if (commandName == "ab"){console.log(commandName);}

  // If the command is known, execute it
  if (commandName === '!command' || commandName === "!commands") {
    client.say(target, `Supported commands: !cat !emote`);
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === "!cat" || commandName === "!cats") {
    client.say(target, "The Bongo Cat overlay was made by me! It's still a WIP but you can learn about my custom made bongo cat crew at github.com/CoroboBred/Bongo-Cat-Crew")
  } else if (commandName == "!emote" || commandName === "!emotes"){
      client.say( target, "catJAM blobDance bongoTap pepeJAM HYPERS ppJedi AYAYA")
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}