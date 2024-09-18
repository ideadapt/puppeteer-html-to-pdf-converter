const express = require('express')
const morgan = require('morgan')
const config = require('./config.js');

const bodyParser = require('body-parser');
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const cors = require('cors');
const slowDown = require("express-slow-down");
const rateLimit = require("express-rate-limit");
const app = express()

require('./puppeteer').launch();

// only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc.)
if (config('TRUST_PROXY')) {
    app.enable("trust proxy");
}

// Add CORS middleware first so that CORS plays well with rate limiter middleware (do not count OPTIONS requests in rate quotas, add CORSs headers to error responses, ...)
app.use(cors());

// Optional : add rate limiter middlewares according to config
if (config('RATE_LIMIT_GLOBAL_REJECT_AFTER') ?? config('RATE_LIMIT_REJECT_AFTER') ?? config('RATE_LIMIT_DELAY_AFTER')) {
    addRateLimiterMiddlewares();
}

const bodyMaxLength = config('BODY_MAX_LENGTH') || '1mb'
app.use(bodyParser.json({limit: bodyMaxLength}));
app.use(bodyParser.urlencoded({extended: true, limit: bodyMaxLength}));
app.use(bodyParserErrorHandler());

app.use(morgan('[:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":user-agent" :response-time ms'));
app.use(express.static('demo/html-js-client'));
require('./routes').register(app);

app.listen(config('PORT'), () => console.log(`Listening on port ${config('PORT')}`));


function addRateLimiterMiddlewares() {
    // Note : RATE_LIMIT_WINDOW is kept for backward compatibility (deprecated, now you should use RATE_LIMIT_WINDOW_MS)
    const windowMs = config('RATE_LIMIT_WINDOW_MS') || (config('RATE_LIMIT_WINDOW') * 60 * 1000) || (1 * 60 * 1000); // default to 1 minute

    if (config('RATE_LIMIT_GLOBAL_REJECT_AFTER')) {
        const globalRateLimiter = rateLimit({
            windowMs: windowMs,
            limit: config('RATE_LIMIT_GLOBAL_REJECT_AFTER'),
            keyGenerator: () => "GLOBAL",
        })
        app.use(globalRateLimiter);
    }

    if (config('RATE_LIMIT_REJECT_AFTER')) {
        const perUserRateLimiter = rateLimit({
            windowMs: windowMs,
            limit: config('RATE_LIMIT_REJECT_AFTER'),
        })
        app.use(perUserRateLimiter);
    } else if (config('RATE_LIMIT_DELAY_AFTER')) {
        const perUserSpeedLimiter = slowDown({
            windowMs: windowMs,
            delayAfter: () => {
                return config('RATE_LIMIT_DELAY_AFTER')
            },
            delayMs: () => {
                return config('RATE_LIMIT_DELAY_MS')
            }
        });
        app.use(perUserSpeedLimiter);
    }
}