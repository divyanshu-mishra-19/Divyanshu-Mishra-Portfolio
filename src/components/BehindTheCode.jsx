import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Disc,
  Music,
  Volume2,
  VolumeX,
  Zap,
  SkipBack,
  SkipForward,
  ListMusic,
  Upload,
  CloudRain,
  Waves,
  Sparkles,
  Repeat,
  Shuffle,
  Info
} from 'lucide-react';
import { initialMusicTracks, musicCategories } from '../data/musicTracks';
import { audioEngine } from '../utils/audioEngine';
import { safeImageSrc } from '../utils/safeHref';

export default function BehindTheCode() {
  const [tracks, setTracks] = useState(initialMusicTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(225);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Change Track
  const selectTrack = useCallback((index) => {
    setCurrentTrackIndex(index);
    const track = tracks[index];
    audioEngine.playTrack(track);
  }, [tracks]);

  // Next Track
  const handleNextTrack = useCallback(() => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    selectTrack(nextIndex);
  }, [currentTrackIndex, isShuffle, tracks.length, selectTrack]);

  // Subscribe to audio engine events
  useEffect(() => {
    const handleTimeUpdate = (data) => {
      setCurrentTime(data.currentTime);
      if (data.duration && !isNaN(data.duration) && data.duration > 0) {
        setDuration(data.duration);
      }
    };

    const handleStateChange = (data) => {
      setIsPlaying(data.isPlaying);
    };

    const handleEnded = () => {
      if (isLooping) {
        audioEngine.seek(0);
        audioEngine.resume();
      } else {
        handleNextTrack();
      }
    };

    audioEngine.on('timeUpdate', handleTimeUpdate);
    audioEngine.on('stateChange', handleStateChange);
    audioEngine.on('ended', handleEnded);

    return () => {
      audioEngine.off('timeUpdate', handleTimeUpdate);
      audioEngine.off('stateChange', handleStateChange);
      audioEngine.off('ended', handleEnded);
      audioEngine.stop();
    };
  }, [currentTrackIndex, isLooping, isShuffle, tracks, handleNextTrack]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.playTrack(currentTrack);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(prevIndex);
  };

  // Volume & Mute
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    audioEngine.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  // Seek
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  // Format seconds -> mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle User Uploaded Local MP3
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newTrack = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Custom Local MP3',
      category: file.name.toLowerCase().includes('hindi') ? 'hindi' : 'music',
      categoryLabel: '🎵 User Upload',
      duration: '3:30',
      durationSec: 210,
      cover: '/images/music-custom-track.webp',
      color: '#38bdf8',
      badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      fileUrl: fileUrl,
      useSynth: false,
      description: 'Your uploaded local MP3 audio stream.'
    };

    setTracks([newTrack, ...tracks]);
    setCurrentTrackIndex(0);
    audioEngine.playTrack(newTrack);

    setToastMessage(`Playing custom track: ${file.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter tracks by category
  const filteredTracks = selectedCategory === 'all'
    ? tracks
    : tracks.filter(t => t.category === selectedCategory);

  return (
    <section id="behind-the-code" className="py-28 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-500 dark:text-emerald-400 uppercase mb-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <Zap className="w-3.5 h-3.5" />
          Soundscapes &amp; Beats
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          Coding{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Soundtrack
          </span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Natural ambient soundscapes, calming Indian Tanpura &amp; Bansuri melodies, and deep focus rhythms that power late-night engineering sessions.
        </p>
      </motion.div>

      {/* Main Music Player Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden glass-card border shadow-xl transition-all duration-300"
        style={{
          borderColor: `${currentTrack.color}35`,
          boxShadow: `0 20px 50px -15px ${currentTrack.color}25, 0 2px 10px -2px ${currentTrack.color}15`,
        }}
      >
        {/* Animated gradient header strip */}
        <div
          className="h-1.5 w-full transition-all duration-700"
          style={{
            background: `linear-gradient(90deg, ${currentTrack.color}, #38bdf8, #818cf8, ${currentTrack.color})`,
            backgroundSize: '200% 100%',
            animation: isPlaying ? 'gradientShift 3s linear infinite' : 'none'
          }}
        />

        {/* Ambient Corner Glows */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none transition-opacity duration-700 blur-3xl opacity-15"
          style={{ background: currentTrack.color }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none transition-opacity duration-700 blur-3xl opacity-10"
          style={{ background: '#38bdf8' }}
        />

        <div className="p-6 sm:p-8 md:p-10 relative z-10 space-y-8">
          {/* Top Player Viewport */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Spinning Vinyl Record with Track Artwork */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Pulsing ambient aura */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${isPlaying ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`}
                style={{
                  boxShadow: `0 0 50px 10px ${currentTrack.color}35`,
                  borderRadius: '50%'
                }}
              />

              <motion.div
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center relative overflow-hidden select-none cursor-pointer"
                style={{
                  background: 'radial-gradient(circle at center, #1e293b 60%, #090d16 100%)',
                  border: '4px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isPlaying ? { duration: 9, ease: 'linear', repeat: Infinity } : { duration: 0.6 }}
                onClick={togglePlay}
                title={isPlaying ? 'Click to Pause' : 'Click to Play'}
              >
                {/* Vinyl groove rings */}
                {[2, 5, 8, 12, 16].map((inset, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-slate-700/40 pointer-events-none"
                    style={{ inset: `${inset * 5}px` }}
                  />
                ))}

                {/* Center Album Art */}
                <img
                  loading="lazy"
                  decoding="async"
                  width={96}
                  height={96}
                  src={safeImageSrc(currentTrack.cover)}
                  alt={currentTrack.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg relative z-10"
                  style={{ border: `2px solid ${currentTrack.color}` }}
                />

                {/* Vinyl Center Hole */}
                <div className="absolute w-5 h-5 rounded-full bg-[#090d16] ring-2 ring-slate-800 z-20 pointer-events-none" />
              </motion.div>

              {/* Floating Audio Badge */}
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-slate-950 font-bold"
                style={{ background: `linear-gradient(135deg, ${currentTrack.color}, #38bdf8)` }}
                animate={{ rotate: isPlaying ? [0, -10, 10, 0] : 0, scale: isPlaying ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
              >
                <Music className="w-4 h-4 text-slate-950" />
              </motion.div>
            </div>

            {/* Track Info & Interactive Player Controls */}
            <div className="flex-1 w-full space-y-5 text-center md:text-left">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-3">
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 px-3 py-1 rounded-full border"
                  style={{
                    color: currentTrack.color,
                    background: `${currentTrack.color}15`,
                    borderColor: `${currentTrack.color}35`,
                  }}
                >
                  {isPlaying ? (
                    <>
                      {/* Animated Real-time Equalizer */}
                      <div className="flex items-end gap-0.5 h-3.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-0.5 rounded-full bar-${i}`}
                            style={{ height: '100%', background: currentTrack.color, transformOrigin: 'bottom' }}
                          />
                        ))}
                      </div>
                      NOW PLAYING
                    </>
                  ) : (
                    <>
                      <Disc className="w-3.5 h-3.5" />
                      PLAYLIST READY
                    </>
                  )}
                </span>

                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  {currentTrack.categoryLabel}
                </span>
              </div>

              {/* Title & Artist */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentTrack.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-sans">
                  {currentTrack.artist}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic font-mono max-w-xl">
                  {currentTrack.description}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.5"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-300 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, ${currentTrack.color} ${(currentTime / (duration || 1)) * 100}%, rgba(148,163,184,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Transport Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3 mx-auto md:mx-0">
                  {/* Shuffle Button */}
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    title={isShuffle ? 'Shuffle Enabled' : 'Enable Shuffle'}
                    className={`p-2 rounded-xl transition-all ${isShuffle ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={handlePrevTrack}
                    className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                    title="Previous Track"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Main Play/Pause Button */}
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold shadow-lg transition-all cursor-pointer text-slate-950"
                    style={{
                      background: `linear-gradient(135deg, ${currentTrack.color}, #38bdf8)`,
                      boxShadow: `0 6px 24px ${currentTrack.color}50`
                    }}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </motion.button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextTrack}
                    className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                    title="Next Track"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Loop Button */}
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    title={isLooping ? 'Looping Track' : 'Disable Loop'}
                    className={`p-2 rounded-xl transition-all ${isLooping ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-center">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-8 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist & Track Selector Section */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Select Track
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  ({filteredTracks.length} available)
                </span>
              </div>

              {/* Upload Custom Local MP3 Button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Upload or pick any MP3 on your device to play right now"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Play Custom MP3</span>
                </button>

                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
                >
                  {showPlaylist ? 'Hide Tracks' : 'Show Tracks'}
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {musicCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-200/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Track List */}
            {showPlaylist && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {filteredTracks.map((track) => {
                  const globalIdx = tracks.findIndex(t => t.id === track.id);
                  const isCurrent = globalIdx === currentTrackIndex;

                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(globalIdx)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-500/60 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      style={{
                        background: isCurrent
                          ? `linear-gradient(135deg, var(--theme-card) 0%, ${track.color}18 100%)`
                          : 'var(--theme-card)'
                      }}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Play Indicator / Thumbnail */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs"
                          style={{
                            background: isCurrent ? track.color : 'rgba(15, 23, 42, 0.6)',
                            color: isCurrent ? '#090d16' : '#94a3b8'
                          }}
                        >
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              {[1, 2, 3].map(i => (
                                <div
                                  key={i}
                                  className={`w-0.5 rounded-full bar-${i}`}
                                  style={{ height: '100%', background: '#090d16' }}
                                />
                              ))}
                            </div>
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h5 className={`text-sm font-bold font-sans truncate ${isCurrent ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {track.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md hidden sm:inline-block bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {track.categoryLabel}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {track.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Audio Guide Banner */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Want to play your favorite Hindi MP3 or rain recording? Click <strong>Play Custom MP3</strong> above or drop any <code>.mp3</code> into <code>/public/audio/</code>.
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
