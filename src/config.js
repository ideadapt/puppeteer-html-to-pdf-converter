const fs = require('fs')
const path = './config.json';
let config = {};
if (fs.existsSync(path)) {
    console.log('Reading ./config.json')
    config = JSON.parse(fs.readFileSync(path));
    validateConfig(config);
} else {
    console.log('no ./config.json found')
    throw new Error('No ./config.json found')
}

module.exports = function (key) {
    key = key.toUpperCase();
    if (process.env[key]) {
        return process.env[key];
    }

    return config[key];
}

function validateConfig(config) {
    if (!config['PORT']) throw new Error('PORT config is required')

    if (config['RATE_LIMIT_GLOBAL_REJECT_AFTER'] || config['RATE_LIMIT_REJECT_AFTER'] || config['RATE_LIMIT_DELAY_AFTER']) {
        if (config['RATE_LIMIT_WINDOW_MS'] === undefined) {
            throw new Error('RATE_LIMIT_WINDOW_MS must be set if one of RATE_LIMIT_REJECT_AFTER or RATE_LIMIT_DELAY_AFTER or RATE_LIMIT_GLOBAL_REJECT_AFTER is set');
        }
    }

    if (config['RATE_LIMIT_DELAY_AFTER'] && config['RATE_LIMIT_DELAY_MS'] === undefined) {
        throw new Error('RATE_LIMIT_DELAY_MS must be set if RATE_LIMIT_DELAY_AFTER is set');
    }
}