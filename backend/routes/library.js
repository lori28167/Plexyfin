const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { startLibraryScan, getScannedStats } = require('../services/scanner');
const router = express.Router();

// Trigger library scan
router.post('/scan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    startLibraryScan();
    res.json({ message: 'Library scan started' });
  } catch (error) {
    console.error('Error starting scan:', error);
    res.status(500).json({ error: 'Failed to start library scan' });
  }
});

// Get library stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getScannedStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get library stats' });
  }
});

module.exports = router;
