const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3000;

app.use(express.static('styles'));
app.use(bodyParser.urlencoded({ extended: true }));

const songs = [
    { title: "SONG1", artist: "artist1" },
    { title: "SONG2", artist: "artist2" },
    { title: "SONG3", artist: "artist3" }
];

app.get("/", (req, res) => {

    res.render("index.ejs", { songs });
});

app.get("/add", (req, res) => {

    res.render("add.ejs");
});

app.post("/add", (req, res) => {
    const { title, artist } = req.body;
    if (title && artist) {
        songs.push({ title, artist });
    }
    res.redirect("/");
});









app.listen(port, () =>{
    console.log(`Server is runnning on http://localhost:${port}`)
});