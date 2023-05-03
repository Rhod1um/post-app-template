"use strict";
//https://race.notion.site/Post-App-With-Firebase-REST-API-94b14a24519c467fad0299e1f8952e01
//beskrivelse af projektet

// ============== global variables ============== //
const endpoint = "http://post-rest-api-default-rtdb.firebaseio.com/"; //firebase er db, app backend og alt muligt
let posts;

// ============== load and init app ============== //

window.addEventListener("load", initApp); //Rasmus bruger window frem for document her, siger
//valget er ligegyldigt

function initApp() {
    updatePostsGrid(); // update the grid of posts: get and show all posts

    // event listener
    document
        .querySelector("#btn-create-post")
        .addEventListener("click", showCreatePostDialog);
    document.querySelector("#button-cancel").addEventListener("click", closeCreatePostDialog);
    document.querySelector("#form-create-post").addEventListener("submit", createPostClicked);
}

// ============== events ============== //

function createPostClicked(event){
    console.log(event.target) //poster man eventet uden target er det noget alt muligt mærkeligt

    //target er DOM elementet som affyrer eventet, det er et DOM objekt, her DOM elementet form
    //poster man med target får man formen og hvad der er inde i den
    const form = event.target //tager hele objektet
    const title = form.title.value //name i html er title, vi bruger name til at referere til ting i objektet
    //const title = event.target.title.value - samme
    //når browseren læser html omformulere den det til DOM - objektrepræsentation af html
    //js manipulere ikke html men DOM'en
    const body = form.body.value
    const image = form.image.value
    console.log(title)

    createPost(title, body, image)
}


function closeCreatePostDialog(){
    document.querySelector("#dialog-create-post").close();


}

function showCreatePostDialog() {
    console.log("Create New Post clicked!");
    document.querySelector("#dialog-create-post").showModal();
    //når den er åben, så skal der være en eventlistener på knappen og så i stedet for showModel() er det close()
    //vi laver formular som lukker den, method="dialog" på html form
    //form i en dialog element lukker altid dialog modal når den sendes automatisk, skal ikke manuelt lukkes
    //tryk escape for at komme ud af en modal hvis der ikke er en eventlisterner som lukker den
    //uden at man behøver submitte formen
}

// todo

// ============== posts ============== //

async function updatePostsGrid() {
    posts = await getPosts(); // get posts from rest endpoint and save in global variable
    showPosts(posts); // show all posts (append to the DOM) with posts as argument
}

// Get all posts - HTTP Method: GET
async function getPosts() {
    const response = await fetch(`${endpoint}/posts.json`); // fetch request, (GET)
    const data = await response.json(); // parse JSON to JavaScript
    const posts = prepareData(data); // convert object of object to array of objects
    return posts; // return posts
}

function showPosts(listOfPosts) {
    document.querySelector("#posts").innerHTML = ""; // reset the content of section#posts

    for (const post of listOfPosts) { //hvilket loop skal man bruge?
        showPost(post); // for every post object in listOfPosts, call showPost
    }
}

function showPost(postObject) {
    const html = /*html*/ `
        <article class="grid-item">
            <img src="${postObject.image}" />
            <h3>${postObject.title}</h3>
            <p>${postObject.body}</p>
            <div class="btns">
                <button class="btn-delete">Delete</button>
                <button class="btn-update">Update</button>
            </div>
        </article>
    `; // html variable to hold generated html in backtick
    document.querySelector("#posts").insertAdjacentHTML("beforeend", html); // append html to the DOM - section#posts
    //^^er som innerHTML men innerHTML sletter eventlisterners på update og delete knapper
    //fordi den overwriter hver gang den laver et nyt pga +=
    //document.querySelector("posts").innerHTML+=html

    // add event listeners to .btn-delete and .btn-update
    document
        .querySelector("#posts article:last-child .btn-delete")
        .addEventListener("click", deleteClicked);//queryselector fungere på samme måde som css hiearki
    //man kunne gøre det samem med id, her går vi bare gennem css hierarki for at få fat i et element
    document
        .querySelector("#posts article:last-child .btn-update")
        .addEventListener("click", updateClicked);
    //eventlisteners er i loop her

    // called when delete button is clicked
    function deleteClicked() {
        console.log("Delete button clicked");
        // to do
    }

    // called when update button is clicked
    function updateClicked() {
        console.log("Update button clicked");
        // to do
    }
}

// Create a new post - HTTP Method: POST
async function createPost(title, body, image) {
    // create new post object
    // convert the JS object to JSON string
    // POST fetch request with JSON in the body
    // check if response is ok - if the response is successful
    // update the post grid to display all posts and the new post

    const newPost = {title: title, body: body, image: image}
    console.log(newPost)

    const json = JSON.stringify(newPost)
    console.log(json)

    const response = await fetch(`${endpoint}/posts.json`, {method: "POST", body: json})
    //body er http body, det er det som bliver sendt til serveren

    if (response.ok){
        updatePostsGrid()
    }
}

// Update an existing post - HTTP Method: DELETE
async function deletePost(id) {
    // DELETE fetch request
    // check if response is ok - if the response is successful
    // update the post grid to display posts
}

// Delete an existing post - HTTP Method: PUT
async function updatePost(id, title, body, image) {
    // post update to update
    // convert the JS object to JSON string
    // PUT fetch request with JSON in the body. Calls the specific element in resource
    // check if response is ok - if the response is successful
    // update the post grid to display all posts and the new post
}

// ============== helper function ============== //

// convert object of objects til an array of objects
function prepareData(dataObject) {
    const array = []; // define empty array
    // loop through every key in dataObject
    // the value of every key is an object
    for (const key in dataObject) {
        const object = dataObject[key]; // define object
        object.id = key; // add the key in the prop id
        array.push(object); // add the object to array
    }
    return array; // return array back to "the caller"
}
