import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

var router = express.Router();

router.get('/preview', async (req, res) => {
    res.type('html');
   try {
    const url = req.query.url;
    let htmlPreview = await getURLPreview(url);
    console.log(htmlPreview );
    res.send(htmlPreview );
   } catch (error) {
    res.send(`Error: ${error.message}`);
   }
});

export default router;