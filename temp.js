// let zHour = new Date().toISOString().slice(11,13).replace(/-/g,"");
// let zMinute = new Date().toISOString().slice(14,16).replace(/-/g,""); 
// let timeNow = `${parseInt(zHour)-6}${zMinute}`

// console.log(`The time is now: ${timeNow}`);

// if (parseInt(timeNow) < 1900) {
//     console.log(`The game hasn't started yet`)
// } else {
//     console.log(`I think the game has started...`)
// }



// let localTime = new Date().getTimezoneOffset();

// console.log(`time zone offest: ${localTime}`);



const moment = require('moment');

let localTime = `${moment().hours()}${moment().minutes()}`



console.log(moment().toString());
console.log(`${moment().hours()}${moment().minutes()}`);