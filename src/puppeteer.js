const puppeteer = require('puppeteer');

puppeteer.launch({
    args: [
        '--disable-dev-shm-usage'
    ]
}).then(browser => {
    global.browser = browser;
    console.log('browser ready');
});