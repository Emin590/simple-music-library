const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;

app.use(express.static('styles'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: "your-secret-key", // keep this safe!
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true if HTTPS
  })
);

// Simulated "database"
let users = [];

const songs = [
    { title: "", artist: "" },
];

app.get("/", (req, res) => {

    res.render("index.ejs");
});

app.get("/register", (req, res) => {

    res.render("register.ejs");
});

app.get("/add", (req, res) => {

    res.render("add.ejs");
});

app.get("/library", (req, res) => {

    res.render("library.ejs", {songs});
});

app.post("/add", (req, res) => {
    const { title, artist } = req.body;
    if (title && artist) {
        songs.push({ title, artist });
    }
    res.redirect("/library");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // check if user exists
  if (users.find((u) => u.username === username)) {
    return res.status(400).send("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });
  res.redirect("/");
});

app.post("/", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) return res.status(400).send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send("Invalid credentials");

  req.session.user = { username: user.username };
  res.render("library.ejs", {songs});
});

//delete navigation abr and add button on front page and make a ejs for the library and make the homepage into login page simply
//fix so you dont get same library for different users







app.listen(port, () =>{
    console.log(`Server is runnning on http://localhost:${port}`)
});