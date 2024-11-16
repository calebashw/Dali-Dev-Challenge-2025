import './App.css';
import React, { useState, useEffect } from 'react';
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


  // Just to get rid of warning against not using player
  console.log(player)

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

  // const fetchPlaylist = async (mood) => {
  //   if (!accessToken) return;
  //   try {
  //     // Fetch playlist matching the mood
  //     const playlistResponse = await axios.get(
  //       `https://api.spotify.com/v1/search?q=${mood}&type=playlist&limit=1`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
  //     const playlistData = playlistResponse.data.playlists.items[0];
  
  //     // Fetch tracks for the selected playlist
  //     const tracksResponse = await axios.get(
  //       `https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
  
  //     return {
  //       ...playlistData,
  //       tracks: tracksResponse.data.items.map((item) => ({
  //         id: item.track.id,
  //         name: item.track.name,
  //         artist: item.track.artists[0]?.name,
  //         album: item.track.album.name,
  //         uri: item.track.uri,
  //       })),
  //     };
  //   } catch (error) {
  //     console.error('Error fetching playlist or tracks:', error);
  //   }
  // };

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
      const playlistData = response.data.playlists.items[0]; // Get the first playlist result
      return playlistData.id; // Return the playlist ID
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
    const playlistData = await fetchPlaylist(mood);
    const image = await fetchUnsplashImage(mood);
    const playlistId = await fetchPlaylist(mood); // Fetch playlist ID based on mood
    setPlaylistId(playlistId);
    setPlaylist({
      ...playlistData,
      cover: image, // Include Unsplash image if you want
    });
  };
  

  const playTrack = async (uri) => {
    if (!deviceId || !uri) return;
    try {
      await axios({
        method: 'PUT',
        url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          uris: [uri], // Play a single track
        },
      });
      console.log(`Playing track: ${uri}`);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const playPlaylist = async () => {
    if (!deviceId || !playlist) return;
    try {
      await axios({
        method: 'PUT',
        url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          context_uri: playlist.uri,
        },
      });
      console.log('Playback started');
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  return (
    <div className="app">
      <h1>Spotify Playlist Recommender</h1>
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
    </div>
  );
}

export default App;
