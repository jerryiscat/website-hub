async function init(){
    let urlInput = document.getElementById("urlInput");
    urlInput.onkeyup = previewUrl;
    urlInput.onchange = previewUrl;
    urlInput.onclick = previewUrl;

    await loadIdentity();
    loadPosts();
}

async function loadPosts(){
    document.getElementById("posts_box").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/${apiVersion}/posts`)
    
    let postsHtml = postsJson.map(postInfo => {
        return `
        <div class="post">
            ${escapeHTML(postInfo.description)}
            ${postInfo.htmlPreview}
            <div><a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}</div>
            <div class="post-interactions">
                <div>
                    <span title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}"> ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes </span> &nbsp; &nbsp; 
                    <span class="heart-button-span ${myIdentity? "": "d-none"}">
                        ${postInfo.likes && postInfo.likes.includes(myIdentity) ? 
                            `<button class="heart_button" onclick='unlikePost("${postInfo.id}")'>&#x2665;</button>` : 
                            `<button class="heart_button" onclick='likePost("${postInfo.id}")'>&#x2661;</button>`} 
                    </span>
                </div>
                <br>
                <button onclick='toggleComments("${postInfo.id}")'>View/Hide comments</button>
                <div id='comments-box-${postInfo.id}' class="comments-box d-none">
                    <button onclick='refreshComments("${postInfo.id}")')>refresh comments</button>
                    <div id='comments-${postInfo.id}'></div>
                    <div class="new-comment-box ${myIdentity? "": "d-none"}">
                        New Comment:
                        <textarea type="textbox" id="new-comment-${postInfo.id}"></textarea>
                        <button onclick='postComment("${postInfo.id}")'>Post Comment</button>
                    </div>
                </div>
            </div>
        </div>`
    }).join("\n");
    document.getElementById("posts_box").innerHTML = postsHtml;
}

async function postUrl(){
    document.getElementById("postStatus").innerHTML = "sending data..."
    let url = document.getElementById("urlInput").value;
    let description = document.getElementById("descriptionInput").value;

    try{
        await fetchJSON(`api/${apiVersion}/posts`, {
            method: "POST",
            body: {url: url, description: description}
        })
    }catch(error){
        document.getElementById("postStatus").innerText = "Error"
        throw(error)
    }
    document.getElementById("urlInput").value = "";
    document.getElementById("descriptionInput").value = "";
    document.getElementById("url_previews").innerHTML = "";
    document.getElementById("postStatus").innerHTML = "successfully uploaded"
    loadPosts();
    
}



let lastTypedUrl = ""
let lastTypedTime = Date.now();
let lastURLPreviewed = "";
async function previewUrl(){
    document.getElementById("postStatus").innerHTML = "";
    let url = document.getElementById("urlInput").value;

    // make sure we are looking at a new url (they might have clicked or something, but not changed the text)
    if(url != lastTypedUrl){
        
        //In order to not overwhelm the server,
        // if we recently made a request (in the last 0.5s), pause in case the user is still typing
        lastTypedUrl = url;
        let timeSinceLastType = Date.now() - lastTypedTime
        lastTypedTime = Date.now()
        if(timeSinceLastType < 500){ 
            await new Promise(r => setTimeout(r, 1000)) // wait 1 second
        }
        // if after pausing the last typed url is still our current url, then continue
        // otherwise, they were typing during our 1 second pause and we should stop trying
        // to preview this outdated url
        if(url != lastTypedUrl){
            return;
        }
        
        if(url != lastURLPreviewed) { // make sure this isn't the one we just previewd
            lastURLPreviewed = url; // mark this url as one we are previewing
            document.getElementById("url_previews").innerHTML = "Loading preview..."
            try{
                let response = await fetch(`api/${apiVersion}/urls/preview?url=` + url)
                let previewHtml = await response.text()
                if(url == lastURLPreviewed){
                    document.getElementById("url_previews").innerHTML = previewHtml;
                }
            }catch(error){
                document.getElementById("url_previews").innerHTML = "There was an error: " + error;
            }
        }
    }
}

async function likePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/like`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


async function unlikePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/unlike`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


function getCommentHTML(commentsJSON){
    return commentsJSON.map(commentInfo => {
        return `
        <div class="individual-comment-box">
            <div>${escapeHTML(commentInfo.comment)}</div>
            <div> - <a href="/userInfo.html?user=${encodeURIComponent(commentInfo.username)}">${escapeHTML(commentInfo.username)}</a>, ${escapeHTML(commentInfo.created_date)}</div>
        </div>`
    }).join(" ");
}

async function toggleComments(postID){
    let element = document.getElementById(`comments-box-${postID}`);
    if(!element.classList.contains("d-none")){
        element.classList.add("d-none");
    }else{
        element.classList.remove("d-none");
        let commentsElement = document.getElementById(`comments-${postID}`);
        if(commentsElement.innerHTML == ""){ // load comments if not yet loaded
            commentsElement.innerHTML = "loading..."

            let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
            commentsElement.innerHTML = getCommentHTML(commentsJSON);          
        }
    }
    
}

async function refreshComments(postID){
    let commentsElement = document.getElementById(`comments-${postID}`);
    commentsElement.innerHTML = "loading..."

    let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
    commentsElement.innerHTML = getCommentHTML(commentsJSON);
}

async function postComment(postID){
    let newComment = document.getElementById(`new-comment-${postID}`).value;

    let responseJson = await fetchJSON(`api/${apiVersion}/comments`, {
        method: "POST",
        body: {postID: postID, newComment: newComment}
    })
    
    refreshComments(postID);
}