const request = require("request");
const fs = require("fs");

let gameData = fs.readFileSync("./output/today.json");
const today = JSON.parse(gameData);
let configData = fs.readFileSync("./output/config.json");
const config = JSON.parse(configData);

console.log(config.users)