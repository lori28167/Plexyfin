const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { allQuery, getQuery, runQuery } = require('../db/database');
const router = express.Router();

// Get all media
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, search, genre, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM media WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR overview LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (genre) {
      query += ' AND genre LIKE ?';
      params.push(`%${genre}%`);
    }
    
    query += ' ORDER BY added_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const media = await allQuery(query, params);
    
    // Get watch progress for user
    const mediaWithProgress = await Promise.all(
      media.map(async (item) => {
        const progress = await getQuery(
          'SELECT progress, completed FROM watch_history WHERE user_id = ? AND media_id = ?',
          [req.user.id, item.id]
        );
        return {
          ...item,
          progress: progress ? progress.progress : 0,
          completed: progress ? progress.completed : false
        };
      })
    );
    
    res.json(mediaWithProgress);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Get single media item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const media = await getQuery('SELECT * FROM media WHERE id = ?', [req.params.id]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Get watch progress
    const progress = await getQuery(
      'SELECT progress, completed, last_watched FROM watch_history WHERE user_id = ? AND media_id = ?',
      [req.user.id, media.id]
    );
    
    res.json({
      ...media,
      progress: progress ? progress.progress : 0,
      completed: progress ? progress.completed : false,
      lastWatched: progress ? progress.last_watched : null
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Update watch progress
router.post('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const mediaId = req.params.id;
    
    // Check if record exists
    const existing = await getQuery(
      'SELECT id FROM watch_history WHERE user_id = ? AND media_id = ?',
      [req.user.id, mediaId]
    );
    
    if (existing) {
      await runQuery(
        'UPDATE watch_history SET progress = ?, completed = ?, last_watched = CURRENT_TIMESTAMP WHERE user_id = ? AND media_id = ?',
        [progress, completed ? 1 : 0, req.user.id, mediaId]
      );
    } else {
      await runQuery(
        'INSERT INTO watch_history (user_id, media_id, progress, completed) VALUES (?, ?, ?, ?)',
        [req.user.id, mediaId, progress, completed ? 1 : 0]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get recently watched
router.get('/history/recent', authenticateToken, async (req, res) => {
  try {
    const history = await allQuery(`
      SELECT m.*, wh.progress, wh.completed, wh.last_watched
      FROM watch_history wh
      JOIN media m ON wh.media_id = m.id
      WHERE wh.user_id = ?
      ORDER BY wh.last_watched DESC
      LIMIT 20
    `, [req.user.id]);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
