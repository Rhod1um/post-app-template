"use strict";
//https://race.notion.site/Post-App-With-Firebase-REST-API-94b14a24519c467fad0299e1f8952e01
//beskrivelse af projektet

// ============== global variables ============== //
const endpoint = "https://post-rest-api-default-rtdb.firebaseio.com/"; //firebase er db, app backend og alt muligt
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
    document.querySelector("#form-delete-post").addEventListener("submit", deletePostClicked);
    //form skal have submit, knapper skal have click, knapper i form som ikke er submit skal have click
    document.querySelector("#btn-no").addEventListener("click", closeDeletePostDialog);
    document.querySelector("#form-update-post").addEventListener("submit", updatePostClicked);
    document.querySelector("#button-cancel-update").addEventListener("click", closeUpdatePostDialog);
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

    form.reset() //resetter det man har skrevet i formen så når man laver ny post skal der
    //ikke stå noget fra tidligere
}

async function updatePostClicked(event){
    const form = event.target

    const title = form.title.value
    const body = form.body.value
    const image = form.image.value

    const id = form.getAttribute("data-id")

    await updatePost(id, title, body, image) //man behøver ikke async og await på andet end fetch men intellj
    //brokker sig. Man har ikke brug for at vente på at update post er færdig?
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

async function deletePostClicked(event){
    const form = event.target
    const id = form.getAttribute("data-id")
    console.log(id)
    await deletePost(id) //hvis den siger promise er ignores så lav funktionen async og brug await her
}

function closeDeletePostDialog(){
    document.querySelector("#dialog-delete-post").close();
}

// todo

// ============== posts ============== //

async function updatePostsGrid() {
    posts = await getPosts(); // get posts from rest endpoint and save in global variable
    showPosts(posts); // show all posts (append to the DOM) with posts as argument
    //her henter vi alle posts igen hvis vi ændre et objekt
    //ueffektivt men Rasmus vil sikre at alt er som det skal være
    //i virkeligheden vil man have et framework til at tage sig af sådanne ting og ikke vanilla js
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
    //her bruges innerHTML for netop at fjerne alt, resette. innerHTML er ellers dårligt at bruge
    //da den overwriter og sletter eventlisteners på alt undtagen den nyeste post

    for (const post of listOfPosts) { //hvilket loop skal man bruge?
        showPost(post); // for every post object in listOfPosts, call showPost
    }
}

function showPost(postObject) { //postObject er hvor objekt i et loop
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
    function deleteClicked() {  //funktion hedder en closure, funktion i funktion
        //ved closures kan ikke kaldes uden for parent funktion
        //hedder closure fordi indre funktion kan bruges selvom det er længe siden parent blev afviklet
        //når objekt er skabt har disse funktioner stadig adgang til objektet
        console.log("Delete button clicked");
        document.querySelector("#dialog-delete-post-title").textContent = postObject.title
        document.querySelector("#form-delete-post").setAttribute("data-id", postObject.id)
        //data-id er en attrbut på html/DOM elementet form-delete-post. Den kan hedde hvad som helst
        //det er som at skrive data-et-eller-andet="postObject.id" på html formen
        //data-id attribut i dommen har post id på det objekt du har trykket delete på
        //sådan gemmer man id på objekt man skal gøre noget med. alternativt lav global variabel øverst med
        // postId men man er ikke så glad for globale variabler
        //id'et er fra firebase
        document.querySelector("#dialog-delete-post").showModal()
    }

    // called when update button is clicked
    function updateClicked() {
        console.log("Update button clicked");
        // to do
        console.log(postObject)
        const form = document.querySelector("#form-update-post")
        form.title.value = postObject.title //viser eksisterende objekt i formen, kan gøres
        //fordi vi er i funktion inde i funktion, så vi er i scope og har eksisterende objekt direkte
        form.body.value = postObject.body
        form.image.value = postObject.image
        form.setAttribute("data-id", postObject.id)
        document.querySelector("#dialog-update-post").showModal()
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

    const json = JSON.stringify(newPost) //laves om til json så vi kan sende det med http
    //json forståelse er indbygget i browseren
    console.log(json)

    const response = await fetch(`${endpoint}/posts.json`, {method: "POST", body: json})
    //body er http body, det er det som bliver sendt til serveren
    //fetch er altid http request
    //default er GET
    //fetch ved get skriver ikke get. post og get og andre ligner hinanden
    //const response = await fetch(`${endpoint}/posts.json`); som ovenover

    if (response.ok){
        await updatePostsGrid()
    } else {
        console.log(response.statusText) //statusText er 404 not found, 200 ok, 500 internal server error osv
        console.log(response.status) //status er 404, 200, 500 osv
    }
}

// Update an existing post - HTTP Method: DELETE
async function deletePost(id) {
    // DELETE fetch request
    const response = await fetch(`${endpoint}/posts/${id}.json`, {method: "DELETE"})
    //også fetch deleter, fetch bruges til alle http funktionre
    // check if response is ok - if the response is successful
    // update the post grid to display posts
    if (response.ok){
        await updatePostsGrid()
    } else {
        console.log(response.statusText) //statusText er 404 not found, 200 ok, 500 internal server error osv
        console.log(response.status) //status er 404, 200, 500 osv
    }
}

// Delete an existing post - HTTP Method: PUT
async function updatePost(id, title, body, image) {
    // post update to update
    const post = {title: title, body: body, image: image}

    const json = JSON.stringify(post)
    console.log(post)
    const response = await fetch(`${endpoint}/posts/${id}.json`, {method: "PUT", body: json})
    // convert the JS object to JSON string
    // PUT fetch request with JSON in the body. Calls the specific element in resource
    // check if response is ok - if the response is successful
    // update the post grid to display all posts and the new post
    if (response.ok){
        await updatePostsGrid()
    } else {
        console.log(response.statusText) //statusText er 404 not found, 200 ok, 500 internal server error osv
        console.log(response.status) //status er 404, 200, 500 osv
    } //den sagde fejl 401 unauthorized, det var fordi title var undefined og man må ikke
    //have at noget ikke har en værdi i databasen
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
