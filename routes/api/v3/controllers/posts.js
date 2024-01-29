import express from 'express';
import { parse } from 'node-html-parser';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';
import models from '../../../../models.js';

router.get('/', async (req, res) => {
    try {
        let usernameQue = req.query.username;
        let posts;
        if(usernameQue) {
          posts = await models.Post.find({ username: usernameQue });
        }else {
          posts= await models.Post.find();
        }
        const postData = await Promise.all(
          posts.map(async (post) => {
            try {
              const url = post.url;
              let htmlPreview = await getURLPreview(url);
              return { id: post._id, description: post.description, type: post.type, htmlPreview: htmlPreview, username: post.username, likes: post.likes};
            } catch (error) {
              console.error(error);
              return { id: post._id, description: post.description, type: post.type, htmlPreview: error.message,
              username: post.username, likes: post.likes};
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
  if(req.session.isAuthenticated) {
    try {
      const {url, type, description} = req.body;
      const username = req.session.account.username;
      const created_date = new Date();
      const newPost = new models.Post({url, type, description, created_date, username});
      await newPost.save();
      res.json({"status": "success"});
    } catch (error) {
      console.log(`Error: ${error.message}`);
      res.status(500).json(`Error: ${error.message}`)
    }
  } else {
    res.json({
      "status": "error",
      "error": "not logged in"
    });
  }
    
});


router.post('/like', async (req, res) => {
  if(req.session.isAuthenticated) {
    try {
      const postID = req.body.postID;
      const username = req.session.account.username;
      const post = await models.Post.findById(postID);

      if (!post.likes.includes(username)) {
          post.likes.push(username);
          await post.save();
      
      }
    
      res.json({"status": "success"});
    } catch (error) {
      console.log(`Error: ${error.message}`);
      res.status(500).json(`Error: ${error.message}`)
    }

  }else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
})

router.post('/unlike', async (req, res) => {
  if(req.session.isAuthenticated) {
    try {

      const postID = req.body.postID;
      const username = req.session.account.username;
      const post = await models.Post.findById(postID);

      if (post.likes.includes(username)) {
          post.likes = post.likes.filter(item => item !== username);
          await post.save();
      }
      
      res.json({"status": "success"});
    } catch (error) {
      console.log(`Error: ${error.message}`);
      res.status(500).json(`Error: ${error.message}`)
    }

  }else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
})

router.delete('/', async (req, res) => {
  if(req.session.isAuthenticated) {
    try {
      const postID = req.body.postID;
      const username = req.session.account.username;
      const post = await models.Post.findById(postID);
      if(username != post.username) {
        res.status(401).json({
          status: 'error',
          error: "you can only delete your own posts"
        });
      }else {
        await models.Comment.deleteMany({ post: postID });
        await models.Post.deleteOne({ _id: postID });
      }
      
      res.json({"status": "success"});
    } catch (error) {
      console.log(`Error: ${error.message}`);
      res.status(500).json(`Error: ${error.message}`)
    }
  }else {
    res.status(401).json({
      status: "error",
      error: "not logged in"
   });
  }
})

export default router;