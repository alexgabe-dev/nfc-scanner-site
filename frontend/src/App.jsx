import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Smartphone, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_BASE = '/api';

function App() {
  const [scanData, setScanData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cardId, setCardId] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    
    // Check URL parameters for NFC scan
    const urlParams = new URLSearchParams(window.location.search);
    const nfcId = urlParams.get('nfc');
    if (nfcId) {
      handleNFCScan(nfcId);
    }
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleNFCScan = async (id) => {
    setIsScanning(true);
    try {
      const response = await axios.post(`${API_BASE}/scan/${id}`);
      setScanData(response.data);
      fetchLeaderboard();
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualScan = () => {
    if (cardId.trim()) {
      handleNFCScan(cardId.trim());
      setCardId('');
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <motion.header 
          className="header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="logo">
            <Zap className="logo-icon" />
            <h1>NFC Counter</h1>
          </div>
          <p className="tagline">Track your NFC interactions with style</p>
        </motion.header>

        {/* Main Content */}
        <main className="main">
          {/* Scan Result */}
          <AnimatePresence>
            {scanData && (
              <motion.div
                className="scan-result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className="scan-icon">
                  <Smartphone />
                </div>
                <h2>Scan Successful!</h2>
                <div className="scan-details">
                  <p><strong>Card ID:</strong> {scanData.cardId}</p>
                  <p><strong>Total Scans:</strong> {scanData.scanCount}</p>
                  <p className="message">{scanData.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Scan Input */}
          <motion.div 
            className="manual-scan"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3>Manual Card Entry</h3>
            <div className="input-group">
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="Enter NFC Card ID"
                className="card-input"
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <button 
                onClick={handleManualScan}
                disabled={isScanning || !cardId.trim()}
                className="scan-button"
              >
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div 
            className="leaderboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="section-header">
              <TrendingUp className="section-icon" />
              <h3>Leaderboard</h3>
            </div>
            <div className="leaderboard-list">
              {leaderboard.map((item, index) => (
                <motion.div
                  key={item.card_id}
                  className={`leaderboard-item ${index === 0 ? 'top' : ''}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="rank">
                    {index === 0 ? <Award className="crown" /> : `#${index + 1}`}
                  </div>
                  <div className="card-info">
                    <span className="card-id">{item.card_id}</span>
                    <span className="scan-count">{item.scan_count} scans</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
