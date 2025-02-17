import React, { useState } from 'react';
import SequencerSection from './SequencerSection';
import PitchSection from './PitchSection';
import ModSection from './ModSection';
import VcoSection from './VcoSection';
import FilterSection from './FilterSection';
import AdsrSection from './AdsrSection';
import MasterSection from './MasterSection';
import TapeDelaySection from './TapeDelaySection';
import './TabSection.css';

const TabSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: 'SEQ',
      content: (
        <>
          <SequencerSection />
          <PitchSection />
        </>
      )
    },
    {
      name: 'MOD/VCO',
      content: (
        <>
          <ModSection />
          <VcoSection />
        </>
      )
    },
    {
      name: 'FILTER/ENV',
      content: (
        <>
          <FilterSection />
          <AdsrSection />
        </>
      )
    },
    {
      name: 'FX',
      content: (
        <>
        <TapeDelaySection />
          <MasterSection />
          
        </>
      )
    }
  ];

  return (
    <div className="tab-section">
      <div className="tab-buttons">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabSection;