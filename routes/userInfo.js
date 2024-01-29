import express from 'express';

var router = express.Router();
import models from '../models.js';

router.get('/', async (req, res) => {
    try {

        const username = req.query.username;
        let userInfo = await models.UserInfo.findOne({ username: username });
        let loadUserInfo;

        if(!userInfo) {
            loadUserInfo = {
                username: username,
                age: undefined,
                favorite_color: undefined
            };
        } else {
            loadUserInfo = {
                username: username,
                age: userInfo.age,
                favorite_color: userInfo.favorite_color
            };    
        }
        
        res.json(loadUserInfo);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        res.status(500).json(`Error: ${error.message}`)
    }
})

router.post('/', async (req, res) => {
    console.log("post")
    if(req.session.isAuthenticated) {
        try {
            const username = req.session.account.username;
            let userInfo = await models.UserInfo.findOne({ username: username });
            const {age, favorite_color} = req.body;

            if(userInfo) {
                userInfo.age = age;
                userInfo.favorite_color = favorite_color;
                await userInfo.save();
            } else {
                userInfo = new models.UserInfo({
                    username, 
                    age,
                    favorite_color
                });
                await userInfo.save();
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
});

export default router;