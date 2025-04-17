'use client';

import React from 'react';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

export default function InsightCardGrid({ insights }) {
  const isPositive = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numValue) && numValue > 0;
  };

  const isNegative = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numValue) && numValue < 0;
  };

  const getInsightIcon = (value) => {
    if (isPositive(value)) {
      return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    } else if (isNegative(value)) {
      return <TrendingDown className="h-5 w-5 text-rose-500" />;
    }
    return <BarChart2 className="h-5 w-5 text-slate-500" />;
  };

  const getCardStyle = (value) => {
    if (isPositive(value)) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    } else if (isNegative(value)) {
      return 'bg-rose-50 border-rose-200 text-rose-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-800';
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights && Object.entries(insights).length > 0 ? (
        Object.entries(insights).map(([key, value]) => (
          <div 
            key={key} 
            className={`p-3 rounded-lg border ${getCardStyle(value)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm sm:text-base">{key}</span>
              {getInsightIcon(value)}
            </div>
            <div className="text-xs sm:text-sm">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-500">No insights available</span>
        </div>
      )}
    </div>
  );
}