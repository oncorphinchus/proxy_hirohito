'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ServerStats } from '../types';
import { formatBytes } from '../utils/formatBytes';
import dynamic from 'next/dynamic';
import StatusCard from './StatusCard';
import ConnectionInfo from './ConnectionInfo';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Dynamically import heavy components with loading
const NetworkTrafficChart = dynamic(() => import('./NetworkTrafficChart'), {
  loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-lg"></div>,
  ssr: false
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Component definition with icons
const CpuIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);
CpuIcon.displayName = 'CpuIcon';

const RamIcon = () => (
  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
RamIcon.displayName = 'RamIcon';

const DiskIcon = () => (
  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);
DiskIcon.displayName = 'DiskIcon';

export default function ServerMonitor() {
  const [currentStats, setCurrentStats] = useState<ServerStats | null>(null);
  const [historicalStats, setHistoricalStats] = useState<ServerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshAnimation, setRefreshAnimation] = useState<boolean>(false);
  // Use a ref for lastRefresh to avoid hydration mismatches
  const lastRefreshRef = useRef<Date>(new Date());
  const [lastRefreshString, setLastRefreshString] = useState<string>('');
  const dataFetchingInProgressRef = useRef<boolean>(false);

  // Format time from now - client-side only function
  const timeAgo = useCallback((date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }, []);

  const fetchLatestStats = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('server_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      setCurrentStats(data);
      lastRefreshRef.current = new Date();
    } catch (err: Error | unknown) {
      console.error("Error fetching latest stats:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch latest stats');
    }
  }, []);

  const fetchHistoricalStats = useCallback(async () => {
    try {
      // Limit to 50 points instead of 100 for better performance
      const { data, error: fetchError } = await supabase
        .from('server_stats')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;
      setHistoricalStats(data || []);
    } catch (err: Error | unknown) {
      console.error("Error fetching historical stats:", err);
    }
  }, []);

  const refreshData = useCallback(() => {
    if (dataFetchingInProgressRef.current) return;
    
    setRefreshAnimation(true);
    dataFetchingInProgressRef.current = true;
    setLoading(true);
    
    Promise.all([
      fetchLatestStats(),
      fetchHistoricalStats()
    ]).finally(() => {
      setLoading(false);
      dataFetchingInProgressRef.current = false;
      setTimeout(() => setRefreshAnimation(false), 1000);
    });
  }, [fetchLatestStats, fetchHistoricalStats]);

  // Update the time string on client side only
  useEffect(() => {
    const updateTimeString = () => {
      setLastRefreshString(timeAgo(lastRefreshRef.current));
    };

    // Initial update
    updateTimeString();
    
    // Update the time string every 10 seconds
    const interval = setInterval(updateTimeString, 10000);
    return () => clearInterval(interval);
  }, [timeAgo]);

  // Data fetch interval
  useEffect(() => {
    // Initial fetch
    refreshData();
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refreshData]);

  // Pre-calculate chart data only when historical stats change
  const chartData = useMemo(() => {
    if (!historicalStats.length) return null;
    
    const labels = historicalStats.map(stat => 
      new Date(stat.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'CPU Usage (%)',
          data: historicalStats.map(stat => stat.cpu_percent),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'RAM Usage (%)',
          data: historicalStats.map(stat => stat.ram_percent),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'Disk Usage (%)',
          data: historicalStats.map(stat => stat.disk_percent),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  }, [historicalStats]);
  
  // Memoized chart options
  const chartOptions = useMemo(() => {
    // @ts-ignore -- Chart.js typing issues with scales configuration
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
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
                label += context.parsed.y.toFixed(1) + '%';
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: number) {
              return value + '%';
            }
          }
        }
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      }
    };
  }, []);
  
  // Calculate trends only when necessary and cache results
  const calculateTrend = useCallback((current: number, dataKey: keyof ServerStats): { value: string; label: string; isPositive: boolean; } | undefined => {
    if (historicalStats.length > 1) {
      const previousValue = historicalStats[historicalStats.length - 2][dataKey] as number;
      if (previousValue === 0) return undefined;
      
      const change = ((current - previousValue) / previousValue) * 100;
      return {
        value: Math.abs(change).toFixed(1),
        label: 'since last check',
        isPositive: change >= 0
      };
    }
    return undefined;
  }, [historicalStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Server Dashboard</h1>
          <p className="text-gray-600">Monitor your Linode server performance and status</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          {!loading && lastRefreshString && (
            <span className="text-sm text-gray-500">
              Last updated: {lastRefreshString}
            </span>
          )}
          <button 
            onClick={refreshData}
            disabled={loading || dataFetchingInProgressRef.current}
            className={`
              px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm 
              hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-indigo-500 focus:ring-offset-2 
              transition-all duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed
              ${refreshAnimation ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-center">
              <svg 
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </div>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      <ConnectionInfo className="mb-4" />
      
      {loading && !currentStats ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : !currentStats ? (
        <div className="luxury-card py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-gray-500">Please make sure your monitoring script is running.</p>
          <div className="mt-6">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatusCard
              title="CPU Usage"
              value={currentStats.cpu_percent?.toFixed(1)}
              unit="%"
              color="blue"
              icon={<CpuIcon />}
              isPercentage={true}
              trend={calculateTrend(currentStats.cpu_percent, 'cpu_percent') || undefined}
            />
            
            <StatusCard
              title="RAM Usage"
              value={currentStats.ram_percent?.toFixed(1)}
              unit="%"
              color="green"
              icon={<RamIcon />}
              isPercentage={true}
              trend={calculateTrend(currentStats.ram_percent, 'ram_percent') || undefined}
            />
            
            <StatusCard
              title="Disk Usage"
              value={currentStats.disk_percent?.toFixed(1)}
              unit="%"
              color="yellow"
              icon={<DiskIcon />}
              isPercentage={true}
              trend={calculateTrend(currentStats.disk_percent, 'disk_percent') || undefined}
            />
            
            <div className="luxury-card">
              <h3 className="text-base font-medium text-gray-700 mb-1">Proxy Status</h3>
              <div className="flex items-center mt-2">
                {currentStats.proxy_active ? (
                  <>
                    <span className="status-active w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-xl font-medium text-green-700">Active</span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-xl font-medium text-red-700">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="luxury-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                Network Traffic
              </h3>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Download</span>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="text-2xl font-bold text-indigo-700">{formatBytes(currentStats.network_rx_bytes)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Upload</span>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-2xl font-bold text-indigo-700">{formatBytes(currentStats.network_tx_bytes)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="luxury-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                Server Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Server ID</span>
                  <span className="font-medium text-gray-900">{currentStats.id}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Last Reading</span>
                  <span className="font-medium text-gray-900">
                    {new Date(currentStats.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {historicalStats.length > 0 && (
            <div className="space-y-6">
              <div className="luxury-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                  Resource Usage History
                </h3>
                <div className="py-2">
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>
              </div>
              
              <div className="luxury-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                  Network Traffic History
                </h3>
                <NetworkTrafficChart historicalStats={historicalStats} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 