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
const { ValidationError } = require('sequelize');
const app = express();

// Middlewares
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

// Connect routes
app.use(routes);

// unhandled requests error handler
app.use((_req, _res, next) => {
    const err = new Error("The requested resource could not be found.");
    err.title = "Resource Not Found";
    err.errors = {
        message: "The requested resource could not be found."
    };
    err.status = 404;
    next(err);
})

// sequelize errors
app.use((err, _req, _res, next) => {
    if (err instanceof ValidationError) {
        let errors = {};
        for (let error of err.errors) {
            errors[error.path] = error.message;
        }
        err.title = 'Validation error';
        err.errors = errors;
    }
    next(err);
});

// error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});


module.exports = app;
