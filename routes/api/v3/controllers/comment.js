import express from 'express';

var router = express.Router();
import models from '../../../../models.js';

router.get('/', async (req, res) => {
    try {
        let postID = req.query.postID;
        console.log(req.query.postID);
        let comments = await models.Comment.find({ post: postID });
        console.log(comments)
        let postComment = await Promise.all(
            comments.map(async (comment) => {
                return { id: comment._id, username: comment.username, comment: comment.comment, post: postID, created_date: comment.created_date };
            })
        );

        res.json(postComment);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        res.status(500).json(`Error: ${error.message}`)
    }
})

router.post('/', async (req, res) => {
    if(req.session.isAuthenticated) {
        try {
            const username = req.session.account.username;
            const created_date = new Date();
            const {newComment, postID} = req.body;
            const comment = new models.Comment({
                username, 
                comment: newComment, 
                post: postID, 
                created_date});
            console.log({username, newComment, postID, created_date});
            await comment.save();
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
});

export default router;