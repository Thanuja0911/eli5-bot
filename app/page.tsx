'use client';

import { useState, useRef } from 'react';

const COMPLEXITY_LEVELS = [
  { value: 'eli5',       label: 'ELI5',       description: "Like I'm 5" },
  { value: 'highschool', label: 'High School', description: 'Age 14–18' },
  { value: 'college',    label: 'College',     description: 'Undergraduate' },
  { value: 'expert',     label: 'Expert',      description: 'Graduate+' },
];

const MODELS = [
  { value: 'claude-haiku-4-5',  label: 'Claude Haiku',  note: 'Fast & cheap' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet', note: 'Smarter & slower' },
];

export default function Home() {
  const [topic, setTopic]           = useState('');
  const [complexity, setComplexity] = useState('eli5');
  const [model, setModel]           = useState('claude-haiku-4-5');
  const [response, setResponse]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  // Metrics state
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [tokenCount, setTokenCount]     = useState<number | null>(null);

  // We use a ref to track start time across the async stream
  const startTimeRef = useRef<number>(0);

  const handleSubmit = async () => {
    if (!topic.trim() || isLoading) return;

    // Reset state for new request
    setResponse('');
    setError('');
    setResponseTime(null);
    setTokenCount(null);
    setIsLoading(true);
    startTimeRef.current = Date.now();

    try {
      // 1. Call our API route
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: topic }],
          complexity,
          model,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error('No response body');

      // 2. Read the stream chunk by chunk
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let chunks = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode each chunk and append to response
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        chunks++;

        // Update the UI in real time — this is what creates the streaming effect!
        setResponse(fullText);
      }

      // 3. Once stream ends, set final metrics
      const elapsed = Date.now() - startTimeRef.current;
      setResponseTime(elapsed);

      // Rough token estimate: ~4 characters per token
      setTokenCount(Math.round(fullText.length / 4));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLevel = COMPLEXITY_LEVELS.find(l => l.value === complexity)!;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600">🧠 ELI5 Bot</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Type any topic — get a crystal-clear explanation
          </p>
        </div>

        {/* Topic input */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Quantum entanglement, Black holes, Recursion..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
                       focus:border-transparent transition"
          />
        </div>

        {/* Complexity slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Complexity</label>
            <span className="text-sm font-semibold text-indigo-600">
              {currentLevel.label}
              <span className="text-gray-400 font-normal ml-1">— {currentLevel.description}</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={COMPLEXITY_LEVELS.findIndex(l => l.value === complexity)}
            onChange={e => setComplexity(COMPLEXITY_LEVELS[Number(e.target.value)].value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            {COMPLEXITY_LEVELS.map(l => <span key={l.value}>{l.label}</span>)}
          </div>
        </div>

        {/* Model dropdown */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400
                       focus:border-transparent bg-white transition"
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>
                {m.label} — {m.note}
              </option>
            ))}
          </select>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!topic.trim() || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300
                     text-white font-semibold py-3 rounded-lg transition cursor-pointer
                     disabled:cursor-not-allowed"
        >
          {isLoading ? '✨ Thinking...' : 'Explain it to me!'}
        </button>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Response area */}
        {(response || isLoading) && !error && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-indigo-500 uppercase tracking-wide">
              Explanation
            </h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {isLoading && !response ? (
                <span className="text-gray-400 italic">Generating explanation...</span>
              ) : response}
              {/* Blinking cursor while streaming */}
              {isLoading && response && (
                <span className="inline-block w-1 h-4 bg-indigo-400 ml-0.5 animate-pulse" />
              )}
            </p>

            {/* Metrics bar */}
            {!isLoading && response && (
              <div className="flex gap-4 pt-2 border-t border-indigo-100 text-xs text-gray-500">
                <span>⏱ {responseTime !== null ? `${responseTime}ms` : '—'}</span>
                <span>🪙 ~{tokenCount} tokens</span>
                <span className="ml-auto">
                  {MODELS.find(m => m.value === model)?.label} · {currentLevel.label}
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}