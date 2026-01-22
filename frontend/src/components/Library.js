import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { mediaAPI, libraryAPI } from '../api/api';

const Container = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #fff;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 16px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #888;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
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
`;

const MediaInfo = styled.div`
  padding: 15px;
`;

const MediaTitle = styled.h3`
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

function Library() {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, filter, search]);

  const loadMedia = async () => {
    try {
      const response = await mediaAPI.getAll({ limit: 1000 });
      setMedia(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];
    
    if (filter !== 'all') {
      filtered = filtered.filter(m => m.type === filter);
    }
    
    if (search) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredMedia(filtered);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await libraryAPI.scan();
      alert('Library scan started. This may take a few minutes.');
      setTimeout(loadMedia, 3000);
    } catch (error) {
      console.error('Error starting scan:', error);
      alert('Failed to start library scan');
    } finally {
      setScanning(false);
    }
  };

  const handleMediaClick = (id) => {
    navigate(`/player/${id}`);
  };

  if (loading) {
    return <Loading>Loading library...</Loading>;
  }

  return (
    <Container>
      <Header>
        <Title>Media Library</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Scan Library'}
          </Button>
        </Controls>
      </Header>
      
      <FilterButtons>
        <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({media.length})
        </FilterButton>
        <FilterButton $active={filter === 'video'} onClick={() => setFilter('video')}>
          Videos ({media.filter(m => m.type === 'video').length})
        </FilterButton>
        <FilterButton $active={filter === 'music'} onClick={() => setFilter('music')}>
          Music ({media.filter(m => m.type === 'music').length})
        </FilterButton>
      </FilterButtons>
      
      <MediaGrid>
        {filteredMedia.map(item => (
          <MediaCard key={item.id} onClick={() => handleMediaClick(item.id)}>
            <Poster $url={item.poster_url} />
            <MediaInfo>
              <MediaTitle>{item.title}</MediaTitle>
              <Year>{item.year}</Year>
            </MediaInfo>
          </MediaCard>
        ))}
      </MediaGrid>
      
      {filteredMedia.length === 0 && (
        <Loading>No media found. Try scanning your library.</Loading>
      )}
    </Container>
  );
}

export default Library;
