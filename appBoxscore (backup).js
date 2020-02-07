const request = require('request');
const fs = require('fs');


var todaysDate = new Date().toISOString().slice(0,10).replace(/-/g,"");

// console.log(`tomorrows's date ${parseInt(todaysDate, 10) + 1}`)

// todaysDate = "20200122"
// todaysDate = "20200124"
// todaysDate = "20200125"

// todaysDate = "20200127"
// todaysDate = "20200128"
// todaysDate = "20200129"
// todaysDate = "20200130"
todaysDate = "20200131"

// todaysDate = "20190503"  // "Nuggets" in quadruple overtime example

console.log(`todays's date ${todaysDate}`)

let boxscoreURL = `http://127.0.0.1:5500/downloadedJSON/${todaysDate}_boxscore.json`

console.log(`\nPULLING from ${boxscoreURL}`)

request(boxscoreURL, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        let data = JSON.parse(html)

        let game = data.basicGameData
        console.log(`game.gameID = ${game.gameId}`)
        console.log(`game.arena.name = ${game.arena.name}`)

        let stats = data.stats
        console.log(`stats.vTeam.totals.points = ${stats.vTeam.totals.points}`)
        
        
        // console.log(`stats.vTeam.leaders = 
        //     ${stats.vTeam.leaders.points.players[0].firstName} ${stats.vTeam.leaders.points.players[0].lastName} - ${stats.vTeam.leaders.points.value} Points
        //     ${stats.vTeam.leaders.rebounds.players[0].firstName} ${stats.vTeam.leaders.rebounds.players[0].lastName} - ${stats.vTeam.leaders.rebounds.value} Rebounds
        //     ${stats.vTeam.leaders.assists.players[0].firstName} ${stats.vTeam.leaders.assists.players[0].lastName} - ${stats.vTeam.leaders.assists.value} Assists

        //     ${stats.hTeam.leaders.points.players[0].firstName} ${stats.hTeam.leaders.points.players[0].lastName} - ${stats.hTeam.leaders.points.value} Points
        //     ${stats.hTeam.leaders.rebounds.players[0].firstName} ${stats.hTeam.leaders.rebounds.players[0].lastName} - ${stats.hTeam.leaders.rebounds.value} Rebounds
        //     ${stats.hTeam.leaders.assists.players[0].firstName} ${stats.hTeam.leaders.assists.players[0].lastName} - ${stats.hTeam.leaders.assists.value} Assists

        //     `)


        console.log(`\nVISITOR LEADERS\n`);

        stats.vTeam.leaders.points.players.forEach(element => {
            console.log(`POINTS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.points.value}`);
        });
        // console.log(`\n`);
        stats.vTeam.leaders.rebounds.players.forEach(element => {
            console.log(`REBOUNDS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.rebounds.value}`);
        });
        // console.log(`\n`);
        stats.vTeam.leaders.assists.players.forEach(element => {
            console.log(`ASSISTS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.assists.value}`);
        });

        console.log(`\nHOME LEADERS\n`);

        stats.hTeam.leaders.points.players.forEach(element => {
            console.log(`POINTS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.points.value}`);
        });
        // console.log(`\n`);
        stats.hTeam.leaders.rebounds.players.forEach(element => {
            console.log(`REBOUNDS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.rebounds.value}`);
        });
        // console.log(`\n`);
        stats.hTeam.leaders.assists.players.forEach(element => {
            console.log(`ASSISTS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.assists.value}`);
        });
        console.log(`\n`);


        stats.activePlayers.forEach(element => {
            console.log(element.personId);
            console.log(`${element.firstName} ${element.lastName}`);
            console.log(element.jersey);
            console.log(element.teamId);
            console.log(element.position_full);
            console.log(`\n`)
        });
        


        const team = "Thunder"
        let boxscore

        // for (let i = 0; i <= Object.entries(data.sports_content.games.game).length-1; i++) {
          
            

                

        //         console.log(`\n`)
        //     }
            
        }
  
    });





function saveLocalJSON(html, type){
    fs.writeFile(`./downloadedJSON/${todaysDate}_${type}.json`, html, function (err) {
        if (err) throw err;
        console.log('JSON saved to file');
        console.log(`TYPE= ${type}`);
      }); 
}
