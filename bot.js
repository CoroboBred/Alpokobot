const tmi = require('tmi.js');
const config = require('./config.json');

// Create a client with our options
const client = new tmi.client(config);

let runtimeCommands = new Map();

let staticCommands = require('./commands.json');

let dynamicCommands = new Map();
dynamicCommands.set("!command", function(target, args){
  client.say(target, JSONKeysToString(staticCommands) + ' ' + mapKeysToString(dynamicCommands) + ' ' + mapKeysToString(runtimeCommands));
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
dynamicPrivilegedCommands.set("!modcommand", function(target, args){
    client.say(target, mapKeysToString(dynamicPrivilegedCommands));
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

  let command = split[0].toLowerCase();
  // Remove pluralization.
  if (command.charAt(command.length -1) == 's'){
    command = command.substring(0, command.length -1);
  }
  // If the command is known, execute it
  if (split.length == 1){
    if(staticCommands.hasOwnProperty(command)){
      client.say(target, staticCommands[command]);
    }else if (runtimeCommands.has(command)){
      client.say(target, `${runtimeCommands.get(command)}`);
    }
  }

  if (dynamicCommands.has(command)){
    dynamicCommands.get(command)(target, split.slice(1));
  }

  if (context['badges'] == null || (context['badges']["broadcaster"] != '1' && context['badges']['moderator'] != '1')){
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

function JSONKeysToString(obj){
  return Object.keys(obj).join(' ');
}

function mapKeysToString(map){
  return Array.from(map.keys()).join(' ');
}