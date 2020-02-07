let zHour = new Date().toISOString().slice(11,13).replace(/-/g,"");
let zMinute = new Date().toISOString().slice(14,16).replace(/-/g,""); 
let timeNow = `${parseInt(zHour)-6}${zMinute}`

if (parseInt(timeNow) < 1600) {
    console.log(`The game hasn't started yet`)
}
