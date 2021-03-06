#!/usr/bin/env node

const fs = require("fs");
const fetch = require("node-fetch");
const sget = require("sget");
const lastfmAPI = "e3d3ffd59eb8600eaf8d8e477f8aacaf";
const getFirstCommit = require('get-first-commit');
const moment = require('moment');

let command = process.argv[2];
if (command === "-h") {
    console.log("Codusic Help; \n");
} else if (command === "init" || command === "") {
    init();
} else {
    console.log(" ! Unknown Command is given for codusic");
}

function init() {
    let username = sget('Your Lasfm account username: ');
    let period = sget('How long have you been working on this project: [overall | 7day | 1month | 3month | 6month | 12month]');

    if (username && period) {
        username = username.replace("\n", "");
        period = period.replace("\n", "");
        if (['overall', '7day', '1month', '3month', '6month', '12month'].includes(period)) {
            console.log(" - Your codusic is now initilized, your top track file is generating...");
            create(username, period);
        } else if ('fc' === period || 'first commit' === period) {
            getPeriodByFirstGitCommit();
        } else {
            console.log(" ! Entered time period is not a valid one, please choose by given.");
            init();
        }
    } else {
        console.log(" ! Do not leave empty label, Try again;");
        init();
    }
}

function getPeriodByFirstGitCommit() {
    return getFirstCommit(function(err, commit) {
            if (err) return console.log(err);
            console.log(getMonthsSinceInitByCommitDate(commit.date).asMonths());
        });
}

function getClosestPeriodRounded(numberofMonths) {

    let period = "overall";
    let roundedNumberOfMonths = Math.round(parseFloat(numberofMonths));

    if (parnumberofMonths < 1) {
        return "7day";
    }

    if (parnumberofMonths > 12) {
        return "12month";
    }

    return

}

function getMonthsSinceInitByCommitDate(date) {
    return moment.duration(moment(date, 'ddd MMM D HH:mm:ss YYYY').diff(moment(moment.now())));
}

function create(username, period) {
    const limit = 10;
    let url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${lastfmAPI}&format=json&period=${period}&limit=${limit}`;

    fetch(url).then(function (res) {
        return res.json();
    }).then(function (json) {
        let stringToSave = "#Top Tracks Listened While Coding This Project \n";
        json.toptracks.track.forEach(t => {
            stringToSave += " - " + t.name + " by **" + t.artist.name + "**\n";
        });
        stringToSave += "\n\n Created by using [Codusic](https://github.com/btk/codusic)";
        saveFile(stringToSave);
    });
}

function saveFile(str) {
    fs.writeFile('codusic.md', str, function (err) {
        if (err) {
            console.log(" ! Error while trying to create/change file codusic.md, make sure you have the rights to change it.");
            return err;
        }
        console.log(' - Your music List is saved in ./codusic.md');
    });
    addToReadme();
}

function addToReadme() {
    fs.readFile('./README.md', 'utf8', function (err, data) {
        if (err) {
            console.log(" ! Error while trying to read README.md");
            return err;
        }
        if (!data.includes("codusic.md")) {
            fs.appendFile('./README.md', '\n\n[Top Tracks Listened While Coding This Project - Codusic](codusic.md)', (err) => {
                if (err) {
                    console.log(" ! Error while trying to add link to README.md");
                    return err;
                }
            });
            console.log(" - Your readme file now has a link to codusic.md file.");
        } else {
            console.log(" - Your readme file already has a link to codusic.md file.");
        }
    });
}
