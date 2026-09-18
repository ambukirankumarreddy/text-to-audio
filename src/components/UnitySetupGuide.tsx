import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Cpu, 
  Volume2, 
  Globe, 
  ChevronRight, 
  CheckCircle2, 
  Terminal, 
  Sparkles,
  ExternalLink,
  Code,
  Cloud,
  Copy,
  Check
} from 'lucide-react';

export const UnitySetupGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCloud, setCopiedCloud] = useState<boolean>(false);
  const cloudUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-cloud-url.run.app';

  const copyCloud = () => {
    navigator.clipboard.writeText(cloudUrl);
    setCopiedCloud(true);
    setTimeout(() => setCopiedCloud(false), 2500);
  };

  const steps = [
    {
      id: 1,
      title: 'Import Package into Unity',
      subtitle: 'Extract Assets/Plugins/GeminiTTS hierarchy',
      icon: Package,
    },
    {
      id: 2,
      title: 'Configure UnityTTSManager',
      subtitle: 'Scene singleton & server endpoint setup',
      icon: Cpu,
    },
    {
      id: 3,
      title: '3D Lip-Sync Setup',
      subtitle: 'ReadyPlayerMe / ARKit blendshape binding',
      icon: Layers,
    },
    {
      id: 4,
      title: '3D Spatial Audio & Proximity',
      subtitle: 'AudioSource rolloff & NPC dialogue triggers',
      icon: Volume2,
    },
    {
      id: 5,
      title: 'WebGL & Standalone Builds',
      subtitle: 'Native browser Web Speech fallback and export',
      icon: Globe,
    },
  ];

  return (
    <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[700px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-[#1E293B] border-r border-slate-700/70 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-amber-500/20 text-amber-400 p-1.5 rounded-lg border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Integration Guide</h3>
              <p className="text-[11px] text-slate-400">Step-by-step Unity integration</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`text-left p-2.5 rounded-lg transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <div>
                    <div className="text-xs font-semibold">{step.title}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                      {step.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Unity 2021.3+ to 6.0</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#0F172A]">
        {activeStep === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-100">Step 1: Download and Import Plugin Files</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Click the <strong className="text-amber-400">Download Unity Plugin (.zip)</strong> button in the top navigation bar. Extract the contents directly into your Unity project's <code className="text-amber-300 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">Assets/Plugins/GeminiTTS</code> directory.
            </p>

            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200">
              <div className="text-amber-400 font-bold mb-2">// Target Directory Structure:</div>
              <div className="text-slate-500">Assets/</div>
              <div className="text-slate-500">└── Plugins/</div>
              <div className="text-slate-500">    └── GeminiTTS/</div>
              <div className="pl-6 text-emerald-400">├── Scripts/ (UnityTTSManager, TTSLipSync, WavUtility...)</div>
              <div className="pl-6 text-emerald-400">├── Editor/ (TTSManagerEditor.cs)</div>
              <div className="pl-6 text-emerald-400">├── Plugins/WebGL/ (UnityWebGLSpeechSynthesizer.jslib)</div>
              <div className="pl-6 text-emerald-400">└── GeminiTTS.asmdef</div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-amber-300">Assembly Definition:</strong> The included <code className="font-mono text-white bg-[#0F172A] px-1 rounded">GeminiTTS.asmdef</code> ensures high compilation speed and prevents namespace collisions with third-party packages.
              </span>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-100">Step 2: Connect Unity to Google Text-to-Speech</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Why did the cloud preview URL fail from Unity? Google AI Studio runs behind a Google Account cookie firewall that only browser sessions can open. External apps like Unity receive an HTML login redirect. 
              Here is how to get <strong>100% authentic Google Text-to-Speech working in Unity right now</strong>:
            </p>

            {/* Method 1: Direct Google Text-to-Speech (Zero Setup - Recommended!) */}
            <div className="bg-[#1E293B] border-2 border-emerald-500/60 rounded-xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3" />
                    Option 1: Direct Google Text-to-Speech (Zero PC Setup!)
                  </span>
                  <span className="text-xs font-bold text-emerald-300">Fastest & Works Instantly</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Recommended</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The updated <code className="text-amber-400 font-mono">UnityTTSManager.cs</code> can talk <strong>directly to the Google Text-to-Speech engine</strong> inside Unity! No Node.js server, no command prompt, and no API key required!
              </p>

              <div className="bg-[#020617] p-3 rounded-lg border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
                <p>1. In Unity, select your <code className="text-amber-400 font-mono">TTSManager</code> GameObject.</p>
                <p>2. In the Inspector on <code className="text-amber-400 font-mono">UnityTTSManager</code>, check the box: <strong className="text-emerald-400 font-mono">[✓] Use Direct Google TTS</strong>.</p>
                <p>3. Press <strong>Play</strong> in Unity! It will speak immediately in authentic, crystal-clear Google Text-to-Speech in Hindi, Tamil, Telugu, English, etc.</p>
              </div>
            </div>

            {/* Method 2: Local Node.js Server */}
            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                    Option 2: Local Node.js Server
                  </span>
                  <span className="text-xs font-bold text-slate-300">With 3D Viseme Lip-Sync Network Stream</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 bg-[#020617] p-3 rounded-lg border border-slate-800">
                <p>1. Click <strong>"Offline Server (.zip)"</strong> in the top header and extract it to your PC.</p>
                <p>2. Double-click <code className="text-amber-300 font-mono">start-server.bat</code> (Windows) or run <code className="text-amber-300 font-mono">npm install && node server.js</code>.</p>
                <p>3. In Unity Inspector, set <strong>Server Endpoint</strong> to: <code className="text-emerald-400 font-mono font-bold">http://localhost:3010</code>.</p>
                <p className="text-slate-400 text-[11px] mt-1">The local server now has the Google Text-to-Speech engine built in, so you will get authentic Google voices without any weird mathematical sounds!</p>
              </div>
            </div>

            {/* In Unity Inspector */}
            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-lg">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase mb-2">In Your Unity Inspector (TTSManager GameObject):</h4>
              <p className="text-xs text-slate-300 mb-3">
                Create an empty GameObject named <code className="text-amber-400 font-mono bg-[#020617] px-1.5 py-0.5 rounded border border-slate-800">TTSManager</code>, attach <code className="text-amber-400 font-mono bg-[#020617] px-1.5 py-0.5 rounded border border-slate-800">UnityTTSManager.cs</code> and an <code className="text-amber-400 font-mono bg-[#020617] px-1.5 py-0.5 rounded border border-slate-800">AudioSource</code>.
              </p>

              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase mb-2">C# Dialogue Trigger Example:</h4>
              <pre className="bg-[#020617] border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`using UnityEngine;
using GeminiTTS;

public class QuestGiverNPC : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            // Speak in authentic Hindi with Male Warrior voice
            UnityTTSManager.Instance.SpeakIndian(
                "सावधान! हमारा राज्य संकट में है। अपनी तलवार उठाओ!",
                IndianLanguage.Hindi,
                VoiceGender.Male,
                (clip, visemes) => {
                    Debug.Log("Dialogue audio playback started!");
                }
            );
        }
    }
}`}
              </pre>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-100">Step 3: 3D Character Facial Lip-Sync & Visemes</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Attach the <code className="text-amber-400 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">TTSLipSync.cs</code> script to your 3D avatar's GameObject containing the <code className="text-amber-400 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">SkinnedMeshRenderer</code> (e.g. ReadyPlayerMe, VRoid, Oculus OVR, or ARKit head mesh).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#1E293B] border border-slate-700/60 p-3.5 rounded-lg shadow-sm">
                <h4 className="text-xs font-bold text-amber-400 mb-1">ReadyPlayerMe & Oculus</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically maps standard blendshapes: <code className="text-slate-200 font-mono bg-[#0F172A] px-1 rounded">viseme_aa</code>, <code className="text-slate-200 font-mono bg-[#0F172A] px-1 rounded">viseme_E</code>, <code className="text-slate-200 font-mono bg-[#0F172A] px-1 rounded">viseme_O</code>, <code className="text-slate-200 font-mono bg-[#0F172A] px-1 rounded">viseme_PP</code>, <code className="text-slate-200 font-mono bg-[#0F172A] px-1 rounded">jawOpen</code>.
                </p>
              </div>

              <div className="bg-[#1E293B] border border-slate-700/60 p-3.5 rounded-lg shadow-sm">
                <h4 className="text-xs font-bold text-amber-400 mb-1">Audio FFT Spectrum Fallback</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If custom blendshapes are missing, real-time frequency analysis dynamically drives jaw open/close automatically based on vocal loudness.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-100">Step 4: 3D Spatial Audio & Dialogue Triggers</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Position voice actors in 3D world space using Unity's native <code className="text-amber-400 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">AudioSource</code> 3D spatial settings combined with <code className="text-amber-400 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">TTSDialogueTrigger.cs</code>.
            </p>

            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 font-mono text-xs text-slate-200">
              <div className="text-amber-400 font-bold mb-2">Recommended AudioSource Settings:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong className="text-white">Spatial Blend:</strong> Set to 1.0 (100% 3D Positional Audio)</li>
                <li><strong className="text-white">3D Sound Settings:</strong> Min Distance = 1.5m, Max Distance = 20.0m</li>
                <li><strong className="text-white">Rolloff Mode:</strong> Logarithmic Rolloff (Realistic acoustic dropoff)</li>
                <li><strong className="text-white">Doppler Level:</strong> 0.2 (Prevents pitch distortion on fast moving NPCs)</li>
              </ul>
            </div>
          </div>
        )}

        {activeStep === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-100">Step 5: WebGL & Standalone Exports</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              For browser WebGL games, the included <code className="text-amber-400 font-mono bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-700">UnityWebGLSpeechSynthesizer.jslib</code> automatically uses the client's browser Web Speech API with zero network latency and zero server costs.
            </p>

            <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-lg">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase mb-2">WebGL JSLib Invocation:</h4>
              <pre className="bg-[#020617] border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`#if UNITY_WEBGL && !UNITY_EDITOR
[System.Runtime.InteropServices.DllImport("__Internal")]
private static extern void SpeakWebGLText(string text, string lang, float pitch, float rate);
#endif`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
