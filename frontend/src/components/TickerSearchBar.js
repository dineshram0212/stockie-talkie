'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function TickerSearchBar({ onSelect }) {
  const [tickerInput, setTickerInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchTickers = async (query) => {
    if (!query) return [];
    try {
      const res = await fetch(`http://localhost:8000/ticker-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.quotes.map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange
      }));
    } catch (error) {
      console.error("Ticker search failed:", error);
      return [];
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (tickerInput.length >= 2) {
        const results = await fetchTickers(tickerInput);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [tickerInput]);

  const handleSuggestionClick = (symbol) => {
    setTickerInput(symbol);
    setSuggestions([]);
    onSelect(symbol);
    setTickerInput(''); 
  };

  return (
    <div className="relative w-64 z-30">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-900 h-4 w-4" />
    <input
      type="text"
      value={tickerInput}
      onChange={(e) => setTickerInput(e.target.value)}
      placeholder="Search stocks..."
      className="pl-10 pr-4 py-2 bg-slate-100 text-black rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
    />
    {suggestions.length > 0 && (
      <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
        {suggestions.map((s, i) => (
          <li
            key={`${s.symbol}-${i}`}
            onClick={() => handleSuggestionClick(s.symbol)}
            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-800"
          >
            {s.symbol} – {s.name}
          </li>
        ))}
      </ul>
    )}
  </div>
  
  );
}
