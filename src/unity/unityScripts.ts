export interface UnityScriptFile {
  filename: string;
  language: 'csharp' | 'javascript' | 'json';
  description: string;
  content: string;
  category: 'Core Manager' | '3D Lip-Sync' | 'Audio Utility' | 'Caching' | 'NPC Trigger' | 'WebGL Bridge' | 'Editor Tools' | 'Package Config';
}

export const UNITY_SCRIPTS: Record<string, UnityScriptFile> = {
  'UnityTTSManager.cs': {
    filename: 'UnityTTSManager.cs',
    language: 'csharp',
    category: 'Core Manager',
    description: 'Singleton REST client managing Indic/Global speech synthesis, audio streaming, and viseme events.',
    content: `// ============================================================================
// UnityTTSManager.cs - High-Performance Text-to-Speech & Lip-Sync Manager
// Supports Indian Languages (Hindi, Tamil, Telugu, etc.) and Global Voices
// Compatible with Unity 2021.3+, 2022.3+, 2023+, and Unity 6 (Standalone & WebGL)
// ============================================================================

using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace GeminiTTS
{
    public enum IndianLanguage
    {
        Hindi,
        IndianEnglish,
        Tamil,
        Telugu,
        Kannada,
        Malayalam,
        Bengali,
        Marathi,
        Gujarati,
        Punjabi,
        Urdu,
        Sanskrit,
        Odia,
        Assamese
    }

    public enum VoiceGender
    {
        Male,
        Female
    }

    [Serializable]
    public class VisemeData
    {
        public int timeMs;
        public string viseme;
        public float weight;
        public float jawOpen;
    }

    [Serializable]
    public class TTSResponsePayload
    {
        public string audioBase64;
        public int sampleRate;
        public float durationSeconds;
        public VisemeData[] visemes;
        public string voiceUsed;
    }

    [RequireComponent(typeof(AudioSource))]
    public class UnityTTSManager : MonoBehaviour
    {
        public static UnityTTSManager Instance { get; private set; }

        [Header("Backend Server Configuration")]
        [Tooltip("Base URL of your TTS backend service (e.g. http://localhost:3010 or your cloud deployment URL)")]
        public string serverEndpoint = "http://localhost:3010";

        [Header("Engine Mode")]
        [Tooltip("When enabled, Unity calls Google Text-to-Speech directly without needing any server. Leave unchecked to use your backend application server.")]
        public bool useDirectGoogleTTS = false;

        [Tooltip("If the server is offline or unreachable, automatically fallback to Google Text-to-Speech.")]
        public bool fallbackToGoogleTTSIfServerFails = true;

        [Header("Default Audio Settings")]
        [Range(0.5f, 2.0f)] public float defaultSpeed = 1.0f;
        [Range(0.5f, 2.0f)] public float defaultPitch = 1.0f;
        public bool enableDiskCache = true;

        [Header("Audio Output")]
        public AudioSource targetAudioSource;

        // Events for Game Architecture
        public event Action<string, AudioClip> OnSpeechStarted;
        public event Action<string> OnSpeechCompleted;
        public event Action<VisemeData> OnVisemeUpdated;

        private Queue<IEnumerator> _speechQueue = new Queue<IEnumerator>();
        private bool _isProcessingQueue = false;

        private void Awake()
        {
            if (Instance != null && Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            if (targetAudioSource == null)
            {
                targetAudioSource = GetComponent<AudioSource>();
            }
        }

        /// <summary>
        /// Speak dialogue with an authentic Indian Male or Female voice in the specified language.
        /// </summary>
        public void SpeakIndian(string text, IndianLanguage language, VoiceGender gender, Action<AudioClip, VisemeData[]> onDone = null)
        {
            string voiceId = GetIndianVoiceId(language, gender);
            Speak(text, voiceId, onDone);
        }

        /// <summary>
        /// Synthesize and play speech with the specified voice identifier.
        /// </summary>
        public void Speak(string text, string voiceId = "hi-aarav", Action<AudioClip, VisemeData[]> onDone = null)
        {
            StartCoroutine(SynthesizeRoutine(text, voiceId, onDone));
        }

        private IEnumerator SynthesizeRoutine(string text, string voiceId, Action<AudioClip, VisemeData[]> onDone)
        {
            string cleanText = text.Trim();
            if (string.IsNullOrEmpty(cleanText)) yield break;

            string langCode = GetLanguageCodeFromVoice(voiceId);

            // Check Cache
            if (enableDiskCache && TTSAudioCache.TryGetClip(cleanText, voiceId, out AudioClip cachedClip))
            {
                PlayClip(cleanText, cachedClip, null);
                onDone?.Invoke(cachedClip, null);
                yield break;
            }

            // If direct Google TTS mode is selected, download and play directly (Zero Server Needed)
            if (useDirectGoogleTTS)
            {
                yield return StartCoroutine(DirectGoogleTTSRoutine(cleanText, voiceId, langCode, onDone));
                yield break;
            }

            string url = $"{serverEndpoint.TrimEnd('/')}/api/tts/synthesize";
            string jsonBody = $"{{\"text\":{EscapeJson(cleanText)},\"voiceId\":\"{voiceId}\",\"speed\":{defaultSpeed},\"pitch\":{defaultPitch}}}";

            using (UnityWebRequest req = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning($"[UnityTTS] Server at {serverEndpoint} unreachable ({req.error}). Falling back to Google Text-to-Speech...");
                    if (fallbackToGoogleTTSIfServerFails)
                    {
                        yield return StartCoroutine(DirectGoogleTTSRoutine(cleanText, voiceId, langCode, onDone));
                    }
                    yield break;
                }

                string responseText = req.downloadHandler.text;
                TTSResponsePayload payload = null;
                try
                {
                    payload = JsonUtility.FromJson<TTSResponsePayload>(responseText);
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[UnityTTS] Failed to parse server response. Falling back to Google TTS: {ex.Message}");
                    if (fallbackToGoogleTTSIfServerFails)
                    {
                        yield return StartCoroutine(DirectGoogleTTSRoutine(cleanText, voiceId, langCode, onDone));
                    }
                    yield break;
                }

                if (payload != null && !string.IsNullOrEmpty(payload.audioBase64))
                {
                    byte[] audioBytes = Convert.FromBase64String(payload.audioBase64);
                    AudioClip clip = WavUtility.ToAudioClip(audioBytes, 0, "TTS_" + voiceId);

                    // If WAV parsing failed (e.g. server returned MP3 stream), stream directly
                    if (clip == null)
                    {
                        string streamUrl = $"{serverEndpoint.TrimEnd('/')}/api/tts/audio.mp3?text={UnityWebRequest.EscapeURL(cleanText)}&voiceId={voiceId}";
                        yield return StartCoroutine(StreamAudioClipRoutine(streamUrl, cleanText, voiceId, payload.visemes, onDone));
                        yield break;
                    }

                    if (enableDiskCache)
                    {
                        TTSAudioCache.SaveClip(cleanText, voiceId, audioBytes);
                    }

                    PlayClip(cleanText, clip, payload.visemes);
                    onDone?.Invoke(clip, payload.visemes);
                }
                else if (fallbackToGoogleTTSIfServerFails)
                {
                    yield return StartCoroutine(DirectGoogleTTSRoutine(cleanText, voiceId, langCode, onDone));
                }
            }
        }

        private IEnumerator DirectGoogleTTSRoutine(string cleanText, string voiceId, string langCode, Action<AudioClip, VisemeData[]> onDone)
        {
            string ttsUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={langCode}&q={UnityWebRequest.EscapeURL(cleanText)}";
            yield return StartCoroutine(StreamAudioClipRoutine(ttsUrl, cleanText, voiceId, null, onDone));
        }

        private IEnumerator StreamAudioClipRoutine(string audioUrl, string cleanText, string voiceId, VisemeData[] visemes, Action<AudioClip, VisemeData[]> onDone)
        {
            using (UnityWebRequest www = UnityWebRequest.Get(audioUrl))
            {
                www.SetRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                yield return www.SendWebRequest();

                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogError($"[UnityTTS] Error downloading audio from {audioUrl}: {www.error}");
                    yield break;
                }

                byte[] audioBytes = www.downloadHandler.data;
                if (audioBytes == null || audioBytes.Length == 0) yield break;

                AudioClip clip = null;

                // Check if uncompressed RIFF WAV
                if (audioBytes.Length > 12 && audioBytes[0] == 'R' && audioBytes[1] == 'I' && audioBytes[2] == 'F' && audioBytes[3] == 'F')
                {
                    clip = WavUtility.ToAudioClip(audioBytes, 0, "TTS_" + voiceId);
                }

                // If MP3, load through Unity multimedia decoder
                if (clip == null)
                {
                    string tempFile = Path.Combine(Application.temporaryCachePath, $"tts_{voiceId}_{DateTime.Now.Ticks}.mp3");
                    File.WriteAllBytes(tempFile, audioBytes);
                    using (UnityWebRequest clipReq = UnityWebRequestMultimedia.GetAudioClip("file://" + tempFile, AudioType.MPEG))
                    {
                        yield return clipReq.SendWebRequest();
                        if (clipReq.result == UnityWebRequest.Result.Success)
                        {
                            clip = DownloadHandlerAudioClip.GetContent(clipReq);
                        }
                    }
                    try { if (File.Exists(tempFile)) File.Delete(tempFile); } catch {}
                }

                if (clip != null)
                {
                    clip.name = "TTS_" + voiceId;
                    PlayClip(cleanText, clip, visemes);
                    onDone?.Invoke(clip, visemes);
                }
            }
        }

        private void PlayClip(string text, AudioClip clip, VisemeData[] visemes)
        {
            if (targetAudioSource != null && clip != null)
            {
                targetAudioSource.clip = clip;
                targetAudioSource.Play();
                OnSpeechStarted?.Invoke(text, clip);

                if (visemes != null && visemes.Length > 0)
                {
                    StartCoroutine(StreamVisemesRoutine(visemes));
                }

                StartCoroutine(WaitForAudioComplete(clip.length, text));
            }
        }

        private IEnumerator StreamVisemesRoutine(VisemeData[] visemes)
        {
            float startTime = Time.time;
            int index = 0;

            while (index < visemes.Length && targetAudioSource != null && targetAudioSource.isPlaying)
            {
                float elapsedMs = (Time.time - startTime) * 1000f;
                if (elapsedMs >= visemes[index].timeMs)
                {
                    OnVisemeUpdated?.Invoke(visemes[index]);
                    index++;
                }
                yield return null;
            }
        }

        private IEnumerator WaitForAudioComplete(float duration, string text)
        {
            yield return new WaitForSeconds(duration);
            OnSpeechCompleted?.Invoke(text);
        }

        public static string GetLanguageCodeFromVoice(string voiceId)
        {
            if (string.IsNullOrEmpty(voiceId)) return "hi";
            string v = voiceId.ToLower();
            if (v.StartsWith("en")) return "en";
            if (v.StartsWith("ta")) return "ta";
            if (v.StartsWith("te")) return "te";
            if (v.StartsWith("kn")) return "kn";
            if (v.StartsWith("ml")) return "ml";
            if (v.StartsWith("bn")) return "bn";
            if (v.StartsWith("mr")) return "mr";
            if (v.StartsWith("gu")) return "gu";
            if (v.StartsWith("pa")) return "pa";
            if (v.StartsWith("ur")) return "ur";
            return "hi";
        }

        public static string GetLanguageCode(IndianLanguage lang)
        {
            return lang switch
            {
                IndianLanguage.Hindi => "hi",
                IndianLanguage.IndianEnglish => "en",
                IndianLanguage.Tamil => "ta",
                IndianLanguage.Telugu => "te",
                IndianLanguage.Kannada => "kn",
                IndianLanguage.Malayalam => "ml",
                IndianLanguage.Bengali => "bn",
                IndianLanguage.Marathi => "mr",
                IndianLanguage.Gujarati => "gu",
                IndianLanguage.Punjabi => "pa",
                IndianLanguage.Urdu => "ur",
                IndianLanguage.Sanskrit => "sa",
                IndianLanguage.Odia => "or",
                IndianLanguage.Assamese => "as",
                _ => "hi"
            };
        }

        public static string GetIndianVoiceId(IndianLanguage lang, VoiceGender gender)
        {
            bool isMale = gender == VoiceGender.Male;
            return lang switch
            {
                IndianLanguage.Hindi => isMale ? "hi-aarav" : "hi-ananya",
                IndianLanguage.IndianEnglish => isMale ? "en-in-rohan" : "en-in-priya",
                IndianLanguage.Tamil => isMale ? "ta-karthik" : "ta-meera",
                IndianLanguage.Telugu => isMale ? "te-arjun" : "te-divya",
                IndianLanguage.Kannada => isMale ? "kn-vikram" : "kn-kavya",
                IndianLanguage.Malayalam => isMale ? "ml-pranav" : "ml-anjali",
                IndianLanguage.Bengali => isMale ? "bn-rahul" : "bn-pooja",
                IndianLanguage.Marathi => isMale ? "mr-aditya" : "mr-tanvi",
                IndianLanguage.Gujarati => isMale ? "gu-harsh" : "gu-diya",
                IndianLanguage.Punjabi => isMale ? "pa-gurpreet" : "pa-simran",
                IndianLanguage.Urdu => isMale ? "ur-zayan" : "ur-zoya",
                IndianLanguage.Sanskrit => isMale ? "sa-aryaman" : "sa-vedika",
                IndianLanguage.Odia => isMale ? "or-debasis" : "or-itishree",
                IndianLanguage.Assamese => isMale ? "as-anupam" : "as-jonali",
                _ => "hi-aarav"
            };
        }

        private string EscapeJson(string s)
        {
            return "\\"" + s.Replace("\\\\", "\\\\\\\\").Replace("\\"", "\\\\\\"").Replace("\\n", "\\\\n") + "\\"";
        }
    }
}
`
  },

  'TTSLipSync.cs': {
    filename: 'TTSLipSync.cs',
    language: 'csharp',
    category: '3D Lip-Sync',
    description: '3D Character facial blendshape controller driving ReadyPlayerMe, Oculus OVR, and ARKit mesh visemes.',
    content: `// ============================================================================
// TTSLipSync.cs - Real-Time 3D Character Viseme & Blendshape Controller
// Drives SkinnedMeshRenderer for ReadyPlayerMe, ARKit, and Oculus OVR Avatars
// ============================================================================

using System.Collections.Generic;
using UnityEngine;

namespace GeminiTTS
{
    public enum AvatarMeshStandard
    {
        ReadyPlayerMe,
        OculusOVR,
        AppleARKit,
        CustomManual
    }

    [RequireComponent(typeof(SkinnedMeshRenderer))]
    public class TTSLipSync : MonoBehaviour
    {
        [Header("Mesh Configuration")]
        public SkinnedMeshRenderer targetSkinnedMesh;
        public AvatarMeshStandard meshStandard = AvatarMeshStandard.ReadyPlayerMe;

        [Header("Animation Dynamics")]
        [Range(5f, 35f)] public float blendSmoothSpeed = 22f;
        [Range(0f, 2f)] public float expressionMultiplier = 1.0f;

        [Header("Audio FFT Fallback (Auto Mouth Movement)")]
        public bool enableAudioSpectrumFallback = true;
        public AudioSource speechAudioSource;
        [Range(10f, 150f)] public float spectrumMouthSensitivity = 65f;

        // Blendshape name mapping dictionary
        private Dictionary<string, int> _blendshapeIndices = new Dictionary<string, int>();
        private float[] _currentWeights;
        private float[] _targetWeights;
        private float[] _audioSpectrum = new float[64];

        private void Start()
        {
            if (targetSkinnedMesh == null)
            {
                targetSkinnedMesh = GetComponent<SkinnedMeshRenderer>();
            }

            if (speechAudioSource == null && UnityTTSManager.Instance != null)
            {
                speechAudioSource = UnityTTSManager.Instance.targetAudioSource;
            }

            CacheMeshBlendshapes();

            // Register event listener with UnityTTSManager
            if (UnityTTSManager.Instance != null)
            {
                UnityTTSManager.Instance.OnVisemeUpdated += HandleVisemeFrame;
            }
        }

        private void OnDestroy()
        {
            if (UnityTTSManager.Instance != null)
            {
                UnityTTSManager.Instance.OnVisemeUpdated -= HandleVisemeFrame;
            }
        }

        private void CacheMeshBlendshapes()
        {
            if (targetSkinnedMesh == null || targetSkinnedMesh.sharedMesh == null) return;

            Mesh mesh = targetSkinnedMesh.sharedMesh;
            int count = mesh.blendShapeCount;
            _blendshapeIndices.Clear();
            _currentWeights = new float[count];
            _targetWeights = new float[count];

            for (int i = 0; i < count; i++)
            {
                string shapeName = mesh.GetBlendShapeName(i);
                _blendshapeIndices[shapeName.ToLower()] = i;
            }
        }

        public void HandleVisemeFrame(VisemeData visemeData)
        {
            if (targetSkinnedMesh == null || visemeData == null) return;

            // Reset targets
            for (int i = 0; i < _targetWeights.Length; i++)
            {
                _targetWeights[i] = 0f;
            }

            string shapeKey = MapVisemeToMeshShape(visemeData.viseme);
            if (!string.IsNullOrEmpty(shapeKey) && _blendshapeIndices.TryGetValue(shapeKey.ToLower(), out int shapeIdx))
            {
                _targetWeights[shapeIdx] = Mathf.Clamp01(visemeData.weight * expressionMultiplier) * 100f;
            }

            // Apply Jaw Open
            if (_blendshapeIndices.TryGetValue("jawopen", out int jawIdx))
            {
                _targetWeights[jawIdx] = Mathf.Clamp01(visemeData.jawOpen * expressionMultiplier) * 100f;
            }
            else if (_blendshapeIndices.TryGetValue("viseme_aa", out int aaIdx) && string.IsNullOrEmpty(shapeKey))
            {
                _targetWeights[aaIdx] = Mathf.Clamp01(visemeData.jawOpen * expressionMultiplier) * 100f;
            }
        }

        private void Update()
        {
            if (targetSkinnedMesh == null) return;

            // Audio Spectrum FFT fallback if audio is playing without explicit viseme streams
            if (enableAudioSpectrumFallback && speechAudioSource != null && speechAudioSource.isPlaying)
            {
                speechAudioSource.GetSpectrumData(_audioSpectrum, 0, FFTWindow.BlackmanHarris);
                float lowFreqVolume = (_audioSpectrum[1] + _audioSpectrum[2] + _audioSpectrum[3]) * 0.33f;
                float dynamicJaw = Mathf.Clamp01(lowFreqVolume * spectrumMouthSensitivity) * 100f;

                if (_blendshapeIndices.TryGetValue("jawopen", out int jawIdx))
                {
                    _targetWeights[jawIdx] = Mathf.Max(_targetWeights[jawIdx], dynamicJaw);
                }
                else if (_blendshapeIndices.TryGetValue("viseme_aa", out int aaIdx))
                {
                    _targetWeights[aaIdx] = Mathf.Max(_targetWeights[aaIdx], dynamicJaw);
                }
            }

            // Smooth interpolation to target weights
            float step = Time.deltaTime * blendSmoothSpeed;
            for (int i = 0; i < _currentWeights.Length; i++)
            {
                _currentWeights[i] = Mathf.Lerp(_currentWeights[i], _targetWeights[i], step);
                targetSkinnedMesh.SetBlendShapeWeight(i, _currentWeights[i]);
            }
        }

        private string MapVisemeToMeshShape(string viseme)
        {
            if (string.IsNullOrEmpty(viseme)) return "viseme_sil";

            switch (meshStandard)
            {
                case AvatarMeshStandard.ReadyPlayerMe:
                    return viseme switch
                    {
                        "viseme_aa" => "viseme_aa",
                        "viseme_E" => "viseme_E",
                        "viseme_I" => "viseme_I",
                        "viseme_O" => "viseme_O",
                        "viseme_U" => "viseme_U",
                        "viseme_PP" => "viseme_PP",
                        "viseme_FF" => "viseme_FF",
                        "viseme_TH" => "viseme_TH",
                        "viseme_DD" => "viseme_DD",
                        "viseme_kk" => "viseme_kk",
                        "viseme_CH" => "viseme_CH",
                        "viseme_SS" => "viseme_SS",
                        "viseme_nn" => "viseme_nn",
                        "viseme_RR" => "viseme_RR",
                        _ => "viseme_sil"
                    };

                case AvatarMeshStandard.AppleARKit:
                    return viseme switch
                    {
                        "viseme_aa" => "jawOpen",
                        "viseme_O" => "mouthPucker",
                        "viseme_U" => "mouthFunnel",
                        "viseme_E" => "mouthSmileLeft",
                        "viseme_PP" => "mouthClose",
                        _ => "jawOpen"
                    };

                default:
                    return viseme;
            }
        }
    }
}
`
  },

  'WavUtility.cs': {
    filename: 'WavUtility.cs',
    language: 'csharp',
    category: 'Audio Utility',
    description: 'High-performance binary parser turning raw byte arrays into native Unity AudioClips in memory.',
    content: `// ============================================================================
// WavUtility.cs - Pure C# In-Memory WAV & PCM Byte Parser for Unity
// Converts raw network audio byte arrays into native Unity AudioClip instances
// ============================================================================

using System;
using System.IO;
using UnityEngine;

namespace GeminiTTS
{
    public static class WavUtility
    {
        public static AudioClip ToAudioClip(byte[] wavFileBytes, int offsetSamples = 0, string clipName = "TTS_AudioClip")
        {
            if (wavFileBytes == null || wavFileBytes.Length < 44)
            {
                Debug.LogError("[GeminiTTS WavUtility] Invalid byte array received for WAV conversion.");
                return null;
            }

            using (MemoryStream stream = new MemoryStream(wavFileBytes))
            using (BinaryReader reader = new BinaryReader(stream))
            {
                // Verify RIFF header
                string riff = new string(reader.ReadChars(4));
                if (riff != "RIFF")
                {
                    Debug.LogWarning("[GeminiTTS WavUtility] Missing RIFF header, assuming raw 24kHz 16-bit Mono PCM.");
                    return ConvertRawPCM(wavFileBytes, 24000, clipName);
                }

                int fileSize = reader.ReadInt32();
                string wave = new string(reader.ReadChars(4)); // "WAVE"

                // Find "fmt " chunk
                while (reader.BaseStream.Position < reader.BaseStream.Length)
                {
                    string chunkId = new string(reader.ReadChars(4));
                    int chunkSize = reader.ReadInt32();

                    if (chunkId == "fmt ")
                    {
                        int audioFormat = reader.ReadInt16(); // 1 = PCM
                        int channels = reader.ReadInt16();
                        int sampleRate = reader.ReadInt32();
                        int byteRate = reader.ReadInt32();
                        int blockAlign = reader.ReadInt16();
                        int bitsPerSample = reader.ReadInt16();

                        // Advance if extra format bytes
                        if (chunkSize > 16)
                        {
                            reader.ReadBytes(chunkSize - 16);
                        }

                        // Now find data chunk
                        while (reader.BaseStream.Position < reader.BaseStream.Length)
                        {
                            string dataChunkId = new string(reader.ReadChars(4));
                            int dataSize = reader.ReadInt32();

                            if (dataChunkId == "data")
                            {
                                int sampleCount = dataSize / (bitsPerSample / 8);
                                float[] floatData = new float[sampleCount];

                                if (bitsPerSample == 16)
                                {
                                    for (int i = 0; i < sampleCount; i++)
                                    {
                                        short sample = reader.ReadInt16();
                                        floatData[i] = sample / 32768.0f;
                                    }
                                }
                                else if (bitsPerSample == 8)
                                {
                                    for (int i = 0; i < sampleCount; i++)
                                    {
                                        byte sample = reader.ReadByte();
                                        floatData[i] = (sample - 128) / 128.0f;
                                    }
                                }

                                AudioClip clip = AudioClip.Create(clipName, sampleCount / channels, channels, sampleRate, false);
                                clip.SetData(floatData, offsetSamples);
                                return clip;
                            }
                            else
                            {
                                reader.ReadBytes(dataSize);
                            }
                        }
                    }
                    else
                    {
                        reader.ReadBytes(chunkSize);
                    }
                }
            }

            return null;
        }

        private static AudioClip ConvertRawPCM(byte[] pcmBytes, int sampleRate, string clipName)
        {
            int sampleCount = pcmBytes.Length / 2;
            float[] floatData = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                short sample = (short)(pcmBytes[i * 2] | (pcmBytes[i * 2 + 1] << 8));
                floatData[i] = sample / 32768.0f;
            }

            AudioClip clip = AudioClip.Create(clipName, sampleCount, 1, sampleRate, false);
            clip.SetData(floatData, 0);
            return clip;
        }
    }
}
`
  },

  'TTSAudioCache.cs': {
    filename: 'TTSAudioCache.cs',
    language: 'csharp',
    category: 'Caching',
    description: 'SHA-256 persistent disk and RAM cache to eliminate duplicate network calls for game dialogue.',
    content: `// ============================================================================
// TTSAudioCache.cs - Persistent Disk & RAM Dialogue Audio Cache
// Eliminates repetitive network calls by caching synthesized voice clips
// ============================================================================

using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;

namespace GeminiTTS
{
    public static class TTSAudioCache
    {
        private static readonly Dictionary<string, AudioClip> _memoryCache = new Dictionary<string, AudioClip>();
        private static string _cacheDirectory;

        static TTSAudioCache()
        {
            _cacheDirectory = Path.Combine(Application.persistentDataPath, "GeminiTTS_AudioCache");
            if (!Directory.Exists(_cacheDirectory))
            {
                Directory.CreateDirectory(_cacheDirectory);
            }
        }

        public static bool TryGetClip(string text, string voiceId, out AudioClip clip)
        {
            string key = ComputeKey(text, voiceId);

            // 1. Check RAM cache
            if (_memoryCache.TryGetValue(key, out clip) && clip != null)
            {
                return true;
            }

            // 2. Check Disk Cache
            string filePath = Path.Combine(_cacheDirectory, key + ".wav");
            if (File.Exists(filePath))
            {
                try
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    clip = WavUtility.ToAudioClip(bytes, 0, "Cached_" + voiceId);
                    if (clip != null)
                    {
                        _memoryCache[key] = clip;
                        return true;
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[GeminiTTS Cache] Failed loading cached audio file: {ex.Message}");
                }
            }

            clip = null;
            return false;
        }

        public static void SaveClip(string text, string voiceId, byte[] wavBytes)
        {
            try
            {
                string key = ComputeKey(text, voiceId);
                string filePath = Path.Combine(_cacheDirectory, key + ".wav");
                File.WriteAllBytes(filePath, wavBytes);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[GeminiTTS Cache] Failed saving audio to disk: {ex.Message}");
            }
        }

        public static void ClearCache()
        {
            _memoryCache.Clear();
            if (Directory.Exists(_cacheDirectory))
            {
                string[] files = Directory.GetFiles(_cacheDirectory);
                foreach (string f in files)
                {
                    File.Delete(f);
                }
            }
        }

        private static string ComputeKey(string text, string voiceId)
        {
            using (SHA256 sha = SHA256.Create())
            {
                byte[] input = Encoding.UTF8.GetBytes($"{voiceId}_{text.Trim()}");
                byte[] hash = sha.ComputeHash(input);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < 8; i++) // 16-character hex hash
                {
                    sb.Append(hash[i].ToString("X2"));
                }
                return sb.ToString();
            }
        }
    }
}
`
  },

  'TTSDialogueTrigger.cs': {
    filename: 'TTSDialogueTrigger.cs',
    language: 'csharp',
    category: 'NPC Trigger',
    description: '3D Spatial NPC proximity trigger with 3D audio rolloff, subtitles, and player interaction.',
    content: `// ============================================================================
// TTSDialogueTrigger.cs - 3D Spatial NPC Proximity Dialogue Component
// Automatically triggers dialogue and positional voice synthesis on approach
// ============================================================================

using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace GeminiTTS
{
    [RequireComponent(typeof(AudioSource), typeof(Collider))]
    public class TTSDialogueTrigger : MonoBehaviour
    {
        [Header("Voice & Identity")]
        public IndianLanguage npcLanguage = IndianLanguage.Hindi;
        public VoiceGender npcGender = VoiceGender.Male;

        [Header("Dialogue Content (Supports Native Script or English)")]
        [TextArea(2, 5)]
        public string[] dialogueLines = new string[]
        {
            "नमस्ते वीर योद्धा! हमारे राज्य में आपका स्वागत है।"
        };

        [Header("3D Spatial Audio Setup")]
        public AudioSource npcAudioSource;
        [Range(1f, 25f)] public float triggerRadius = 5f;
        [Range(1f, 10f)] public float min3DDistance = 1.5f;
        [Range(10f, 50f)] public float max3DDistance = 20f;

        [Header("Subtitle Events")]
        public UnityEvent<string> onSubtitleShown;
        public UnityEvent onDialogueEnded;

        private int _currentLineIndex = 0;
        private bool _isSpeaking = false;

        private void Start()
        {
            if (npcAudioSource == null)
            {
                npcAudioSource = GetComponent<AudioSource>();
            }

            // Configure 3D Spatial Sound on AudioSource
            npcAudioSource.spatialBlend = 1.0f; // 100% 3D Positional
            npcAudioSource.minDistance = min3DDistance;
            npcAudioSource.maxDistance = max3DDistance;
            npcAudioSource.rolloffMode = AudioRolloffMode.Logarithmic;

            // Configure Trigger Collider
            SphereCollider col = GetComponent<SphereCollider>();
            if (col != null)
            {
                col.isTrigger = true;
                col.radius = triggerRadius;
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") && !_isSpeaking)
            {
                PlayNextLine();
            }
        }

        public void PlayNextLine()
        {
            if (dialogueLines == null || dialogueLines.Length == 0) return;

            string line = dialogueLines[_currentLineIndex];
            _isSpeaking = true;
            onSubtitleShown?.Invoke(line);

            if (UnityTTSManager.Instance != null)
            {
                UnityTTSManager.Instance.SpeakIndian(line, npcLanguage, npcGender, (clip, visemes) =>
                {
                    if (npcAudioSource != null && clip != null)
                    {
                        npcAudioSource.clip = clip;
                        npcAudioSource.Play();
                        StartCoroutine(WaitForAudio(clip.length));
                    }
                });
            }

            _currentLineIndex = (_currentLineIndex + 1) % dialogueLines.Length;
        }

        private System.Collections.IEnumerator WaitForAudio(float duration)
        {
            yield return new WaitForSeconds(duration);
            _isSpeaking = false;
            onDialogueEnded?.Invoke();
        }
    }
}
`
  },

  'UnityWebGLSpeechSynthesizer.jslib': {
    filename: 'UnityWebGLSpeechSynthesizer.jslib',
    language: 'javascript',
    category: 'WebGL Bridge',
    description: 'Native WebGL JavaScript plugin for zero-latency in-browser Web Speech API synthesis.',
    content: `// ============================================================================
// UnityWebGLSpeechSynthesizer.jslib - Native WebGL Speech Synthesis Bridge
// Provides zero-latency browser Web Speech synthesis for Unity WebGL exports
// ============================================================================

mergeInto(LibraryManager.library, {
    SpeakWebGLText: function (textPtr, langPtr, pitch, rate) {
        var text = UTF8ToString(textPtr);
        var lang = UTF8ToString(langPtr);

        if (!('speechSynthesis' in window)) {
            console.warn('[GeminiTTS WebGL] Browser does not support window.speechSynthesis');
            return;
        }

        window.speechSynthesis.cancel(); // Stop active voices

        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang || 'hi-IN';
        utterance.pitch = pitch || 1.0;
        utterance.rate = rate || 1.0;

        // Try to match appropriate voice
        var voices = window.speechSynthesis.getVoices();
        for (var i = 0; i < voices.length; i++) {
            if (voices[i].lang.startsWith(lang.substring(0, 2))) {
                utterance.voice = voices[i];
                break;
            }
        }

        utterance.onstart = function () {
            SendMessage('TTSManager', 'OnWebGLSpeechStart', text);
        };

        utterance.onend = function () {
            SendMessage('TTSManager', 'OnWebGLSpeechEnd', text);
        };

        window.speechSynthesis.speak(utterance);
    },

    CancelWebGLSpeech: function () {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
});
`
  },

  'TTSManagerEditor.cs': {
    filename: 'TTSManagerEditor.cs',
    language: 'csharp',
    category: 'Editor Tools',
    description: 'Custom Unity Editor inspector test-bench for testing Indian & Global voices in Play Mode.',
    content: `// ============================================================================
// TTSManagerEditor.cs - Custom Unity Inspector Test Bench
// Enables live testing and speech synthesis inside the Unity Editor
// ============================================================================

#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace GeminiTTS
{
    [CustomEditor(typeof(UnityTTSManager))]
    public class TTSManagerEditor : Editor
    {
        private string _testLine = "सावधान! हमारा राज्य संकट में है। अपनी तलवार उठाओ!";
        private IndianLanguage _testLanguage = IndianLanguage.Hindi;
        private VoiceGender _testGender = VoiceGender.Male;

        public override void OnInspectorGUI()
        {
            DrawDefaultInspector();

            UnityTTSManager manager = (UnityTTSManager)target;

            EditorGUILayout.Space(15);
            EditorGUILayout.LabelField("🎮 Indic Speech Test Bench", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("Test speech synthesis and lip-sync events live in Play Mode.", MessageType.Info);

            _testLanguage = (IndianLanguage)EditorGUILayout.EnumPopup("Indian Language", _testLanguage);
            _testGender = (VoiceGender)EditorGUILayout.EnumPopup("Voice Gender", _testGender);

            EditorGUILayout.LabelField("Test Line (Native Script or English):");
            _testLine = EditorGUILayout.TextArea(_testLine, GUILayout.Height(50));

            GUI.enabled = Application.isPlaying;
            if (GUILayout.Button("🔊 Synthesize & Speak Now", GUILayout.Height(35)))
            {
                manager.SpeakIndian(_testLine, _testLanguage, _testGender, (clip, visemes) =>
                {
                    Debug.Log($"[GeminiTTS] Generated audio clip: {clip.name}, duration: {clip.length:F2}s, visemes: {visemes?.Length ?? 0}");
                });
            }

            if (!Application.isPlaying)
            {
                EditorGUILayout.HelpBox("Enter Play Mode to test audio synthesis.", MessageType.Warning);
            }
            GUI.enabled = true;
        }
    }
}
#endif
`
  },

  'GeminiTTS.asmdef': {
    filename: 'GeminiTTS.asmdef',
    language: 'json',
    category: 'Package Config',
    description: 'Unity Assembly Definition for clean modular architecture and compilation speeds.',
    content: `{
    "name": "GeminiTTS",
    "rootNamespace": "GeminiTTS",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": [],
    "noEngineReferences": false
}
`
  }
};
