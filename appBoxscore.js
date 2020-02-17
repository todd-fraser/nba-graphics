const request = require('request');
const fs = require('fs');
const moment = require('moment');

// Get TODAY CONFIG
let data = fs.readFileSync('./output/today.json');
const today = JSON.parse(data);

// console.log(`INPUT JSON \n${data}`);

let hoursNow = parseInt(moment().hours());  //get time in hh format to match tip time

// console.log(`The hour is now: ${hoursNow}`);

// console.group(`today.tip: ${today.tip}`);

// console.log(`(today.tip+200)/100: ${(today.tip+200)/100}`);


if (today.playToday && (today.tip+200)/100 < hoursNow) {
    console.log(`It's at least two hours after tip, pulling boxscore`);
    getBoxscore();
} else if (today.playToday && (today.tip+200)/100 > hoursNow) {
    console.log('The game probably is not over yet');
} else if (!today.playToday) {
    console.log('They do not play today');
}




function getBoxscore() {
    let boxscoreURL = `http://data.nba.net/prod/v1/${today.date}/${today.gameId}_boxscore.json`

    console.log(`### PULLING from ${boxscoreURL} ###`)

    request(boxscoreURL, (error, response, html) => {
        if(!error && response.statusCode == 200) {
            let data = JSON.parse(html)
            let game = data.basicGameData
            let stats = data.stats

            if (game.statusNum > 1) {
                today.visitorScore = stats.vTeam.totals.points
                today.homeScore = stats.hTeam.totals.points
                today.clock = game.clock
            } else {
                console.log(`The game hasn't started`)
            }
            
            // logActivePlayers(stats);

            writeXMLHeader();

            stats.activePlayers.forEach(player => {
                writePlayerStats(player);
            });

            writeXMLFooter();

            }

            // Write CONFIG back to file
            data = JSON.stringify(today, null, 2);  //writes pretty JSON (, null, 2)
            fs.writeFile('./output/today.json', data, finished);
            function finished(err) {
                console.log(`Today JSON writen to file`);
            }
    
        });
    };


    









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




function logActivePlayers(stats){
    stats.activePlayers.forEach(player => {
        console.log(player.personId);
        console.log(`${player.firstName} ${player.lastName}`);
        console.log(player.jersey);
        console.log(player.teamId);
        console.log(`${player.points} PTS`);
        if (player.fga > 0){
            console.log(`${player.fgm}/${player.fga} FG`);
        }
        if (player.tpa > 0){
            console.log(`${player.tpm}/${player.tpa} 3PT`);
        }
        if (player.steals > 0){
            console.log(`${player.steals} STL`);
        }
        
        console.log(`\n`);
    });
}



function writeXMLHeader(){
    let XMLHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>

<fcpxml version="1.6">
    <resources>
        <format id="r1" name="FFVideoFormat720p2997" frameDuration="1001/30000s" width="1280" height="720"/>
        <effect id="r2" name="Lower Third - 2015" uid="~/Generators.localized/_TEMPLATE/NewsOK/Lower Third - 2015/Lower Third - 2015.motn" src="file:///Users/tfraser/Movies/Motion%20Templates.localized/Generators.localized/_TEMPLATE/NewsOK/Lower%20Third%20-%202015/Lower%20Third%20-%202015.motn"/>
    </resources>
    <library location="file:///Users/tfraser/Downloads/Thunder%20XML%20Template/Thunder%20XML%20automation%20template.fcpbundle/">
        <event name="${today.date}" uid="016E45C1-FDF6-42E0-9E47-${today.gameId}">
            `

    fs.writeFileSync(`./output/FCPXML/${today.date}.fcpxml`, XMLHeader, function (err) {
        if (err) throw err;
        console.log('XMLHeader written to file');
        }); 

}


function writePlayerStats(stats){

    if (stats.min != "0:00"){

        let statLine = ""
        if (stats.points > 0){
            statLine += `${stats.points} PTS`;
        }
        if (stats.totReb > 0){
            statLine += `, ${stats.totReb} REB`;
        }
        if (stats.assists > 0){
            statLine += `, ${stats.assists} AST`;
        }
        if (stats.steals > 0){
            statLine += `, ${stats.steals} STL`;
        }
        if (stats.blocks > 0){
            statLine += `, ${stats.blocks} BLK`;
        }
        if (stats.fga > 0){
            statLine += `   ${stats.fgm}/${stats.fga} FG`;
        }
        if (stats.tpa > 0){
            statLine += `  ${stats.tpm}/${stats.tpa} 3PT`;
        }

        console.log(statLine)

        let playerStats = `
                <project name="${stats.teamId}_${stats.firstName}_${stats.lastName}" uid="D08BE1A0-73F3-4CBF-9F40-${stats.personId}" modDate="2020-01-28 13:35:39 -0600">
                    <sequence duration="180180/30000s" format="r1" renderColorSpace="Rec. 709" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
                        <spine>
                            <gap name="Gap" offset="0s" duration="180180/30000s" start="107999892/30000s">
                                <video name="Lower Third - 2015" lane="1" offset="107999892/30000s" ref="r2" duration="720720/120000s" start="108108000/30000s">
                                    <param name="Position" key="9999/10223/10230/1/100/101" value="-536.154 -194"/>
                                    <param name="Text" key="9999/10223/10230/2/369" value="${stats.firstName} ${stats.lastName}"/>
                                    <param name="Position" key="9999/10223/10239/1/100/101" value="-502.25 -246"/>
                                    <param name="Text" key="9999/10223/10239/2/369" value="${statLine}"/>
                                </video>
                            </gap>
                        </spine>
                    </sequence>
                </project>
    `

        fs.appendFileSync(`./output/FCPXML/${today.date}.fcpxml`, playerStats, function (err) {
            if (err) throw err;
            console.log('Player stats written to file');
        }); 
    } else {
        console.log("Did not play")
    }


}


function writeXMLFooter(){
    let XMLFooter = `
    </event>
    </library>
    </fcpxml>`


    fs.appendFileSync(`./output/FCPXML/${today.date}.fcpxml`, XMLFooter, function (err) {
        if (err) throw err;
        console.log('XML footer written to file');
    }); 

}



function saveLocalJSON(html, type){
    fs.writeFile(`./downloadedJSON/${today.date}_${type}.json`, html, function (err) {
        if (err) throw err;
        console.log('JSON saved to file');
        console.log(`TYPE= ${type}`);
      }); 
}