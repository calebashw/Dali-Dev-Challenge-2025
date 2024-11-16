import React from 'react';
import '../Display.css';

function Display({ playlist, playTrack }) {
  return (
    <div className="result-display">
      <div className="image-container">
        <img src={playlist.images[0]?.url} alt={playlist.name} className="playlist-cover" />
      </div>
      <div className="music-container">
        <h3>Recommended Playlist:</h3>
        <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
          {playlist.name}
        </a>
      </div>
      <div className="tracks-container">
        <h4>Tracks:</h4>
        <ul>
          {playlist.tracks.map((track) => (
            <li key={track.id} className="track">
              <div className="track-info">
                <span>
                  <strong>{track.name}</strong> by {track.artist}
                </span>
              </div>
              <button onClick={() => playTrack(track.uri)} className="play-button">
                Play
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Display;
