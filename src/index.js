const express = require('express')
const morgan = require('morgan')
const config = require('./config.js');

const port = config('PORT')
if (!port) throw new Error('PORT config is required')

const bodyParser = require('body-parser');
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const cors = require('cors');
const slowDown = require("express-slow-down");
const app = express()

require('./puppeteer').launch();

// only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc.)
if (config('TRUST_PROXY')) {
    app.enable("trust proxy");
}

const speedLimiter = slowDown({
  windowMs: (config('RATE_LIMIT_WINDOW') || 1) * 60 * 1000, // within 1min
  delayAfter:  () => {
      return config('RATE_LIMIT_DELAY_AFTER') || 20 // allow 20 req (one every 3sec)
  },
  delayMs: () => {
      return config('RATE_LIMIT_DELAY_MS') || 500 // add 500ms delay per request, if not slowed down
  }
});

// Preflight OPTION requests are sent by browsers before POST for CORS motivations, and should not be rate limited
const conditionalSpeedLimiter = (req, res, next) => {
    if (req.method !== 'OPTION') {
        return speedLimiter(req, res, next);
    }
    next();
};

app.use(conditionalSpeedLimiter);

const bodyMaxLength = config('BODY_MAX_LENGTH') || '1mb'
app.use(bodyParser.json({limit: bodyMaxLength}));
app.use(bodyParser.urlencoded({extended: true, limit: bodyMaxLength}));
app.use(bodyParserErrorHandler());

app.use(morgan('[:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":user-agent" :response-time ms'));
app.use(cors());
app.use(express.static('demo/html-js-client'));
require('./routes').register(app);

app.listen(port, () => console.log(`listening on port ${port}`));
