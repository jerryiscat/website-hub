/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import express from 'express';
import authProvider from '../auth/AuthProvider.js';
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from '../authConfig.js';

const router = express.Router();

router.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

router.get('/acquireToken', authProvider.acquireToken({
    scopes: ['User.Read'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/users/profile'
}));

router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

  
router.get('/error', (req, res) => {
    res.send(`There was a server error: ${error.message}`);
});

router.get('/unauthorized', (req, res) => {
    res.send('Permission was denied.');
});

export default router;