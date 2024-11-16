import React from 'react';
import '../Display.css';

function Display({ mood, imageUrl }) {
  return (
    <div className="result-display">
      <div className="message-container">
        <h3>{`Here's a picture for your ${mood} mood:`}</h3>
        <p>hope you enjoy :)</p>
      </div>
      <div className="image-container">
        <img src={imageUrl} alt={`for ${mood} mood`} className="unsplash-image" />
      </div>
    </div>
  );
}

export default Display;
