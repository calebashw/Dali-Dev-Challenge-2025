import React from 'react';

function MoodSelector({ setMood }) {
  return (
    <select defaultValue="" className="mood-selector" onChange={(e) => setMood(e.target.value)}>
      <option value="" disabled hidden>
        Select Mood
      </option>
      <option value="happy">Happy</option>
      <option value="sad">Sad</option>
      <option value="calm">Calm</option>
      <option value="romance">Romantic</option>
      <option value="angry">Angry</option>
      <option value="energetic">Energetic</option>
    </select>
  );
}

export default MoodSelector;
