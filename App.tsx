import React, { useState, useRef, useCallback } from 'react';
import type { WebGLRenderer } from 'three';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import type { VisualizerSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<VisualizerSettings>({
    colorA: '#ff0070',
    colorB: '#007bff',
    motion: 0.2,
    distortion: 0.4,
    grain: 0.1,
    chromaticAberration: 0.005,
  });

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const glRendererRef = useRef<WebGLRenderer | null>(null);

  const handleExport = useCallback(() => {
    const renderer = glRendererRef.current;
    if (renderer) {
      const link = document.createElement('a');
      link.setAttribute('download', 'abstract-visualizer.png');
      renderer.domElement.toBlob((blob) => {
        if (blob) {
          const href = URL.createObjectURL(blob);
          link.setAttribute('href', href);
          link.click();
          URL.revokeObjectURL(href);
        }
      });
    }
  }, []);
  
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white">
      <Visualizer settings={settings} setRendererRef={glRendererRef} />
      
      <div 
        className={`absolute top-0 right-0 h-full bg-gray-900/50 backdrop-blur-md transition-transform duration-300 ease-in-out z-10 ${isControlsVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '320px' }}
      >
        <Controls
          settings={settings}
          setSettings={setSettings}
          onExport={handleExport}
          onToggleVisibility={() => setIsControlsVisible(false)}
        />
      </div>

      <button 
        onClick={() => setIsControlsVisible(true)}
        className={`absolute top-4 right-4 z-20 p-2 rounded-full bg-indigo-600/50 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out ${isControlsVisible ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        aria-label="Show controls"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

export default App;
