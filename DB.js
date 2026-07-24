require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'process.env.DB_PASSWORD', 
    database: 'sih',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('--- DATABASE CONNECTION ERROR ---');
        console.error(err.message);
        return;
    }
    console.log('Successfully connected to MySQL database!');
});

function calculateStatus(age_months, weight_kg) {
    if (!weight_kg) return 'Normal'; 
    const expectedWeight = (age_months * 0.2) + 4; 
    
    if (weight_kg < expectedWeight * 0.7) return 'SAM';
    if (weight_kg < expectedWeight * 0.85) return 'MAM';
    if (weight_kg < expectedWeight * 0.95) return 'Underweight';
    return 'Normal';
}

app.get('/api/measurements', (req, res) => {
    connection.query(
        'SELECT * FROM growth_measurements ORDER BY visit_date DESC',
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Database error' });
            } else {
                res.json(results);
            }
        }
    );
});

app.post('/api/measurements', (req, res) => {
    let { record_id, child_name, age_months, weight_kg, height_cm } = req.body;

    record_id = record_id ? record_id.trim().toUpperCase() : '';
    child_name = child_name ? child_name.trim() : '';

    if (!record_id || !record_id.startsWith('REC')) {
        return res.status(400).json({ error: 'Record ID must start with REC followed by numbers.' });
    }
    
    if (!child_name || child_name.length < 2) {
        return res.status(400).json({ error: 'Child Name must be at least 2 characters.' });
    }
    
    if (age_months === undefined || age_months < 0 || age_months > 72) {
        return res.status(400).json({ error: 'Age must be between 0 and 72 months.' });
    }
    
    if (weight_kg !== null && (weight_kg <= 0 || weight_kg > 40)) {
        return res.status(400).json({ error: 'Weight must be a realistic positive value.' });
    }

    const calculatedStatus = calculateStatus(age_months, weight_kg);
    const visit_date = new Date().toISOString().split('T')[0]; 

    const checkQuery = 'SELECT record_id FROM growth_measurements WHERE record_id = ?';
    
    connection.query(checkQuery, [record_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database verification failed.' });

        if (results.length > 0) {
            const updateQuery = `
                UPDATE growth_measurements 
                SET child_name = ?, age_months = ?, weight_kg = ?, height_cm = ?, status = ?, visit_date = ?
                WHERE record_id = ?
            `;
            connection.query(
                updateQuery,
                [child_name, age_months, weight_kg, height_cm, calculatedStatus, visit_date, record_id],
                (error) => {
                    if (error) return res.status(500).json({ error: 'Failed to update record.' });
                    res.json({ success: true, message: 'Record updated successfully.' });
                }
            );
        } else {
            const insertQuery = `
                INSERT INTO growth_measurements (record_id, child_name, age_months, visit_date, weight_kg, height_cm, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            connection.query(
                insertQuery,
                [record_id, child_name, age_months, visit_date, weight_kg, height_cm, calculatedStatus],
                (error) => {
                    if (error) return res.status(500).json({ error: 'Failed to insert record.' });
                    res.json({ success: true, message: 'Record added successfully.' });
                }
            );
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});