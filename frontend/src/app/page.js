'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownResponse from '@/components/MarkdownResponse';
import InsightCardGrid from '@/components/InsightCardGrid'; 
import ChartSection from '@/components/ChartSection';
import NewsCardGrid from '@/components/NewsCardGrid';
import { Search, BarChart2, TrendingUp, ArrowRightCircle, XCircle, PanelRight } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = e.target.elements.message.value.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    e.target.reset();

    // Simulate API response (Replace with real API call)
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: userMessage })
      });
    
      if (!res.ok) throw new Error("Failed to fetch");
    
      const data = await res.json();
    
      setResponse(data);
      setHasReport(true);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Report generated. See analysis panel for detailed insights." }
      ]);
      setIsPanelExpanded(true);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Failed to fetch analysis. Please try again." }
      ]);
    }
  };

  const toggleAnalysisPanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-800">Stockie Talkie</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search stocks..." 
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors">
            My Watchlist
          </button>
          {hasReport && !isPanelExpanded && (
            <button 
              onClick={toggleAnalysisPanel} 
              className="bg-indigo-600 text-white p-2 rounded-md flex items-center space-x-1 hover:bg-indigo-700 transition-colors"
              title="Open Analysis Panel"
            >
              <PanelRight className="h-5 w-5" />
              <span className="hidden sm:inline">Analysis</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content - Flexible height with overflow */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Chat Panel - Centered by default, moves left when analysis is shown */}
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ x: 0 }}
          animate={{ 
            x: isPanelExpanded ? 0 : 0,
            width: isPanelExpanded ? '50%' : '100%'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Scrollable Chat Content */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-md p-4 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Fixed Chat Input */}
          <div className="border-t border-slate-200 bg-white p-4">
            <form onSubmit={handleSend} className="flex space-x-2">
              <input
                name="message"
                type="text"
                placeholder="Ask about a stock symbol (e.g., RELIANCE.BSE)"
                className="flex-1 text-black border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit" 
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ArrowRightCircle className="h-5 w-5" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Analysis Panel - Slides in from right */}
        <AnimatePresence>
          {isPanelExpanded && (
            <motion.div 
              className="w-2/3 bg-white border-l border-slate-200 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Fixed Panel Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
                  Analysis Report
                </h2>
                <button 
                  onClick={toggleAnalysisPanel}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Panel Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Markdown Response */}
                <section className="bg-slate-50 rounded-lg p-5">
                  <MarkdownResponse content={response?.chatResponse} />
                </section>

                {/* Insight Cards */}
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Key Insights</h3>
                  <InsightCardGrid insights={response?.insights} />
                </section>

                {/* Chart Section */}
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Technical Charts</h3>
                  <ChartSection charts={response?.charts} />
                </section>

                {/* News Section */}
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Recent News</h3>
                  <NewsCardGrid news={response?.news} />
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State (when no report and chat is centered) */}
        {!isPanelExpanded && !messages.length && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 max-w-md">
              <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Stock Analysis Assistant</h2>
              <p className="text-slate-500">
                Ask a question about any stock to get detailed analysis, technical indicators, and recent news.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}