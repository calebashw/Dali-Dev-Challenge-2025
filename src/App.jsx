import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Display from './components/Display';
import SpotifyEmbed from './components/SpotifyEmbed';
import MoodSelector from './components/MoodSelector';

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private'
];

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;

function App() {
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  const imageRef = useRef(null);


  // Just to get rid of warning against not using player
  console.log(player);
  console.log(deviceId);
  console.log(playlist);

  useEffect(() => {
    // Extract access token from URL after redirect
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      setAccessToken(token);
      window.history.pushState('', document.title, window.location.pathname); // Remove token from URL
    }
  }, []);

  useEffect(() => {
    // Initialize the Spotify Web Playback SDK
    if (accessToken && !window.onSpotifyWebPlaybackSDKReady) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          const player = new window.Spotify.Player({
            name: 'Web Playback SDK Player',
            getOAuthToken: cb => { cb(accessToken); },
            volume: 0.5
          });

          setPlayer(player);

          player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            setDeviceId(device_id);
          });

          player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
          });

          player.connect();
        };
      };
    }
  }, [accessToken]);

  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  const fetchPlaylist = async (mood) => {
    if (!accessToken) return;
    try {
      // Fetch playlist matching the mood
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${mood}&type=playlist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Get playlist data as the first returned playlist from request
      const playlistData = response.data.playlists.items[0];
      return playlistData.id;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }
  };

  const fetchUnsplashImage = async (mood) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${mood}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      return response.data.urls.regular;
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
    }
  };

  const fetchMoodData = async () => {
    const image = await fetchUnsplashImage(mood);
    const playlistId = await fetchPlaylist(mood);
    setImageUrl(image);
    setPlaylistId(playlistId);
  
    // Try to automatically start playback
    if (deviceId && playlistId) {
      try {
        await axios({
          method: 'PUT',
          url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            context_uri: `spotify:playlist:${playlistId}`,
          },
        });
        console.log('Playback started');
      } catch (error) {
        console.error('Error starting playback:', error);
      }
    } else {
      console.error('Device ID or Playlist ID is missing.');
    }
  };

  useEffect(() => {
    if (imageUrl && imageRef.current) {
      console.log('imageRef.current:', imageRef.current); // Log the actual DOM element
      setTimeout(() => {
        imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1000);
    }
  }, [imageUrl]);

  return (
    <div className="app">
      <header>
        <h1>Spotify Playlist Recommender</h1>
        <p>Discover the perfect playlist for your mood</p>
      </header>
      {!accessToken ? (
        <div className="login-container">
          <button className="spotify-login" onClick={handleLogin}>
            Log in with Spotify
          </button>
        </div>
      ) : (
        <div className="mood-and-music-buttons">
          <MoodSelector setMood={setMood} />
          <button className="get-music-button" onClick={fetchMoodData}>
            Get music recommendations
          </button>
        </div>
      )}
      {playlistId && <SpotifyEmbed className="embedded-spotify" playlistId={playlistId} />}
      {imageUrl && (
        <div ref={imageRef}>
          <Display mood={mood} imageUrl={imageUrl} />
        </div>
      )}
      <footer>
        <p>Powered by Spotify & Unsplash</p>
      </footer>
    </div>
  );
}

export default App;
