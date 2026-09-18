import React, { useEffect, useRef, useState } from 'react';
import { VisemeBlendshapes, SpatialAudio3DConfig } from '../types';
import { Volume2, Mic, Activity, Compass, Move, RefreshCw } from 'lucide-react';

interface AvatarSimulatorProps {
  currentVisemes: VisemeBlendshapes;
  isPlaying: boolean;
  audioAnalyser: AnalyserNode | null;
  spatialConfig: SpatialAudio3DConfig;
  onSpatialConfigChange: (config: SpatialAudio3DConfig) => void;
  voiceName: string;
  language: string;
}

export const AvatarSimulator: React.FC<AvatarSimulatorProps> = ({
  currentVisemes,
  isPlaying,
  audioAnalyser,
  spatialConfig,
  onSpatialConfigChange,
  voiceName,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pannerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'3d-avatar' | 'spatial-panner'>('3d-avatar');
  const [isDraggingNpc, setIsDraggingNpc] = useState(false);
  const [blinkProgress, setBlinkProgress] = useState(0);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      let step = 0;
      const anim = setInterval(() => {
        step += 0.2;
        if (step <= 1) {
          setBlinkProgress(Math.sin(step * Math.PI));
        } else {
          setBlinkProgress(0);
          clearInterval(anim);
        }
      }, 30);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Draw 3D Avatar Face & Frequency Spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(32);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark sleek background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle grid
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Read audio FFT spectrum if available
      let audioEnergy = 0;
      if (audioAnalyser && isPlaying) {
        audioAnalyser.getByteFrequencyData(freqData);
        for (let i = 0; i < freqData.length; i++) {
          audioEnergy += freqData[i];
        }
        audioEnergy = audioEnergy / (freqData.length * 255);
      }

      // Head Center
      const centerX = w / 2;
      const centerY = h / 2 - 10;
      const headRadius = 75;

      // Head glow if speaking
      if (isPlaying) {
        const glow = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 120);
        glow.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
        glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head Base Contour
      ctx.strokeStyle = isPlaying ? '#F59E0B' : '#334155';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, headRadius * 0.85, headRadius * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair / Top Crest
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(centerX, centerY - headRadius * 0.7, headRadius * 0.75, Math.PI, 0);
      ctx.fill();

      // Eyes with Blinking
      const eyeOffsetX = 26;
      const eyeOffsetY = -15;
      const eyeWidth = 14;
      const eyeHeight = 10 * (1 - blinkProgress);

      ctx.fillStyle = '#F8FAFC';
      // Left Eye
      ctx.beginPath();
      ctx.ellipse(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeWidth, Math.max(1, eyeHeight), 0, 0, Math.PI * 2);
      ctx.fill();
      // Right Eye
      ctx.beginPath();
      ctx.ellipse(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeWidth, Math.max(1, eyeHeight), 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupils (Focus center)
      if (eyeHeight > 3) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, 4, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyebrows
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 38, centerY - 28);
      ctx.lineTo(centerX - 14, centerY - 26);
      ctx.moveTo(centerX + 14, centerY - 26);
      ctx.lineTo(centerX + 38, centerY - 28);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 2);
      ctx.lineTo(centerX + 4, centerY + 16);
      ctx.lineTo(centerX - 3, centerY + 18);
      ctx.stroke();

      // 3D Mouth & Viseme Morphing
      const mouthCenterY = centerY + 45;
      const jaw = Math.max(currentVisemes.jawOpen, audioEnergy * 1.2);
      const aaWeight = currentVisemes.viseme_aa;
      const oWeight = currentVisemes.viseme_O;
      const eWeight = currentVisemes.viseme_E;
      const ppWeight = currentVisemes.viseme_PP;

      // Dynamic mouth geometry
      const mouthWidth = 24 + (eWeight * 14) - (oWeight * 10);
      const mouthHeight = 3 + (jaw * 22) + (aaWeight * 16) + (oWeight * 14) - (ppWeight * 4);

      ctx.save();
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = isPlaying ? '#FBBF24' : '#64748B';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.ellipse(centerX, mouthCenterY, Math.max(12, mouthWidth), Math.max(2, mouthHeight), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Teeth & Tongue if mouth open
      if (mouthHeight > 8) {
        // Upper teeth
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(centerX - mouthWidth * 0.5, mouthCenterY - mouthHeight * 0.7, mouthWidth, 4);
        // Tongue
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthCenterY + mouthHeight * 0.5, mouthWidth * 0.4, mouthHeight * 0.4, 0, 0, Math.PI);
        ctx.fill();
      }
      ctx.restore();

      // Draw Audio Frequency Spectrum at Bottom
      const specBarWidth = (w - 40) / 32;
      for (let i = 0; i < 32; i++) {
        const val = isPlaying ? (freqData[i] || (Math.random() * 80 * audioEnergy)) : 4;
        const barH = (val / 255) * 45;
        const bx = 20 + i * specBarWidth;
        const by = h - 16 - barH;

        ctx.fillStyle = isPlaying ? `rgba(245, 158, 11, ${0.4 + (val / 255) * 0.6})` : '#1E293B';
        ctx.fillRect(bx, by, specBarWidth - 2, barH);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentVisemes, isPlaying, audioAnalyser, blinkProgress]);

  // Draw 2D/3D Spatial Audio Panner Radar
  useEffect(() => {
    const canvas = pannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);

    // Draw Distance Rings (1m, 3m, 5m, 10m)
    const rings = [35, 70, 105, 140];
    rings.forEach((r, idx) => {
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${(idx + 1) * 3}m`, centerX + r - 18, centerY - 4);
    });

    // Crosshairs
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX, h - 10);
    ctx.moveTo(10, centerY);
    ctx.lineTo(w - 10, centerY);
    ctx.stroke();

    // Listener (Player) at Center
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.stroke();
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.fillText('Player (Listener)', centerX - 42, centerY + 22);

    // NPC Speaker Node
    const npcCanvasX = centerX + spatialConfig.npcPos.x * 14;
    const npcCanvasY = centerY - spatialConfig.npcPos.z * 14;

    // Line from listener to NPC
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(npcCanvasX, npcCanvasY);
    ctx.stroke();
    ctx.setLineDash([]);

    // NPC Audio Source Node
    ctx.fillStyle = isPlaying ? '#F59E0B' : '#64748B';
    ctx.beginPath();
    ctx.arc(npcCanvasX, npcCanvasY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sound Wave Pulse if playing
    if (isPlaying) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      ctx.arc(npcCanvasX, npcCanvasY, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.fillText(`NPC (${voiceName.split(' ')[0]})`, npcCanvasX - 25, npcCanvasY - 16);

    // Distance calculation
    const dist = Math.sqrt(
      Math.pow(spatialConfig.npcPos.x, 2) + Math.pow(spatialConfig.npcPos.z, 2)
    );
    ctx.fillStyle = '#FCD34D';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`Dist: ${(dist * 0.3).toFixed(1)}m`, npcCanvasX - 22, npcCanvasY + 24);
  }, [spatialConfig, isPlaying, voiceName]);

  // Handle Dragging NPC in Spatial Panner
  const handlePannerMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingNpc(true);
    updateNpcPositionFromMouse(e);
  };

  const handlePannerMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingNpc) return;
    updateNpcPositionFromMouse(e);
  };

  const handlePannerMouseUp = () => {
    setIsDraggingNpc(false);
  };

  const updateNpcPositionFromMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = pannerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const worldX = (x - centerX) / 14;
    const worldZ = -(y - centerY) / 14;

    onSpatialConfigChange({
      ...spatialConfig,
      npcPos: { x: parseFloat(worldX.toFixed(1)), y: 0, z: parseFloat(worldZ.toFixed(1)) },
    });
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header with Simulator Tabs */}
      <div className="bg-[#1E293B] border-b border-slate-700/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-100">3D Lip-Sync & Spatial Panner</span>
        </div>
        <div className="flex items-center gap-1 bg-[#0F172A] p-0.5 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setActiveTab('3d-avatar')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === '3d-avatar'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Avatar Mesh
          </button>
          <button
            onClick={() => setActiveTab('spatial-panner')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'spatial-panner'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            3D Spatial Audio
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="p-4 flex-1 flex flex-col justify-center items-center relative">
        {activeTab === '3d-avatar' ? (
          <div className="relative w-full max-w-[340px] aspect-square flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              width={340}
              height={300}
              className="rounded-lg border border-slate-700/80 w-full shadow-inner bg-[#0F172A]"
            />
            {/* Overlay Info Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#1E293B]/90 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-slate-500'}`} />
              {isPlaying ? 'Speaking / Lip-Sync Live' : 'Idle'}
            </div>
            <div className="absolute top-2 right-2 bg-[#1E293B]/90 border border-slate-700/80 px-2 py-1 rounded text-[10px] font-mono text-amber-400">
              {language}
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[340px] aspect-square flex flex-col items-center justify-center">
            <canvas
              ref={pannerCanvasRef}
              width={340}
              height={300}
              onMouseDown={handlePannerMouseDown}
              onMouseMove={handlePannerMouseMove}
              onMouseUp={handlePannerMouseUp}
              onMouseLeave={handlePannerMouseUp}
              className="rounded-lg border border-slate-700/80 w-full shadow-inner cursor-crosshair bg-[#0F172A]"
            />
            <div className="absolute top-2 left-2 bg-[#1E293B]/90 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center gap-1">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Drag NPC icon to pan audio</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Blendshape Weights HUD */}
      <div className="bg-[#1E293B] border-t border-slate-700/60 p-3 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
          <span>Active Blendshapes (Oculus/RPM Standard)</span>
          <span className="text-amber-400">FPS: 60</span>
        </div>
        <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
          <div className="bg-[#0F172A] p-1.5 rounded border border-slate-700/80 flex justify-between items-center">
            <span className="text-slate-400">viseme_aa</span>
            <span className="text-amber-400 font-bold">{Math.round((currentVisemes.viseme_aa || 0) * 100)}%</span>
          </div>
          <div className="bg-[#0F172A] p-1.5 rounded border border-slate-700/80 flex justify-between items-center">
            <span className="text-slate-400">viseme_E</span>
            <span className="text-amber-400 font-bold">{Math.round((currentVisemes.viseme_E || 0) * 100)}%</span>
          </div>
          <div className="bg-[#0F172A] p-1.5 rounded border border-slate-700/80 flex justify-between items-center">
            <span className="text-slate-400">viseme_O</span>
            <span className="text-amber-400 font-bold">{Math.round((currentVisemes.viseme_O || 0) * 100)}%</span>
          </div>
          <div className="bg-[#0F172A] p-1.5 rounded border border-slate-700/80 flex justify-between items-center">
            <span className="text-slate-400">jawOpen</span>
            <span className="text-emerald-400 font-bold">{Math.round((currentVisemes.jawOpen || 0) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
