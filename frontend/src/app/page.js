'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownResponse from '@/components/MarkdownResponse';
import InsightCardGrid from '@/components/InsightCardGrid'; 
import ChartSection from '@/components/ChartSection';
import NewsCardGrid from '@/components/NewsCardGrid';
import TickerSearchBar from '@/components/TickerSearchBar';
import { BarChart2, TrendingUp, ArrowRightCircle, MessageSquare } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [reports, setReports] = useState([]);
  const [activeSymbol, setActiveSymbol] = useState(null); 

  const chatContainerRef = useRef(null);

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
  
    try {
      setMessages((prev) => [...prev, { sender: "bot", text: "Analyzing stock data..." }]);
      
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: userMessage })
      });
  
      if (!res.ok) throw new Error("Failed to fetch");
  
      const data = await res.json();
      
      const stockSymbol = data?.symbol && data.symbol !== "unknown" 
  
      setReports((prev) => {
        const existingIndex = prev.findIndex((r) => r.symbol === stockSymbol);``
        
        if (existingIndex >= 0) {
          const updatedReports = [...prev];
          updatedReports[existingIndex] = { 
            symbol: stockSymbol, 
            data: data,
            timestamp: new Date().toISOString()
          };
          return updatedReports;
        } else {
          return [...prev, { 
            symbol: stockSymbol, 
            data: data,
            timestamp: new Date().toISOString()
          }];
        }
      });
  
      setActiveSymbol(stockSymbol);
      
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop();
        newMessages.push({ sender: "bot", text: `Report generated for ${stockSymbol}` });
        return newMessages;
      });
      
      setIsChatVisible(true);
      
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop();
        newMessages.push({ sender: "bot", text: "Failed to fetch analysis. Please try again." });
        return newMessages;
      });
    }
  };

  const handleSendManual = (messageText) => {
    const fakeEvent = {
      preventDefault: () => {},
      target: {
        elements: {
          message: { value: messageText }
        },
        reset: () => {}
      }
    };
    handleSend(fakeEvent);
  };
  
  const toggleChatPanel = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-800">Stockie Talkie</h1>
        </div>
        <div className="flex items-center space-x-4 z-40">
          <TickerSearchBar onSelect={(symbol) => {
            handleSendManual(`Give me a detailed analysis and news of ${symbol}`);
          }} />

          <button 
            onClick={toggleChatPanel} 
            className="bg-indigo-600 text-white p-2 rounded-md flex items-center space-x-1 hover:bg-indigo-700 transition-colors"
            title={isChatVisible ? "Hide Chat" : "Show Chat"}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden sm:inline">{isChatVisible ? "Hide Chat" : "Show Chat"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex relative overflow-hidden">
        <AnimatePresence>
          {isChatVisible && (
            <motion.div 
              className="flex flex-col border-r border-slate-200"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '40%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
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
                
                {!messages.length && (
                  <div className="h-full flex items-center justify-center">
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
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <form onSubmit={handleSend} className="flex space-x-2">
                  <input
                    name="message"
                    type="text"
                    placeholder="Ask about a stock symbol (e.g., AAPL or RELIANCE.BSE)"
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
          )}
        </AnimatePresence>

        <motion.div 
          className="bg-white overflow-y-auto flex flex-col"
          animate={{ 
            width: isChatVisible ? '60%' : '100%'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10 overflow-x-auto">
            {reports.length > 0 ? (
              reports.map((r) => (
                <button 
                  key={r.symbol} 
                  onClick={() => setActiveSymbol(r.symbol)}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${
                    r.symbol === activeSymbol ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {r.symbol}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-500">No reports generated yet</div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeSymbol && reports.find(r => r.symbol === activeSymbol) ? (
              <div className="p-6 space-y-8">
                <section className="bg-slate-50 rounded-lg p-5">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">{activeSymbol} Analysis</h2>
                  <MarkdownResponse content={reports.find(r => r.symbol === activeSymbol).data.chatResponse} />
                </section>
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Key Insights</h3>
                  <InsightCardGrid insights={reports.find(r => r.symbol === activeSymbol).data.insights} />
                </section>
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Technical Charts</h3>
                  <ChartSection charts={reports.find(r => r.symbol === activeSymbol).data.charts} />
                </section>
                <section>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Recent News</h3>
                  <NewsCardGrid news={reports.find(r => r.symbol === activeSymbol).data.news} />
                </section>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                    <BarChart2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">No Stock Selected</h2>
                  <p className="text-slate-500">
                    Ask about a stock in the chat to generate a detailed analysis report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}