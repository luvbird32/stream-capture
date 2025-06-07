
import { OverlayDimensions, OverlayPosition } from './types';

export const getOverlayDimensions = (size: 'small' | 'medium' | 'large'): OverlayDimensions => {
  switch (size) {
    case 'small': return { width: 240, height: 180 };
    case 'medium': return { width: 320, height: 240 };
    case 'large': return { width: 400, height: 300 };
    default: return { width: 320, height: 240 };
  }
};

export const getOverlayPosition = (
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  width: number,
  height: number
): OverlayPosition => {
  const margin = 20;
  switch (position) {
    case 'top-left': return { x: margin, y: margin };
    case 'top-right': return { x: 1920 - width - margin, y: margin };
    case 'bottom-left': return { x: margin, y: 1080 - height - margin };
    case 'bottom-right': return { x: 1920 - width - margin, y: 1080 - height - margin };
    default: return { x: 1920 - width - margin, y: 1080 - height - margin };
  }
};
