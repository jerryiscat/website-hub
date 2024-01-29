import express from 'express';
import { parse } from 'node-html-parser';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';
import models from '../../../../models.js';

router.get('/', async (req, res) => {
    try {
        const posts = await models.Post.find();
        const postData = await Promise.all(
          posts.map(async (post) => {
            try {
              const url = post.url;
              let htmlPreview = await getURLPreview(url);
              return { description: post.description, type: post.type, htmlPreview: htmlPreview };
            } catch (error) {
              console.error(error);
              return { description: post.description, type: post.type, htmlPreview: error.message };
            }
          })
        );
        res.json(postData);

      } catch (error) {
        console.error(error);
        res.status(500).json({ "status": "error", "error": error});
      }
});

router.post('/', async (req, res) => {
   try {
    const {url, type, description, created_date} = req.body;
    const newPost = new models.Post({url, type, description, created_date});
    await newPost.save();
    res.json({"status": "success"});
   } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).json(`Error: ${error.message}`)
   }
});
export default router;