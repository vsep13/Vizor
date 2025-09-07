import React from 'react';
import type { VisualizerSettings } from '../types';

interface ControlsProps {
  settings: VisualizerSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  onExport: () => void;
  onToggleVisibility: () => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; }> = ({ label, value, onChange, min, max, step }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
      <span className="text-sm text-gray-200 w-12 text-right">{value.toFixed(3)}</span>
    </div>
  </div>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="relative flex items-center">
        <input
            type="color"
            value={value}
            onChange={onChange}
            className="p-0 w-10 h-10 border-none bg-transparent appearance-none cursor-pointer"
        />
        <span className="ml-3 text-gray-200 uppercase">{value}</span>
    </div>
  </div>
);

const Controls: React.FC<ControlsProps> = ({ settings, setSettings, onExport, onToggleVisibility }) => {
  const handleChange = (key: keyof VisualizerSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Controls</h2>
        <button onClick={onToggleVisibility} className="p-2 text-gray-400 hover:text-white" aria-label="Hide controls">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <ColorPicker
          label="Color A"
          value={settings.colorA}
          onChange={(e) => handleChange('colorA', e.target.value)}
        />
        <ColorPicker
          label="Color B"
          value={settings.colorB}
          onChange={(e) => handleChange('colorB', e.target.value)}
        />
        <Slider
          label="Motion"
          value={settings.motion}
          onChange={(e) => handleChange('motion', parseFloat(e.target.value))}
          min={0}
          max={1}
          step={0.01}
        />
        <Slider
          label="Distortion"
          value={settings.distortion}
          onChange={(e) => handleChange('distortion', parseFloat(e.target.value))}
          min={0}
          max={2}
          step={0.01}
        />
        <Slider
          label="Grain"
          value={settings.grain}
          onChange={(e) => handleChange('grain', parseFloat(e.target.value))}
          min={0}
          max={0.5}
          step={0.005}
        />
        <Slider
          label="Chromatic Aberration"
          value={settings.chromaticAberration}
          onChange={(e) => handleChange('chromaticAberration', parseFloat(e.target.value))}
          min={0}
          max={0.05}
          step={0.001}
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={onExport}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
          Export PNG
        </button>
      </div>
    </div>
  );
};

export default Controls;
