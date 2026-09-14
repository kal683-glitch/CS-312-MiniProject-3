import express from 'express';
import bodyParser from 'body-parser';


const app = express();
const port = 3000;

const editInputForm = "<form action='/editSubmit' method='POST'><label for='author'>Author:</label><input type='text' name='author' value='<%= locals.currPost.creatorName %>'required><label for='blogTitle'>Title:</label><input type='text' name='blogTitle' value='<%= locals.currPost.blogTitle %>'required><label for='blogBody'>Body:</label><input type='text' name='blogBody' value='<%= locals.currPost.blogBody %>' required><input type='submit' value='Submit'></form>"

//Array logic for posts
let postsArray = [{
  blogTitle: "I'm a blog!",
  creatorName: "Kenji",
  creationTime: "August 19, 1975 23:15:30",
  blogBody: "Create a blog using the input forms above!"
},];

//Adds the new post data to the postsArray
function addPost (blogTitle, creatorName, creationTime, blogBody){
   let tempObj = {};
   tempObj.blogTitle = blogTitle;
   tempObj.creatorName = creatorName;
   tempObj.creationTime = creationTime;
   tempObj.blogBody = blogBody;
   postsArray.push(tempObj);
}

//Deletes a post from the postsArray, and returns the index of the now deleted post
function deletePost(blogTitle){
  const index = findPost(blogTitle);
  if (index !== -1){
    postsArray.splice(index, 1);
  }
  return index;
}

//Deletes the edited post and inserts a new post into where the post was. Needs the unedited post elements as parameters
//aswell as the edited elements.
function editPost(oldBlogTitle, blogTitle, creatorName, creationTime, blogBody){
  const index = deletePost(oldBlogTitle);
  if(index !== -1){
     let tempObj = {};
     tempObj.blogTitle = blogTitle;
     tempObj.creatorName = creatorName;
     tempObj.creationTime = creationTime;
     tempObj.blogBody = blogBody;
     postsArray.splice(index, 0, tempObj);
  }
}

//return the index of the post object in postsArray using the post's title
function findPost(blogTitle){
  //Creates a temporary array that contains the blog titles where all the spaces have been deleted,
  //aswell as a temporary title where the spaces are removed
  console.log(blogTitle);
  let tempArray = [];
  let tempBlogTitle = blogTitle.replace(/ /g, "");
  postsArray.forEach(blog => {
    tempArray.push(blog.blogTitle.replace(/ /g, ""));
  });
   //Tests the temporary array against the tempBlogTitle that have all had their whitespace removed,
   //and returns the resulting index.
  return(tempArray.findIndex(title => title === tempBlogTitle));
}

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.render("index.ejs", {postsArray: postsArray});
});

//responds to the "submit" button in the form
app.post('/submit', (req, res) => {
  let currDate = new Date();
  addPost(req.body["blogTitle"], req.body["author"], currDate, req.body["blogBody"]);
  res.render("index.ejs", {postsArray: postsArray});
})

//responds to the "delete" button
app.post("/delete", (req, res) =>{
  //console.log("deleteskies");
  deletePost(req.body.cardTitle);
  res.render("index.ejs", {postsArray: postsArray});
})

//responds to the "edit" button, opens up an input menu with the variable "editInput";
app.post("/edit", (req, res) => {
  //console.log("reg edit");
  const currCardTitle = req.body.cardTitle;
  const currCardIndex = findPost(currCardTitle);
  const currPost = postsArray[currCardIndex];
  res.render("index.ejs", {postsArray: postsArray, currPost: currPost});
})

//responds to when the "Submit" button is clicked in the edit input, calls the "editPost" function and re-renders
//the page
app.post("/editSubmit", (req, res) => {
  editPost(req.body.oldBlogTitle, req.body.blogTitle, req.body.author, req.body.blogTime, req.body.blogBody);
  res.render("index.ejs", {postsArray: postsArray});
  //console.log(postsArray);
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});