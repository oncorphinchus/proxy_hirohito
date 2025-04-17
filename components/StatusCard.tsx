'use client';

import { useState } from 'react';

interface StatusCardProps {
  title: string;
  value: number | string;
  unit?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
  icon?: React.ReactNode;
  isPercentage?: boolean;
  trend?: {
    value: string | number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export default function StatusCard({
  title,
  value,
  unit = '',
  color,
  icon,
  isPercentage = false,
  trend,
  className = '',
}: StatusCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get color classes based on the color prop
  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        progress: 'from-blue-400 to-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-100',
        progress: 'from-green-400 to-green-600'
      },
      yellow: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
        progress: 'from-amber-400 to-amber-600'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-100',
        progress: 'from-red-400 to-red-600'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-100',
        progress: 'from-indigo-400 to-indigo-600'
      }
    };
    
    return colors[color];
  };
  
  const colorClasses = getColorClasses();
  
  // Calculate percentage for progress bar
  const percentage = isPercentage ? Number(value) : 0;
  
  return (
    <div 
      className={`luxury-card fade-in-delay-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-1">{title}</h3>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${colorClasses.text}`}>
              {value}
            </span>
            {unit && <span className="ml-1 text-gray-500">{unit}</span>}
          </div>
          
          {trend && (
            <div className={`mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="flex items-center">
                {trend.isPositive ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-2 rounded-full ${colorClasses.bg} ${colorClasses.border} border transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            {icon}
          </div>
        )}
      </div>
      
      {isPercentage && (
        <div className="mt-4">
          <div className="progress-bar h-2">
            <div 
              className={`progress-value bg-gradient-to-r ${colorClasses.progress}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
} 