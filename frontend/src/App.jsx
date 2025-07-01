import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Smartphone, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import '@/index.css';

const API_BASE = '/api';

function App() {
  const [scanData, setScanData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cardId, setCardId] = useState('');

  useEffect(() => {
    fetchLeaderboard();
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 flex flex-col items-center justify-center p-4">
      <motion.header 
        className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2 mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <Zap className="text-primary w-8 h-8 animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">NFC Counter</h1>
        </div>
        <p className="text-muted-foreground text-lg">Track your NFC interactions with style</p>
      </motion.header>

      <main className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <AnimatePresence>
          {scanData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-4 shadow-lg border-primary/30 animate-in fade-in zoom-in-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Smartphone className="text-primary w-6 h-6" />
                  <CardTitle>Scan Successful!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Card ID: <span className="font-mono text-primary">{scanData.cardId}</span></span>
                    <span className="font-semibold">Total Scans: <span className="text-primary">{scanData.scanCount}</span></span>
                    <span className="italic text-muted-foreground">{scanData.message}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-4 shadow-md">
            <CardHeader>
              <CardTitle>Manual Card Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Input
                  type="text"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  placeholder="Enter NFC Card ID"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                  disabled={isScanning}
                />
                <Button
                  onClick={handleManualScan}
                  disabled={isScanning || !cardId.trim()}
                  className="w-full sm:w-auto"
                >
                  {isScanning ? 'Scanning...' : 'Scan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="text-primary w-6 h-6" />
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {leaderboard.length === 0 && (
                  <span className="text-muted-foreground">No scans yet.</span>
                )}
                {leaderboard.map((item, index) => (
                  <motion.div
                    key={item.card_id}
                    className={`flex items-center gap-4 p-2 rounded-lg transition-all ${index === 0 ? 'bg-primary/10 border border-primary/30 shadow' : 'hover:bg-muted/50'}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 min-w-[48px]">
                      {index === 0 ? (
                        <Award className="text-yellow-500 w-6 h-6 animate-bounce" />
                      ) : (
                        <span className="font-bold text-lg w-8 text-center">#{index + 1}</span>
                      )}
                    </div>
                    <Avatar>
                      <AvatarFallback>{item.card_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-mono text-sm flex-1">{item.card_id}</span>
                    <span className="font-semibold text-primary">{item.scan_count} scans</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
