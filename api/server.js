// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = 4142;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./nfc_counter.db');

// Create table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS nfc_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT UNIQUE,
    scan_count INTEGER DEFAULT 0,
    last_scan DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API Routes
app.post('/api/scan/:cardId', (req, res) => {
  const cardId = req.params.cardId;
  
  db.get('SELECT * FROM nfc_scans WHERE card_id = ?', [cardId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      // Update existing card
      db.run('UPDATE nfc_scans SET scan_count = scan_count + 1, last_scan = CURRENT_TIMESTAMP WHERE card_id = ?', 
        [cardId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Update failed' });
          }
          res.json({ 
            cardId, 
            scanCount: row.scan_count + 1, 
            message: 'Scan recorded successfully!' 
          });
        });
    } else {
      // Create new card entry
      db.run('INSERT INTO nfc_scans (card_id, scan_count) VALUES (?, 1)', 
        [cardId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Insert failed' });
          }
          res.json({ 
            cardId, 
            scanCount: 1, 
            message: 'New card registered!' 
          });
        });
    }
  });
});

app.get('/api/stats/:cardId', (req, res) => {
  const cardId = req.params.cardId;
  
  db.get('SELECT * FROM nfc_scans WHERE card_id = ?', [cardId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      res.json({
        cardId: row.card_id,
        scanCount: row.scan_count,
        lastScan: row.last_scan,
        createdAt: row.created_at
      });
    } else {
      res.json({ cardId, scanCount: 0, message: 'Card not found' });
    }
  });
});

app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT card_id, scan_count, last_scan FROM nfc_scans ORDER BY scan_count DESC LIMIT 10', 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

app.listen(PORT, () => {
  console.log(`NFC Counter API running on port ${PORT}`);
});
