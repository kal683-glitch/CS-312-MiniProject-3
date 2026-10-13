import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

let usersData = [{name: 1}];
let blogsData = [{yo: 'wsg'}];

let currUser = {};

let currEditPost = {};

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  //put in your own database and password here!
  database: "",
  password: "",
  port: 5432,
});

db.connect();

//Queries the database for the users and puts it into the usersData array.
async function updateUsersData() {
  const result = await db.query("SELECT * FROM users");
  let tempUsersData = [];
  result.rows.forEach((user) =>{
    tempUsersData.push(user)
  });
  usersData = tempUsersData;
}
//Queries the database for the blogs and puts it into the blogsData array. 
async function updateBlogsData(){
  const result = await db.query("SELECT * FROM blogs");
  let tempBlogsData = [];
  result.rows.forEach((user) =>{
    tempBlogsData.push(user)
  });
  blogsData = tempBlogsData;
}

//Adds the new post data to the postsArray
async function addPost (blogTitle, creationTime, blogBody){
   await db.query("INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, $5)", 
    [currUser.name, currUser.user_id, blogTitle, blogBody, creationTime]
  );
}

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', async (req, res) => {
  await updateBlogsData();
  await updateUsersData();
  res.render("signin.ejs");
});

//responds to the "submit" button in the form
app.post('/submit', async(req, res) => {
  let currDate = new Date();
  await addPost(req.body["blogTitle"], currDate, req.body["blogBody"]);
  await updateBlogsData();
  res.render("index.ejs", {postsArray: blogsData});
})

//responds to the "delete" button
app.post("/delete", async (req, res) =>{
  if (req.body.user_id === currUser.user_id){
    await db.query("DELETE FROM blogs WHERE title = $1", [req.body.cardTitle]);
    await updateBlogsData();
  }
  res.render("index.ejs", {postsArray: blogsData});
})

//responds to the "edit" button, opens up an input menu with the variable "editInput";
app.post("/edit", async (req, res) => {
  if(currUser.user_id === req.body.creator_user_id){
    currEditPost = {blog_id: req.body.blog_id, creator_name: req.body.creator_name, 
    creator_user_id: req.body.creator_user_id, title: req.body.title, 
    body: req.body.body, date_created: req.body.date_created};
    res.render("index.ejs", {postsArray: blogsData, currPost: currEditPost});
    console.log("win!");
  }else{
    res.render("index.ejs", {postsArray: blogsData});
    console.log("fail");
  }
})

//responds to when the "Submit" button is clicked in the edit input, calls the "editPost" function and re-renders
//the page
app.post("/editSubmit", async(req, res) => {
  await db.query("UPDATE blogs SET title = $1 WHERE blog_id = $2", [req.body.title, currEditPost.blog_id]);
  await db.query("UPDATE blogs SET body = $1 WHERE blog_id = $2", [req.body.body, currEditPost.blog_id]);
  await updateBlogsData();
  res.render("index.ejs", {postsArray: blogsData});
})

app.post("/signin", (req, res) =>{
  let user_id = req.body.user_id;
  let password = req.body.password;
  let foundUser = false;
  usersData.forEach(user =>{
    if(user.user_id === user_id){
      if(user.password === password){
        currUser = user;
        foundUser = true;
        console.log(currUser);
      }
    }
  });
  if (foundUser){
    res.render("index.ejs", {postsArray: blogsData});
  } else {
    res.render("signin.ejs", {note: "Wrong password or User ID. Try again!"});
  }
});

app.post("/gotosignup", (req, res) =>{
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  let user_id = req.body.user_id;
  let password = req.body.password;
  let username = req.body.username;
  let foundUser = false;
  usersData.forEach(user =>{
    if((user.user_id === user_id) || (user.username === username)){
      foundUser = true;
    }
  });
  if (foundUser){
    res.render("signup.ejs", {note: "Choose a different User ID or Username!"});
  } else{
    await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [user_id, password, username]);
    await updateUsersData();
    res.render("signin.ejs", {note: "Sign in with your new credentials!"});
  }
});

app.post("/gotosignin", (req, res) =>{
  res.render("signin.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});