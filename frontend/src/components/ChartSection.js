'use client';

import React from 'react';
import { LineChart, TrendingUp, BarChart2 } from 'lucide-react';

export default function ChartSection({ charts }) {
  // Determine which icon to use based on chart type
  const getChartIcon = (chartName) => {
    if (chartName.toLowerCase().includes('candlestick')) {
      return <BarChart2 className="h-6 w-6 text-indigo-500" />;
    }
    return <LineChart className="h-6 w-6 text-indigo-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts?.map((chart, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-slate-700">{chart.title}</span>
            {getChartIcon(chart.title)}
          </div>
          <div className="p-0 h-[400px]">
            <iframe
              src={`http://localhost:8000${chart.url}`}
              className="w-full h-full"
              frameBorder="0"
              title={`Chart-${i}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
