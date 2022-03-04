const express = require('express');
const app = express();
const port = 8585;
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

const fs = require('fs');
const soundboardFiles = './soundfiles/';
const Discord = require('discord.js');
const voiceDiscord = require('@discordjs/voice');
const { joinVoiceChannel } = require('@discordjs/voice');
// require('dotenv').config();
const client = new Discord.Client({ intents: 641 });

// client.commands = new Discord.Collection();
// client.aliases = new Discord.Collection();

client.login(`ODgzMTYwNzk4Njc4MTE4NDMw.YTF5lg.4kRRAKKC9Mgj7Eb75FT9IENsFO4`);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
    userList();
});

let voiceUsers = [];

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

// function playFile(fileName, userName) {
//     user = voiceUsers[userName];
//     const channel = user.voice.channel;
//     const player = voiceDiscord.createAudioPlayer();
//     resource = voiceDiscord.createAudioResource('./files/'+fileName), { inlineVolume: true };

//     const connection = joinVoiceChannel({
//         channelId: channel.id,
//         guildId: channel.guild.id,
//         adapterCreator: channel.guild.voiceAdapterCreator,
//     });
//     player.play(resource);
//     connection.subscribe(player);
// }

// const { createReadStream } = require('fs');
// const { join } = require('path');
const { createAudioResource } = require('@discordjs/voice');

function playFile(fileName, userName, volume) {
    user = voiceUsers[userName];
    const channel = user.voice.channel;
    const player = voiceDiscord.createAudioPlayer();
    let resource = createAudioResource('./soundfiles/'+fileName);
    resource = createAudioResource('./soundfiles/'+fileName, { inlineVolume: true });
    resource.volume.setVolume(volume/100);

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    player.play(resource);
    connection.subscribe(player);
}

function stopAudio() {
    player.stop();
}

function fileList() {
    let list = [];
    fs.readdir(soundboardFiles, (err, files) => {
    files.forEach(file => {
        // list.push(file.split('.').slice(0, -1).join('.'));
        list.push(file);
        // console.log(file);
    });
    })
    return list;
}
