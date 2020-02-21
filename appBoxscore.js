const request = require("request");
const fs = require("fs");
// const moment = require('moment');
const nodemailer = require("nodemailer");

require("dotenv").config();

// Get TODAY JSON
let gameData = fs.readFileSync("./output/today.json");
const today = JSON.parse(gameData);
let configData = fs.readFileSync("./output/config.json");
const config = JSON.parse(configData);

let myTeamRecord;

// console.log(`INPUT JSON \n${data}`);

//  ### removed moment dependency
// let hoursNow = parseInt(moment().hours());  //get time in hh format to match tip time

// ### native solution to get hours
let date = new Date(); //Get current time
let hoursNow = date.getHours(); //Get current hour - returns two digit hour
// hoursNow = 20  //dev override

console.log(`hoursNow: `);
console.log(hoursNow);
console.log(`(today.tip+200)/100: `);
console.log((today.tip + 200) / 100);

if (
  today.playToday &&
  (today.tip + 200) / 100 <= hoursNow &&
  today.gameProcessed != true
) {
  console.log(`It's at least two hours after tip, pulling boxscore`);
  getBoxscore();
} else if (today.playToday && (today.tip + 200) / 100 > hoursNow) {
  console.log(
    `### ${today.myTeam} GAME TODAY, boxscore not pulled until Tip + 2 Hours`
  );
} else if (!today.playToday) {
  // console.log(`### ${today.myTeam} do not play today`);
}

function getBoxscore() {
  let boxscoreURL = `http://data.nba.net/prod/v1/${today.date}/${today.gameId}_boxscore.json`;

  console.log(`### PULLING from ${boxscoreURL} ###`);

  request(boxscoreURL, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      let data = JSON.parse(html);
      let game = data.basicGameData;
      let stats = data.stats;

      if (game.statusNum > 1) {
        today.visitorScore = stats.vTeam.totals.points;
        today.homeScore = stats.hTeam.totals.points;
        today.clock = game.clock;
      } else {
        console.log(`The game hasn't started`);
      }

      // logActivePlayers(stats);

      writeXMLHeader();
      buildMyTeamRecord(game);
      writeAnalysisXML(game);
      writePlayerStats(stats);
      writeXMLFooter();
    }

    // Write CONFIG back to file
    today.gameProcessed = true;
    data = JSON.stringify(today, null, 2); //writes pretty JSON (, null, 2)
    fs.writeFile("./output/today.json", data, finished);

    async function mailer() {
      let xmlPath = `./output/FCPXML/${today.date}.fcpxml`;
      let attachmentName = `${today.visitor}_(${today.visitorScore})_at_${today.home}_(${today.homeScore})`;
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"HubBot" <ghweathergraphics@gmail.com', // sender address
        // to: "tfraser@oklahoman.com", // list of receivers
        to: config.users, // list of receivers
        subject: process.env.SUBJECT, // Subject line
        text: "FCP Graphics for tonight's Game", // plain text body
        html: "<div><b>FCP Graphics for tonight's Game</b></div>", // html body
        attachments: [
          {
            filename: "FCPXML.fcpxml",
            path: xmlPath
          }
        ]
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    }

    mailer().catch(console.error);

    function finished(err) {
      console.log(`Today JSON writen to file`);
    }
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

function buildMyTeamRecord(game) {
  if (config.myTeam === today.home) {
    myTeamRecord = `${game.hTeam.triCode} ${game.hTeam.win}-${game.hTeam.loss}`;
    console.log(myTeamRecord);
  } else if (config.myTeam === today.visitor) {
    myTeamRecord = `${game.vTeam.triCode} ${game.vTeam.win}-${game.vTeam.loss}`;
  }
  console.log(myTeamRecord);
  return myTeamRecord;
}

function logActivePlayers(stats) {
  stats.activePlayers.forEach(player => {
    console.log(player.personId);
    console.log(`${player.firstName} ${player.lastName}`);
    console.log(player.jersey);
    console.log(player.teamId);
    console.log(`${player.points} PTS`);
    if (player.fga > 0) {
      console.log(`${player.fgm}/${player.fga} FG`);
    }
    if (player.tpa > 0) {
      console.log(`${player.tpm}/${player.tpa} 3PT`);
    }
    if (player.steals > 0) {
      console.log(`${player.steals} STL`);
    }

    console.log(`\n`);
  });
}

function writeXMLHeader() {
  let XMLHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>

<fcpxml version="1.6">
    <resources>
        <format id="r1" name="FFVideoFormat720p2997" frameDuration="1001/30000s" width="1280" height="720"/>
        <effect id="r2" name="Custom" uid=".../Generators.localized/Solids.localized/Custom.localized/Custom.motn"/>
        <effect id="r3" name="Cross Dissolve" uid="FxPlug:4731E73A-8DAC-4113-9A30-AE85B1761265"/>
        <effect id="r4" name="Audio Crossfade" uid="FFAudioTransition"/>
        <asset id="r5" name="Thunder Intro 2015" uid="AF28B393523879DD583866BC628404E5" src="file:///Users/Shared/Intros/Thunder%20Intro%202015.mov" start="108108000/30000s" duration="240240/30000s" hasVideo="1" format="r1" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000">
            <bookmark>Ym9vazADAAAAAAQQMAAAAP+yXLVXCETPDxpZDCz3CD+Pr1CN7Wg58iYWM2lEWa1HIAIAAAQAAAADAwAAAAgAKAUAAAABAQAAVXNlcnMAAAAHAAAAAQEAAHRmcmFzZXIACQAAAAEBAABEb2N1bWVudHMAAAALAAAAAQEAADIwMTUgSW50cm9zABYAAAABAQAAVGh1bmRlciBJbnRybyAyMDE1Lm1vdgAAFAAAAAEGAAAQAAAAIAAAADAAAABEAAAAWAAAAAgAAAAEAwAAsgAAAAAAAAAIAAAABAMAABLrLQAAAAAACAAAAAQDAAA+bS4AAAAAAAgAAAAEAwAAsLsuAAAAAAAIAAAABAMAACLKLgAAAAAAFAAAAAEGAACUAAAApAAAALQAAADEAAAA1AAAAAgAAAAABAAAQbwOBk4AAAAYAAAAAQIAAAEAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAgAAAAEAwAAAwAAAAAAAAAEAAAAAwMAAPclfV4IAAAAAQkAAGZpbGU6Ly8vDAAAAAEBAABNYWNpbnRvc2ggSEQIAAAABAMAAACwg7LoAAAACAAAAAAEAABBwXE4IgAAACQAAAABAQAAMTMyRjFCOEQtOUY2RC0zQjMzLUFERDktMkQ1NkFCMjM3RTVEGAAAAAECAACBAAAAAQAAAO8TAAABAAAAAAAAAAAAAAABAAAAAQEAAC8AAAAAAAAAAQUAABoAAAABAQAATlNVUkxEb2N1bWVudElkZW50aWZpZXJLZXkAAAQAAAADAwAAoQcAANgAAAD+////AQAAAAAAAAARAAAABBAAAHgAAAAAAAAABRAAAOQAAAAAAAAAEBAAABABAAAAAAAAQBAAAAABAAAAAAAAAiAAANwBAAAAAAAABSAAAEwBAAAAAAAAECAAAFwBAAAAAAAAESAAAJABAAAAAAAAEiAAAHABAAAAAAAAEyAAAIABAAAAAAAAICAAALwBAAAAAAAAMCAAAOgBAAAAAAAAAcAAADABAAAAAAAAEcAAACAAAAAAAAAAEsAAAEABAAAAAAAAENAAAAQAAAAAAAAA8AEAgBQCAAAAAAAA</bookmark>
        </asset>
        <effect id="r6" name="Lower Third DUAL - 2015" uid="~/Generators.localized/_TEMPLATE/NewsOK/Lower Third DUAL - 2015/Lower Third DUAL - 2015.motn" src="file:///Users/tfraser/Movies/Motion%20Templates.localized/Generators.localized/_TEMPLATE/NewsOK/Lower%20Third%20DUAL%20-%202015/Lower%20Third%20DUAL%20-%202015.motn"/>
        <effect id="r7" name="Lower Third - 2015" uid="~/Generators.localized/_TEMPLATE/NewsOK/Lower Third - 2015/Lower Third - 2015.motn" src="file:///Users/tfraser/Movies/Motion%20Templates.localized/Generators.localized/_TEMPLATE/NewsOK/Lower%20Third%20-%202015/Lower%20Third%20-%202015.motn"/>
    </resources>
    <library location="file:///Users/tfraser/Downloads/Thunder%20XML%20Template/Thunder%20XML%20automation%20template.fcpbundle/">
        
            `;

  fs.writeFileSync(`./output/FCPXML/${today.date}.fcpxml`, XMLHeader, function(
    err
  ) {
    if (err) throw err;
    console.log("XMLHeader written to file");
  });
}

function writeAnalysisXML() {
  let analysisXML = `<event name="Analysis" uid="4C7A9169-9A18-4B6B-8CB3-25860995599E">
    <project name="${today.visitor} at ${today.home}" uid="EE2A8B99-C639-4E3A-A2C0-13E016479E10" modDate="2020-02-21 10:59:14 -0600">
        <sequence duration="1591590/30000s" format="r1" renderColorSpace="Rec. 709" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
            <spine>
                <gap name="Gap" offset="0s" duration="91091/30000s" start="107999892/30000s">
                    <spine lane="1" offset="8999991/2500s">
                        <transition name="Cross Dissolve" offset="0s" duration="5005/30000s">
                            <filter-video ref="r3" name="Cross Dissolve">
                                <param name="Look" key="1" value="11 (Video)"/>
                                <param name="Amount" key="2" value="50"/>
                                <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                <param name="Ease Amount" key="51" value="0"/>
                            </filter-video>
                            <filter-audio ref="r4" name="Audio Crossfade"/>
                        </transition>
                        <asset-clip name="Thunder Intro 2015" offset="0s" ref="r5" duration="167167/30000s" start="108181073/30000s" audioRole="dialogue" tcFormat="NDF">
                            <adjust-volume>
                                <param name="amount">
                                    <fadeIn type="easeIn" duration="161683/720000s"/>
                                    <fadeOut type="easeIn" duration="1071384/720000s"/>
                                    <keyframeAnimation>
                                        <keyframe time="2598301452/720000s" value="0dB"/>
                                        <keyframe time="2599222655/720000s" value="-11dB"/>
                                    </keyframeAnimation>
                                </param>
                            </adjust-volume>
                        </asset-clip>
                        <transition name="Cross Dissolve" offset="152152/30000s" duration="15015/30000s">
                            <filter-video ref="r3" name="Cross Dissolve">
                                <param name="Look" key="1" value="11 (Video)"/>
                                <param name="Amount" key="2" value="50"/>
                                <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                <param name="Ease Amount" key="51" value="0"/>
                            </filter-video>
                            <filter-audio ref="r4" name="Audio Crossfade"/>
                        </transition>
                    </spine>
                </gap>
                <gap name="Gap" offset="91091/30000s" duration="1342341/30000s" start="108113005/30000s">
                    <video name="Lower Third DUAL - 2015" lane="1" offset="108200092/30000s" ref="r6" duration="720720/120000s" start="108108000/30000s">
                        <param name="Position" key="9999/10223/10230/1/100/101" value="-536 -194"/>
                        <param name="Text" key="9999/10223/10230/2/369" value="${config.reporter1}"/>
                        <param name="Position" key="9999/10223/10239/1/100/101" value="-502.25 -246"/>
                        <param name="Text" key="9999/10223/10239/2/369" value="Reporting for The Oklahoman"/>
                        <param name="Position" key="9999/10223/18281/1/100/101" value="438.543 -194"/>
                        <param name="Alignment" key="9999/10223/18281/2/354/18282/401" value="2 (Right)"/>
                        <param name="Text" key="9999/10223/18281/2/369" value="${config.reporter2}"/>
                        <param name="Position" key="9999/10223/18409/1/100/101" value="383.809 -246"/>
                        <param name="Alignment" key="9999/10223/18409/2/354/18410/401" value="2 (Right)"/>
                        <param name="Text" key="9999/10223/18409/2/369" value=""/>
                    </video>
                    <video name="Lower Third - 2015" lane="1" offset="108380272/30000s" ref="r7" duration="720720/120000s" start="108108000/30000s">
                        <param name="Position" key="9999/10223/10230/1/100/101" value="-536.154 -194"/>
                        <param name="Text" key="9999/10223/10230/2/369" value="${today.visitor} ${today.visitorScore}, ${today.home} ${today.homeScore}"/>
                        <param name="Position" key="9999/10223/10239/1/100/101" value="-502.25 -246"/>
                        <param name="Text" key="9999/10223/10239/2/369" value="${myTeamRecord}"/>
                    </video>
                    <spine lane="1" offset="5472467/1500s">
                        <transition name="Cross Dissolve" offset="0s" duration="5005/30000s">
                            <filter-video ref="r3" name="Cross Dissolve">
                                <param name="Look" key="1" value="11 (Video)"/>
                                <param name="Amount" key="2" value="50"/>
                                <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                <param name="Ease Amount" key="51" value="0"/>
                            </filter-video>
                            <filter-audio ref="r4" name="Audio Crossfade"/>
                        </transition>
                        <asset-clip name="Thunder Intro 2015" offset="0s" ref="r5" duration="164164/30000s" start="108184076/30000s" audioRole="dialogue" tcFormat="NDF">
                            <adjust-volume>
                                <param name="amount">
                                    <fadeIn type="easeIn" duration="161683/720000s"/>
                                    <fadeOut type="easeIn" duration="1071384/720000s"/>
                                    <keyframeAnimation>
                                        <keyframe time="2598301452/720000s" value="0dB"/>
                                    </keyframeAnimation>
                                </param>
                            </adjust-volume>
                        </asset-clip>
                        <transition name="Cross Dissolve" offset="149149/30000s" duration="15015/30000s">
                            <filter-video ref="r3" name="Cross Dissolve">
                                <param name="Look" key="1" value="11 (Video)"/>
                                <param name="Amount" key="2" value="50"/>
                                <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                <param name="Ease Amount" key="51" value="0"/>
                            </filter-video>
                            <filter-audio ref="r4" name="Audio Crossfade"/>
                        </transition>
                    </spine>
                </gap>
            </spine>
        </sequence>
    </project>
    <asset-clip name="Thunder Intro 2015" ref="r5" duration="240240/30000s" start="108108000/30000s" audioRole="dialogue" format="r1" tcFormat="NDF" modDate="2020-02-21 10:50:55 -0600"/>
</event>
`;
  fs.appendFileSync(
    `./output/FCPXML/${today.date}.fcpxml`,
    analysisXML,
    function(err) {
      if (err) throw err;
      console.log("Analysis Event written to file");
    }
  );
}

function writePlayerStats(stats) {
    let visitorStatsXML = `<event name="${today.visitor}" uid="016E45C1-FDF6-42E0-9E47-${stats.vTeam.teamId}">`
    let homeStatsXML = `<event name="${today.home}" uid="016E45C1-FDF6-42E0-9E47-${stats.hTeam.teamId}">`
  stats.activePlayers.forEach(player => {
      console.log(player.min);
    if (player.min != "0:00") {
      let statLine = "";
      if (player.points > 0) {
        statLine += `${player.points} PTS`;
      }
      if (player.totReb > 0) {
        statLine += `, ${player.totReb} REB`;
      }
      if (player.assists > 0) {
        statLine += `, ${player.assists} AST`;
      }
      if (player.steals > 0) {
        statLine += `, ${player.steals} STL`;
      }
      if (player.blocks > 0) {
        statLine += `, ${player.blocks} BLK`;
      }
      if (player.fga > 0) {
        statLine += `   ${player.fgm}/${player.fga} FG`;
      }
      if (player.tpa > 0) {
        statLine += `  ${player.tpm}/${player.tpa} 3PT`;
      }

      console.log(statLine);

      let playerStats = `
                <project name="${player.firstName} ${player.lastName}" uid="D08BE1A0-73F3-4CBF-9F40-${player.personId}" modDate="2020-01-28 13:35:39 -0600">
                    <sequence duration="1689688/30000s" format="r1" renderColorSpace="Rec. 709" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
                        <spine>
                            <video name="Custom" offset="0s" ref="r2" duration="98098/30000s" start="108108000/30000s">
                                <spine lane="1" offset="18018/5s">
                                    <transition name="Cross Dissolve" offset="0s" duration="5005/30000s">
                                        <filter-video ref="r3" name="Cross Dissolve">
                                            <param name="Look" key="1" value="11 (Video)"/>
                                            <param name="Amount" key="2" value="50"/>
                                            <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                            <param name="Ease Amount" key="51" value="0"/>
                                        </filter-video>
                                        <filter-audio ref="r4" name="Audio Crossfade"/>
                                    </transition>
                                    <asset-clip name="Thunder Intro 2015" offset="0s" ref="r5" duration="167167/30000s" start="108181073/30000s" audioRole="dialogue" tcFormat="NDF">
                                        <adjust-volume>
                                            <param name="amount">
                                                <fadeIn type="easeIn" duration="161683/720000s"/>
                                                <fadeOut type="easeIn" duration="1071384/720000s"/>
                                                <keyframeAnimation>
                                                    <keyframe time="2598301452/720000s" value="0dB"/>
                                                    <keyframe time="2599222655/720000s" value="-11dB"/>
                                                </keyframeAnimation>
                                            </param>
                                        </adjust-volume>
                                    </asset-clip>
                                    <transition name="Cross Dissolve" offset="152152/30000s" duration="15015/30000s">
                                        <filter-video ref="r3" name="Cross Dissolve">
                                            <param name="Look" key="1" value="11 (Video)"/>
                                            <param name="Amount" key="2" value="50"/>
                                            <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                            <param name="Ease Amount" key="51" value="0"/>
                                        </filter-video>
                                        <filter-audio ref="r4" name="Audio Crossfade"/>
                                    </transition>
                                </spine>
                            </video>
                            <gap name="Gap" offset="98098/30000s" duration="1433432/30000s" start="107999892/30000s">
                                <video name="Lower Third - 2015" lane="1" offset="108083976/30000s" ref="r7" duration="720720/120000s" start="108108000/30000s">
                                    <param name="Position" key="9999/10223/10230/1/100/101" value="-536.154 -194"/>
                                    <param name="Text" key="9999/10223/10230/2/369" value="${player.firstName} ${player.lastName}"/>
                                    <param name="Position" key="9999/10223/10239/1/100/101" value="-502.25 -246"/>
                                    <param name="Text" key="9999/10223/10239/2/369" value="${statLine}"/>
                                </video>
                                <video name="Lower Third - 2015" lane="1" offset="108266158/30000s" ref="r7" duration="720720/120000s" start="108108000/30000s">
                                    <param name="Position" key="9999/10223/10230/1/100/101" value="-536.154 -194"/>
                                    <param name="Text" key="9999/10223/10230/2/369" value="${today.visitor} ${today.visitorScore}, ${today.home} ${today.homeScore}"/>
                                    <param name="Position" key="9999/10223/10239/1/100/101" value="-502.25 -246"/>
                                    <param name="Text" key="9999/10223/10239/2/369" value="${myTeamRecord}"/>
                                </video>
                                <spine lane="1" offset="54713659/15000s">
                                    <transition name="Cross Dissolve" offset="0s" duration="5005/30000s">
                                        <filter-video ref="r3" name="Cross Dissolve">
                                            <param name="Look" key="1" value="11 (Video)"/>
                                            <param name="Amount" key="2" value="50"/>
                                            <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                            <param name="Ease Amount" key="51" value="0"/>
                                        </filter-video>
                                        <filter-audio ref="r4" name="Audio Crossfade"/>
                                    </transition>
                                    <asset-clip name="Thunder Intro 2015" offset="0s" ref="r5" duration="164164/30000s" start="108184076/30000s" audioRole="dialogue" tcFormat="NDF">
                                        <adjust-volume>
                                            <param name="amount">
                                                <fadeIn type="easeIn" duration="161683/720000s"/>
                                                <fadeOut type="easeIn" duration="1071384/720000s"/>
                                                <keyframeAnimation>
                                                    <keyframe time="2598301452/720000s" value="0dB"/>
                                                </keyframeAnimation>
                                            </param>
                                        </adjust-volume>
                                    </asset-clip>
                                    <transition name="Cross Dissolve" offset="149149/30000s" duration="15015/30000s">
                                        <filter-video ref="r3" name="Cross Dissolve">
                                            <param name="Look" key="1" value="11 (Video)"/>
                                            <param name="Amount" key="2" value="50"/>
                                            <param name="Ease" key="50" value="2 (In &amp; Out)"/>
                                            <param name="Ease Amount" key="51" value="0"/>
                                        </filter-video>
                                        <filter-audio ref="r4" name="Audio Crossfade"/>
                                    </transition>
                                </spine>
                            </gap>
                            <video name="Custom" offset="1531530/30000s" ref="r2" duration="98098/30000s" start="108108000/30000s"/>
                        </spine>
                    </sequence>
                </project>
    `;

      if (player.teamId != today.homeId){
        visitorStatsXML += playerStats
      } else {
        homeStatsXML += playerStats
      }

    } else {
      console.log("Did not play");
    }
  });

  fs.appendFileSync(
    `./output/FCPXML/${today.date}.fcpxml`,
    `${homeStatsXML} </event>`,
    function(err) {
      if (err) throw err;
      console.log("Player stats written to file");
    }
  );

  fs.appendFileSync(
    `./output/FCPXML/${today.date}.fcpxml`,
    `${visitorStatsXML} </event>`,
    function(err) {
      if (err) throw err;
      console.log("Player stats written to file");
    }
  );

}

function writeXMLFooter() {
  let XMLFooter = `
    </library>
    </fcpxml>`;

  fs.appendFileSync(`./output/FCPXML/${today.date}.fcpxml`, XMLFooter, function(
    err
  ) {
    if (err) throw err;
    console.log("XML footer written to file");
  });
}

function saveLocalJSON(html, type) {
  fs.writeFile(`./downloadedJSON/${today.date}_${type}.json`, html, function(
    err
  ) {
    if (err) throw err;
    console.log("JSON saved to file");
    console.log(`TYPE= ${type}`);
  });
}
