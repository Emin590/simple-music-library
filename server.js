const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;
const pool = require("./db")

app.use(express.static("styles"));

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

// ---------- Routes ----------
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/library");
  res.render("index.ejs");
});

app.get("/add", (req, res) => {
  if (!req.session.user) return res.redirect("/"); // protect route
  res.render("add.ejs");
});

app.get("/library", async (req, res) => {
  const userId = req.session.user.id;

  const result = await pool.query(
    "SELECT title, artist FROM songs WHERE user_id = $1",
    [userId]
  );

  res.render("library.ejs", { songs: result.rows });
});

// ---------- Add Song ----------
app.post("/add", async (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const { title, artist } = req.body;
  const userId = req.session.user.id;

  try {
    await pool.query(
      "INSERT INTO songs (user_id, title, artist) VALUES ($1, $2, $3)",
      [userId, title, artist]
    );
    res.redirect("/library");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding song");
  }
});


// ---------- Register ----------
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    // Check if the user already exists
    const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.redirect("/"); // redirect to login page
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});


// ---------- Login ----------
app.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(400).send("User not found");

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    req.session.user = { id: user.id, username: user.username }; // store DB id
    res.redirect("/library");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});


// ---------- Logout ----------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ---------- Server ----------
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
