const request = require('request');
const fs = require('fs');


    // JSON Contents
    // "date": "20200205",
    // "myTeam": "Thunder",
    // "playToday": true,
    // "gameId": "0021900760",
    // "isHomeTeam": true,
    // "opponent": "Cavaliers",
    // "tip": 1900,
    // "tipString": "7:00 PM"
    
// Get CONFIG
let data = fs.readFileSync('./output/today.json');
const today = JSON.parse(data);

today.visitorScore = ""
today.homeScore = ""
today.clock = ""

//set today to today
today.date = new Date().toISOString().slice(0,10).replace(/-/g,""); 

let feedURL = `http://data.nba.net/5s/json/cms/noseason/scoreboard/${today.date}/games.json`
// let feedURL = `http://127.0.0.1:5500/downloadedJSON/${today.date}_schedule.json`
let game;

console.log(`\nPULLING schedule from ${feedURL}`)

request(feedURL, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        let data = JSON.parse(html)
        console.log(`JSON downloaded from NBA`);
        // saveLocalJSON(html, "schedule")

        console.log(`looking for ${today.myTeam} games`);
        for (let i = 0; i <= Object.entries(data.sports_content.games.game).length-1; i++) {
            if (data.sports_content.games.game[i].home.nickname === today.myTeam || data.sports_content.games.game[i].visitor.nickname === today.myTeam) {
                console.log(`\n#### GAME Today for the ${today.myTeam}\n`);
                today.playToday = true;
                game = data.sports_content.games.game[i]
                today.gameId = game.id
                if (game.home.nickname === today.myTeam){
                    setHomeGame();
                } else {
                    setVisitorGame();
                }
                break;
            } else {
                today.playToday = false;
            }
        };
    }

    // Write CONFIG back to file
    data = JSON.stringify(today, null, 2);  //writes pretty JSON (, null, 2)
    fs.writeFile('./output/today.json', data, finished);
    function finished(err) {
        console.log(`Today JSON writen to file`);
    }

});





// functions

function setHomeGame() {
    today.isHomeTeam = true;
    today.home = game.home.nickname
    today.homeCity = game.home.city
    today.visitor = game.visitor.nickname
    today.visitorCity = game.visitor.city
    today.tip = parseInt(game.home_start_time)
    today.tipString = formatTipTime(game.home_start_time);

};

function setVisitorGame() {
    today.isHomeTeam = false;
    today.home = game.home.nickname
    today.homeCity = game.home.city
    today.visitor = game.visitor.nickname
    today.visitorCity = game.visitor.city
    today.tip = parseInt(game.visitor_start_time)
    today.tipString = formatTipTime(game.visitor_start_time);
};
  
function formatTipTime(input) {
    let tipHour = parseInt(input.match(/.{2}/g)[0]);
    let tipMinute = game.home_start_time.match(/.{2}/g)[1];
    let amPm
    if (tipHour > 12) {
        amPm = "PM"
    } else {
        amPm = "AM"
    }
    return `${tipHour-12}:${tipMinute} ${amPm}`
}

function saveLocalJSON(html, type){
    fs.writeFile(`./downloadedJSON/${today.date}_${type}.json`, html, function (err) {
        if (err) throw err;
        console.log('JSON saved to file');
        console.log(`TYPE= ${type}`);
      }); 
};