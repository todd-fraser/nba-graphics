const request = require('request');
const fs = require('fs');

    // JSON Contents Example
    // "myTeam": "Thunder",
    // "gameProcessed": false,
    // "date": 20200213,
    // "playToday": true,
    // "gameId": "0021900819",
    // "isHomeTeam": false,
    // "home": "Pelicans",
    // "homeCity": "New Orleans",
    // "visitor": "Thunder",
    // "visitorCity": "Oklahoma City",
    // "tip": 1400,
    // "tipString": "7:00 PM"
    
// Get CONFIG
let data = fs.readFileSync('./output/config.json');
const config = JSON.parse(data);
const today = {}

today.myTeam = config.myTeam
today.gameProcessed = false


//set today to today
today.date = new Date().toISOString().slice(0,10).replace(/-/g,""); 
// today.date = 20200213 //DEV override the date

let feedURL = `http://data.nba.net/5s/json/cms/noseason/scoreboard/${today.date}/games.json`
// let feedURL = `http://127.0.0.1:5500/downloadedJSON/${today.date}_schedule.json`
let game;

console.log(`\nPULLING schedule from ${feedURL}`)

request(feedURL, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        let data = JSON.parse(html)
        console.log(`JSON downloaded from NBA`);
        // saveLocalJSON(html, "schedule")
        console.log(`${Object.entries(data.sports_content.games.game).length} games today`)

        // Check if ANY games are being played today
        if ( Object.entries(data.sports_content.games.game).length > 0 ){  
            console.log(`looking for ${today.myTeam} games`);
            // Loop through games being played today
            for (let i = 0; i <= Object.entries(data.sports_content.games.game).length-1; i++) {  //
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
                    console.log(`Game checked, not the ${config.myTeam}`)
                    today.playToday = false;
                }
            };

        } else {
            console.log(`No games today`)
            today.playToday = false
        }        
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