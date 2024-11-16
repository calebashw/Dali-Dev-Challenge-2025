// src/components/MoodSelector.js

import React from 'react';

function MoodSelector({ setMood }) {
  return (
    <select className="mood-selector" onChange={(e) => setMood(e.target.value)}>
      <option value="">Select Mood</option>
      <option value="happy">Happy</option>
      <option value="sad">Sad</option>
      <option value="calm">Calm</option>
      <option value="angry">Angry</option>
      <option value="energetic">Energetic</option>
    </select>
  );
}

export default MoodSelector;
