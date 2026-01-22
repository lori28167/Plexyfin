const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { runQuery, allQuery } = require('../db/database');
const { fetchMetadata } = require('./metadata');

let scanInProgress = false;
let scanStats = {
  totalFiles: 0,
  processedFiles: 0,
  newMedia: 0,
  errors: 0
};

const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
const audioExtensions = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'];

async function startLibraryScan() {
  if (scanInProgress) {
    console.log('Scan already in progress');
    return;
  }
  
  scanInProgress = true;
  scanStats = { totalFiles: 0, processedFiles: 0, newMedia: 0, errors: 0 };
  
  console.log('🔍 Starting library scan...');
  
  try {
    const mediaPaths = process.env.MEDIA_PATHS ? process.env.MEDIA_PATHS.split(',') : [];
    
    if (mediaPaths.length === 0) {
      console.log('⚠️  No media paths configured in MEDIA_PATHS');
      scanInProgress = false;
      return;
    }
    
    for (const mediaPath of mediaPaths) {
      const trimmedPath = mediaPath.trim();
      if (await fs.pathExists(trimmedPath)) {
        await scanDirectory(trimmedPath);
      } else {
        console.log(`⚠️  Path not found: ${trimmedPath}`);
      }
    }
    
    console.log('✅ Library scan completed!');
    console.log(`   Total: ${scanStats.totalFiles}, New: ${scanStats.newMedia}, Errors: ${scanStats.errors}`);
    
  } catch (error) {
    console.error('Error during library scan:', error);
  } finally {
    scanInProgress = false;
  }
}

async function scanDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        
        if (videoExtensions.includes(ext) || audioExtensions.includes(ext)) {
          scanStats.totalFiles++;
          await processMediaFile(fullPath, ext);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    scanStats.errors++;
  }
}

async function processMediaFile(filePath, ext) {
  try {
    // Check if file already exists in database
    const existing = await allQuery('SELECT id FROM media WHERE file_path = ?', [filePath]);
    
    if (existing.length > 0) {
      return; // Already in database
    }
    
    // Get file info
    const stats = await fs.stat(filePath);
    const mediaInfo = await getMediaInfo(filePath);
    
    const fileName = path.basename(filePath, ext);
    const folderPath = path.dirname(filePath);
    
    // Determine media type
    const type = videoExtensions.includes(ext) ? 'video' : 'music';
    
    // Try to extract year from filename
    const yearMatch = fileName.match(/\((\d{4})\)|\[(\d{4})\]|(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1] || yearMatch[2] || yearMatch[3]) : null;
    
    // Clean up title
    let title = fileName
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\d{4}/g, '')
      .replace(/[._]/g, ' ')
      .trim();
    
    // Try to fetch metadata
    let metadata = null;
    if (type === 'video') {
      metadata = await fetchMetadata(title, year);
    }
    
    // Insert into database
    await runQuery(`
      INSERT INTO media (
        title, type, file_path, folder_path, duration, size, codec, resolution,
        year, genre, rating, overview, poster_url, backdrop_url, tmdb_id, imdb_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      metadata?.title || title,
      type,
      filePath,
      folderPath,
      mediaInfo.duration || null,
      stats.size,
      mediaInfo.codec || null,
      mediaInfo.resolution || null,
      metadata?.year || year,
      metadata?.genre || null,
      metadata?.rating || null,
      metadata?.overview || null,
      metadata?.posterUrl || null,
      metadata?.backdropUrl || null,
      metadata?.tmdbId || null,
      metadata?.imdbId || null
    ]);
    
    scanStats.newMedia++;
    scanStats.processedFiles++;
    
    if (scanStats.processedFiles % 10 === 0) {
      console.log(`   Processed ${scanStats.processedFiles}/${scanStats.totalFiles} files...`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    scanStats.errors++;
  }
}

function getMediaInfo(filePath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        resolve({});
        return;
      }
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      resolve({
        duration: metadata.format.duration ? Math.floor(metadata.format.duration) : null,
        codec: videoStream?.codec_name || audioStream?.codec_name || null,
        resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null
      });
    });
  });
}

async function getScannedStats() {
  try {
    const totalMedia = await allQuery('SELECT COUNT(*) as count, type FROM media GROUP BY type');
    const recentlyAdded = await allQuery(
      'SELECT * FROM media ORDER BY added_at DESC LIMIT 10'
    );
    
    return {
      scanning: scanInProgress,
      scanProgress: scanStats,
      library: totalMedia,
      recentlyAdded
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { scanning: scanInProgress, scanProgress: scanStats };
  }
}

module.exports = {
  startLibraryScan,
  getScannedStats
};
