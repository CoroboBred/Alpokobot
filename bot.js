const tmi = require('tmi.js');
const config = require('./config.json');
const channelName = config['channels'][0];
// Create a client with our options
const client = new tmi.client(config);

let runtimeCommands = new Map();

let staticCommands = require('./commands.json');

let restarts = new Map();
let headpats = new Map();
let dynamicCommands = new Map();
dynamicCommands.set("!command", function(context, target, args){
  client.say(target, JSONKeysToString(staticCommands) + ' ' + mapKeysToString(dynamicCommands) + ' ' + mapKeysToString(runtimeCommands));
});

dynamicCommands.set("!headpat", function(context, target, args){
  let name = context['display-name'];
  let pats = 1;
  let key = `${name}+${args[0]}`;
  if(headpats.has(key)){
    pats++;
  }
  headpats.set(key, pats);
  client.say(target, `${name} has headpated ${args[0]}!!! They headpated ${args[0]} ${pats} times!!!!!`);
});

dynamicCommands.set("!restart", function(context, target, args){
  if(restarts.has(channelName)){
    let restartCount = restarts.get(channelName);
    client.say(target, `${channelName} has restarted ${restartCount} times. Sadge`)
  } else{
    client.say(target, `${channelName} hasn't restarted yet! POGGERS`);
  }
});

let dynamicPrivilegedCommands = new Map();

dynamicPrivilegedCommands.set("!addrestart", function(target, args){
  let restartCount = 0;
  if (restarts.has(channelName)){
    restartCount = restarts.get(channelName);
  }
  restartCount++;
  restarts.set(channelName, restartCount);
  client.say(target, `${channelName} has restarted ${restartCount} times. Sadge`);
});

dynamicPrivilegedCommands.set("!add", function(target, args){
    resp = args.slice(1).join(' ');
    runtimeCommands.set(args[0], resp);
    client.say(target, `Added new command "${args[0]}" with response "${resp}"`);
});


dynamicPrivilegedCommands.set("!delete", function(target, args){
    if(!runtimeCommands.has(args[0])){
      client.say(target, `Cannot delete "${args[0]}" command. It does not exist`);
      return;
    }
    runtimeCommands.delete(args[0]);
    client.say(target, `Deleted command "${args[0]}"`);
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
    dynamicCommands.get(command)(context, target, split.slice(1));
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