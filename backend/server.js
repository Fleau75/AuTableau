const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const PORT = 3000;

// Configurer CORS pour permettre les requêtes depuis le frontend
app.use(cors());

// Utilisation du JSON pour les requêtes POST
app.use(express.json());

// Configuration de la base de données SQLite
const db = new sqlite3.Database("./db.sqlite", (err) => {
    if (err)
        console.error("Erreur lors de l'ouverture de la base de données:", err);
    else console.log("Connecté à la base de données SQLite.");
});

// Création des tables si elles n'existent pas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        class_id INTEGER,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);
});

// Routes pour la gestion des classes
app.get("/classrooms", (req, res) => {
    db.all("SELECT * FROM classes", (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post("/classrooms", (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO classes (name) VALUES (?)", [name], function (err) {
        if (err) res.status(409).json({ error: "La classe existe déjà." });
        else res.status(201).json({ id: this.lastID, name });
    });
});

app.delete("/classrooms/:id", (req, res) => {
    const classId = req.params.id;
    db.run("DELETE FROM classes WHERE id = ?", [classId], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.status(204).end();
    });
});

// Routes pour la gestion des étudiants
app.get("/classrooms/:classroom_id/students", (req, res) => {
    const classroomId = req.params.classroom_id;
    db.all(
        "SELECT * FROM students WHERE class_id = ?",
        [classroomId],
        (err, rows) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json(rows);
        }
    );
});

app.post("/classrooms/:classroom_id/students", (req, res) => {
    const classroomId = req.params.classroom_id;
    const { name } = req.body;
    db.run(
        "INSERT INTO students (name, class_id) VALUES (?, ?)",
        [name, classroomId],
        function (err) {
            if (err)
                res.status(409).json({
                    error: "L'étudiant existe déjà dans cette classe.",
                });
            else res.status(201).json({ id: this.lastID, name });
        }
    );
});

app.delete("/classrooms/:classroom_id/students/:student_id", (req, res) => {
    const studentId = req.params.student_id;
    db.run("DELETE FROM students WHERE id = ?", [studentId], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.status(204).end();
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
