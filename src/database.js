const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'db.sqlite');

// Create/connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables
db.serialize(() => {
    // Employers table
    db.run(`CREATE TABLE IF NOT EXISTS employers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        position TEXT,
        country TEXT,
        company TEXT,
        field TEXT,
        company_site TEXT,
        headquarters TEXT,
        hiring_location TEXT,
        company_culture TEXT,
        company_atmosphere TEXT,
        company_direction TEXT,
        software_lessons TEXT,
        general_experience TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Applicants table
    db.run(`CREATE TABLE IF NOT EXISTS applicants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        country TEXT,
        education TEXT,
        field TEXT,
        gpa TEXT,
        github TEXT,
        linkedin TEXT,
        motivation TEXT,
        work_ethic TEXT,
        life_goals TEXT,
        lessons TEXT,
        experience TEXT,
        resume_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Jobs stuf
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_skills TEXT NOT NULL,
        description TEXT NOT NULL,
        company TEXT NOT NULL,
        good_fits INTEGER DEFAULT 0,
        interested_applicants INTEGER DEFAULT 0,
        location TEXT,
        employer_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES employers (id)
    )`);
    
    console.log('Database tables created/verified');
});

module.exports = db;
