import express from 'express';
var router = express.Router();

import postsRouter from './controllers/posts.js';
import urlsRouter from './controllers/urls.js';
import usersRouter from './controllers/users.js';
import commentRouter from './controllers/comment.js';

router.use('/posts', postsRouter);
router.use('/urls', urlsRouter);
router.use('/users', usersRouter);
router.use('/comments', commentRouter);

export default router;