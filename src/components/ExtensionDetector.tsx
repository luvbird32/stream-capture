
import React, { useEffect, useState } from 'react';
import { ChromeExtensionService } from '../services/ChromeExtensionService';

interface ExtensionDetectorProps {
  children: React.ReactNode;
}

export const ExtensionDetector: React.FC<ExtensionDetectorProps> = ({ children }) => {
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    setIsExtension(ChromeExtensionService.isExtension());
  }, []);

  return (
    <div className={`${isExtension ? 'extension-mode' : 'webapp-mode'}`}>
      {isExtension && (
        <div className="bg-blue-500 text-white text-xs px-2 py-1 text-center">
          Running as Chrome Extension
        </div>
      )}
      {children}
    </div>
  );
};
