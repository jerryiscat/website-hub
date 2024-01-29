import express from 'express';
import { compile } from 'morgan';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a apiv1');
// });

router.get('/urls/preview', async (req, res) => {
    res.type('html');
   try {
    const urlRes = req.query.url;
    const response = await fetch(urlRes);
    const url = await response.text();
    const html = parse(url); 

    const openGraphUrl = html.querySelector('meta[property="og:url"]')?.getAttribute('content') || urlRes;
    
    const title = html.querySelector('meta[property="og:title"]')?.getAttribute('content') || html.querySelector('title')?.text || openGraphUrl;


    const image = html.querySelector('meta[property="og:image"]')?.getAttribute('content');

    console.log(image);

    const description = html.querySelector('meta[property="og:description"]')?.getAttribute('content');

    const siteName = html.querySelector('meta[property="og:site_name"]')?.getAttribute('content');


    const htmlString = `
    <div style="max-width: 100%; border: solid 1px; padding: 3px; text-align: center;">
        ${siteName ? `<h1>${siteName}</h1>` : ''}
        <a href="${openGraphUrl}">
            <h2><strong>${title}</strong></h2>
            ${image ? `<img src="${image}" style="max-height: auto; max-width: 50%;">` : ''}
        </a>
        ${description ? `<p>${description}</p>` : ''}
    </div>
    `;

    res.send(htmlString);
   } catch (error) {
    res.send(`Error: ${error.message}`);
   }
});


export default router;
