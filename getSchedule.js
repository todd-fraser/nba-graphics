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
// todaysDate = "20200131"

// todaysDate = "20190503"  // "Nuggets" in quadruple overtime example

todaysDate = "20200205"

console.log(`todays's date ${todaysDate}`)

// let feedURL = `http://data.nba.net/5s/json/cms/noseason/scoreboard/${todaysDate}/games.json`
// let feedURL = `http://data.nba.net/5s/json/cms/noseason/scoreboard/20200122/games.json`
let feedURL = `http://127.0.0.1:5500/downloadedJSON/${todaysDate}_schedule.json`

console.log(`\nPULLING from ${feedURL}`)

request(feedURL, (error, response, html) => {
    if(!error && response.statusCode == 200) {
        let data = JSON.parse(html)

        // saveLocalJSON(html, "schedule")

        const team = "Thunder"
        let game

        for (let i = 0; i <= Object.entries(data.sports_content.games.game).length-1; i++) {
          
            // add check for game status (1, 2, 3)
            // if (data.sports_content.games.game[i].visitor.nickname === "Thunder" && data.sports_content.games.game[i].period_time.game_status === "3" ) {
            
            if (data.sports_content.games.game[i].home.nickname === team || data.sports_content.games.game[i].visitor.nickname === team) {
                game = data.sports_content.games.game[i];
                console.log(`\nTHUNDER GAME TODAY`);
                console.log(`${game.visitor.nickname} vs. ${game.home.nickname}`);
                console.log(`${game.arena}`);
                console.log(`${game.city}, ${game.state}`);

                console.log(`Downloading Boxscore`);

                let boxscoreURL = `http://data.nba.net/prod/v1/${todaysDate}/${game.id}_boxscore.json`

                request(boxscoreURL, (error, response, html) => {
                    if(!error && response.statusCode == 200) {
                        let data = JSON.parse(html)
                
                        // saveLocalJSON(html, "boxscore")
                    }
                });


                // console.log(`Visitor start time: ${game.visitor_start_time}`)
            

                if (game.period_time.game_status == 1) {
                    console.log(game.period_time.period_status)
                    outputFinal = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>Document</title>
                        <link rel="stylesheet" type="text/css" href="score.css">
                        <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800&display=swap" rel="stylesheet">
                    </head>
                    <body>
                        <div class="city" id="visitorCity">
                            ${game.visitor.city}
                        </div>
                        <div class="scoreBar visitor nickname">
                            ${game.visitor.nickname}
                        </div>
                        <div class="scoreBar visitor score">
                            
                        </div>
                        <div class="city" id="homeCity">
                            ${game.home.city}
                        </div>
                        <div class="scoreBar home nickname">
                            ${game.home.nickname}
                        </div>
                        <div class="scoreBar home score">
                            
                        </div>
                        <div id="clock">
                            ${game.period_time.game_clock}
                        </div>
                        <div id="periodStatus">
                            ${game.period_time.period_status}
                        </div>
                        <div class="scoreShade" id="visitorScoreShade"></div>
                        <div class="scoreShade" id="homeScoreShade"></div>

          

                    </body>
                    </html>
                    `

                    fs.writeFile(`./output/outputFinal.html`, outputFinal, function (err) {
                        if (err) throw err;
                        console.log('HTML for future game saved to file');
                      }); 

                } else if ( game.period_time.game_status == 2 ) {
                    console.log("The Game is in progress")
                    console.log(`${game.period_time.game_clock} - ${game.period_time.period_status}`)
                } else if ( game.period_time.game_status == 3 ) {
                    // console.log(`
                    // Box Score   ${game.visitor.linescores.period[0].period_name}    ${game.visitor.linescores.period[1].period_name}    ${game.visitor.linescores.period[2].period_name}    ${game.visitor.linescores.period[3].period_name}    Final
                    // Visitor:    ${game.visitor.linescores.period[0].score}    ${game.visitor.linescores.period[1].score}    ${game.visitor.linescores.period[2].score}    ${game.visitor.linescores.period[3].score}    ${game.visitor.score}
                    // Home:       ${game.home.linescores.period[0].score}    ${game.home.linescores.period[1].score}    ${game.home.linescores.period[2].score}    ${game.home.linescores.period[3].score}    ${game.home.score}
                    // `)


                    console.log(`\n################################################\n`)
                    
                    console.log(`NUMBER OF GAMES TODAY: ${Object.entries(data.sports_content.games.game).length}\n`)
                    
                    console.log(`${game.visitor.nickname} vs. ${game.home.nickname}`)
                    const numberOfQuarters = Object.entries(data.sports_content.games.game[i].visitor.linescores.period).length
                    console.log(`NUMBER OF PERIODS IN GAME: ${numberOfQuarters}\n`)
                    
                    for (let j = 0; j < parseInt(numberOfQuarters); j++) {
                        console.log(`${game.visitor.linescores.period[j].period_name}   ${game.visitor.linescores.period[0].score}  ${game.home.linescores.period[0].score}`)
                    }


                    console.log(`\n################################################\n`)



                    outputFinal = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>Document</title>
                        <link rel="stylesheet" type="text/css" href="score.css">
                        <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800&display=swap" rel="stylesheet">
                    </head>
                    <body>
                        <div class="city" id="visitorCity">
                            ${game.visitor.city}
                        </div>
                        <div class="scoreBar visitor nickname">
                            ${game.visitor.nickname}
                        </div>
                        <div class="scoreBar visitor score">
                            ${game.visitor.score}
                        </div>
                        <div class="city" id="homeCity">
                            ${game.home.city}
                        </div>
                        <div class="scoreBar home nickname">
                            ${game.home.nickname}
                        </div>
                        <div class="scoreBar home score">
                            ${game.home.score}
                        </div>
                        <div id="clock">
                            ${game.period_time.game_clock}
                        </div>
                        <div id="periodStatus">
                            ${game.period_time.period_status} Score
                        </div>
                        <div class="scoreShade" id="visitorScoreShade"></div>
                        <div class="scoreShade" id="homeScoreShade"></div>

                        <table>
                            <tr class="boxLabelRow">
                                <td></td>
                                <td>${game.visitor.linescores.period[0].period_name}</td>
                                <td>${game.visitor.linescores.period[1].period_name}</td>
                                <td>${game.visitor.linescores.period[2].period_name}</td>
                                <td>${game.visitor.linescores.period[3].period_name}</td>
                                <td>${game.period_time.period_status}</td>
                            </tr>
                            <tr>
                                <td class="tableTeamName">${game.visitor.nickname}</td>
                                <td>${game.visitor.linescores.period[0].score}</td>
                                <td>${game.visitor.linescores.period[1].score}</td>
                                <td>${game.visitor.linescores.period[2].score}</td>
                                <td>${game.visitor.linescores.period[3].score}</td>
                                <td>${game.visitor.score}</td>
                            </tr>
                            <tr>
                                <td class="tableTeamName">${game.home.nickname}</td>
                                <td>${game.home.linescores.period[0].score}</td>
                                <td>${game.home.linescores.period[1].score}</td>
                                <td>${game.home.linescores.period[2].score}</td>
                                <td>${game.home.linescores.period[3].score}</td>
                                <td>${game.home.score}</td>
                            </tr>
                        </table>

                    </body>
                    </html>
                    `

                    // for (i = 0; i < Object.entries(game.visitor.linescores.period).length; i++) {
                    //     console.log(game.visitor.linescores.period[0].period_name)
                    // }
                    // for (i = 0; i < Object.entries(game.visitor.linescores.period).length; i++) {
                    //     console.log(game.visitor.linescores.period[0].score)
                    // }
                    // for (i = 0; i < Object.entries(game.visitor.linescores.period).length; i++) {
                    //     console.log(game.home.linescores.period[0].score)
                    // }
                 


                    fs.writeFile(`./output/outputFinal.html`, outputFinal, function (err) {
                        if (err) throw err;
                        console.log('HTML saved to file');
                      }); 

                }

                

                console.log(`\n`)
            }
            
        }









// period_time.period_value:
    // postgame "4"
    // pre-game ""
    //"period_value": "5", == Overtime periods ad 1

// period_time.period_status: 
    // prior to game = "8:00 pm ET"
    // during game = "Halftime"
    // during game = "2nd Qtr"
    // after game = "Final"
// period_time.game_status
    // pre-game "1"  
    // in-progress "2"
    // postgame "3"

// period_time.game_clock": ""   // Empty string DURING HALFTIME, before and after game
















        
    }
});





function saveLocalJSON(html, type){
    fs.writeFile(`./downloadedJSON/${todaysDate}_${type}.json`, html, function (err) {
        if (err) throw err;
        console.log('JSON saved to file');
        console.log(`TYPE= ${type}`);
      }); 
}
