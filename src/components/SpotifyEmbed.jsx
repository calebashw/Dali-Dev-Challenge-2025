import React from 'react';

function SpotifyEmbed({ playlistId }) {
  return (
    <div className="spotify-embed-container" style={{ width: '100%', minHeight: '360px' }}>
      <iframe
        title="Spotify Playlist Embed"
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
        width="100%"
        height="200%"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

export default SpotifyEmbed;
