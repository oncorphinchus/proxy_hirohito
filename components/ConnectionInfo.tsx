'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ConnectionInfoProps {
  className?: string;
}

export default function ConnectionInfo({ className = '' }: ConnectionInfoProps) {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);
  const [dbInfo, setDbInfo] = useState<{
    host?: string;
    project?: string;
    latency?: number;
  }>({});
  
  // Check connection status
  const checkConnection = async () => {
    const startTime = performance.now();
    try {
      // Ping the Supabase API
      const { error } = await supabase
        .from('server_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      // Calculate ping time
      const endTime = performance.now();
      const pingTime = Math.round(endTime - startTime);
      
      setConnectionStatus('online');
      setLastPingTime(pingTime);
      
      // Extract project info from the URL
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const host = new URL(url).hostname;
      const project = host.split('.')[0];
      
      setDbInfo({
        host,
        project,
        latency: pingTime
      });
      
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus('offline');
    }
  };
  
  useEffect(() => {
    // Check connection immediately
    checkConnection();
    
    // Set up regular ping
    const interval = setInterval(() => {
      checkConnection();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`luxury-card fade-in ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
        Connection Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-3">
            <span className="text-sm text-gray-600 block mb-1">Status</span>
            <div className="flex items-center">
              {connectionStatus === 'online' ? (
                <>
                  <span className="status-active w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="font-medium text-green-700">Connected</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="font-medium text-red-700">Disconnected</span>
                </>
              )}
            </div>
          </div>
          
          {lastPingTime && (
            <div className="mb-3">
              <span className="text-sm text-gray-600 block mb-1">Latency</span>
              <span className={`font-medium ${lastPingTime < 100 ? 'text-green-700' : lastPingTime < 300 ? 'text-yellow-700' : 'text-red-700'}`}>
                {lastPingTime} ms
              </span>
            </div>
          )}
        </div>
        
        <div>
          {dbInfo.project && (
            <div className="mb-3">
              <span className="text-sm text-gray-600 block mb-1">Project</span>
              <span className="font-medium text-indigo-700">{dbInfo.project}</span>
            </div>
          )}
          
          {dbInfo.host && (
            <div className="mb-3">
              <span className="text-sm text-gray-600 block mb-1">Database Host</span>
              <span className="font-medium text-gray-900">{dbInfo.host}</span>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={checkConnection}
        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Test Connection
      </button>
    </div>
  );
} 