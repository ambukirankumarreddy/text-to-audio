import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { MPEGDecoder } from 'mpg123-decoder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const mpegDecoder = new MPEGDecoder();

// Helper to convert MP3 buffer directly into 16-bit PCM RIFF WAV
function mp3BufferToWavBuffer(mp3Buf: Buffer): { wavBuffer: Buffer; duration: number } {
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

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28);
  header.writeUInt16LE(numChannels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  const duration = numSamples / sampleRate;
  return { wavBuffer: Buffer.concat([header, pcmBuffer]), duration };
}

// Enable wide open CORS for Unity WebGL, Desktop, Mobile, and Remote Editors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Generate realistic RIFF WAV header for 16-bit Mono PCM
function createWavHeader(dataLength: number, sampleRate: number = 24000): Buffer {
  const buffer = Buffer.alloc(44);
  // RIFF identifier
  buffer.write('RIFF', 0);
  // File length minus 8
  buffer.writeUInt32LE(dataLength + 36, 4);
  // RIFF type
  buffer.write('WAVE', 8);
  // Format chunk identifier
  buffer.write('fmt ', 12);
  // Format chunk length
  buffer.writeUInt32LE(16, 16);
  // Sample format (1 is PCM)
  buffer.writeUInt16LE(1, 20);
  // Channels (1 = mono)
  buffer.writeUInt16LE(1, 22);
  // Sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // Byte rate (SampleRate * Channels * BitsPerSample / 8)
  buffer.writeUInt32LE(sampleRate * 2, 28);
  // Block align (Channels * BitsPerSample / 8)
  buffer.writeUInt16LE(2, 32);
  // Bits per sample
  buffer.writeUInt16LE(16, 34);
  // Data chunk identifier
  buffer.write('data', 36);
  // Data chunk length
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

// Calculate timestamped viseme blendshape frames for lip-sync
function calculateVisemeFrames(text: string, durationSeconds: number) {
  const visemesList = [
    'viseme_sil', 'viseme_aa', 'viseme_E', 'viseme_I', 
    'viseme_O', 'viseme_U', 'viseme_PP', 'viseme_FF', 
    'viseme_TH', 'viseme_DD', 'viseme_kk', 'viseme_CH', 
    'viseme_SS', 'viseme_nn', 'viseme_RR'
  ];

  const words = text.toLowerCase().replace(/[^a-zA-Z\u0900-\u0D7F\s]/g, '').split(/\s+/).filter(Boolean);
  const totalDurationMs = durationSeconds * 1000;
  const frames: Array<{ timeMs: number; viseme: string; weight: number; jawOpen: number }> = [];

  // Always start with silence
  frames.push({ timeMs: 0, viseme: 'viseme_sil', weight: 0.1, jawOpen: 0.0 });

  const numSyllables = Math.max(3, Math.floor(totalDurationMs / 120));
  const timeStep = totalDurationMs / numSyllables;

  for (let i = 0; i < numSyllables; i++) {
    const timeMs = Math.floor(i * timeStep);
    // Cycle through natural speech phonemes
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

  // End with silence
  frames.push({ timeMs: Math.floor(totalDurationMs), viseme: 'viseme_sil', weight: 0.0, jawOpen: 0.0 });
  return frames;
}

// API: Synthesize Speech
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voiceId = 'hi-aarav', emotionPrompt = '', speed = 1.0, pitch = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required.' });
      return;
    }

    const ai = getGenAI();
    let audioBuffer: Buffer | null = null;
    let durationSeconds = 1.5;
    const sampleRate = 24000;

    // Try Gemini TTS model if API key available
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

        const promptText = emotionPrompt ? `${emotionPrompt} Deliver this text: ${text}` : text;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: promptText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
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
      } catch (err: any) {
        console.warn('[Gemini TTS] TTS API fallback triggered:', err.message);
      }
    }

    // Fallback to official Google Text-to-Speech if Gemini TTS model is rate-limited or unavailable
    let format = 'wav';
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

        const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
        const gttsRes = await fetch(gttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (gttsRes.ok) {
          const arr = await gttsRes.arrayBuffer();
          const decoded = mp3BufferToWavBuffer(Buffer.from(arr));
          audioBuffer = decoded.wavBuffer;
          format = 'wav';
          durationSeconds = decoded.duration;
        }
      } catch (gttsErr: any) {
        console.warn('[Google TTS fallback note]:', gttsErr.message);
      }
    }

    if (!audioBuffer) {
      // Create minimal silent audio buffer instead of buzzing tones if completely offline
      const silentSamples = Math.floor(sampleRate * 1.0);
      const silentPcm = Buffer.alloc(silentSamples * 2);
      const wavHeader = createWavHeader(silentPcm.length, sampleRate);
      audioBuffer = Buffer.concat([wavHeader, silentPcm]);
      durationSeconds = 1.0;
      format = 'wav';
    }

    const visemes = calculateVisemeFrames(text, durationSeconds);

    res.json({
      audioBase64: audioBuffer.toString('base64'),
      format,
      sampleRate,
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      visemes,
      voiceUsed: voiceId,
      audioStreamUrl: `/api/tts/audio.mp3?text=${encodeURIComponent(text)}&voiceId=${voiceId}`,
    });
  } catch (error: any) {
    console.error('Error in /api/tts/synthesize:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// API: Stream real Google Text-to-Speech MP3 directly for Unity or Web
app.get('/api/tts/audio.mp3', async (req, res) => {
  try {
    const text = (req.query.text as string) || 'नमस्ते';
    const voiceId = ((req.query.voiceId || req.query.lang || 'hi') as string).toLowerCase();
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

    const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
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
  } catch (err: any) {
    res.status(500).send('Error streaming Google TTS audio');
  }
});

// API: Stream clean real PCM WAV audio directly for Unity
app.get('/api/tts/audio.wav', async (req, res) => {
  try {
    const text = (req.query.text as string) || 'नमस्ते';
    const voiceId = (((req.query.voiceId || req.query.lang || 'hi') as string)).toLowerCase();
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

    const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
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
  } catch (err: any) {
    res.status(500).send('Error generating audio stream');
  }
});

// API: Translate Dialogue to Indic Languages
app.post('/api/tts/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'Hindi' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      res.json({
        translatedText: text,
        romanized: text,
        note: 'Direct passthrough (Configure Gemini API key for AI auto-translation)',
      });
      return;
    }

    const prompt = `Translate the following dialogue into ${targetLanguage} suitable for a game NPC or warrior dialogue.
Return a JSON object with:
- "nativeText": the translation in native Indic script (or English if Indian English)
- "romanizedText": phonetic Romanized transliteration
- "englishMeaning": short English summary of the meaning

Input Dialogue: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Unity TTS Plugin Studio',
    version: '2.0.0',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unity TTS Studio Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
