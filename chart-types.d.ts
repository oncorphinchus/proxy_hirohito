import { ChartOptions } from 'chart.js';

declare module 'chart.js' {
  interface ScaleTypeRegistry {
    linear: {
      ticks: {
        callback: (value: number | string) => string;
      };
    };
  }
  
  // Relax the typing constraints for chart callbacks
  interface TooltipCallbacks {
    label: (context: any) => string | string[] | void | null;
  }
}

// This allows us to use any for Chart options
declare module 'react-chartjs-2' {
  interface LineProps {
    options?: any;
  }
} 