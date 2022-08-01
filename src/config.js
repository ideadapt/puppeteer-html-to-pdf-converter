const fs = require('fs')
const path = './config.json';
let config = {};
if (fs.existsSync(path)) {
    console.log('reading config.json')
    config = JSON.parse(fs.readFileSync(path));
}else{
    console.log('no config.json found')
}

module.exports = function(key) {
    key = key.toUpperCase();
    if (process.env[key]) {
        return process.env[key];
    }

    return config[key];
}