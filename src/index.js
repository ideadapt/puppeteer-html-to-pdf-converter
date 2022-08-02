const express = require('express')
const config = require('./config.js');

const port = config('PORT')
if (!port) throw new Error('PORT config is required')

const bodyParser = require('body-parser');
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const multer = require('multer');
const cors = require('cors');
const slowDown = require("express-slow-down");
const upload = multer();
let app = express()

// boot up browser
require('./puppeteer');

// only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
if (config('TRUST_PROXY')) {
    app.enable("trust proxy");
}

const speedLimiter = slowDown({
  windowMs: (config('RATE_LIMIT_WINDOW') || 1) * 60 * 1000, // within 1min
  delayAfter: (config('RATE_LIMIT_DELAY_AFTER') || 20), // allow 20 req (one every 3sec)
  delayMs: config('RATE_LIMIT_DELAY_MS') || 500 // add 500ms delay per request, if not slowed down
});
const limit = config('HTML_MAX_LENGTH') || '1mb'
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));
app.use(bodyParserErrorHandler());
app.use(upload.array());
app.use(cors());
app.use(express.static('demo/html-js-client'));
app.use(speedLimiter);

app = require('./routes').register(app);


app.listen(port, () => console.log(`listening on port ${port}`));