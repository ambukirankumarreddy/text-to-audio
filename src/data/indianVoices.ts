import { VoiceProfile, IndianLanguage } from '../types';

export const INDIAN_LANGUAGES: { name: IndianLanguage; native: string; code: string }[] = [
  { name: 'Hindi', native: 'हिन्दी', code: 'hi-IN' },
  { name: 'Indian English', native: 'English (India)', code: 'en-IN' },
  { name: 'Tamil', native: 'தமிழ்', code: 'ta-IN' },
  { name: 'Telugu', native: 'తెలుగు', code: 'te-IN' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn-IN' },
  { name: 'Malayalam', native: 'മലയാളം', code: 'ml-IN' },
  { name: 'Bengali', native: 'বাংলা', code: 'bn-IN' },
  { name: 'Marathi', native: 'मराठी', code: 'mr-IN' },
  { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu-IN' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
  { name: 'Urdu', native: 'اردو', code: 'ur-IN' },
  { name: 'Sanskrit', native: 'संस्कृतम्', code: 'sa-IN' },
  { name: 'Odia', native: 'ଓଡ଼ିଆ', code: 'or-IN' },
  { name: 'Assamese', native: 'অসমীয়া', code: 'as-IN' },
];

export const INDIAN_VOICES: VoiceProfile[] = [
  // 1. Hindi (hi-IN)
  {
    id: 'hi-aarav',
    name: 'Aarav (आरव)',
    nativeScript: 'आरव - वीर योद्धा',
    language: 'Hindi',
    languageCode: 'hi-IN',
    gender: 'male',
    archetype: 'Heroic Warrior & Protagonist',
    personality: 'Resolute, commanding, and passionate with a rich baritone resonance.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.95,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'सावधान! हमारा राज्य संकट में है। अपनी तलवार उठाओ और युद्ध के लिए तैयार हो जाओ!',
        romanizedText: 'Saavdhan! Hamaara rajya sankat mein hai. Apni talwaar uthao aur yuddh ke liye taiyaar ho jao!',
        englishMeaning: 'Beware! Our kingdom is in grave danger. Raise your sword and prepare for battle!'
      },
      {
        category: 'Battle Cry',
        nativeText: 'जीत हमारी होगी! पीछे मत हटना, आगे बढ़ो!',
        romanizedText: 'Jeet hamaari hogi! Peechhe mat hatna, aage badho!',
        englishMeaning: 'Victory shall be ours! Do not fall back, push forward!'
      },
      {
        category: 'Casual NPC',
        nativeText: 'नमस्ते मित्र! क्या तुम्हें शहर के मुख्य चौराहे का रास्ता पता है?',
        romanizedText: 'Namaste mitra! Kya tumhe shahar ke mukhya chauraahe ka raasta pata hai?',
        englishMeaning: 'Greetings friend! Do you know the way to the city main square?'
      }
    ]
  },
  {
    id: 'hi-ananya',
    name: 'Ananya (अनन्या)',
    nativeScript: 'अनन्या - राजसी कथावाचिका',
    language: 'Hindi',
    languageCode: 'hi-IN',
    gender: 'female',
    archetype: 'Royal Princess & Graceful Narrator',
    personality: 'Elegant, gentle, expressive, and melodic with clear diction.',
    geminiVoice: 'Kore',
    pitchOffset: 1.05,
    speedMultiplier: 0.98,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'इस प्राचीन मंदिर में अनंत शांति है। माँ भवानी का आशीर्वाद सदा तुम्हारे साथ रहे।',
        romanizedText: 'Is praacheen mandir mein anant shaanti hai. Maa Bhavani ka aasheervaad sadaa tumhaare saath rahe.',
        englishMeaning: 'There is eternal peace in this ancient shrine. May the Mother goddess bless your journey forever.'
      },
      {
        category: 'Wise Sage / Elder',
        nativeText: 'जो धैर्य रखता है, विजय अंत में उसी की होती है। साहस मत छोड़ना।',
        romanizedText: 'Jo dhairya rakhta hai, vijay ant mein usi ki hoti hai. Saahas mat chhodna.',
        englishMeaning: 'Those who maintain patience ultimately triumph. Never lose your courage.'
      },
      {
        category: 'AI / Tech Guide',
        nativeText: 'प्रणाली सक्रिय हो चुकी है। सभी नेविगेशन निर्देशांक सुरक्षित हैं।',
        romanizedText: 'Pranaali sakriya ho chuki hai. Sabhi navigation nirdeshank surakshit hain.',
        englishMeaning: 'System online. All navigation coordinates verified and locked.'
      }
    ]
  },

  // 2. Indian English (en-IN)
  {
    id: 'en-in-rohan',
    name: 'Rohan (रोहन)',
    nativeScript: 'Rohan - Tech Lead / Urban Hero',
    language: 'Indian English',
    languageCode: 'en-IN',
    gender: 'male',
    archetype: 'Tech Lead & Modern Adventurer',
    personality: 'Crisp Indian-English accent, energetic, articulate, and trustworthy.',
    geminiVoice: 'Puck',
    pitchOffset: 1.0,
    speedMultiplier: 1.05,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'AI / Tech Guide',
        nativeText: 'Target acquired on radar. Synchronizing the telemetry data with your HUD right now.',
        romanizedText: 'Target acquired on radar. Synchronizing the telemetry data with your HUD right now.',
        englishMeaning: 'Target acquired on radar. Synchronizing telemetry data with HUD.'
      },
      {
        category: 'RPG Warrior',
        nativeText: 'Hold the perimeter! We cannot allow the corrupted drones to breach Sector 4!',
        romanizedText: 'Hold the perimeter! We cannot allow the corrupted drones to breach Sector 4!',
        englishMeaning: 'Hold the perimeter against the hostile breach.'
      }
    ]
  },
  {
    id: 'en-in-priya',
    name: 'Priya (प्रिया)',
    nativeScript: 'Priya - AI Companion & Scholar',
    language: 'Indian English',
    languageCode: 'en-IN',
    gender: 'female',
    archetype: 'Futuristic AI & Smart Companion',
    personality: 'Warm, refined, reassuring tone with contemporary Indian English cadence.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.08,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'AI / Tech Guide',
        nativeText: 'Welcome back, Commander. Quantum core temperature is stable at optimal efficiency.',
        romanizedText: 'Welcome back, Commander. Quantum core temperature is stable at optimal efficiency.',
        englishMeaning: 'Welcome greeting and telemetry report.'
      },
      {
        category: 'Casual NPC',
        nativeText: 'I discovered an encrypted memory archive hidden inside the ancient ruins. Should I decrypt it?',
        romanizedText: 'I discovered an encrypted memory archive hidden inside the ancient ruins. Should I decrypt it?',
        englishMeaning: 'Dialogue proposing decryption of secret ruins data.'
      }
    ]
  },

  // 3. Tamil (ta-IN)
  {
    id: 'ta-karthik',
    name: 'Karthik (கார்த்திக்)',
    nativeScript: 'கார்த்திக் - சோழ தளபதி',
    language: 'Tamil',
    languageCode: 'ta-IN',
    gender: 'male',
    archetype: 'Chola Commander & Legendary Warrior',
    personality: 'Commanding, fierce, rhythmic Tamil orator with profound gravity.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.93,
    speedMultiplier: 1.02,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'சோழ நாட்டின் பெருமையை காப்போம்! நமது படை புறப்பட தயாராக உள்ளது!',
        romanizedText: 'Chola naattin perumaiyai kaappom! Namadhu padai purappada thayaaraaga ulladhu!',
        englishMeaning: 'We shall defend the glory of the Chola empire! Our army is ready to march!'
      },
      {
        category: 'Battle Cry',
        nativeText: 'வெற்றி நமதே! பகைவரை ஓட ஓட விரட்டுங்கள்!',
        romanizedText: 'Vetri namadhe! Pagaivarai oda oda virattungal!',
        englishMeaning: 'Victory is ours! Chase the enemies till they retreat!'
      }
    ]
  },
  {
    id: 'ta-meera',
    name: 'Meera (மீரா)',
    nativeScript: 'மீரா - கோவில் ஆசிரியை',
    language: 'Tamil',
    languageCode: 'ta-IN',
    gender: 'female',
    archetype: 'Temple Mystic & Classical Narrator',
    personality: 'Soothing, melodious, classical diction filled with reverence.',
    geminiVoice: 'Kore',
    pitchOffset: 1.04,
    speedMultiplier: 0.96,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'வணக்கம்! இந்த புனித தலத்திற்கு உங்களை அன்புடன் வரவேற்கிறேன்.',
        romanizedText: 'Vanakkam! Indha punitha thalathirku ungalai anbudan varaverkirom.',
        englishMeaning: 'Greetings! I warmly welcome you to this sacred sanctum.'
      },
      {
        category: 'Wise Sage / Elder',
        nativeText: 'தர்மத்தின் வழியில் நடப்பவருக்கு எந்த பயமும் இல்லை.',
        romanizedText: 'Dharmatthin vazhiyil nadappavarukku endha bayamum illai.',
        englishMeaning: 'Those who walk the path of righteousness have nothing to fear.'
      }
    ]
  },

  // 4. Telugu (te-IN)
  {
    id: 'te-arjun',
    name: 'Arjun (అర్జున్)',
    nativeScript: 'అర్జున్ - వీర యోధుడు',
    language: 'Telugu',
    languageCode: 'te-IN',
    gender: 'male',
    archetype: 'Tollywood Action Star & Hero',
    personality: 'Punchy, charismatic, bold, and energetic with dynamic modulation.',
    geminiVoice: 'Charon',
    pitchOffset: 0.97,
    speedMultiplier: 1.04,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Battle Cry',
        nativeText: 'యుద్ధం మొదలైంది! శత్రువులను ఎట్టి పరిస్థితుల్లోనూ వదిలిపెట్టేది లేదు!',
        romanizedText: 'Yuddham modalaindi! Shatruvulanu etti paristhithulloonu vadilipettedi ledu!',
        englishMeaning: 'The war has begun! Under no circumstances will the enemies be spared!'
      },
      {
        category: 'RPG Warrior',
        nativeText: 'నాతో రండి! ఈ కోటను మనం కాపాడుకోవాలి!',
        romanizedText: 'Naatho randi! Ee kotanu manam kaapaadukovaali!',
        englishMeaning: 'Come with me! We must defend this fortress at all costs!'
      }
    ]
  },
  {
    id: 'te-divya',
    name: 'Divya (దివ్య)',
    nativeScript: 'దివ్య - పూజారిణి / మార్గదర్శి',
    language: 'Telugu',
    languageCode: 'te-IN',
    gender: 'female',
    archetype: 'Gentle Mystic & Spiritual Guide',
    personality: 'Sweet, compassionate, articulate, and crystal clear.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.06,
    speedMultiplier: 0.98,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'శుభోదయం మిత్రమా! నీ సంకల్పం విజయవంతం కావాలని కోరుకుంటున్నాను.',
        romanizedText: 'Shubhodhayam mitrama! Nee sankalpam vijayavantham kaavalani korukuntunnanu.',
        englishMeaning: 'Good morning my friend! I pray that your noble resolve meets great victory.'
      },
      {
        category: 'Wise Sage / Elder',
        nativeText: 'సత్యం మరియు ధర్మం ఎప్పుడూ నిన్ను సరైన దారిలో నడిపిస్తాయి.',
        romanizedText: 'Satyam mariyu dharmam eppudoo ninnu saraina daarilo nadipisthaayi.',
        englishMeaning: 'Truth and righteous virtue will always guide you along the right path.'
      }
    ]
  },

  // 5. Kannada (kn-IN)
  {
    id: 'kn-vikram',
    name: 'Vikram (ವಿಕ್ರಮ್)',
    nativeScript: 'ವಿಕ್ರಮ್ - ಕದಂಬ ನಾಯಕ',
    language: 'Kannada',
    languageCode: 'kn-IN',
    gender: 'male',
    archetype: 'Sandalwood Hero & Defender',
    personality: 'Deep, resonant, dignified, and brave tone.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.94,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'ಕರುನಾಡಿನ ಗೌರವಕ್ಕಾಗಿ ನಾವು ನಮ್ಮ ಕೊನೆಯ ಉಸಿರಿನವರೆಗೂ ಹೋರಾಡುತ್ತೇವೆ!',
        romanizedText: 'Karunaadina gouravakkaagi naavu namma koneya usirinavaregoo horaadutteve!',
        englishMeaning: 'For the honor of Karnataka, we will fight till our very last breath!'
      }
    ]
  },
  {
    id: 'kn-kavya',
    name: 'Kavya (ಕಾವ್ಯ)',
    nativeScript: 'ಕಾವ್ಯ - ವಿದುಷಿ / ರಾಜಕುಮಾರಿ',
    language: 'Kannada',
    languageCode: 'kn-IN',
    gender: 'female',
    archetype: 'Royal Scholar & Companion',
    personality: 'Soft-spoken, melodic, scholarly, and reassuring.',
    geminiVoice: 'Kore',
    pitchOffset: 1.05,
    speedMultiplier: 0.98,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Wise Sage / Elder',
        nativeText: 'ಜ್ಞಾನವೇ ಶಕ್ತಿ. ನಿಮ್ಮ ಸಾಹಸದಲ್ಲಿ ಈ ರಹಸ್ಯ ಗ್ರಂಥವು ದಾರಿದೀಪವಾಗಲಿದೆ.',
        romanizedText: 'Jnaanave shakti. Nimma saahasadhalli ee rahasya granthavu daarideepavaagalide.',
        englishMeaning: 'Knowledge is power. In your perilous quest, this secret scroll will be your guiding beacon.'
      }
    ]
  },

  // 6. Malayalam (ml-IN)
  {
    id: 'ml-pranav',
    name: 'Pranav (പ്രണവ്)',
    nativeScript: 'പ്രണവ് - തീരദേശ നാവികൻ',
    language: 'Malayalam',
    languageCode: 'ml-IN',
    gender: 'male',
    archetype: 'Coastal Navigator & Storyteller',
    personality: 'Warm, lyrical, natural Malayalam cadence with soothing timbre.',
    geminiVoice: 'Charon',
    pitchOffset: 0.96,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'കടൽ ശാന്തമാണ്, പക്ഷെ വരാനിരിക്കുന്ന കൊടുങ്കാറ്റിനെ നാം കരുതിയിരിക്കണം.',
        romanizedText: 'Kadal shaanthamaanu, pakshe varaanirikkunna kodunkaattine naam karuthiyirakkanam.',
        englishMeaning: 'The sea is calm right now, but we must stay prepared for the coming gale.'
      }
    ]
  },
  {
    id: 'ml-anjali',
    name: 'Anjali (അഞ്ജലി)',
    nativeScript: 'അഞ്ജലി - നാടോടി ഗായിക',
    language: 'Malayalam',
    languageCode: 'ml-IN',
    gender: 'female',
    archetype: 'Soothing Storyteller & Healer',
    personality: 'Calming, gentle, poetic, and heartwarming.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.06,
    speedMultiplier: 0.96,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'ഈ വനത്തിലെ ഔഷധസസ്യങ്ങൾ നിങ്ങളുടെ എല്ലാ മുറിവുകളും സുഖപ്പെടുത്തും.',
        romanizedText: 'Ee vanatthile aushadha sasyangal ningalude ellaa murivukalum sukhappaduthum.',
        englishMeaning: 'The medicinal herbs in this mystical forest will heal all your battle wounds.'
      }
    ]
  },

  // 7. Bengali (bn-IN)
  {
    id: 'bn-rahul',
    name: 'Rahul (রাহুল)',
    nativeScript: 'রাহুল - নাট্যকার / যোদ্ধা',
    language: 'Bengali',
    languageCode: 'bn-IN',
    gender: 'male',
    archetype: 'Kolkata Theatrical Orator & Hero',
    personality: 'Passionate, dramatic, rich emotional depth and poetic rhythm.',
    geminiVoice: 'Puck',
    pitchOffset: 0.96,
    speedMultiplier: 1.02,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'আমাদের এই পবিত্র ভূমির ওপর কোনো অপশক্তির ছায়া পড়তে দেব না!',
        romanizedText: 'Aamader ei pobitro bhoomir opor kono oposhoktir chhaaya porte debo na!',
        englishMeaning: 'We will never allow the dark shadows of evil to fall upon our sacred land!'
      }
    ]
  },
  {
    id: 'bn-pooja',
    name: 'Pooja (পূজা)',
    nativeScript: 'পূজা - ঐতিহ্যের কণ্ঠস্বর',
    language: 'Bengali',
    languageCode: 'bn-IN',
    gender: 'female',
    archetype: 'Poetic Heritage Voice & Scholar',
    personality: 'Sweet, expressive, articulate with classic Rabindrik grace.',
    geminiVoice: 'Kore',
    pitchOffset: 1.07,
    speedMultiplier: 0.97,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Wise Sage / Elder',
        nativeText: 'নমস্কার! এই যাত্রায় সত্য ও সাহসের আলো সর্বদা আপনার সঙ্গী হোক।',
        romanizedText: 'Nomoshkar! Ei jaatray shotti o shaahosher aalo shorbodaa aapnar songi hok.',
        englishMeaning: 'Greetings! May the light of truth and bravery be your eternal companion on this journey.'
      }
    ]
  },

  // 8. Marathi (mr-IN)
  {
    id: 'mr-aditya',
    name: 'Aditya (आदित्य)',
    nativeScript: 'आदित्य - मावळा / दुर्ग रक्षक',
    language: 'Marathi',
    languageCode: 'mr-IN',
    gender: 'male',
    archetype: 'Maratha Fort Defender & Warrior',
    personality: 'Fierce, honorable, thunderous and steadfast with Maratha valor.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.94,
    speedMultiplier: 1.03,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Battle Cry',
        nativeText: 'हर हर महादेव! स्वराज्याच्या रक्षणासाठी आम्ही प्राण पणाला लावू!',
        romanizedText: 'Har Har Mahadev! Swaraajyaachya rakshanaasaathi aamhi praan panaala laavu!',
        englishMeaning: 'Har Har Mahadev! We shall stake our lives for the defense of Swarajya!'
      }
    ]
  },
  {
    id: 'mr-tanvi',
    name: 'Tanvi (तन्वी)',
    nativeScript: 'तन्वी - संयमी वक्ता',
    language: 'Marathi',
    languageCode: 'mr-IN',
    gender: 'female',
    archetype: 'Dignified Orator & Guide',
    personality: 'Confident, clear, inspiring, and majestic tone.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.04,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'किल्ल्याचे दरवाजे सुरक्षित आहेत. पुढच्या कारवाईची योजना त्वरित आखा!',
        romanizedText: 'Killyaache darwaaje surakshit aahet. Pudhchya kaarwaaeechi yojana twarit aakha!',
        englishMeaning: 'The fort gates are secure. Draw up the next tactical maneuver immediately!'
      }
    ]
  },

  // 9. Gujarati (gu-IN)
  {
    id: 'gu-harsh',
    name: 'Harsh (હર્ષ)',
    nativeScript: 'હર્ષ - સાહસિક નાયક',
    language: 'Gujarati',
    languageCode: 'gu-IN',
    gender: 'male',
    archetype: 'Dynamic Protagonist & Merchant',
    personality: 'Lively, warm, spirited, and shrewd with crisp Gujarati diction.',
    geminiVoice: 'Puck',
    pitchOffset: 0.98,
    speedMultiplier: 1.04,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Casual NPC',
        nativeText: 'કેમ છો ભાઈ! બજારમાં સૌથી દુર્લભ ઔષધીઓ અને હથિયારો અહીં જ મળશે!',
        romanizedText: 'Kem chho bhai! Bajaarmaa sauthi durlabh aushadhiyo ane hathiyaaro aheen j malshe!',
        englishMeaning: 'How are you brother! The rarest potions and weaponry in the market can only be found right here!'
      }
    ]
  },
  {
    id: 'gu-diya',
    name: 'Diya (દિયા)',
    nativeScript: 'દિયા - મંગલ ગાયિકા',
    language: 'Gujarati',
    languageCode: 'gu-IN',
    gender: 'female',
    archetype: 'Festive Hostess & Healer',
    personality: 'Bright, cheerful, welcoming, and melodic.',
    geminiVoice: 'Kore',
    pitchOffset: 1.06,
    speedMultiplier: 0.99,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'જય શ્રી કૃષ્ણ! તમારા દરેક કાર્યમાં ઈશ્વર તમને વિજય અને સુખ અર્પે.',
        romanizedText: 'Jai Shree Krishna! Tamaara darek kaaryamaa Ishwar tamne vijay ane sukh arpe.',
        englishMeaning: 'Jai Shree Krishna! May the Divine grant you triumph and happiness in every endeavor.'
      }
    ]
  },

  // 10. Punjabi (pa-IN)
  {
    id: 'pa-gurpreet',
    name: 'Gurpreet (ਗੁਰਪ੍ਰੀਤ)',
    nativeScript: 'ਗੁਰਪ੍ਰੀਤ - ਸ਼ੇਰ-ਏ-ਮੈਦਾਨ',
    language: 'Punjabi',
    languageCode: 'pa-IN',
    gender: 'male',
    archetype: 'Lionheart Champion & Defender',
    personality: 'Booming, warm, fearless, energetic with high Punjabi enthusiasm.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.93,
    speedMultiplier: 1.05,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Battle Cry',
        nativeText: 'ਬੋਲੇ ਸੋ ਨਿਹਾਲ, ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਚੜ੍ਹਦੀ ਕਲਾ ਵਿੱਚ ਰਹੋ ਤੇ ਵੈਰੀਆਂ ਦਾ ਮੁਕਾਬਲਾ ਕਰੋ!',
        romanizedText: 'Bole So Nihal, Sat Sri Akal! Chardikla vich raho te vairiyan da mukaabla karo!',
        englishMeaning: 'Victory cry! Stay in high spirits and confront all adversaries fearlessly!'
      }
    ]
  },
  {
    id: 'pa-simran',
    name: 'Simran (ਸਿਮਰਨ)',
    nativeScript: 'ਸਿਮਰਨ - ਜੋਸ਼ੀਲੀ ਸਾਥੀ',
    language: 'Punjabi',
    languageCode: 'pa-IN',
    gender: 'female',
    archetype: 'Vibrant Companion & Warrior',
    personality: 'High-spirited, courageous, affectionate, and rhythmic.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.05,
    speedMultiplier: 1.02,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'ਹਿੰਮਤ ਨਾ ਹਾਰਿਓ, ਅਸੀਂ ਸਾਰੇ ਮਿਲ ਕੇ ਇਸ ਮੁਸੀਬਤ ਨੂੰ ਪਾਰ ਕਰਾਂਗੇ!',
        romanizedText: 'Himmat na haario, aseen saare mil ke is museebat nu paar karaange!',
        englishMeaning: 'Do not lose heart, together we shall overcome every challenge!'
      }
    ]
  },

  // 11. Urdu (ur-IN)
  {
    id: 'ur-zayan',
    name: 'Zayan (زیان)',
    nativeScript: 'زیان - شاعر و سفارت کار',
    language: 'Urdu',
    languageCode: 'ur-IN',
    gender: 'male',
    archetype: 'Lucknowi Poet & Diplomat',
    personality: 'Polite, eloquent, poetic, velvety baritone with pristine Urdu talaffuz.',
    geminiVoice: 'Charon',
    pitchOffset: 0.95,
    speedMultiplier: 0.98,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Wise Sage / Elder',
        nativeText: 'آداب عرض ہے! صبر اور حکمت سے بڑا کوئی ہتھیار اس دنیا میں نہیں۔',
        romanizedText: 'Aadaab arz hai! Sabr aur hikmat se bada koi hathiyaar is duniya mein nahi.',
        englishMeaning: 'Greetings! There is no weapon in this world more formidable than patience and wisdom.'
      }
    ]
  },
  {
    id: 'ur-zoya',
    name: 'Zoya (زویا)',
    nativeScript: 'زویا - غزل و ادب کی صدا',
    language: 'Urdu',
    languageCode: 'ur-IN',
    gender: 'female',
    archetype: 'Lyrical Ghazal Voice & Noble',
    personality: 'Melodious, cultured, delicate, and deeply expressive.',
    geminiVoice: 'Kore',
    pitchOffset: 1.06,
    speedMultiplier: 0.96,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'خوش آمدید! آپ کا یہ سفر محبت، کامیابی اور سکون سے لبریز ہو۔',
        romanizedText: 'Khush aamdeed! Aap ka yeh safar mohabbat, kaamyaabi aur sukoon se labrez ho.',
        englishMeaning: 'Welcome! May this noble expedition be brimming with grace, triumph, and peace.'
      }
    ]
  },

  // 12. Sanskrit (sa-IN)
  {
    id: 'sa-aryaman',
    name: 'Aryaman (अर्यमन्)',
    nativeScript: 'अर्यमन् - वैदिक ऋषि',
    language: 'Sanskrit',
    languageCode: 'sa-IN',
    gender: 'male',
    archetype: 'Vedic Mantra Sage & Guru',
    personality: 'Sacred, resonant, ancient acoustic power with classical Vedic meter.',
    geminiVoice: 'Charon',
    pitchOffset: 0.92,
    speedMultiplier: 0.94,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Wise Sage / Elder',
        nativeText: 'सत्यमेव जयते नानृतम्। धर्मो रक्षति रक्षितः। उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत!',
        romanizedText: 'Satyameva jayate naanritam. Dharmo rakshati rakshitah. Uttishthata jaagrata praapya varaannibodhata!',
        englishMeaning: 'Truth alone triumphs, not untruth. Righteousness protects those who protect it. Arise, awake, and stop not until the goal is reached!'
      }
    ]
  },
  {
    id: 'sa-vedika',
    name: 'Vedika (वेदिका)',
    nativeScript: 'वेदिका - शान्ति मन्त्र वादिनी',
    language: 'Sanskrit',
    languageCode: 'sa-IN',
    gender: 'female',
    archetype: 'Tranquil Chantress & Priestess',
    personality: 'Serene, celestial, meditative, and pure.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.05,
    speedMultiplier: 0.95,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। ॐ शान्तिः शान्तिः शान्तिः।',
        romanizedText: 'Om dyauh shaantir antariksham shaantih prithivee shaantir aapah shaantir oshadhayah shaantih. Om shaantih shaantih shaantih.',
        englishMeaning: 'May peace radiate in the celestial realms, in the atmosphere, on Earth, in waters and medicinal plants. Om Peace Peace Peace.'
      }
    ]
  },

  // 13. Odia (or-IN)
  {
    id: 'or-debasis',
    name: 'Debasis (ଦେବାଶିଷ)',
    nativeScript: 'ଦେବାଶିଷ - କୋଣାର୍କ ରକ୍ଷକ',
    language: 'Odia',
    languageCode: 'or-IN',
    gender: 'male',
    archetype: 'Konark Guardian & Historian',
    personality: 'Noble, warm, rhythmic, and clear.',
    geminiVoice: 'Puck',
    pitchOffset: 0.97,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'ଜୟ ଜଗନ୍ନାଥ! ଏହି ଐତିହାସିକ ଦୁର୍ଗର ରକ୍ଷା ଆମର ପରମ କର୍ତ୍ତବ୍ୟ!',
        romanizedText: 'Jai Jagannath! Ehi aitihasika durgara raksha amara parama kartabya!',
        englishMeaning: 'Jai Jagannath! Defending this historic citadel is our paramount sacred duty!'
      }
    ]
  },
  {
    id: 'or-itishree',
    name: 'Itishree (ଇତିଶ୍ରୀ)',
    nativeScript: 'ଇତିଶ୍ରୀ - ଓଡ଼ିଶୀ ବାର୍ତ୍ତାବାହିକା',
    language: 'Odia',
    languageCode: 'or-IN',
    gender: 'female',
    archetype: 'Odissi Narrator & Cultural Guide',
    personality: 'Graceful, sweet, crystal, and melodic.',
    geminiVoice: 'Kore',
    pitchOffset: 1.06,
    speedMultiplier: 0.98,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Wise Sage / Elder',
        nativeText: 'ନମସ୍କାର! ଧର୍ମ ଓ ସଦ୍ଭାବନା ହିଁ ଜୀବନର ପ୍ରକୃତ ସୌନ୍ଦର୍ଯ୍ୟ।',
        romanizedText: 'Namaskar! Dharma o sadbhabana hin jibanara prakruta soundarya.',
        englishMeaning: 'Greetings! Righteousness and goodwill represent the true beauty of life.'
      }
    ]
  },

  // 14. Assamese (as-IN)
  {
    id: 'as-anupam',
    name: 'Anupam (অনুপম)',
    nativeScript: 'অনুপম - ব্ৰহ্মপুত্ৰৰ নাৱৰীয়া',
    language: 'Assamese',
    languageCode: 'as-IN',
    gender: 'male',
    archetype: 'Brahmaputra Explorer & Helmsman',
    personality: 'Energetic, adventurous, friendly, and resonant.',
    geminiVoice: 'Puck',
    pitchOffset: 0.98,
    speedMultiplier: 1.02,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'RPG Warrior',
        nativeText: 'ব্ৰহ্মপুত্ৰৰ উত্তাল তৰংগৰ দৰে আমাৰ সাহসো অপৰাজেয়!',
        romanizedText: 'Brahmaputrar uttal tarangar dore aamar sahaso aporajeyo!',
        englishMeaning: 'Just like the mighty waves of the Brahmaputra, our courage is undefeated!'
      }
    ]
  },
  {
    id: 'as-jonali',
    name: 'Jonali (জোনালী)',
    nativeScript: 'জোনালী - বিহু কণ্ঠশিল্পী',
    language: 'Assamese',
    languageCode: 'as-IN',
    gender: 'female',
    archetype: 'Bihu Songstress & Valley Guide',
    personality: 'Joyful, musical, bright, and charming.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.07,
    speedMultiplier: 1.0,
    isIndian: true,
    sampleDialogues: [
      {
        category: 'Casual NPC',
        nativeText: 'নমস্কাৰ! সেউজীয়া পাহাৰ আৰু নদীৰ এই মনোৰম দেশলৈ আপোনাক স্বাগতম!',
        romanizedText: 'Nomoskar! Seujiya pahar aaru nodir ei monorom dexoloi aaponak swagotom!',
        englishMeaning: 'Greetings! Welcome to this beautiful realm of lush green hills and pristine rivers!'
      }
    ]
  },

  // Global Archetype Voices (for reference and multi-character world building)
  {
    id: 'global-puck',
    name: 'Puck (Playful Sprite)',
    nativeScript: 'Global Actor - High Spirits',
    language: 'Global English',
    languageCode: 'en-US',
    gender: 'male',
    archetype: 'Playful Rogue & Jester',
    personality: 'Fast-paced, cheeky, animated, and youthful.',
    geminiVoice: 'Puck',
    pitchOffset: 1.05,
    speedMultiplier: 1.1,
    isIndian: false,
    sampleDialogues: [
      {
        category: 'Casual NPC',
        nativeText: 'Hey there traveler! Looking for secrets, or just getting yourself into trouble?',
        romanizedText: 'Hey there traveler! Looking for secrets, or just getting yourself into trouble?',
        englishMeaning: 'Playful rogue greeting.'
      }
    ]
  },
  {
    id: 'global-charon',
    name: 'Charon (Shadow Keeper)',
    nativeScript: 'Global Actor - Deep Grave',
    language: 'Global English',
    languageCode: 'en-US',
    gender: 'male',
    archetype: 'Underworld Ferryman & Boss NPC',
    personality: 'Low, gravelly, menacing, and ominous.',
    geminiVoice: 'Charon',
    pitchOffset: 0.88,
    speedMultiplier: 0.9,
    isIndian: false,
    sampleDialogues: [
      {
        category: 'Battle Cry',
        nativeText: 'You dare step into the realm of shadows? Turn back, or be consumed.',
        romanizedText: 'You dare step into the realm of shadows? Turn back, or be consumed.',
        englishMeaning: 'Ominous boss encounter warning.'
      }
    ]
  },
  {
    id: 'global-kore',
    name: 'Kore (Goddess of Spring)',
    nativeScript: 'Global Actor - Warm Nature',
    language: 'Global English',
    languageCode: 'en-US',
    gender: 'female',
    archetype: 'Benevolent Deity & Healer',
    personality: 'Warm, nurturing, celestial, and soothing.',
    geminiVoice: 'Kore',
    pitchOffset: 1.04,
    speedMultiplier: 0.95,
    isIndian: false,
    sampleDialogues: [
      {
        category: 'Temple Mystic',
        nativeText: 'Rest your weary soul. The light shall guide you through the darkest night.',
        romanizedText: 'Rest your weary soul. The light shall guide you through the darkest night.',
        englishMeaning: 'Benevolent healing blessing.'
      }
    ]
  },
  {
    id: 'global-fenrir',
    name: 'Fenrir (Beast Commander)',
    nativeScript: 'Global Actor - Primal Rage',
    language: 'Global English',
    languageCode: 'en-US',
    gender: 'male',
    archetype: 'Berserker Chieftain & Alpha',
    personality: 'Aggressive, thunderous, guttural, and commanding.',
    geminiVoice: 'Fenrir',
    pitchOffset: 0.9,
    speedMultiplier: 1.08,
    isIndian: false,
    sampleDialogues: [
      {
        category: 'Battle Cry',
        nativeText: 'Crush their defenses! Let no wall stand before our fury!',
        romanizedText: 'Crush their defenses! Let no wall stand before our fury!',
        englishMeaning: 'Primal berserker war cry.'
      }
    ]
  },
  {
    id: 'global-zephyr',
    name: 'Zephyr (Sky Courier)',
    nativeScript: 'Global Actor - Smooth Air',
    language: 'Global English',
    languageCode: 'en-US',
    gender: 'female',
    archetype: 'Ethereal Guide & Aviator',
    personality: 'Breezy, crisp, futuristic, and melodious.',
    geminiVoice: 'Zephyr',
    pitchOffset: 1.06,
    speedMultiplier: 1.02,
    isIndian: false,
    sampleDialogues: [
      {
        category: 'AI / Tech Guide',
        nativeText: 'Altitude holding steady at three thousand meters. Clear skies ahead.',
        romanizedText: 'Altitude holding steady at three thousand meters. Clear skies ahead.',
        englishMeaning: 'Aviation navigational report.'
      }
    ]
  }
];

export const EMOTION_DIRECTIVES = [
  { label: 'Default / Balanced', prompt: '' },
  { label: 'Heroic & Commandingly', prompt: 'Speak in a heroic, resolute, and commanding tone like a legendary battle commander.' },
  { label: 'Royal & Graceful', prompt: 'Speak with royal poise, gentle dignity, and elegant classical rhythm.' },
  { label: 'Urgent Combat Alert', prompt: 'Speak rapidly with urgent combat tension and battlefield seriousness.' },
  { label: 'Whispering in Fear / Stealth', prompt: 'Speak in a hushed, intense whisper as if hiding behind enemy lines.' },
  { label: 'Mystical Temple Blessing', prompt: 'Chant or recite with divine serenity, spiritual reverberation, and deep peace.' },
  { label: 'Cheerful Companion', prompt: 'Speak warmly, playfully, and enthusiastically like a supportive RPG companion.' },
  { label: 'Cold AI Telemetry', prompt: 'Deliver in a calm, precise, cybernetic cadence like an advanced spaceship navigation OS.' },
];
