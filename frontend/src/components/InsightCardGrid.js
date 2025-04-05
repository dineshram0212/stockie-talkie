// components/InsightCardGrid.js
'use client';

import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

export default function InsightCardGrid({ insights }) {
  // Function to determine icon based on insight key and value
  const getInsightIcon = (key, value) => {
    if (key === 'RSI' && value.toLowerCase().includes('overbought')) {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    } else if (key === 'MACD' && value.toLowerCase().includes('above')) {
      return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    } else if (key === 'Volume' && value.toLowerCase().includes('spike')) {
      return <BarChart2 className="h-5 w-5 text-indigo-500" />;
    } else if (value.toLowerCase().includes('down')) {
      return <TrendingDown className="h-5 w-5 text-rose-500" />;
    }
    return <TrendingUp className="h-5 w-5 text-slate-500" />;
  };

  // Function to determine card color based on insight value
  const getCardStyle = (value) => {
    if (value.toLowerCase().includes('bullish') || value.toLowerCase().includes('above')) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    } else if (value.toLowerCase().includes('bearish') || value.toLowerCase().includes('below')) {
      return 'bg-rose-50 border-rose-200 text-rose-800';
    } else if (value.toLowerCase().includes('overbought')) {
      return 'bg-amber-50 border-amber-200 text-amber-800';
    } else if (value.toLowerCase().includes('spike') || value.toLowerCase().includes('unusual')) {
      return 'bg-indigo-50 border-indigo-200 text-indigo-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-800';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {insights && Object.entries(insights).map(([key, value]) => (
        <div 
          key={key} 
          className={`p-4 rounded-lg border ${getCardStyle(value)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{key}</span>
            {getInsightIcon(key, value)}
          </div>
          <div className="text-sm">{value}</div>
        </div>
      ))}
    </div>
  );
}