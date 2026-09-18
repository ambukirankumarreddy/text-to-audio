export type IndianLanguage = 
  | 'Hindi'
  | 'Indian English'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati'
  | 'Punjabi'
  | 'Urdu'
  | 'Sanskrit'
  | 'Odia'
  | 'Assamese';

export type VoiceGender = 'male' | 'female';

export interface SampleDialogue {
  category: 'RPG Warrior' | 'Wise Sage / Elder' | 'AI / Tech Guide' | 'Temple Mystic' | 'Casual NPC' | 'Battle Cry';
  nativeText: string;
  romanizedText: string;
  englishMeaning: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  nativeScript: string;
  language: IndianLanguage | 'Global English';
  languageCode: string;
  gender: VoiceGender;
  archetype: string;
  personality: string;
  geminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  pitchOffset: number; // In semitones or multiplier
  speedMultiplier: number;
  sampleDialogues: SampleDialogue[];
  badgeColor?: string;
  isIndian: boolean;
}

export interface VisemeFrame {
  timeMs: number;
  viseme: string;
  weight: number; // 0.0 to 1.0
  jawOpen: number; // 0.0 to 1.0
}

export interface VisemeBlendshapes {
  viseme_sil: number;
  viseme_PP: number;
  viseme_FF: number;
  viseme_TH: number;
  viseme_DD: number;
  viseme_kk: number;
  viseme_CH: number;
  viseme_SS: number;
  viseme_nn: number;
  viseme_RR: number;
  viseme_aa: number;
  viseme_E: number;
  viseme_I: number;
  viseme_O: number;
  viseme_U: number;
  jawOpen: number;
  mouthSmile?: number;
}

export interface SynthesisRequest {
  text: string;
  voiceId: string;
  language?: string;
  gender?: VoiceGender;
  emotionPrompt?: string;
  speed?: number;
  pitch?: number;
  enableVisemes?: boolean;
}

export interface SynthesisResponse {
  audioBase64: string; // Base64 WAV or PCM
  sampleRate: number;
  durationSeconds: number;
  visemes: VisemeFrame[];
  cached?: boolean;
  voiceUsed: string;
}

export interface SpatialAudio3DConfig {
  listenerPos: { x: number; y: number; z: number };
  npcPos: { x: number; y: number; z: number };
  minDistance: number;
  maxDistance: number;
  dopplerLevel: number;
  spatialBlend: number; // 0 (2D) to 1 (3D)
}

export type UnityScriptTab = 
  | 'UnityTTSManager.cs'
  | 'TTSLipSync.cs'
  | 'WavUtility.cs'
  | 'TTSAudioCache.cs'
  | 'TTSDialogueTrigger.cs'
  | 'UnityWebGLSpeechSynthesizer.jslib'
  | 'TTSManagerEditor.cs'
  | 'GeminiTTS.asmdef';
