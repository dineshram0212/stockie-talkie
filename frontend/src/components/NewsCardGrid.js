'use client';

import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

export default function NewsCardGrid({ news }) {
  if (!news || news.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {news.map((article, idx) => (
        <a
          key={idx}
          href={article.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700">News</span>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-4">
            <h4 className="font-medium text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
              {article.title}
            </h4>
            <p className="text-slate-600 text-sm">{article.summary}</p>
          </div>
        </a>
      ))}
    </div>
  );
}