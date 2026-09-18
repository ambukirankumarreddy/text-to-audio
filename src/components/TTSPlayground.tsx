import React, { useState, useEffect, useRef } from 'react';
import { INDIAN_VOICES, INDIAN_LANGUAGES, EMOTION_DIRECTIVES } from '../data/indianVoices';
import { VoiceProfile, VoiceGender, IndianLanguage, VisemeBlendshapes, SpatialAudio3DConfig } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Globe, 
  Languages, 
  Radio, 
  Zap, 
  ChevronRight,
  Code
} from 'lucide-react';

interface TTSPlaygroundProps {
  onVisemeUpdate: (visemes: VisemeBlendshapes) => void;
  onAudioAnalyserReady: (analyser: AnalyserNode | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentVoice: VoiceProfile;
  setCurrentVoice: (voice: VoiceProfile) => void;
  spatialConfig: SpatialAudio3DConfig;
}

export const TTSPlayground: React.FC<TTSPlaygroundProps> = ({
  onVisemeUpdate,
  onAudioAnalyserReady,
  isPlaying,
  setIsPlaying,
  currentVoice,
  setCurrentVoice,
  spatialConfig,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'all' | VoiceGender>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dialogue and Synthesis parameters
  const [dialogueText, setDialogueText] = useState<string>(
    currentVoice.sampleDialogues[0]?.nativeText || 'सावधान! हमारा राज्य संकट में है। अपनी तलवार उठाओ!'
  );
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [useBrowserWebSpeech, setUseBrowserWebSpeech] = useState<boolean>(false);

  // Status & Audio Controls
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Web Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const pannerNodeRef = useRef<PannerNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const visemeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Filter voices based on language, gender, search
  const filteredVoices = INDIAN_VOICES.filter((voice) => {
    const matchLang = selectedLanguage === 'All' || voice.language === selectedLanguage;
    const matchGender = selectedGender === 'all' || voice.gender === selectedGender;
    const matchSearch =
      searchQuery === '' ||
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.archetype.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.nativeScript.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLang && matchGender && matchSearch;
  });

  // Whenever voice changes, update default dialogue sample
  const handleSelectVoice = (voice: VoiceProfile) => {
    setCurrentVoice(voice);
    if (voice.sampleDialogues.length > 0) {
      setDialogueText(voice.sampleDialogues[0].nativeText);
    }
  };

  // Initialize Web Audio graph
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx && !audioContextRef.current) {
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      onAudioAnalyserReady(analyser);

      const panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      pannerNodeRef.current = panner;

      panner.connect(analyser);
      analyser.connect(ctx.destination);
    }

    return () => {
      visemeTimeoutsRef.current.forEach(clearTimeout);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update Spatial Panner 3D Position
  useEffect(() => {
    if (pannerNodeRef.current && audioContextRef.current) {
      const p = pannerNodeRef.current;
      const ctx = audioContextRef.current;
      const posX = spatialConfig.npcPos.x;
      const posY = spatialConfig.npcPos.y;
      const posZ = spatialConfig.npcPos.z;

      if (p.positionX) {
        p.positionX.setValueAtTime(posX, ctx.currentTime);
        p.positionY.setValueAtTime(posY, ctx.currentTime);
        p.positionZ.setValueAtTime(posZ, ctx.currentTime);
      } else {
        p.setPosition(posX, posY, posZ);
      }
    }
  }, [spatialConfig]);

  // Execute Speech Synthesis (Server-side Gemini TTS or Browser Web Speech fallback)
  const handleSynthesizeAndPlay = async () => {
    if (!dialogueText.trim()) return;

    // Browser Web Speech Mode
    if (useBrowserWebSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dialogueText);
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.lang = currentVoice.languageCode || 'hi-IN';

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        onVisemeUpdate({
          viseme_sil: 1,
          viseme_PP: 0,
          viseme_FF: 0,
          viseme_TH: 0,
          viseme_DD: 0,
          viseme_kk: 0,
          viseme_CH: 0,
          viseme_SS: 0,
          viseme_nn: 0,
          viseme_RR: 0,
          viseme_aa: 0,
          viseme_E: 0,
          viseme_I: 0,
          viseme_O: 0,
          viseme_U: 0,
          jawOpen: 0,
        });
      };

      // Mock viseme cadence for browser speech
      const words = dialogueText.split(/\s+/);
      const estDuration = Math.max(1.5, words.length * 0.4);
      scheduleVisemeAnimation(estDuration);

      window.speechSynthesis.speak(utterance);
      return;
    }

    // Full Server-side Gemini TTS & Viseme Engine
    try {
      setLoading(true);
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dialogueText,
          voiceId: currentVoice.id,
          language: currentVoice.language,
          gender: currentVoice.gender,
          emotionPrompt: selectedEmotion,
          speed,
          pitch,
        }),
      });

      if (!response.ok) {
        throw new Error('Synthesis failed with status ' + response.status);
      }

      const data = await response.json();
      const wavBase64 = data.audioBase64;
      const byteChars = atob(wavBase64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const newUrl = URL.createObjectURL(blob);

      setAudioUrl(newUrl);
      setAudioDuration(data.durationSeconds || 2.0);

      // Play audio element through spatial Web Audio graph
      if (audioElemRef.current) {
        audioElemRef.current.src = newUrl;
        
        // Connect media source once
        if (!sourceNodeRef.current && audioContextRef.current && pannerNodeRef.current) {
          try {
            const source = audioContextRef.current.createMediaElementSource(audioElemRef.current);
            source.connect(pannerNodeRef.current);
            sourceNodeRef.current = source;
          } catch (e) {
            // Node might already be connected
          }
        }

        audioElemRef.current.play();
        setIsPlaying(true);

        // Schedule Viseme Frames accurately
        if (data.visemes && data.visemes.length > 0) {
          visemeTimeoutsRef.current.forEach(clearTimeout);
          visemeTimeoutsRef.current = [];

          data.visemes.forEach((vf: any) => {
            const t = setTimeout(() => {
              onVisemeUpdate({
                viseme_sil: vf.viseme === 'viseme_sil' ? 1 : 0,
                viseme_PP: vf.viseme === 'viseme_PP' ? vf.weight : 0,
                viseme_FF: vf.viseme === 'viseme_FF' ? vf.weight : 0,
                viseme_TH: vf.viseme === 'viseme_TH' ? vf.weight : 0,
                viseme_DD: vf.viseme === 'viseme_DD' ? vf.weight : 0,
                viseme_kk: vf.viseme === 'viseme_kk' ? vf.weight : 0,
                viseme_CH: vf.viseme === 'viseme_CH' ? vf.weight : 0,
                viseme_SS: vf.viseme === 'viseme_SS' ? vf.weight : 0,
                viseme_nn: vf.viseme === 'viseme_nn' ? vf.weight : 0,
                viseme_RR: vf.viseme === 'viseme_RR' ? vf.weight : 0,
                viseme_aa: vf.viseme === 'viseme_aa' ? vf.weight : 0,
                viseme_E: vf.viseme === 'viseme_E' ? vf.weight : 0,
                viseme_I: vf.viseme === 'viseme_I' ? vf.weight : 0,
                viseme_O: vf.viseme === 'viseme_O' ? vf.weight : 0,
                viseme_U: vf.viseme === 'viseme_U' ? vf.weight : 0,
                jawOpen: vf.jawOpen || 0.4,
              });
            }, vf.timeMs);
            visemeTimeoutsRef.current.push(t);
          });
        }
      }
    } catch (err: any) {
      console.error('Synthesis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scheduleVisemeAnimation = (duration: number) => {
    const steps = Math.floor(duration * 8);
    visemeTimeoutsRef.current.forEach(clearTimeout);
    visemeTimeoutsRef.current = [];

    for (let i = 0; i < steps; i++) {
      const t = setTimeout(() => {
        const isOpen = i % 2 === 0;
        onVisemeUpdate({
          viseme_sil: isOpen ? 0 : 0.5,
          viseme_PP: 0,
          viseme_FF: 0,
          viseme_TH: 0,
          viseme_DD: 0,
          viseme_kk: 0,
          viseme_CH: 0,
          viseme_SS: 0,
          viseme_nn: 0,
          viseme_RR: 0,
          viseme_aa: isOpen ? 0.8 : 0.1,
          viseme_E: isOpen ? 0.5 : 0.1,
          viseme_I: 0,
          viseme_O: isOpen ? 0.6 : 0.1,
          viseme_U: 0,
          jawOpen: isOpen ? 0.7 : 0.1,
        });
      }, (i * (duration * 1000)) / steps);
      visemeTimeoutsRef.current.push(t);
    }
  };

  const handleStopAudio = () => {
    if (audioElemRef.current) {
      audioElemRef.current.pause();
      audioElemRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    visemeTimeoutsRef.current.forEach(clearTimeout);
  };

  const copyUnityCodeSnippet = () => {
    const langEnum = currentVoice.language.replace(/\s+/g, '');
    const genderEnum = currentVoice.gender === 'male' ? 'VoiceGender.Male' : 'VoiceGender.Female';
    const escapedText = dialogueText.replace(/"/g, '\\"');
    const snippet = `UnityTTSManager.Instance.SpeakIndian("${escapedText}", IndianLanguage.${langEnum}, ${genderEnum});`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Voice Matrix Bar: Language Tabs & Gender Filters */}
      <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-lg flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-lg border border-slate-700/80">
            <span className="text-xs font-semibold text-slate-400 px-2">Gender:</span>
            <button
              onClick={() => setSelectedGender('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedGender === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              All Voices
            </button>
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                selectedGender === 'male'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <span>Male</span>
              <span className={selectedGender === 'male' ? 'text-slate-900 font-bold' : 'text-blue-400'}>♂</span>
            </button>
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                selectedGender === 'female'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <span>Female</span>
              <span className={selectedGender === 'female' ? 'text-slate-900 font-bold' : 'text-pink-400'}>♀</span>
            </button>
          </div>

          {/* Voice Search Filter */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voice, language, actor..."
              className="w-full bg-[#0F172A] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Indic Language Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedLanguage('All')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              selectedLanguage === 'All'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-[#0F172A] text-slate-400 border border-slate-700/80 hover:text-slate-100'
            }`}
          >
            🌐 All Languages ({INDIAN_VOICES.length})
          </button>
          {INDIAN_LANGUAGES.map((lang) => {
            const count = INDIAN_VOICES.filter((v) => v.language === lang.name).length;
            const isSelected = selectedLanguage === lang.name;
            return (
              <button
                key={lang.name}
                onClick={() => setSelectedLanguage(lang.name)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-[#0F172A] text-slate-400 border border-slate-700/80 hover:text-slate-100'
                }`}
              >
                <span>{lang.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-900 font-semibold' : 'opacity-70'}`}>({lang.native})</span>
              </button>
            );
          })}
          <button
            onClick={() => setSelectedLanguage('Global English')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              selectedLanguage === 'Global English'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-[#0F172A] text-slate-400 border border-slate-700/80 hover:text-slate-100'
            }`}
          >
            Global Actors (5)
          </button>
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[290px] overflow-y-auto pr-1">
        {filteredVoices.map((voice) => {
          const isSelected = currentVoice.id === voice.id;
          const isMale = voice.gender === 'male';

          return (
            <div
              key={voice.id}
              onClick={() => handleSelectVoice(voice)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-[#1E293B] border-slate-700/60 hover:border-amber-500/50 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isMale ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-500/15 text-pink-400'
                    }`}
                  >
                    <span>{isMale ? 'Male ♂' : 'Female ♀'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#0F172A] px-1.5 py-0.5 rounded border border-slate-700/80">
                    {voice.language}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {voice.name}
                </h4>
                <p className="text-[11px] text-amber-400 font-mono mt-0.5">{voice.nativeScript}</p>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {voice.archetype}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-[10px]">Gemini: {voice.geminiVoice}</span>
                <span className="text-amber-400 text-xs flex items-center gap-0.5 font-medium">
                  Select <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Dialogue Editor & Directorial Bench */}
      <div className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-xl flex flex-col gap-4">
        {/* Preset Dialogue Quick-Load Chips */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentic Game Dialogue Presets ({currentVoice.language})</span>
            </label>
            <span className="text-[11px] text-slate-400">Click to load native script</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentVoice.sampleDialogues.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setDialogueText(sample.nativeText)}
                className="text-left bg-[#0F172A] hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 px-3 py-2 rounded-lg text-xs transition-all group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{sample.category}</span>
                </div>
                <div className="text-slate-100 font-medium line-clamp-1">{sample.nativeText}</div>
                {sample.englishMeaning && (
                  <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                    "{sample.englishMeaning}"
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400">Dialogue Text (Supports Any Indic Script or Romanized English):</label>
            <span className="text-[11px] font-mono text-slate-400">{dialogueText.length} characters</span>
          </div>
          <textarea
            rows={3}
            value={dialogueText}
            onChange={(e) => setDialogueText(e.target.value)}
            placeholder="Enter NPC dialogue or prompt here..."
            className="w-full bg-[#0F172A] border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed font-sans"
          />
        </div>

        {/* Speech Directives & Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0F172A] p-3 rounded-lg border border-slate-700/80">
          {/* Emotion Directives */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Directorial Tone / Emotion:</span>
            </label>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="bg-[#1E293B] border border-slate-700/80 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              {EMOTION_DIRECTIVES.map((emo, idx) => (
                <option key={idx} value={emo.prompt}>
                  {emo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Speech Speed:</span>
              <span className="font-mono text-amber-400">{speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Pitch Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Voice Pitch:</span>
              <span className="font-mono text-amber-400">{pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.5}
              step={0.05}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Bottom Control Bar with Play, Web Speech Toggle, Copy Unity Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? handleStopAudio : handleSynthesizeAndPlay}
              disabled={loading}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98 shadow-amber-500/10'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Synthesize & Speak ({currentVoice.name.split(' ')[0]})</span>
                </>
              )}
            </button>

            {/* Zero-latency WebGL Synth Fallback Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none bg-[#0F172A] px-3 py-2 rounded-lg border border-slate-700/80">
              <input
                type="checkbox"
                checked={useBrowserWebSpeech}
                onChange={(e) => setUseBrowserWebSpeech(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Browser Web Speech Fallback</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {audioUrl && (
              <a
                href={audioUrl}
                download={`GeminiTTS_${currentVoice.id}.wav`}
                className="bg-[#0F172A] hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Download Audio WAV"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download .WAV</span>
              </a>
            )}

            <button
              onClick={copyUnityCodeSnippet}
              className="bg-[#0F172A] hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Copy Unity C# invocation line"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied C#!</span>
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy C# Line</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hidden Audio Element for Web Audio streaming */}
        <audio
          ref={audioElemRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    </div>
  );
};
