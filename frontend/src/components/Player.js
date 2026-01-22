import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { mediaAPI, streamAPI } from '../api/api';

const Container = styled.div`
  background: #000;
  min-height: 100vh;
  padding: 20px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
`;

const MediaInfo = styled.div`
  max-width: 1400px;
  margin: 30px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 15px;
  color: #fff;
`;

const Details = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #888;
  font-size: 16px;
`;

const Overview = styled.p`
  color: #ccc;
  line-height: 1.6;
  font-size: 16px;
`;

const QualitySelector = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const QualityButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$active ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
  color: #888;
`;

function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState('direct');
  const [playing, setPlaying] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);

  useEffect(() => {
    loadMedia();
    
    return () => {
      // Save progress on unmount
      if (lastProgress > 0 && media) {
        saveProgress(lastProgress);
      }
    };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && media) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          setLastProgress(progress);
          
          // Auto-save progress every 30 seconds
          if (Math.floor(currentTime) % 30 === 0) {
            saveProgress(progress);
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [media]);

  const loadMedia = async () => {
    try {
      const response = await mediaAPI.getById(id);
      setMedia(response.data);
      setLastProgress(response.data.progress || 0);
    } catch (error) {
      console.error('Error loading media:', error);
      alert('Failed to load media');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (progress) => {
    try {
      const completed = progress >= 95;
      await mediaAPI.updateProgress(id, Math.floor(progress), completed);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const getStreamUrl = () => {
    if (!media) return '';
    
    if (quality === 'direct') {
      return streamAPI.getDirectUrl(id);
    } else {
      return streamAPI.getTranscodeUrl(id, quality);
    }
  };

  const handleReady = () => {
    if (playerRef.current && lastProgress > 0 && lastProgress < 95) {
      const duration = playerRef.current.getDuration();
      const seekTo = (lastProgress / 100) * duration;
      playerRef.current.seekTo(seekTo);
    }
  };

  if (loading) {
    return <Loading>Loading media...</Loading>;
  }

  if (!media) {
    return <Loading>Media not found</Loading>;
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      
      <PlayerWrapper>
        <ReactPlayer
          ref={playerRef}
          url={getStreamUrl()}
          playing={playing}
          controls
          width="100%"
          height="auto"
          style={{ maxHeight: '80vh' }}
          onReady={handleReady}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </PlayerWrapper>
      
      <MediaInfo>
        <Title>{media.title}</Title>
        <Details>
          {media.year && <span>{media.year}</span>}
          {media.duration && <span>{Math.floor(media.duration / 60)} min</span>}
          {media.resolution && <span>{media.resolution}</span>}
          {media.rating && <span>⭐ {media.rating.toFixed(1)}</span>}
        </Details>
        {media.genre && <Details><span>Genre: {media.genre}</span></Details>}
        {media.overview && <Overview>{media.overview}</Overview>}
        
        <QualitySelector>
          <span style={{ color: '#888' }}>Quality:</span>
          <QualityButton 
            $active={quality === 'direct'} 
            onClick={() => setQuality('direct')}
          >
            Direct Play
          </QualityButton>
          <QualityButton 
            $active={quality === '720p'} 
            onClick={() => setQuality('720p')}
          >
            720p
          </QualityButton>
          <QualityButton 
            $active={quality === '1080p'} 
            onClick={() => setQuality('1080p')}
          >
            1080p
          </QualityButton>
        </QualitySelector>
      </MediaInfo>
    </Container>
  );
}

export default Player;
