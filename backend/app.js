const express = require('express');
require('express-async-errors');
const morgan = require('morgan');   // log info about server req/res
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');   // security middleware
const cookieParser = require('cookie-parser');
const { environment } = require('./config');
const isProduction = environment === 'production';
const routes = require('./routes');
const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// Security Middleware
if (!isProduction) {
    // enable cors only in dev
    app.use(cors());
}

// helmet helps set headers for better security
app.use(helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
}));

// csrf token adds req.csrfToken
app.use(csurf({
    cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
    }
}));

app.use(routes);

module.exports = app;
