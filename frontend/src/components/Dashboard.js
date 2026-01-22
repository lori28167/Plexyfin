import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { mediaAPI } from '../api/api';

const Container = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: #fff;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const MediaCard = styled.div`
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
`;

const Poster = styled.div`
  width: 100%;
  padding-top: 150%;
  background: ${props => props.$url ? `url(${props.$url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${props => props.$progress}%;
    background: #667eea;
  }
`;

const MediaInfo = styled.div`
  padding: 15px;
`;

const Title = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Year = styled.span`
  color: #888;
  font-size: 14px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 50px;
  color: #888;
`;

function Dashboard() {
  const [recentMedia, setRecentMedia] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recentResponse, continueResponse] = await Promise.all([
        mediaAPI.getAll({ limit: 12 }),
        mediaAPI.getRecent()
      ]);
      
      setRecentMedia(recentResponse.data);
      setContinueWatching(continueResponse.data.filter(m => m.progress > 0 && !m.completed));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = (id) => {
    navigate(`/player/${id}`);
  };

  if (loading) {
    return <Loading>Loading your media library...</Loading>;
  }

  return (
    <Container>
      {continueWatching.length > 0 && (
        <Section>
          <SectionTitle>Continue Watching</SectionTitle>
          <MediaGrid>
            {continueWatching.map(media => (
              <MediaCard key={media.id} onClick={() => handleMediaClick(media.id)}>
                <Poster $url={media.poster_url}>
                  {media.progress > 0 && <ProgressBar $progress={media.progress} />}
                </Poster>
                <MediaInfo>
                  <Title>{media.title}</Title>
                  <Year>{media.year}</Year>
                </MediaInfo>
              </MediaCard>
            ))}
          </MediaGrid>
        </Section>
      )}
      
      <Section>
        <SectionTitle>Recently Added</SectionTitle>
        <MediaGrid>
          {recentMedia.map(media => (
            <MediaCard key={media.id} onClick={() => handleMediaClick(media.id)}>
              <Poster $url={media.poster_url} />
              <MediaInfo>
                <Title>{media.title}</Title>
                <Year>{media.year}</Year>
              </MediaInfo>
            </MediaCard>
          ))}
        </MediaGrid>
      </Section>
    </Container>
  );
}

export default Dashboard;
