var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');


/* GET home page. */
router.get('/', function(req, res, next) {
    req.app.render('index', { title: 'Express' }, function(err, html) {
        if (err) return next(err);
        res.send(html);
    });
});

router.get('/register', (req, res) => {
    const role = req.query.role;

    if (role === 'applicant') {
        res.render('register-applicant'); // renders views/applicant.ejs
    } else if (role === 'employer') {
        res.render('register-employer'); // renders views/employer.ejs
    } else {
        res.redirect('/'); // or redirect somewhere
    }
});


const upload = multer({
    dest: path.join(__dirname, 'tmp/'),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/signup', upload.single('resume'), (req, res) => {
    const userData = req.body;
    const file = req.file;
    console.log(file);
    if (!file) return res.status(400).send('Missing resume file');

    // Optional: Rename file to user email or name
    const ext = path.extname(file.originalname);
    const safeName = (userData.email || userData.name || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const newFileName = `${safeName}_${Date.now()}${ext}`;
    const newFilePath = path.join(__dirname, 'tmp/', newFileName);

    fs.rename(file.path, newFilePath, (err) => {
        if (err) return res.status(500).send('File save failed');

        // Insert into SQLite database
        const sql = `INSERT INTO applicants (
            name, email, password, phone, country, education, field,
            gpa, github, linkedin, motivation, work_ethic, life_goals,
            lessons, experience, resume_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            userData.name,
            userData.email,
            userData.password,
            userData.phone,
            userData.country,
            userData.education,
            userData.field,
            userData.gpa,
            userData.github,
            userData.linkedin,
            userData.motivation,
            userData['work-ethic'],
            userData['life-goals'],
            userData.lessons,
            userData.experience,
            newFilePath
        ];

        db.run(sql, values, function(dbErr) {
            if (dbErr) {
                console.error('Database error:', dbErr);
                if (dbErr.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }
            }

            console.log('New user signed up:');
            console.log({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                resumePath: newFilePath,
                applicantId: this.lastID
            });
            console.log(userData);

            res.status(200).json({
                message: 'Signup complete',
                applicantId: this.lastID
            });
        });
    });
});


router.post('/signup-employer', upload.none(), (req, res) => {
    // Debug: log the request body to see what's being received
    console.log('Request body:', req.body);

    const sql = `INSERT INTO employers (
        name, email, phone, position, country, company, field,
        company_site, headquarters, hiring_location, company_culture,
        company_atmosphere, company_direction, software_lessons, general_experience
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.position,
        req.body.country,
        req.body.company,
        req.body.field,
        req.body['company-site'],
        req.body.headquarters,
        req.body['hiring-location'],
        req.body['company-culture'],
        req.body['company-atmosphere'],
        req.body['company-direction'],
        req.body['software-lessons'],
        req.body['general-experience']
    ];

    // Debug: log the values array
    console.log('Values to insert:', values);

    db.run(sql, values, function(err) {
        if (err) {
            console.error('Database error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
        } else {
            console.log('Employer created with ID:', this.lastID);
            res.json({
                success: true,
                message: 'Employer signup successful!',
                employerId: this.lastID
            });
        }
    });
});

module.exports = router;
