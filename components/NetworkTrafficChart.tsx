'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ServerStats } from '../types';
import { formatBytes } from '../utils/formatBytes';
import { TooltipItem } from 'chart.js';

interface NetworkTrafficChartProps {
  historicalStats: ServerStats[];
}

export default function NetworkTrafficChart({ historicalStats }: NetworkTrafficChartProps) {
  const [derivedData, setDerivedData] = useState<{ time: string; rx: number; tx: number }[]>([]);
  const [chartLoaded, setChartLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (historicalStats.length < 2) return;

    // Sort by creation time to ensure correct order
    const sortedStats = [...historicalStats].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Calculate the difference between consecutive readings
    const derived = sortedStats.slice(1).map((stat, index) => {
      const prevStat = sortedStats[index];
      
      // Calculate time difference in seconds
      const currTime = new Date(stat.created_at).getTime();
      const prevTime = new Date(prevStat.created_at).getTime();
      const timeDiffSec = (currTime - prevTime) / 1000;
      
      // Calculate bytes per second
      const rxBps = timeDiffSec > 0 
        ? (stat.network_rx_bytes - prevStat.network_rx_bytes) / timeDiffSec 
        : 0;
      
      const txBps = timeDiffSec > 0 
        ? (stat.network_tx_bytes - prevStat.network_tx_bytes) / timeDiffSec 
        : 0;
      
      return {
        time: new Date(stat.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
        rx: rxBps,
        tx: txBps
      };
    });

    setDerivedData(derived);
    // Add a slight delay before showing chart for animation effect
    setTimeout(() => setChartLoaded(true), 300);
  }, [historicalStats]);

  if (derivedData.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-36 bg-gray-200 rounded"></div>
        </div>
        <p className="mt-4 text-gray-500">Not enough data to show network traffic rates</p>
      </div>
    );
  }

  const chartData = {
    labels: derivedData.map(d => d.time),
    datasets: [
      {
        label: 'Download',
        data: derivedData.map(d => d.rx),
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Upload',
        data: derivedData.map(d => d.tx),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatBytes(context.parsed.y) + '/s';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 10,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          callback: function(value: number) {
            return formatBytes(value) + '/s';
          },
          font: {
            size: 10,
          }
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  };

  return (
    <div className="py-2" style={{ height: '300px' }}>
      <div className={`transition-opacity duration-500 h-full ${chartLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
} 