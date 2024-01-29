import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sessions from 'express-session';

import models from './models.js'
import apiv3Router from './routes/api/v3/apiv3.js';
import userInfoRouter from './routes/userInfo.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from './authConfig.js';
import authProvider from './auth/AuthProvider.js';

import { error } from 'console';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const oneDay = 1000 * 60 * 60 * 24;

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessions({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
        maxAge: oneDay,
    }
}));


app.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

app.post('/redirect', authProvider.handleRedirect());

app.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

app.get('/error', (req, res) => {
    res.send(`There was a server error: ${error.message}`);
});

app.get('/unauthorized', (req, res) => {
    res.send('Permission was denied.');
});

app.get('/', (req, res) => {
    let bodyContent;
    
    if(req.session.isAuthenticated) {
        bodyContent = `
                <div>isAuthenticated: ${req.session.isAuthenticated}</div>
                <div>username: ${req.session.account?.username}</div>
                <div><a href="/users/id">See ID Information</div>
                <br>
                <div><a href="/auth/signout">Sign out</div>
                `;
    } else {
        bodyContent = `<a href="/auth/signin">Sign in</a>`
    }

    const html = `
        <html>
            <head>Testing Azure</head>
            <body>
                <h1>MSAL Node & Express App Login</h1>
                ${bodyContent}
            </body>
        </html>
    `
    res.type('html');
    res.send(html);
});

app.use((req, res, next) => {
    req.models = models
    next();
})

app.use('/api/v3', apiv3Router);
app.use('/api/userinfo', userInfoRouter);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(
        `<html>
            <body>
                <h1 style='color: red'>Error!</h1>
                <h2>Message</h2>
                <p>${err.message}</p>
                <h4>Full Details</h4>
                <p>${JSON.stringify(err, null, 2)}</p>
            </body>
        </html>
        `
    );
});

export default app;
