require("dotenv").config();
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./wellness.db');

// Create tables if not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        category TEXT,
        start_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        workout_type TEXT,
        duration INTEGER,
        calories INTEGER,
        workout_date TEXT,
        intensity TEXT,
        locations TEXT,
        rating INTEGER,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE VIEW IF NOT EXISTS user_workout_stats AS
SELECT 
    u.id AS user_id,
    u.name,
    COUNT(w.id) AS total_workouts,
    SUM(w.calories) AS total_calories,
    AVG(w.duration) AS avg_duration,
    MAX(w.workout_date) AS last_workout_date
FROM users u
LEFT JOIN workouts w ON u.id = w.user_id
GROUP BY u.id, u.name`);
});
app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [email, hash, name],
        function(err) {
            if (err) return res.status(400).json({ error: "User exists" });
            res.json({ success: true });
        }
    );
});

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    db.all(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (!rows || !rows.length)
                return res.status(401).json({ error: "Invalid login" });

            const user = rows[0];
            const ok = bcrypt.compareSync(password, user.password);

            if (!ok)
                return res.status(401).json({ error: "Invalid login" });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            res.json({
                token,
                name: user.name
            });
        }
    );
});

// ================= AUTH =================
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.sendStatus(401);

    const token = header.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) return res.sendStatus(403);
        req.userId = data.userId;
        next();
    });
}

// ================= DASHBOARD =================
app.get("/api/dashboard", auth, (req, res) => {
    db.all(
        "SELECT * FROM user_workout_stats WHERE user_id = ?",
        [req.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(rows[0] || {});
        }
    );
});

// ================= ADD WORKOUT =================
app.post("/api/workouts", auth, (req, res) => {
    const { workout_type, duration, calories, workout_date, intensity, locations, rating, notes } = req.body;
    
    db.run(
        "INSERT INTO workouts (user_id, workout_type, duration, calories, workout_date, intensity, locations, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.userId, workout_type, duration, calories, workout_date, intensity, JSON.stringify(locations || []), rating, notes],
        function(err) {
            if (err) return res.status(400).json({ error: "Failed to add workout" });
            res.json({ success: true });
        }
    );
});

app.listen(3000, () => {
    console.log("✅ Backend radi na http://localhost:3000");
});
