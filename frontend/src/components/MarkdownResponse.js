'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';

export default function MarkdownResponse({ content }) {
  if (!content) {
    return null;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-indigo-600" />
        <h3 className="font-medium text-black">Summary Report</h3>
      </div>
      <div className="p-4 prose prose-slate prose-sm max-w-none text-slate-600">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}