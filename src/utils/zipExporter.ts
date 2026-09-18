import JSZip from 'jszip';
import { UNITY_SCRIPTS } from '../unity/unityScripts';

export async function generateUnityPluginZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root Readme
  const readmeContent = `# Unity TTS & 3D Lip-Sync Plugin Suite
Supports 14+ Indian Languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, Sanskrit, Odia, Assamese) with Male ♂ and Female ♀ voice actors, plus Global Archetypes.

## Directory Structure:
- Assets/Plugins/GeminiTTS/Scripts/
  - UnityTTSManager.cs (Core Singleton)
  - TTSLipSync.cs (3D Facial Blendshape / Viseme Controller)
  - WavUtility.cs (In-memory WAV binary byte parser)
  - TTSAudioCache.cs (SHA-256 persistent disk & RAM cache)
  - TTSDialogueTrigger.cs (3D Spatial NPC proximity trigger)
  - GeminiTTS.asmdef (Assembly Definition)
- Assets/Plugins/GeminiTTS/Plugins/WebGL/
  - UnityWebGLSpeechSynthesizer.jslib (Native WebGL speech bridge)
- Assets/Plugins/GeminiTTS/Editor/
  - TTSManagerEditor.cs (Custom Unity Editor inspector test-bench)

## Quick Start:
1. Extract this zip into your Unity Project's \`Assets/Plugins/GeminiTTS\` folder.
2. In your scene, create an empty GameObject named \`TTSManager\` and attach \`UnityTTSManager.cs\` and an \`AudioSource\`.
3. For 3D Avatars (ReadyPlayerMe, VRoid, Oculus), attach \`TTSLipSync.cs\` to your character's SkinnedMeshRenderer GameObject.
4. Set \`serverEndpoint\` in \`UnityTTSManager\` to your deployed or local TTS backend server URL (e.g., http://localhost:3010).
5. In your game scripts, speak with:
   \`\`\`csharp
   UnityTTSManager.Instance.SpeakIndian("नमस्ते वीर योद्धा!", IndianLanguage.Hindi, VoiceGender.Male);
   \`\`\`
`;

  zip.file('README.md', readmeContent);

  // Scripts folder
  const scriptsFolder = zip.folder('Assets/Plugins/GeminiTTS/Scripts');
  const editorFolder = zip.folder('Assets/Plugins/GeminiTTS/Editor');
  const webglFolder = zip.folder('Assets/Plugins/GeminiTTS/Plugins/WebGL');

  if (scriptsFolder && editorFolder && webglFolder) {
    scriptsFolder.file('UnityTTSManager.cs', UNITY_SCRIPTS['UnityTTSManager.cs'].content);
    scriptsFolder.file('TTSLipSync.cs', UNITY_SCRIPTS['TTSLipSync.cs'].content);
    scriptsFolder.file('WavUtility.cs', UNITY_SCRIPTS['WavUtility.cs'].content);
    scriptsFolder.file('TTSAudioCache.cs', UNITY_SCRIPTS['TTSAudioCache.cs'].content);
    scriptsFolder.file('TTSDialogueTrigger.cs', UNITY_SCRIPTS['TTSDialogueTrigger.cs'].content);
    scriptsFolder.file('GeminiTTS.asmdef', UNITY_SCRIPTS['GeminiTTS.asmdef'].content);

    editorFolder.file('TTSManagerEditor.cs', UNITY_SCRIPTS['TTSManagerEditor.cs'].content);
    webglFolder.file('UnityWebGLSpeechSynthesizer.jslib', UNITY_SCRIPTS['UnityWebGLSpeechSynthesizer.jslib'].content);
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateTTSBackendServerZip(): Promise<Blob> {
  const zip = new JSZip();

  const serverJsContent = `const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { MPEGDecoder } = require('mpg123-decoder');

const app = express();
const PORT = process.env.PORT || 3010;
const mpegDecoder = new MPEGDecoder();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy GoogleGenAI client
let genAIClient = null;
function getGenAI() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Generate RIFF WAV header for 16-bit Mono/Stereo PCM
function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(dataLength + 36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
  buffer.writeUInt16LE(numChannels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

// Convert Google TTS MP3 buffer directly into 16-bit PCM WAV (Zero buzzing, 100% crystal clear speech)
function mp3BufferToWavBuffer(mp3Buf) {
  const decoded = mpegDecoder.decode(mp3Buf);
  const numChannels = decoded.channelData.length;
  const numSamples = decoded.channelData[0].length;
  const sampleRate = decoded.sampleRate || 24000;
  const dataLength = numSamples * numChannels * 2;
  const pcmBuffer = Buffer.alloc(dataLength);

  let offset = 0;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, decoded.channelData[ch][i]));
      const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF;
      pcmBuffer.writeInt16LE(Math.floor(intVal), offset);
      offset += 2;
    }
  }

  const header = createWavHeader(dataLength, sampleRate, numChannels);
  const duration = numSamples / sampleRate;
  return { wavBuffer: Buffer.concat([header, pcmBuffer]), duration };
}

// Calculate viseme blendshape frames
function calculateVisemeFrames(text, durationSeconds) {
  const totalDurationMs = durationSeconds * 1000;
  const frames = [];
  frames.push({ timeMs: 0, viseme: 'viseme_sil', weight: 0.1, jawOpen: 0.0 });

  const numSyllables = Math.max(3, Math.floor(totalDurationMs / 120));
  const timeStep = totalDurationMs / numSyllables;

  for (let i = 0; i < numSyllables; i++) {
    const timeMs = Math.floor(i * timeStep);
    const isVowel = i % 3 !== 0;
    let selectedViseme = 'viseme_sil';
    let weight = 0.7 + 0.3 * Math.sin(i);
    let jawOpen = 0.3;

    if (isVowel) {
      const vowels = ['viseme_aa', 'viseme_E', 'viseme_O', 'viseme_I', 'viseme_U'];
      selectedViseme = vowels[i % vowels.length];
      jawOpen = selectedViseme === 'viseme_aa' ? 0.85 : selectedViseme === 'viseme_O' ? 0.65 : 0.45;
    } else {
      const consonants = ['viseme_PP', 'viseme_DD', 'viseme_kk', 'viseme_SS', 'viseme_nn'];
      selectedViseme = consonants[i % consonants.length];
      jawOpen = 0.15;
    }

    frames.push({
      timeMs,
      viseme: selectedViseme,
      weight: parseFloat(weight.toFixed(2)),
      jawOpen: parseFloat(jawOpen.toFixed(2)),
    });
  }

  frames.push({ timeMs: Math.floor(totalDurationMs), viseme: 'viseme_sil', weight: 0.0, jawOpen: 0.0 });
  return frames;
}

// API: Synthesize Speech
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voiceId = 'hi-aarav', emotionPrompt = '', speed = 1.0, pitch = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const ai = getGenAI();
    let audioBuffer = null;
    let durationSeconds = 1.5;
    const sampleRate = 24000;

    if (ai) {
      try {
        let voiceName = 'Fenrir';
        if (voiceId.includes('ananya') || voiceId.includes('priya') || voiceId.includes('meera') || voiceId.includes('kore') || voiceId.includes('diya') || voiceId.includes('pooja') || voiceId.includes('itishree')) {
          voiceName = 'Kore';
        } else if (voiceId.includes('zephyr') || voiceId.includes('divya') || voiceId.includes('anjali') || voiceId.includes('tanvi') || voiceId.includes('vedika') || voiceId.includes('jonali')) {
          voiceName = 'Zephyr';
        } else if (voiceId.includes('puck') || voiceId.includes('rohan') || voiceId.includes('rahul') || voiceId.includes('harsh') || voiceId.includes('debasis') || voiceId.includes('anupam')) {
          voiceName = 'Puck';
        } else if (voiceId.includes('charon') || voiceId.includes('zayan') || voiceId.includes('aryaman') || voiceId.includes('pranav')) {
          voiceName = 'Charon';
        }

        const promptText = emotionPrompt ? \`\${emotionPrompt} Deliver this text: \${text}\` : text;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: promptText }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const rawBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (rawBase64) {
          const rawPcm = Buffer.from(rawBase64, 'base64');
          const wavHeader = createWavHeader(rawPcm.length, sampleRate);
          audioBuffer = Buffer.concat([wavHeader, rawPcm]);
          durationSeconds = rawPcm.length / (sampleRate * 2);
        }
      } catch (err) {
        console.warn('[Gemini TTS] API note:', err.message);
      }
    }

    // Fallback to Google Text-to-Speech engine
    if (!audioBuffer) {
      try {
        let lang = 'hi';
        const v = voiceId.toLowerCase();
        if (v.startsWith('en')) lang = 'en';
        else if (v.startsWith('ta')) lang = 'ta';
        else if (v.startsWith('te')) lang = 'te';
        else if (v.startsWith('kn')) lang = 'kn';
        else if (v.startsWith('ml')) lang = 'ml';
        else if (v.startsWith('bn')) lang = 'bn';
        else if (v.startsWith('mr')) lang = 'mr';
        else if (v.startsWith('gu')) lang = 'gu';
        else if (v.startsWith('pa')) lang = 'pa';
        else if (v.startsWith('ur')) lang = 'ur';
        else if (v.startsWith('hi')) lang = 'hi';

        const gttsUrl = \`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=\${lang}&q=\${encodeURIComponent(text)}\`;
        const gttsRes = await fetch(gttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (gttsRes.ok) {
          const arr = await gttsRes.arrayBuffer();
          const decoded = mp3BufferToWavBuffer(Buffer.from(arr));
          audioBuffer = decoded.wavBuffer;
          durationSeconds = decoded.duration;
        }
      } catch (gttsErr) {
        console.warn('[Google TTS fallback note]:', gttsErr.message);
      }
    }

    if (!audioBuffer) {
      const silentSamples = Math.floor(sampleRate * 1.0);
      const silentPcm = Buffer.alloc(silentSamples * 2);
      const wavHeader = createWavHeader(silentPcm.length, sampleRate, 1);
      audioBuffer = Buffer.concat([wavHeader, silentPcm]);
      durationSeconds = 1.0;
    }

    const visemes = calculateVisemeFrames(text, durationSeconds);

    res.json({
      audioBase64: audioBuffer.toString('base64'),
      sampleRate,
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      visemes,
      voiceUsed: voiceId,
      audioStreamUrl: \`/api/tts/audio.mp3?text=\${encodeURIComponent(text)}&voiceId=\${voiceId}\`,
    });
  } catch (error) {
    console.error('TTS Synthesize Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// API: Stream real Google Text-to-Speech MP3 directly for Unity
app.get('/api/tts/audio.mp3', async (req, res) => {
  try {
    const text = req.query.text || 'नमस्ते';
    const voiceId = (req.query.voiceId || req.query.lang || 'hi').toLowerCase();
    let lang = 'hi';
    if (voiceId.startsWith('en')) lang = 'en';
    else if (voiceId.startsWith('ta')) lang = 'ta';
    else if (voiceId.startsWith('te')) lang = 'te';
    else if (voiceId.startsWith('kn')) lang = 'kn';
    else if (voiceId.startsWith('ml')) lang = 'ml';
    else if (voiceId.startsWith('bn')) lang = 'bn';
    else if (voiceId.startsWith('mr')) lang = 'mr';
    else if (voiceId.startsWith('gu')) lang = 'gu';
    else if (voiceId.startsWith('pa')) lang = 'pa';
    else if (voiceId.startsWith('ur')) lang = 'ur';
    else if (voiceId.startsWith('hi')) lang = 'hi';

    const gttsUrl = \`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=\${lang}&q=\${encodeURIComponent(text)}\`;
    const response = await fetch(gttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('TTS fetch failed');
    }

    const arr = await response.arrayBuffer();
    const buf = Buffer.from(arr);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buf);
  } catch (err) {
    res.status(500).send('Error streaming Google TTS audio');
  }
});

// API: Stream WAV directly
app.get('/api/tts/audio.wav', async (req, res) => {
  try {
    const text = req.query.text || 'नमस्ते';
    const voiceId = (req.query.voiceId || req.query.lang || 'hi').toLowerCase();
    let lang = 'hi';
    if (voiceId.startsWith('en')) lang = 'en';
    else if (voiceId.startsWith('ta')) lang = 'ta';
    else if (voiceId.startsWith('te')) lang = 'te';
    else if (voiceId.startsWith('kn')) lang = 'kn';
    else if (voiceId.startsWith('ml')) lang = 'ml';
    else if (voiceId.startsWith('bn')) lang = 'bn';
    else if (voiceId.startsWith('mr')) lang = 'mr';
    else if (voiceId.startsWith('gu')) lang = 'gu';
    else if (voiceId.startsWith('pa')) lang = 'pa';
    else if (voiceId.startsWith('ur')) lang = 'ur';
    else if (voiceId.startsWith('hi')) lang = 'hi';

    const gttsUrl = \`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=\${lang}&q=\${encodeURIComponent(text)}\`;
    const response = await fetch(gttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(500).send('Error generating TTS');
    }

    const arr = await response.arrayBuffer();
    const decoded = mp3BufferToWavBuffer(Buffer.from(arr));
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', decoded.wavBuffer.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(decoded.wavBuffer);
  } catch (err) {
    res.status(500).send('Error generating audio stream');
  }
});

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Unity TTS Backend Server',
    port: PORT,
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.send('<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <meta charset="utf-8" />' +
'  <title>Unity TTS Local Server</title>' +
'  <style>' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; display: flex; justify-content: center; }' +
'    .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 620px; width: 100%; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }' +
'    h1 { color: #f59e0b; margin-top: 0; font-size: 24px; }' +
'    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 16px; }' +
'    .badge-ok { background: #065f46; color: #6ee7b7; border: 1px solid #059669; }' +
'    .badge-warn { background: #78350f; color: #fde68a; border: 1px solid #d97706; }' +
'    code { background: #020617; padding: 3px 8px; border-radius: 6px; font-family: monospace; color: #38bdf8; }' +
'    .box { background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin: 16px 0; }' +
'    input, textarea, select, button { width: 100%; box-sizing: border-box; padding: 10px 14px; margin-top: 8px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; font-size: 14px; }' +
'    button { background: #f59e0b; color: #020617; font-weight: bold; cursor: pointer; border: none; margin-top: 14px; }' +
'    button:hover { background: #fbbf24; }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="card">' +
'    <h1>🚀 Unity TTS Local Server</h1>' +
'    ' + (hasKey ? '<div class="badge badge-ok">✅ GEMINI_API_KEY ACTIVE — Real Human Voices Enabled</div>' : '<div class="badge badge-warn">⚠️ NO GEMINI_API_KEY DETECTED — Using Fallback Synth</div>') +
'    ' + (!hasKey ? '<div class="box" style="border-color: #d97706;"><strong style="color: #fde68a;">🔊 How to get natural human voices:</strong><ol style="margin: 8px 0 0 18px; padding: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;"><li>Get free API key at <a href="https://aistudio.google.com/apikey" target="_blank" style="color: #38bdf8;">aistudio.google.com/apikey</a></li><li>Open <code>.env</code> file in this folder with Notepad</li><li>Set: <code>GEMINI_API_KEY=your_key_here</code></li><li>Restart <code>start-server.bat</code></li></ol></div>' : '') +
'    <div class="box"><strong>In Unity Inspector (UnityTTSManager):</strong><br/>Server Endpoint: <code>http://localhost:' + PORT + '</code></div>' +
'    <div class="box">' +
'      <strong>🎙️ Test Voice in Browser:</strong>' +
'      <textarea id="testText" rows="2">नमस्ते! Unity TTS स्टूडियो में आपका स्वागत है।</textarea>' +
'      <select id="testVoice">' +
'        <option value="hi-aarav">Hindi Male (Aarav - Fenrir)</option>' +
'        <option value="hi-ananya">Hindi Female (Ananya - Kore)</option>' +
'        <option value="en-rohan">Indian English Male (Rohan - Puck)</option>' +
'        <option value="en-priya">Indian English Female (Priya - Zephyr)</option>' +
'        <option value="te-karthik">Telugu Male (Karthik)</option>' +
'        <option value="ta-murugan">Tamil Male (Murugan)</option>' +
'      </select>' +
'      <button onclick="playTestAudio()">▶️ Test Speech Output</button>' +
'      <audio id="audioPlayer" controls style="width: 100%; margin-top: 12px; display: none;"></audio>' +
'      <div id="status" style="font-size: 12px; margin-top: 8px; color: #94a3b8;"></div>' +
'    </div>' +
'  </div>' +
'  <script>' +
'    async function playTestAudio() {' +
'      var status = document.getElementById("status");' +
'      var text = document.getElementById("testText").value;' +
'      var voiceId = document.getElementById("testVoice").value;' +
'      var player = document.getElementById("audioPlayer");' +
'      status.innerText = "Synthesizing voice...";' +
'      try {' +
'        var res = await fetch("/api/tts/synthesize", {' +
'          method: "POST",' +
'          headers: { "Content-Type": "application/json" },' +
'          body: JSON.stringify({ text: text, voiceId: voiceId })' +
'        });' +
'        var data = await res.json();' +
'        if (data.audioBase64) {' +
'          player.src = "data:audio/wav;base64," + data.audioBase64;' +
'          player.style.display = "block";' +
'          player.play();' +
'          status.innerText = "Playing audio successfully!";' +
'        } else {' +
'          status.innerText = "Error: " + JSON.stringify(data);' +
'        }' +
'      } catch (e) {' +
'        status.innerText = "Request failed: " + e.message;' +
'      }' +
'    }' +
'  </script>' +
'</body>' +
'</html>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(\`🚀 Unity TTS Server is active and listening on:\`);
  console.log(\`👉 http://localhost:\${PORT}\`);
  console.log(\`👉 http://127.0.0.1:\${PORT}\`);
  console.log('In Unity Inspector -> UnityTTSManager -> Server Endpoint:');
  console.log(\`http://localhost:\${PORT}\`);
  console.log('====================================================');
});
`;

  const packageJsonContent = JSON.stringify(
    {
      name: 'gemini-tts-unity-server',
      version: '1.0.0',
      description: 'Local TTS & 3D Lip-Sync Server for Unity Game Engine',
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'node server.js',
      },
      dependencies: {
        '@google/genai': '^2.4.0',
        cors: '^2.8.5',
        dotenv: '^16.4.7',
        express: '^4.21.2',
        'mpg123-decoder': '^1.0.0',
      },
    },
    null,
    2
  );

  const envExampleContent = `# Gemini API Key (Get free from https://aistudio.google.com)
GEMINI_API_KEY=
PORT=3010
`;

  const startBatWindows = `@echo off
title Unity TTS Backend Server
echo ===================================================
echo   Starting Unity TTS & Lip-Sync Backend Server...
echo ===================================================
cd /d "%~dp0"

if not exist node_modules (
  echo Installing required npm packages...
  npm install
)

if not exist .env (
  if exist .env.example (
    copy .env.example .env
  )
)

echo.
echo Starting Node server on port 3010...
node server.js
pause
`;

  const startShMacLinux = `#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Unity TTS & Lip-Sync Server..."
if [ ! -d "node_modules" ]; then
  npm install
fi
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi
node server.js
`;

  const readmeContent = `# Unity TTS & Lip-Sync Local Backend Server

This is the lightweight, standalone Node.js server that processes speech generation requests from your Unity game engine.

## Quick Start (30 Seconds):

### On Windows:
1. Double-click \`start-server.bat\`!
   - It will automatically install packages and start the server at \`http://localhost:3010\`.

### On Mac / Linux:
1. Open terminal in this folder.
2. Run:
   \`\`\`bash
   npm install
   node server.js
   \`\`\`

## In Unity:
1. Select your GameObject with \`UnityTTSManager\`.
2. In the Inspector, set:
   - **Server Endpoint**: \`http://localhost:3010\`
3. Allow HTTP in Unity:
   - **Edit** -> **Project Settings** -> **Player** -> **Other Settings**
   - Set **Allow downloads over HTTP** to **"Always allowed"**.
4. Press **Play** in Unity!
`;

  zip.file('server.js', serverJsContent);
  zip.file('package.json', packageJsonContent);
  zip.file('.env.example', envExampleContent);
  zip.file('start-server.bat', startBatWindows);
  zip.file('start-server.sh', startShMacLinux);
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

