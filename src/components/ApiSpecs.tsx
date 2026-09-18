import React, { useState } from 'react';
import { Terminal, Send, Check, Copy, Play, Volume2, Globe, FileCode } from 'lucide-react';

export const ApiSpecs: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('/api/tts/synthesize');
  const [method, setMethod] = useState<'POST' | 'GET'>('POST');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(
      {
        text: 'सावधान! हमारा राज्य संकट में है। अपनी तलवार उठाओ!',
        voiceId: 'hi-aarav',
        language: 'Hindi',
        gender: 'male',
        speed: 1.0,
        pitch: 1.0,
      },
      null,
      2
    )
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('Click "Send Request" to test live API endpoint.');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    try {
      if (endpoint === '/api/tts/synthesize') {
        const res = await fetch('/api/tts/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });

        setResponseStatus(res.status);
        const headers: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          headers[key] = val;
        });
        setResponseHeaders(headers);

        const data = await res.json();
        setResponseBody(JSON.stringify(data, null, 2));
      } else if (endpoint === '/api/tts/audio.wav') {
        const res = await fetch('/api/tts/audio.wav?text=नमस्ते&pitch=1.0&speed=1.0');
        setResponseStatus(res.status);
        const headers: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          headers[key] = val;
        });
        setResponseHeaders(headers);
        setResponseBody(`Binary audio stream received.\nContent-Type: audio/wav\nContent-Length: ${headers['content-length'] || 'streamed'} bytes`);
      } else if (endpoint === '/api/health') {
        const res = await fetch('/api/health');
        setResponseStatus(res.status);
        const data = await res.json();
        setResponseBody(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex flex-col gap-4 p-4 min-h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-100">Live REST API Inspector & Debugger</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span>Backend Target:</span>
          <span className="text-emerald-400 font-bold">Express + Gemini TTS</span>
        </div>
      </div>

      {/* Endpoint Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0F172A] p-2 rounded-lg border border-slate-700/80">
        <div className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded text-xs font-mono font-bold border border-amber-500/30">
          {endpoint === '/api/tts/audio.wav' || endpoint === '/api/health' ? 'GET' : 'POST'}
        </div>
        <select
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="bg-[#1E293B] border border-slate-700/80 text-slate-100 text-xs font-mono rounded px-3 py-1.5 flex-1 focus:outline-none focus:border-amber-500"
        >
          <option value="/api/tts/synthesize">/api/tts/synthesize (Full Synthesis & Visemes JSON)</option>
          <option value="/api/tts/audio.wav">/api/tts/audio.wav (Raw WAV Audio Stream for Unity)</option>
          <option value="/api/health">/api/health (Server & Gemini API Health Check)</option>
        </select>
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Sending...' : 'Send Request'}</span>
        </button>
      </div>

      {/* Request & Response Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Request Pane */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-slate-400">Request Payload (JSON):</label>
          <textarea
            rows={12}
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            disabled={endpoint !== '/api/tts/synthesize'}
            className="w-full flex-1 bg-[#020617] border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Response Pane */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>Response Payload</span>
              {responseStatus && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    responseStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
            </label>

            <button
              onClick={handleCopyResponse}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="w-full flex-1 bg-[#020617] border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-auto max-h-[480px]">
            {responseBody}
          </pre>
        </div>
      </div>
    </div>
  );
};
