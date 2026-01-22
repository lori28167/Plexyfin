const express = require('express');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { authenticateToken } = require('../middleware/auth');
const { getQuery, runQuery } = require('../db/database');
const router = express.Router();

// Configure ffmpeg paths
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

// Direct stream (no transcoding)
router.get('/direct/:id', authenticateToken, async (req, res) => {
  try {
    const media = await getQuery('SELECT * FROM media WHERE id = ?', [req.params.id]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const filePath = media.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
    
    // Log streaming session
    await runQuery(
      'INSERT INTO sessions (user_id, media_id, device, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.id, media.id, req.headers['user-agent'], req.ip]
    );
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: 'Failed to stream media' });
  }
});

// Transcode stream
router.get('/transcode/:id', authenticateToken, async (req, res) => {
  try {
    const media = await getQuery('SELECT * FROM media WHERE id = ?', [req.params.id]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const filePath = media.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    const { quality = '720p', format = 'mp4' } = req.query;
    
    // Video bitrate based on quality
    const qualityMap = {
      '360p': { width: 640, height: 360, bitrate: '800k' },
      '480p': { width: 854, height: 480, bitrate: '1500k' },
      '720p': { width: 1280, height: 720, bitrate: '3000k' },
      '1080p': { width: 1920, height: 1080, bitrate: '5000k' }
    };
    
    const settings = qualityMap[quality] || qualityMap['720p'];
    
    res.contentType(`video/${format}`);
    
    ffmpeg(filePath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size(`${settings.width}x${settings.height}`)
      .videoBitrate(settings.bitrate)
      .audioBitrate('128k')
      .format(format)
      .on('start', (cmd) => {
        console.log('Started transcoding:', cmd);
      })
      .on('error', (err) => {
        console.error('Transcoding error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Transcoding failed' });
        }
      })
      .on('end', () => {
        console.log('Transcoding finished');
      })
      .pipe(res, { end: true });
      
  } catch (error) {
    console.error('Transcoding error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to transcode media' });
    }
  }
});

// Get subtitle tracks
router.get('/subtitles/:id', authenticateToken, async (req, res) => {
  try {
    const media = await getQuery('SELECT * FROM media WHERE id = ?', [req.params.id]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const filePath = media.file_path;
    const basePath = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    
    // Look for external subtitle files
    const subtitleExtensions = ['.srt', '.vtt', '.ass', '.ssa'];
    const subtitles = [];
    
    for (const ext of subtitleExtensions) {
      const subPath = path.join(basePath, baseName + ext);
      if (fs.existsSync(subPath)) {
        subtitles.push({
          language: 'unknown',
          format: ext.slice(1),
          path: subPath
        });
      }
    }
    
    res.json({ subtitles });
    
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    res.status(500).json({ error: 'Failed to fetch subtitles' });
  }
});

module.exports = router;
