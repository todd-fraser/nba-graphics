const fs = require('fs');

// JSON Contents
// "todaysDate": "20200205",
// "playToday": true,
// "todayTip": 1800,
// "nickname": "Thunder",
// "isHomeTeam": true

let data = fs.readFileSync('config.json');
let config = JSON.parse(data);
console.log(config);
console.log(`Today's Tip Time is: ${config.todayTip}`)

console.log(`today's date from file: ${config.todaysDate}`)

var todaysDate = new Date().toISOString().slice(0,10).replace(/-/g,"");

config.todaysDate = todaysDate

data = JSON.stringify(config, null, 2);  //writes pretty JSON
// let data = JSON.stringify(config); //writes single line JSON
fs.writeFile('config.json', data, finished);
function finished(err) {
    console.log(`JSON writen to file`);
}