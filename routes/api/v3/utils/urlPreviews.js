import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import sanitizeHtml from 'sanitize-html';

// const escapeHTML = str => String(str).replace(/[&<>'"]/g, 
//     tag => ({
//         '&': '&amp;',
//         '<': '&lt;',
//         '>': '&gt;',
//         "'": '&#39;',
//         '"': '&quot;'
//     }[tag]));

async function getURLPreview(url){
  // TODO: Copy from your code for making url previews in A2 to make this 
  // a function that takes a url and returns an html string with a preview of that html
  const response = await fetch(url);
  const urlRe = await response.text();
  const urlParsed = parse(urlRe); 

  const openGraphUrl = urlParsed.querySelector('meta[property="og:url"]')?.getAttribute('content') || url;
  
  const title = urlParsed.querySelector('meta[property="og:title"]')?.getAttribute('content') || url.querySelector('title')?.text || openGraphUrl;


  const image = urlParsed.querySelector('meta[property="og:image"]')?.getAttribute('content');

  const description = urlParsed.querySelector('meta[property="og:description"]')?.getAttribute('content');

  const siteName = urlParsed.querySelector('meta[property="og:site_name"]')?.getAttribute('content');

  const clean_url = sanitizeHtml(openGraphUrl)
  const clean_title = sanitizeHtml(title)
  const clean_image = sanitizeHtml(image)
  const clean_description = sanitizeHtml(description)
  const clean_siteName = sanitizeHtml(siteName)

  const htmlString = `
  <div style="max-width: 100%; border: solid 1px; padding: 3px; text-align: center;">
      ${clean_siteName ? `<h1>${clean_siteName}</h1>` : ''}
      <a href="${clean_url}">
          <p><strong>${clean_title}</strong></p>
          ${clean_image ? `<img src="${clean_image}" style="max-height: auto; max-width: 50%;">` : ''}
      </a>
      ${clean_description ? `<p>${clean_description}</p>` : ''}
  </div>
  `;

  return htmlString;
}

export default getURLPreview;