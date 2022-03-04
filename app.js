const fs = require('fs');
const soundboardFiles = './soundfiles/';
const Discord = require('discord.js');
const voiceDiscord = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { joinVoiceChannel } = require('@discordjs/voice');
const client = new Discord.Client({ intents: 641 });
const express = require('express');
const app = express();
const port = 8585;

const entranceSoundFile = "entranceSound.json";
const entranceVolume = 50;
let voiceUsers = [];

//Loads the handlebars module
const handlebars = require('express-handlebars');
//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

//Sets handlebars configurations
app.engine('hbs', handlebars({
layoutsDir: __dirname + '/views/layouts',
extname: 'hbs',
defaultLayout: 'index',
// partialsDir: __dirname + '/views/partials/'
}));

app.use(express.static('public'))

app.get('/', (req, res) => {
//Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
res.render('main', {layout: 'index', files: fileList(), users: userList() });
});


app.get('/play', (req, res) => {
    playFile(req.query.file, req.query.user, req.query.volume);
    res.render('main', {layout: 'index', files: fileList(), users: userList() });
});

app.get('/stop', (req, res) => {
    stopAudio();
    res.render('main', {layout: 'index', files: fileList(), users: userList() });
});

app.listen(port, () => console.log(`App listening to port ${port}`));

// startup
client.login(``);
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
    userList();
});

// user joins or changes channel
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channelId != null) {
        fs.readFile(entranceSoundFile, 'utf8', (err, data) => {
            var tree = JSON.parse(data);
            for (const [key, value] of Object.entries(tree)) {
                if (newState.id == key) {
                    entranceSound(value, newState.channel);
                }
              }
        });  
    }
});

// messaging

// client.on('message', async msg => {
//     if (msg.author.bot) return;
//     if (msg.content.startsWith('$')) {
//         const param = msg.content.split(' ');
//         let adminCommand = param[0].substr('$'.length);
//         let command  = param[1];
//         if (adminCommand == 'addcommand') {
//             const message = param.slice(2,param.length).join(' ');
//             fs.readFile('commands.json', 'utf8', (err, data) => {
//                 var contents = JSON.parse(data);
//                 if (contents.hasOwnProperty(command)) {
//                     msg.channel.send(`\`${command}\` already exists. use \`$delcommand ${command}\` to delete the old command first.`);
//                 }
//                 else {
//                     contents[command] = message;
//                     fs.writeFileSync('commands.json', JSON.stringify(contents));
//                     msg.channel.send(`\`${command}\` added.`);
//                 }
//             });
//         }
//         else if (adminCommand == 'delcommand') {
//             fs.readFile('commands.json', 'utf8', (err, data) => {
//                 var contents = JSON.parse(data);
//                 if (contents.hasOwnProperty(command)) {
//                     delete contents[command];
//                     fs.writeFileSync('commands.json', JSON.stringify(contents));
//                     msg.channel.send(`\`${command}\` deleted.`);
//                 }
//                 else {
//                     msg.channel.send(`\`${command}\` does not exist.`);
//                 }
//             });
//         }
//     }
// });

function userList() {
    voiceUsers = [];
    client.guilds.cache.forEach(guild => {
        // console.log(`Voice users in ${guild.name}:`)
        guild.voiceStates.cache.forEach(voiceState => {
            if(voiceState.channel){
                // console.log(voiceState.member);
                voiceUsers.push(voiceState.member);
                // console.log(voiceUsers);
            }
        });
    });
    return voiceUsers;
}

function entranceSound(fileName, channel) {
    const player = voiceDiscord.createAudioPlayer();
    let resource = createAudioResource('./soundfiles/'+fileName);
    resource = createAudioResource('./soundfiles/'+fileName, { inlineVolume: true });
    resource.volume.setVolume(entranceVolume/100);
    const connection = joinVoiceChannel({
        selfDeaf: false,
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    player.play(resource);
    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        player.play(getNextResource());
    });
    connection.subscribe(player);
}

function playFile(fileName, userName, volume) {
    user = voiceUsers[userName];
    // console.log("username = " + user);
    const channel = user.voice.channel;
    const player = voiceDiscord.createAudioPlayer();
    let resource = createAudioResource('./soundfiles/'+fileName);
    resource = createAudioResource('./soundfiles/'+fileName, { inlineVolume: true });
    resource.volume.setVolume(volume/100);

    const connection = joinVoiceChannel({
        selfDeaf: false,
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    player.play(resource);
    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        player.play(getNextResource());
    });
    connection.subscribe(player);
}

function stopAudio() {
    player.stop();
}

function fileList() {
    let list = [];
    fs.readdir(soundboardFiles, (err, files) => {
        files.forEach(file => {
            list.push(file);
        });
    })
    return list;
}
