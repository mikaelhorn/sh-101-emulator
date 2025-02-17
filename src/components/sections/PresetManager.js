import React, { useContext, useState } from 'react';
import { AudioContext } from '../../context/AudioContext';

const PresetManager = () => {
  const { presets, currentPreset, savePreset, loadPreset, deletePreset } = useContext(AudioContext);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (newPresetName.trim()) {
      savePreset(newPresetName.trim());
      setNewPresetName('');
    }
  };

  return (
    <div className="preset-manager">
      <h3>PRESETS</h3>
      <div className="preset-controls">
        <select 
          value={currentPreset} 
          onChange={(e) => loadPreset(e.target.value)}
        >
          {Object.keys(presets).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        
        <form onSubmit={handleSave} className="preset-save">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="New preset name"
          />
          <button type="submit">Save</button>
        </form>
        
        {currentPreset !== 'default' && (
          <button 
            onClick={() => deletePreset(currentPreset)}
            className="preset-delete"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PresetManager;