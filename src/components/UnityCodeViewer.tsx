import React, { useState } from 'react';
import { UNITY_SCRIPTS, UnityScriptFile } from '../unity/unityScripts';
import { Copy, Check, FileCode, Download, Search, Terminal, Layers } from 'lucide-react';
import { UnityScriptTab } from '../types';

export const UnityCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<UnityScriptTab>('UnityTTSManager.cs');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>('');

  const currentScript: UnityScriptFile = UNITY_SCRIPTS[selectedFile];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentScript.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([currentScript.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentScript.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[740px]">
      {/* Top Header */}
      <div className="bg-[#1E293B] border-b border-slate-700/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-100">Unity C# & WebGL Plugin Source Suite</h3>
          <span className="bg-amber-500/15 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
            8 Ready Files
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied Source!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Script Navigation Tabs */}
      <div className="bg-[#0F172A] border-b border-slate-700/80 px-2 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {Object.keys(UNITY_SCRIPTS).map((fileNameKey) => {
          const file = UNITY_SCRIPTS[fileNameKey];
          const isSelected = selectedFile === fileNameKey;

          return (
            <button
              key={fileNameKey}
              onClick={() => setSelectedFile(fileNameKey as UnityScriptTab)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1E293B] text-amber-400 border border-amber-500/30 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <span>{file.filename}</span>
              <span className="text-[9px] opacity-60 bg-[#0F172A] px-1 rounded">
                {file.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* File Description Header */}
      <div className="bg-[#1E293B]/60 px-4 py-2 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-200 font-semibold">{currentScript.filename}</span>
          <span>—</span>
          <span>{currentScript.description}</span>
        </div>
        <span className="font-mono text-[11px] text-amber-400">{currentScript.category}</span>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex-1 overflow-auto bg-[#020617] p-4 font-mono text-xs leading-relaxed text-slate-300 selection:bg-amber-500 selection:text-slate-950">
        <pre className="flex">
          {/* Line Numbers */}
          <div className="select-none text-slate-600 pr-4 text-right border-r border-slate-800 min-w-[40px]">
            {currentScript.content.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          {/* Code text */}
          <div className="pl-4 flex-1 overflow-x-auto text-slate-200">
            {currentScript.content.split('\n').map((line, idx) => {
              // Basic sleek code coloration for C# keywords
              let formattedLine = line;
              const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*');
              const isDirective = line.trim().startsWith('using ') || line.trim().startsWith('#');

              return (
                <div
                  key={idx}
                  className={`whitespace-pre ${
                    isComment
                      ? 'text-slate-500 italic'
                      : isDirective
                      ? 'text-amber-300 font-semibold'
                      : 'text-slate-200'
                  }`}
                >
                  {formattedLine}
                </div>
              );
            })}
          </div>
        </pre>
      </div>
    </div>
  );
};
