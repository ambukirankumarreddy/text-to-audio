import React, { useState } from 'react';
import { INDIAN_VOICES } from './data/indianVoices';
import { VoiceProfile, VisemeBlendshapes, SpatialAudio3DConfig } from './types';
import { AvatarSimulator } from './components/AvatarSimulator';
import { TTSPlayground } from './components/TTSPlayground';
import { UnityCodeViewer } from './components/UnityCodeViewer';
import { UnitySetupGuide } from './components/UnitySetupGuide';
import { ApiSpecs } from './components/ApiSpecs';
import { generateUnityPluginZip, generateTTSBackendServerZip, downloadBlob } from './utils/zipExporter';
import { 
  Sparkles, 
  Download, 
  Code2, 
  BookOpen, 
  Terminal, 
  Layers, 
  Volume2, 
  Gamepad2, 
  Globe,
  Radio,
  Check,
  Server,
  Cloud,
  Copy
} from 'lucide-react';

type StudioTab = 'studio' | 'unity-scripts' | 'setup-guide' | 'api-inspector';

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('studio');
  const [currentVoice, setCurrentVoice] = useState<VoiceProfile>(INDIAN_VOICES[0]); // Default: Aarav (Hindi Male)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [downloadingServerZip, setDownloadingServerZip] = useState<boolean>(false);
  const [serverDownloadSuccess, setServerDownloadSuccess] = useState<boolean>(false);
  const [copiedCloud, setCopiedCloud] = useState<boolean>(false);

  const cloudUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyCloudUrl = () => {
    if (cloudUrl) {
      navigator.clipboard.writeText(cloudUrl);
      setCopiedCloud(true);
      setTimeout(() => setCopiedCloud(false), 2500);
    }
  };

  // 3D Lip-Sync Blendshape Weights state
  const [currentVisemes, setCurrentVisemes] = useState<VisemeBlendshapes>({
    viseme_sil: 1.0,
    viseme_PP: 0.0,
    viseme_FF: 0.0,
    viseme_TH: 0.0,
    viseme_DD: 0.0,
    viseme_kk: 0.0,
    viseme_CH: 0.0,
    viseme_SS: 0.0,
    viseme_nn: 0.0,
    viseme_RR: 0.0,
    viseme_aa: 0.0,
    viseme_E: 0.0,
    viseme_I: 0.0,
    viseme_O: 0.0,
    viseme_U: 0.0,
    jawOpen: 0.0,
  });

  // 3D Positional Audio Coordinate State (in meters)
  const [spatialConfig, setSpatialConfig] = useState<SpatialAudio3DConfig>({
    listenerPos: { x: 0, y: 0, z: 0 },
    npcPos: { x: 2.5, y: 0, z: 2.0 },
    minDistance: 1.0,
    maxDistance: 20.0,
    dopplerLevel: 0.2,
    spatialBlend: 1.0,
  });

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zipBlob = await generateUnityPluginZip();
      downloadBlob(zipBlob, 'GeminiTTS_Unity_Plugin_Package.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadServerZip = async () => {
    try {
      setDownloadingServerZip(true);
      const zipBlob = await generateTTSBackendServerZip();
      downloadBlob(zipBlob, 'GeminiTTS_Local_Server.zip');
      setServerDownloadSuccess(true);
      setTimeout(() => setServerDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export server zip:', err);
    } finally {
      setDownloadingServerZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Studio Navbar */}
      <header className="bg-[#1E293B] border-b border-slate-700/70 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">Unity TTS Plugin Studio</h1>
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                  Indic & Global 3D
                </span>
              </div>
              <p className="text-xs text-slate-400">
                14+ Indian Languages (Male ♂ & Female ♀) &bull; 3D Viseme Lip-Sync &bull; Unity C# Plugin
              </p>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <nav className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Studio & Test Bench</span>
            </button>

            <button
              onClick={() => setActiveTab('unity-scripts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'unity-scripts'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Unity C# Scripts (8)</span>
            </button>

            <button
              onClick={() => setActiveTab('setup-guide')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'setup-guide'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('api-inspector')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'api-inspector'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>REST API</span>
            </button>
          </nav>

          {/* Download Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Local TTS Server (.zip) */}
            <button
              id="download-local-server-btn"
              onClick={handleDownloadServerZip}
              disabled={downloadingServerZip}
              title="Download local Node.js server with double-click start-server.bat"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all border ${
                serverDownloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 active:scale-95 shadow-indigo-600/20'
              } disabled:opacity-50`}
            >
              {serverDownloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Downloaded Server (.zip)!</span>
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 text-indigo-200" />
                  <span>{downloadingServerZip ? 'Packing...' : 'Download TTS Server (.zip)'}</span>
                </>
              )}
            </button>

            {/* Download Unity Package .zip Button */}
            <button
              id="download-unity-plugin-btn"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-amber-500/20'
              } disabled:opacity-50`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Downloaded Unity (.zip)!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloadingZip ? 'Packing...' : 'Unity Plugin (.zip)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Prominent Quick-Action Download & Cloud Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-indigo-950/50 to-slate-900 border-b border-emerald-500/30 px-4 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 text-slate-200">
            <span className="bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide flex items-center gap-1 shadow">
              <Cloud className="w-3 h-3" />
              Cloud Server Active
            </span>
            <span className="text-slate-300">
              Want authentic Gemini speech without running a local server? Paste this URL into Unity:
            </span>
            <code className="bg-[#020617] text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/40 text-[11px] select-all">
              {cloudUrl || 'https://your-cloud-url.run.app'}
            </code>
            <button
              onClick={handleCopyCloudUrl}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded font-bold transition-all flex items-center gap-1 text-[11px]"
            >
              {copiedCloud ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCloud ? 'Copied!' : 'Copy for Unity'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingZip ? 'Downloading...' : 'Unity C# Scripts (.zip)'}</span>
            </button>
            <button
              onClick={handleDownloadServerZip}
              disabled={downloadingServerZip}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 text-xs"
              title="Only needed if you want to run offline on your local machine"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Offline Server (.zip)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Indian & Global Voice Matrix + Dialogue Synthesizer (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <TTSPlayground
                onVisemeUpdate={setCurrentVisemes}
                onAudioAnalyserReady={setAudioAnalyser}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentVoice={currentVoice}
                setCurrentVoice={setCurrentVoice}
                spatialConfig={spatialConfig}
              />
            </div>

            {/* Right: 3D Face Avatar & Viseme Lip-Sync Simulator + 3D Spatial Audio Panner (5 Cols) */}
            <div className="lg:col-span-5 sticky top-20 flex flex-col gap-4">
              <AvatarSimulator
                currentVisemes={currentVisemes}
                isPlaying={isPlaying}
                audioAnalyser={audioAnalyser}
                spatialConfig={spatialConfig}
                onSpatialConfigChange={setSpatialConfig}
                voiceName={currentVoice.name}
                language={currentVoice.language}
              />

              {/* Quick Unity Integration Box */}
              <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 text-xs flex flex-col gap-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Unity C# Snippet</span>
                  </span>
                  <span className="font-mono text-[10px] text-amber-400">UnityTTSManager.cs</span>
                </div>
                <pre className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-amber-200/90 overflow-x-auto">
{`UnityTTSManager.Instance.SpeakIndian(
    "${currentVoice.sampleDialogues[0]?.nativeText || 'नमस्ते'}",
    IndianLanguage.${currentVoice.language.replace(/\s+/g, '')},
    VoiceGender.${currentVoice.gender === 'male' ? 'Male' : 'Female'}
);`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'unity-scripts' && <UnityCodeViewer />}

        {activeTab === 'setup-guide' && <UnitySetupGuide />}

        {activeTab === 'api-inspector' && <ApiSpecs />}
      </main>

      {/* Sleek Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-700/70 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span>Unity TTS Plugin Studio &bull; Indic Multi-Language 3D Lip-Sync Architecture</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Supports 14+ Indic Languages</span>
            <span>&bull;</span>
            <span>Male ♂ & Female ♀ Voices</span>
            <span>&bull;</span>
            <span>Zero WebGL Latency Fallback</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
