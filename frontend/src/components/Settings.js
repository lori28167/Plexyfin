import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { userAPI, libraryAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 30px;
  color: #fff;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  color: #fff;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
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

const InfoText = styled.p`
  color: #888;
  margin-top: 15px;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const StatCard = styled.div`
  background: rgba(102, 126, 234, 0.2);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #ccc;
  font-size: 14px;
`;

function Settings() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await userAPI.getProfile();
      setEmail(response.data.email);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await libraryAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const data = { email };
      if (newPassword) {
        data.currentPassword = currentPassword;
        data.newPassword = newPassword;
      }
      
      await userAPI.updateProfile(data);
      alert('Profile updated successfully');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Settings</Title>
      
      <Section>
        <SectionTitle>Library Statistics</SectionTitle>
        {stats && (
          <StatsGrid>
            {stats.library?.map(item => (
              <StatCard key={item.type}>
                <StatValue>{item.count}</StatValue>
                <StatLabel>{item.type === 'video' ? 'Videos' : 'Music'}</StatLabel>
              </StatCard>
            ))}
          </StatsGrid>
        )}
      </Section>
      
      <Section>
        <SectionTitle>Account Settings</SectionTitle>
        <form onSubmit={handleUpdateProfile}>
          <FormGroup>
            <Label>Username</Label>
            <Input type="text" value={user?.username || ''} disabled />
          </FormGroup>
          
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>
          
          <SectionTitle style={{ marginTop: '30px' }}>Change Password</SectionTitle>
          
          <FormGroup>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Section>
      
      <Section>
        <SectionTitle>About Plexyfin</SectionTitle>
        <InfoText>
          Plexyfin is a self-hosted media server that combines the best features of Jellyfin and Plex.
          It provides a beautiful interface for managing and streaming your personal media collection.
        </InfoText>
        <InfoText>Version 1.0.0</InfoText>
      </Section>
    </Container>
  );
}

export default Settings;
