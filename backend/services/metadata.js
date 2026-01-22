const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchMetadata(title, year = null) {
  if (!TMDB_API_KEY) {
    return null; // No API key configured
  }
  
  try {
    // Search for movie/show
    const searchUrl = `${TMDB_BASE_URL}/search/multi`;
    const searchParams = {
      api_key: TMDB_API_KEY,
      query: title,
      year: year || undefined
    };
    
    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    
    if (searchResponse.data.results.length === 0) {
      return null;
    }
    
    const result = searchResponse.data.results[0];
    const mediaType = result.media_type; // 'movie' or 'tv'
    
    // Get detailed information
    const detailUrl = `${TMDB_BASE_URL}/${mediaType}/${result.id}`;
    const detailResponse = await axios.get(detailUrl, {
      params: { api_key: TMDB_API_KEY }
    });
    
    const details = detailResponse.data;
    
    return {
      title: details.title || details.name,
      year: details.release_date ? new Date(details.release_date).getFullYear() : 
            details.first_air_date ? new Date(details.first_air_date).getFullYear() : null,
      genre: details.genres?.map(g => g.name).join(', ') || null,
      rating: details.vote_average || null,
      overview: details.overview || null,
      posterUrl: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : null,
      backdropUrl: details.backdrop_path ? `${IMAGE_BASE_URL}${details.backdrop_path}` : null,
      tmdbId: details.id.toString(),
      imdbId: details.imdb_id || null
    };
    
  } catch (error) {
    console.error('Error fetching metadata:', error.message);
    return null;
  }
}

module.exports = {
  fetchMetadata
};
