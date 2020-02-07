const request = require('request');
const fs = require('fs');

// Get CONFIG
let data = fs.readFileSync('./output/today.json');
const today = JSON.parse(data);

console.log(today);

let boxscoreURL = `http://data.nba.net/prod/v1/${today.date}/${today.gameId}_boxscore.json`

console.log(`\nPULLING from ${boxscoreURL}`)

request(boxscoreURL, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        let data = JSON.parse(html)
        let game = data.basicGameData
        let stats = data.stats

        if (game.statusNum > 1) {
            today.visitorScore = stats.vTeam.totals.points
            today.homeScore = stats.hTeam.totals.points
            today.clock = game.clock
        }
        
        
        
        
        

            
        }

        // Write CONFIG back to file
        data = JSON.stringify(today, null, 2);  //writes pretty JSON (, null, 2)
        fs.writeFile('./output/today.json', data, finished);
        function finished(err) {
            console.log(`Today JSON writen to file`);
        }
  
    });





function saveLocalJSON(html, type){
    fs.writeFile(`./downloadedJSON/${todaysDate}_${type}.json`, html, function (err) {
        if (err) throw err;
        console.log('JSON saved to file');
        console.log(`TYPE= ${type}`);
      }); 
}





// ###### stats and leaders


        // console.log(`stats.vTeam.leaders = 
        //     ${stats.vTeam.leaders.points.players[0].firstName} ${stats.vTeam.leaders.points.players[0].lastName} - ${stats.vTeam.leaders.points.value} Points
        //     ${stats.vTeam.leaders.rebounds.players[0].firstName} ${stats.vTeam.leaders.rebounds.players[0].lastName} - ${stats.vTeam.leaders.rebounds.value} Rebounds
        //     ${stats.vTeam.leaders.assists.players[0].firstName} ${stats.vTeam.leaders.assists.players[0].lastName} - ${stats.vTeam.leaders.assists.value} Assists

        //     ${stats.hTeam.leaders.points.players[0].firstName} ${stats.hTeam.leaders.points.players[0].lastName} - ${stats.hTeam.leaders.points.value} Points
        //     ${stats.hTeam.leaders.rebounds.players[0].firstName} ${stats.hTeam.leaders.rebounds.players[0].lastName} - ${stats.hTeam.leaders.rebounds.value} Rebounds
        //     ${stats.hTeam.leaders.assists.players[0].firstName} ${stats.hTeam.leaders.assists.players[0].lastName} - ${stats.hTeam.leaders.assists.value} Assists

        //     `)


        // console.log(`\nVISITOR LEADERS\n`);

        // stats.vTeam.leaders.points.players.forEach(element => {
        //     console.log(`POINTS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.points.value}`);
        // });
        // // console.log(`\n`);
        // stats.vTeam.leaders.rebounds.players.forEach(element => {
        //     console.log(`REBOUNDS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.rebounds.value}`);
        // });
        // // console.log(`\n`);
        // stats.vTeam.leaders.assists.players.forEach(element => {
        //     console.log(`ASSISTS: ${element.firstName} ${element.lastName} - ${stats.vTeam.leaders.assists.value}`);
        // });

        // console.log(`\nHOME LEADERS\n`);

        // stats.hTeam.leaders.points.players.forEach(element => {
        //     console.log(`POINTS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.points.value}`);
        // });
        // // console.log(`\n`);
        // stats.hTeam.leaders.rebounds.players.forEach(element => {
        //     console.log(`REBOUNDS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.rebounds.value}`);
        // });
        // // console.log(`\n`);
        // stats.hTeam.leaders.assists.players.forEach(element => {
        //     console.log(`ASSISTS: ${element.firstName} ${element.lastName} - ${stats.hTeam.leaders.assists.value}`);
        // });
        // console.log(`\n`);


        // stats.activePlayers.forEach(element => {
        //     console.log(element.personId);
        //     console.log(`${element.firstName} ${element.lastName}`);
        //     console.log(element.jersey);
        //     console.log(element.teamId);
        //     console.log(element.position_full);
        //     console.log(`\n`)
        // });