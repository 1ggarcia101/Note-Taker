const express = require("express");
const app = express();
const fs = require("fs");

const path = require("path");

const PORT = process.env.PORT || 3001;

var data;
var oldNotes;

const oldNotesFunc = () => {
  data = fs.readFileSync("./db/db.json");
  oldNotes = JSON.parse(data);
}
oldNotesFunc();

const uuid = require("./helpers/uuid");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


app.get("/notes", (req, res) => {
  let p = path.join(__dirname, "./public/notes.html");
  res.sendFile(p);
});

app.get("/api/notes", (req, res) => {
  oldNotesFunc();
  res.status(200).json(oldNotes);
});

app.get("*", (req, res) => {
  let p = path.join(__dirname, "./public/index.html");
  res.sendFile(p);
});


app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    oldNotes.push(newNote);
    fs.writeFileSync("./db/db.json", JSON.stringify(oldNotes, null, 4));

    res.json(newNote);
  } else {
    res.status(500).json("Missing title and/or text");
  }
});

app.delete("/api/notes/:id", (req, res) => {
  var id = req.params.id;

  const subtractedNotes = oldNotes.filter((oldNote) => {
    return oldNote.id != id;
  });

  fs.writeFileSync("./db/db.json", JSON.stringify(subtractedNotes, null, 4));
  res.json(subtractedNotes);
  console.log(`Note ${id} has been deleted.`)
});


app.listen(PORT, () =>
  console.log(`Express server listening on port ${PORT}.`)
);