import React, { useEffect } from 'react';
import UPSCTracker from './components/UPSCTracker';
import { Capacitor } from '@capacitor/core';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';
import './index.css';

function App() {
  useEffect(() => {
    // Only run this native code if we are on Android/iOS, not in the web browser
    if (Capacitor.isNativePlatform()) {
      // Enables background execution
      BackgroundMode.enable();
      
      // Customizes the persistent Android notification required to stay alive
      BackgroundMode.setDefaults({
        title: 'UPSC HQ Tracker',
        text: 'Study session in progress...',
        icon: 'icon',
        color: '#F59E0B', 
        resume: true,
        hidden: false,
      });

      // ⚡ THIS IS THE NATIVE PERMISSION PROMPT ⚡
      // Asks the user to exempt your app from Android's battery optimizations
      BackgroundMode.disableBatteryOptimizations();
    }
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen">
      <UPSCTracker />
    </div>
  );
}

export default App;