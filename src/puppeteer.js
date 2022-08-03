const puppeteer = require('puppeteer');

module.exports.launch = function () {
    return puppeteer.launch({
        args: [
            '--disable-dev-shm-usage'
        ]
    }).then(browser => {
        global.browser = browser;
        console.log('browser ready');
    });
}
