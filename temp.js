// var date = new Date(); //Get current time
// var hour = date.getHours(); //Get current hour

// console.log(hour)


const moment = require('moment');

let hoursNow = moment().hours();  //get time in hh format to match tip time

console.log(hoursNow)