const tmi = require('tmi.js');
const config = require('./config.json');

// Create a client with our options
const client = new tmi.client(config);

let runtimeCommands = new Map();

let staticCommands = new Map();
staticCommands.set('!cat', 'The Bongo Cat overlay was made by me! Download v1.0 at github.com/CoroboBred/Bongo-Cat-Crew');
staticCommands.set('!emote', 'catJAM blobDance bongoTap pepeJAM HYPERS ppJedi AYAYA');
staticCommands.set('!bot', 'Like this bot? Add it to your channel: github.com/CoroboBred/Alpokobot');

let dynamicCommands = new Map();
dynamicCommands.set("!command", function(target, args){
  client.say(target, "Supported commands: " + mapKeysToString(staticCommands) + ' ' + mapKeysToString(dynamicCommands) + ' ' + mapKeysToString(runtimeCommands));
});

let dynamicPrivilegedCommands = new Map();
dynamicPrivilegedCommands.set("!add", function(target, args){
    resp = args.slice(1).join(' ');
    runtimeCommands.set(args[0], resp);
    client.say(target, `Added new command "${args[0]}" with response "${resp}"`);
});

dynamicPrivilegedCommands.set('!custom', function(target, args){
  client.say(target, 'To add a custom commands to my channel just type "!add !<newCommand> <desired response>". You have have to be a mod for this to work.');
});
dynamicPrivilegedCommands.set("!modCommand", function(target, args){
    client.say(target, "Supported Mod Commands: " + mapKeysToString(dynamicPrivilegedCommands));
});


// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  // Ignore messages from the bot
  if (self) {
    return;
  }
  // Remove whitespace from chat message and split by spaces
  const split = msg.trim().split(" ");

  // If the command is known, execute it
  const command = split[0];
  if (split.length == 1){
    if(staticCommands.has(command)){
      client.say(target, staticCommands.get(command))
    }else if (runtimeCommands.has(command)){
      client.say(target, `${runtimeCommands.get(command)}`);
    }
  }

  if (dynamicCommands.has(command)){
    dynamicCommands.get(command)(target, split.slice(1));
  }


  if (context['badges']["broadcaster"] != '1' && context['badges']['moderator'] != '1'){
    return;
  }

  if (dynamicPrivilegedCommands.has(command)){
      dynamicPrivilegedCommands.get(command)(target, split.slice(1));
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function mapKeysToString(map){
  return Array.from(map.keys()).join(' ');
}