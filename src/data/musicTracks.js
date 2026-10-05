// ============================================================================
// CURATED MUSIC TRACKS: Natural Soundscapes & Hindi Instrumental / Lo-Fi
// ============================================================================

export const musicCategories = [
  { id: 'all', label: 'All Tracks', icon: 'Disc' },
  { id: 'nature', label: '🌿 Nature Sounds', icon: 'CloudRain' },
  { id: 'hindi', label: '🪕 Hindi Music', icon: 'Music' },
  { id: 'focus', label: '🎧 Deep Focus', icon: 'Zap' },
];

export const initialMusicTracks = [
  // 🌿 1. NATURAL SOUND TRACKS
  {
    id: 'monsoon-rain',
    title: 'Monsoon Rain & Distant Thunder',
    artist: 'Himalayan Wet Weather Soundscape',
    category: 'nature',
    categoryLabel: '🌿 Nature Sounds',
    duration: '3:45',
    durationSec: 225,
    cover: '/images/music-monsoon-rain.webp',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    synthType: 'monsoon-rain',
    fileUrl: '/audio/monsoon-rain.mp3',
    description: 'Continuous soothing rainfall with soft distant rolling thunder and rhythmic water droplets.'
  },
  {
    id: 'forest-river',
    title: 'Pine Forest Stream & Mountain Breeze',
    artist: 'Nagaland Foothills Nature Recording',
    category: 'nature',
    categoryLabel: '🌿 Nature Sounds',
    duration: '4:10',
    durationSec: 250,
    cover: '/images/music-forest-river.webp',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    synthType: 'forest-river',
    fileUrl: '/audio/forest-river.mp3',
    description: 'Gentle babbling mountain brook winding through pine trees with refreshing ambient breeze.'
  },
  {
    id: 'midnight-ocean',
    title: 'Midnight Ocean Waves & Deep Tide',
    artist: 'Coastal Night Resonance',
    category: 'nature',
    categoryLabel: '🌿 Nature Sounds',
    duration: '3:30',
    durationSec: 210,
    cover: '/images/music-ocean-waves.webp',
    color: '#0ea5e9',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    synthType: 'ocean-waves',
    fileUrl: '/audio/ocean-waves.mp3',
    description: 'Rhythmic, deep ocean waves surging under the starry midnight sky.'
  },

  // 🪕 2. HINDI & INDIAN CHILL MUSIC
  {
    id: 'hindi-bansuri-tanpura',
    title: 'Raag Desh / Bansuri Twilight Chill',
    artist: 'Classical Indian Flute & Tanpura Drone',
    category: 'hindi',
    categoryLabel: '🪕 Hindi Music',
    duration: '4:35',
    durationSec: 275,
    cover: '/images/music-hindi-bansuri.webp',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    synthType: 'hindi-tanpura',
    fileUrl: '/audio/hindi-bansuri.mp3',
    description: 'Resonant harmonic Indian Tanpura drone paired with meditative bamboo flute motifs in Raag Bhairavi.'
  },
  {
    id: 'hindi-midnight-chai',
    title: 'Midnight Chai & Bollywood Acoustic Lo-Fi',
    artist: 'Late-Night Acoustic Guitar Melodies',
    category: 'hindi',
    categoryLabel: '🪕 Hindi Music',
    duration: '3:20',
    durationSec: 200,
    cover: '/images/music-hindi-acoustic.webp',
    color: '#ec4899',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    synthType: 'hindi-acoustic',
    fileUrl: '/audio/hindi-acoustic.mp3',
    description: 'Warm fingerpicked acoustic guitar chords layered over vintage lo-fi vinyl crackle for late-night study.'
  },

  // 🎧 3. FOCUS & CODING BEATS
  {
    id: 'deep-focus-brown',
    title: 'Deep Focus Brown Noise & Theta Waves',
    artist: 'Binaural Engineering Session',
    category: 'focus',
    categoryLabel: '🎧 Deep Focus',
    duration: '5:00',
    durationSec: 300,
    cover: '/images/music-deep-focus.webp',
    color: '#8b5cf6',
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    synthType: 'deep-focus-brown',
    fileUrl: '/audio/deep-focus.mp3',
    description: 'Smooth, deep brown noise designed to mask room distractions and unlock flow state.'
  }
];
