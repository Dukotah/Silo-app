import React, { useState, useEffect, useRef } from 'react';

// ─── CONSTANTS & CONFIGURATION ──────────────────────────────────────────────
var DATA_STORAGE_KEY = 'silo_v8_universal_data';
var LEVEL_XP_REQUIREMENT = 500;
var MAXIMUM_LEVEL = 5;
var FREE_JOURNAL_LIMIT = 3;
var FREE_ANALYZE_LIMIT = 2;

function formatTwoDigits(n) { return String(n).padStart(2, '0'); }
function getTodayString() { return new Date().toISOString().slice(0, 10); }

function calculateDayStreak(startDateString) {
  if (!startDateString) return 0;
  var diffTime = Date.now() - new Date(startDateString).getTime();
  return Math.max(0, Math.floor(diffTime / 86400000));
}

function calculateTimeElapsed(startDateString) {
  if (!startDateString) return { h: 0, m: 0, s: 0 };
  var totalSeconds = Math.max(0, Math.floor((Date.now() - new Date(startDateString).getTime()) / 1000));
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60
  };
}

// ─── THE ARCHETYPE THEME ENGINE ──────────────────────────────────────────────
var THEMES = {
  tactical: {
    id: 'tactical',
    accent: '#4a9eff', accentDim: '#0a1628', accentBorder: '#1e3a5f',
    accent2: '#22c55e', streak: '#f97316',
    bg: '#070a10', bg2: '#0a0e1a', bg3: '#0d1220',
    bd: '#151e30', bd2: '#1e3a5f',
    text: '#e2e8f0', muted: '#94a3b8', dim: '#475569', dimmer: '#2d3748',
    proCol: '#6d28d9', proBd: '#3b1a8a', proTxt: '#c4b5fd', proBg: '#0d0a2a',
    font: "'DM Mono', monospace",
    charLabel: 'OPERATIVE FRAME',
    streakLabel: 'Days Isolated',
    tagline: 'System architecture offline. Rebuild core integrity.',
    shadowLabel: 'SHADOW TRANSMISSION INBOX',
    shadowPH: 'Staging message... Write what you intend to send to them...',
    analyzeBtn: 'ANALYZE STRATEGIC IMPACT',
    journalSave: 'COMMIT LOG ENTRY',
    journalPH: 'Input tactical logs, daily operations, or friction points...',
    chamberTitle: 'DECOMPRESSION CHAMBER',
    interceptTitle: 'CRITICAL COGNITIVE INTERCEPT',
    interceptSub: 'Protocol triggered — processing impulse patterns before transmission.',
    interceptGreet: 'Secure line established. Maintain your position.\n\nIdentify the immediate situational trigger for this impulse:',
    interceptFollow: 'Acknowledged. The neural friction loop peaks right before a behavioral breakthrough.\n\nQuantify the exact expected utility or outcome if you transmit this message:',
    analysisText: 'PREDICTED COGNITIVE IMPACT MATRIX:\n\n1. Initial Transmit: Brief dopamine saturation lasting ~8 minutes, followed by a persistent 24-72 hour cognitive load waiting for verification.\n\n2. Scenario Alpha (Silence): Complete loss of operational momentum. Internal cycle optimization reverts as you read old logs.\n\n3. Scenario Beta (Response): Re-activation of the historical dependency loop. Same interpersonal friction. Same long-term systemic overhead.\n\nConclusion: Core defensive perimeter intact. Do not exchange long-term systemic stability for a temporary execution spike.',
    trainTitle: 'TACTICAL RECOVERY TASKS',
    progressTitle: 'FRAME EVOLUTION GRAPH'
  },
  supportive: {
    id: 'supportive',
    accent: '#e879a0', accentDim: '#1a0810', accentBorder: '#5a1830',
    accent2: '#34d399', streak: '#fb923c',
    bg: '#0a060e', bg2: '#110818', bg3: '#180d20',
    bd: '#221030', bd2: '#3d1545',
    text: '#f0e6f6', muted: '#c4a8d4', dim: '#7a5a8a', dimmer: '#3d2a4d',
    proCol: '#9333ea', proBd: '#4a1090', proTxt: '#d8b4fe', proBg: '#100820',
    font: "'DM Sans', sans-serif",
    charLabel: 'HEALING ESSENCE',
    streakLabel: 'Days Reclaimed',
    tagline: 'Gently coming home to the person you were before.',
    shadowLabel: 'THE UNSENT LETTER VAULT',
    shadowPH: "Pour out what you are holding onto... Write the words you wish you could say...",
    analyzeBtn: 'REFLECT WITH COMPASSION',
    journalSave: 'SAVE HEALING JOURNAL',
    journalPH: 'Write freely and openly. This space is holding your raw thoughts...',
    chamberTitle: 'SAFE GROUNDING SPACE',
    interceptTitle: 'GENTLE EMOTIONAL ANCHOR',
    interceptSub: 'Take a long, deep breath. Let us sit with this feeling together.',
    interceptGreet: "I am right here with you. You don't have to carry this completely alone.\n\nWhat happened just now that made your heart want to reach out?",
    interceptFollow: "Thank you for sharing that with me. Your system is simply looking for comfort and clarity.\n\nDeep down, what emotional need or validation are you hoping to receive from them?",
    analysisText: "GENTLE REFLECTION MATRIX:\n\nReaching out right now offers about 8 minutes of relief, but it instantly makes your phone a source of heavy anxiety while you wait for things to shift.\n\nIf they do not respond: The silence will feel much heavier than any words they could write.\n\nIf they do respond: It rarely delivers the true healing you deserve, often restarting the same painful cycle.\n\nYou have built a beautiful space for yourself. Protect your peace today.",
    trainTitle: 'DAILY CONSCIOUS SELF-CARE',
    progressTitle: 'INNER GROWTH CHRONICLES'
  }
};

// ─── EVOLVED CHARACTER ARCHETYPES (UNIVERSAL) ──────────────────────────────────
var CHARACTER_STAGES = [
  { level: 0, name: 'The Ember / Spark', emoji: '🌑', color: '#64748b', glow: 'rgba(100,116,139,0.3)', desc: 'Vulnerable but protected. The flame is low, but the core foundation is perfectly intact.' },
  { level: 1, name: 'The Wanderer / Seeker', emoji: '🌿', color: '#4a9eff', glow: 'rgba(74,158,255,0.4)', desc: 'The initial fog is lifting. Moving through the world with fresh intention and newly forming habits.' },
  { level: 2, name: 'The Guardian / Resilient', emoji: '🛡️', color: '#34d399', glow: 'rgba(52,211,153,0.45)', desc: 'Establishing personal boundaries. Physical stamina and internal cognitive structures are stabilizing.' },
  { level: 3, name: 'The Alchemist / Catalyst', emoji: '⚡', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', desc: 'Actively transmuting past emotional weight into raw real-world momentum. Perception is razor sharp.' },
  { level: 4, name: 'The Sovereign / Vanguard', emoji: '👑', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)', desc: 'Fully autonomous, self-determined, and completely unshakeable. You have masterfully reclaimed ownership of your identity.' }
];

var UNIVERSAL_ACTIVITIES = [
  { id: 'training', label: 'Physical Conditioning / Training', xp: 85, icon: '🏋️', stat: 'body' },
  { id: 'movement', label: 'Conscious Cardio / Endurance', xp: 65, icon: '🏃', stat: 'body' },
  { id: 'nourish', label: 'Systemic Regeneration / Sleep', xp: 50, icon: '🌙', stat: 'body' },
  { id: 'meditation', label: 'Attention Anchor / Meditation', xp: 60, icon: '🧘', stat: 'mind' },
  { id: 'journaling', label: 'Cognitive Review / Journaling', xp: 55, icon: '📓', stat: 'mind' },
  { id: 'focus_mode', label: 'Information Fast / No Doomscroll', xp: 45, icon: '📵', stat: 'mind' },
  { id: 'kinship', label: 'True Connection / Shared Circles', xp: 80, icon: '🤝', stat: 'soul' },
  { id: 'nature', label: 'Grounding Environment / Nature', xp: 55, icon: '🌲', stat: 'soul' },
  { id: 'creation', label: 'Creative Project / Craft Development', xp: 70, icon: '🎨', stat: 'soul' }
];

var UNIVERSAL_MILESTONES = [
  { days: 1, xp: 100, label: 'Initial Horizon', desc: 'First 24 hours of intentional distance achieved without breaking configuration.', icon: '🔒', pro: false },
  { days: 3, xp: 200, label: '72-Hour Threshold', desc: 'Neurological craving responses begin adjusting to the new paradigm.', icon: '🧠', pro: false },
  { days: 7, xp: 500, label: 'One Week Matrix', desc: 'Systemic fog is parting. Clear validation of personal operational willpower.', icon: '🎯', pro: true },
  { days: 14, xp: 750, label: 'Fortnight Perimeter', desc: 'Dopamine baselines are actively restoring to equilibrium.', icon: '⚡', pro: true },
  { days: 30, xp: 1500, label: '30-Day Operational Shift', desc: 'Substantial structural changes achieved. Total self-sovereignty established.', icon: '🛡️', pro: true }
];

var REFLECTION_PROMPTS = [
  "What is one thing you built or executed today that had absolutely nothing to do with them?",
  "Detail a specific real-world advantage your mindset has gained this week.",
  "If you could brief your past self from day 0, what clarity would you share?",
  "What core human need is underneath this urgent pull, and how can you provide it for yourself?",
  "Describe the actions of your character if they were operating at 100% capacity tomorrow.",
  "What is a piece of your personality or space that you have fully reclaimed for yourself?"
];

var MOOD_EMOJIS = ['💪', '✨', '🧘', '😤', '🍃', '🌙'];

// ─── INLINE COMPONENTS ────────────────────────────────────────────────────────
function CharacterArt({ level, color, glow }) {
  var normalizedLevel = Math.min(level, MAXIMUM_LEVEL - 1);
  var currentStage = CHARACTER_STAGES[normalizedLevel];
  var strokeOpacity = 0.3 + (normalizedLevel / MAXIMUM_LEVEL) * 0.7;
  
  var visualRings = [];
  for (var i = 0; i <= normalizedLevel + 1; i++) {
    visualRings.push(
      <circle 
        key={'ring-' + i} cx="100" cy="120" r={String(50 + i * 16)} 
        fill="none" stroke={color} strokeWidth="0.8" 
        opacity={Math.max(0.02, 0.12 - i * 0.02)} 
        style={{ animation: `pulse ${2 + i * 0.5}s ease-in-out ${i * 0.2}s infinite` }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px auto', width: '100%', maxWidth: '240px' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', filter: `drop-shadow(0 0 20px ${glow})`, transition: 'filter 0.5s ease' }}>
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {visualRings}
          <ellipse cx="100" cy="185" rx={String(30 + normalizedLevel * 10)} ry="6" fill={color} opacity="0.1" />
          
          {/* Universal Abstract Character Core Mesh Geometry */}
          <g transform="translate(0, -10)">
            <polygon points="100,45 130,85 100,165 70,85" fill="none" stroke={color} strokeWidth="1.5" opacity={strokeOpacity} />
            <polygon points="100,45 115,85 100,165 85,85" fill="none" stroke={color} strokeWidth="1" opacity={strokeOpacity * 0.6} />
            <line x1="70" y1="85" x2="130" y2="85" stroke={color} strokeWidth="1" opacity={strokeOpacity * 0.5} />
            <circle cx="100" cy="45" r="4" fill={color} opacity={strokeOpacity} />
            <circle cx="100" cy="165" r="4" fill={color} opacity={strokeOpacity} />
            <circle cx="70" cy="85" r="3" fill={color} opacity={strokeOpacity * 0.8} />
            <circle cx="130" cy="85" r="3" fill={color} opacity={strokeOpacity * 0.8} />
            
            {/* Dynamic internal evolution nodes */}
            {normalizedLevel >= 1 && <circle cx="100" cy="85" r="6" fill="none" stroke={color} strokeWidth="1.2" style={{ animation: 'pulse 1.5s infinite' }} />}
            {normalizedLevel >= 2 && <path d="M85,85 L100,65 L115,85 L100,125 Z" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />}
            {normalizedLevel >= 3 && <circle cx="100" cy="120" r="14" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="3 3" />}
            {normalizedLevel >= 4 && (
              <g>
                <polygon points="100,20 108,35 92,35" fill={color} opacity="0.8" />
                <circle cx="100" cy="15" r="2.5" fill={color} style={{ animation: 'pulse 1s infinite' }} />
              </g>
            )}
          </g>
        </svg>
      </div>
      <div style={{ textAlign: 'center', marginTop: '-10px', zIndex: 5 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
          <span style={{ fontSize: '14px' }}>{currentStage.emoji}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: '600', color: color, letterSpacing: '0.1em' }}>
            LVL {normalizedLevel} · {currentStage.name.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', lineHeight: '1.4', maxWidth: '280px', padding: '0 10px' }}>
          {currentStage.desc}
        </p>
      </div>
    </div>
  );
}

function MetricProgressBar({ label, value, max, color, theme }) {
  var percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.dim, letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: value > 0 ? color : theme.dimmer }}>{value}</span>
      </div>
      <div style={{ height: '4px', background: theme.bd, borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
    </div>
  );
}

// ─── SYSTEM MASTER ROOT APP ──────────────────────────────────────────────────
export default function App() {
  // 1. LIFTCYCLE STATE STORAGE INITIALIZATION HOOKS (RUNS UNCONDITIONALLY)
  var [userData, setUserData] = useState(function() {
    try {
      var saved = localStorage.getItem(DATA_STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed;
        }
      }
    } catch (err) {}
    return null; // Triggers onboarding if null
  });

  var [activeTab, setActiveTab] = useState('dashboard');
  var [shadowText, setShadowText] = useState('');
  var [activePromptIndex, setActivePromptIndex] = useState(0);
  var [journalInput, setJournalInput] = useState('');
  var [selectedMood, setSelectedMood] = useState('💪');
  var [interceptStep, setInterceptStep] = useState('closed'); // 'closed', 'trigger', 'outcome', 'matrix'
  var [interceptTriggerInput, setInterceptTriggerInput] = useState('');
  var [interceptOutcomeInput, setInterceptOutcomeInput] = useState('');
  
  // Modal Overlays Staging
  var [showProModal, setShowProModal] = useState(false);
  var [proModalTriggerKey, setProModalTriggerKey] = useState('pro');
  var [showSettingsModal, setShowSettingsModal] = useState(false);
  var [xpNotification, setXpNotification] = useState(null);
  var [evolutionModal, setEvolutionModal] = useState(null);
  
  // Real-time Timer Tick Logic
  var [currentTimeParts, setCurrentTimeParts] = useState({ h: 0, m: 0, s: 0 });

  // 2. EFFECT HOOK PIPELINES
  useEffect(function() {
    if (!userData) return;
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {}
  }, [userData]);

  useEffect(function() {
    if (!userData || !userData.ncDate) return;
    
    // Immediate initial sync calculation
    setCurrentTimeParts(calculateTimeElapsed(userData.ncDate));
    
    var intervalTimer = setInterval(function() {
      setCurrentTimeParts(calculateTimeElapsed(userData.ncDate));
    }, 1000);
    
    return function() { clearInterval(intervalTimer); };
  }, [userData?.ncDate]);

  // Inject Styles directly into Document Head
  useEffect(function() {
    var existingStyle = document.getElementById('silo-core-styles');
    if (!existingStyle) {
      var styleElement = document.createElement('style');
      styleElement.id = 'silo-core-styles';
      styleElement.innerText = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070a10; font-family: 'DM Mono', monospace; overscroll-behavior: none; -webkit-font-smoothing: antialiased; }
        input, textarea, button { font-family: inherit; outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input[type='date']::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  // 3. INTERNAL HANDLERS & ARCHITECTURE MATHEMATICS
  function triggerXpGain(amount) {
    if (!userData) return;
    
    var updatedXp = (userData.xp || 0) + amount;
    var currentLevel = Math.min(Math.floor((userData.xp || 0) / LEVEL_XP_REQUIREMENT), MAXIMUM_LEVEL - 1);
    var theoreticalLevel = Math.min(Math.floor(updatedXp / LEVEL_XP_REQUIREMENT), MAXIMUM_LEVEL - 1);
    
    setXpNotification(amount);
    
    setUserData(function(prev) {
      return Object.assign({}, prev, { xp: updatedXp });
    });

    if (theoreticalLevel > currentLevel) {
      var stageMetas = CHARACTER_STAGES[theoreticalLevel];
      setEvolutionModal(stageMetas);
    }
  }

  function handleLogActivity(activityItem) {
    if (!userData) return;
    
    var todayString = getTodayString();
    var currentLoggedToday = Object.assign({}, userData.loggedToday || {});
    
    // Toggle logic for item logging within single day parameters
    if (currentLoggedToday[activityItem.id]) {
      // Already logged today -> Undo tracking logic
      delete currentLoggedToday[activityItem.id];
      var filteredLog = (userData.activityLog || []).filter(function(x) { return x !== activityItem.id; });
      
      setUserData(function(prev) {
        return Object.assign({}, prev, {
          activityLog: filteredLog,
          loggedToday: currentLoggedToday
        });
      });
    } else {
      // Activating task tracking log
      currentLoggedToday[activityItem.id] = true;
      var extendedLog = [activityItem.id].concat(userData.activityLog || []);
      
      setUserData(function(prev) {
        return Object.assign({}, prev, {
          activityLog: extendedLog,
          loggedToday: currentLoggedToday
        });
      });
      triggerXpGain(activityItem.xp);
    }
  }

  function handleCommitJournal() {
    if (!userData || !journalInput.trim()) return;
    
    var totalExistingEntries = (userData.journalEntries || []).length;
    if (totalExistingEntries >= FREE_JOURNAL_LIMIT && !userData.isPro) {
      setProModalTriggerKey('journal');
      setShowProModal(true);
      return;
    }

    var newJournalRecord = {
      id: 'jrnl_' + Date.now(),
      date: getTodayString(),
      text: journalInput.trim(),
      prompt: REFLECTION_PROMPTS[activePromptIndex],
      mood: selectedMood
    };

    setUserData(function(prev) {
      return Object.assign({}, prev, {
        journalEntries: [newJournalRecord].concat(prev.journalEntries || [])
      });
    });

    setJournalInput('');
    setActivePromptIndex(function(current) { return (current + 1) % REFLECTION_PROMPTS.length; });
    triggerXpGain(60);
  }

  function handleRunShadowAnalysis() {
    if (!userData || !shadowText.trim()) return;

    var totalAnalyses = userData.analyzeCount || 0;
    if (totalAnalyses >= FREE_ANALYZE_LIMIT && !userData.isPro) {
      setProModalTriggerKey('analyze');
      setShowProModal(true);
      return;
    }

    setUserData(function(prev) {
      return Object.assign({}, prev, {
        analyzeCount: (prev.analyzeCount || 0) + 1
      });
    });
    setInterceptStep('matrix');
  }

  function resetSystemDatabase() {
    localStorage.removeItem(DATA_STORAGE_KEY);
    setUserData(null);
    setActiveTab('dashboard');
    setShadowText('');
    setJournalInput('');
    setInterceptStep('closed');
    setShowSettingsModal(false);
  }

  // 4. THEME RESOLUTION DEFENSIVE FALLBACK LAYER
  var activeThemeType = userData?.themeArchetype || 'tactical';
  var theme = THEMES[activeThemeType];

  // Compute character and metric stats based on actual log history arrays
  var computedLevel = userData ? Math.min(Math.floor((userData.xp || 0) / LEVEL_XP_REQUIREMENT), MAXIMUM_LEVEL - 1) : 0;
  var currentLevelProgressXp = userData ? (userData.xp || 0) % LEVEL_XP_REQUIREMENT : 0;

  var attributeStats = { body: 0, mind: 0, soul: 0 };
  if (userData && userData.activityLog) {
    userData.activityLog.forEach(function(activityId) {
      var foundActivity = UNIVERSAL_ACTIVITIES.find(function(act) { return act.id === activityId; });
      if (foundActivity) {
        attributeStats[foundActivity.stat] = Math.min(attributeStats[foundActivity.stat] + 1, 99);
      }
    });
  }

  // 5. RENDERING BRANCH CONFIGURATIONS
  if (!userData) {
    // ONBOARDING USER REGISTRATION SUB-VIEW FLOW
    return <OnboardingWizard onWizardComplete={function(freshState) { setUserData(freshState); }} />;
  }

  // CORE APPLICATION WORKSPACE RENDERPASS
  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: theme.font, paddingBottom: '90px', transition: 'background 0.5s ease' }}>
      
      {/* GLOBAL HUD SYSTEM BANNER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${theme.bg}dd`, borderBottom: `1px solid ${theme.bd}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, style: { animation: 'pulse 2s infinite' } }} />
            <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: '600', letterSpacing: '0.15em' }}>SILO v8.0</h1>
          </div>
          <button 
            onClick={function() { setShowSettingsModal(true); }}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '8px', color: theme.dim, cursor: 'pointer' }}
          >
            ⚙
          </button>
        </div>
      </header>

      {/* CORE FRAME LAYOUT STAGING WINDOW */}
      <main style={{ maxWidth: '540px', margin: '0 auto', padding: '16px', animation: 'fadeUp 0.4s ease' }}>
        
        {/* VIEWPORTS ROUTER COMPONENT CONDITIONAL CONTROLLER */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* DYNAMIC METRIC ENGINE HERO COMPONENT */}
            <div style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '16px', padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '12px', right: '14px', display: 'flex', alignItems: 'center', gap: '4px', background: `${theme.streak}12`, border: `1px solid ${theme.streak}33`, padding: '4px 10px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', color: theme.streak }}>🔥</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: '600', color: theme.streak }}>
                  {calculateDayStreak(userData.ncDate)} {theme.streakLabel.toUpperCase()}
                </span>
              </div>

              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.dim, letterSpacing: '0.12em', display: 'block', textAlign: 'left' }}>
                {theme.charLabel} // IDENT: {userData.name.toUpperCase()}
              </span>

              {/* HIGH RES GRAPH ARTWORK CANVAS LAYER */}
              <CharacterArt level={computedLevel} color={theme.accent} glow={theme.accentBorder} />

              {/* TIMESTEP TICK LOOP DISPLAY GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: theme.bg3, padding: '12px', borderRadius: '12px', marginTop: '16px', border: `1px solid ${theme.bd}` }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '18px', fontWeight: '500', color: theme.text }}>{formatTwoDigits(currentTimeParts.h)}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', color: theme.dim, letterSpacing: '0.05em', marginTop: '2px' }}>HOURS</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '18px', fontWeight: '500', color: theme.text }}>{formatTwoDigits(currentTimeParts.m)}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', color: theme.dim, letterSpacing: '0.05em', marginTop: '2px' }}>MINUTES</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '18px', fontWeight: '500', color: theme.accent }}>{formatTwoDigits(currentTimeParts.s)}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', color: theme.dim, letterSpacing: '0.05em', marginTop: '2px' }}>SECONDS</div>
                </div>
              </div>

              {/* PROGRESSION LEVEL XP SLIDER EXPONENT METRIC */}
              <div style={{ marginTop: '16px' }}>
                <MetricProgressBar label="CORE INTEGRITY EXPERIENCE MATRIX" value={currentLevelProgressXp} max={LEVEL_XP_REQUIREMENT} color={theme.accent} theme={theme} />
              </div>
            </div>

            {/* THREE-AXIS CORE TRAIT PROFILE MATRIX */}
            <div style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.dim, letterSpacing: '0.1em' }}>BIO-COGNITIVE ATTRIBUTES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <MetricProgressBar label="💪 PHYSICAL (BODY)" value={attributeStats.body} max={25} color="#ef4444" theme={theme} />
                <MetricProgressBar label="🧠 PSYCHOLOGICAL (MIND)" value={attributeStats.mind} max={25} color="#3b82f6" theme={theme} />
                <MetricProgressBar label="✨ TRANSCENDENT (SOUL)" value={attributeStats.soul} max={25} color="#10b981" theme={theme} />
              </div>
            </div>

            {/* CRITICAL ACTIONS ROUTINE STAGING INPUT CONTROLS */}
            <div style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em' }}>{theme.trainTitle}</h3>
                <p style={{ fontSize: '11px', color: theme.dim, marginTop: '2px' }}>Toggle verified operations executed directly over the last 24 hours.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {UNIVERSAL_ACTIVITIES.map(function(activity) {
                  var isLoggedToday = !!userData.loggedToday?.[activity.id];
                  return (
                    <button
                      key={activity.id}
                      onClick={function() { handleLogActivity(activity); }}
                      style={{
                        width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px',
                        background: isLoggedToday ? theme.accentDim : theme.bg3,
                        border: isLoggedToday ? `1px solid ${theme.accent}` : `1px solid ${theme.bd}`,
                        borderRadius: '12px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '18px', opacity: isLoggedToday ? 1 : 0.6 }}>{activity.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: isLoggedToday ? theme.text : theme.muted }}>{activity.label}</div>
                        <div style={{ fontSize: '9px', color: theme.dim, marginTop: '1px', fontFamily: "'DM Mono', monospace" }}>ATTRIBUTE // {activity.stat.toUpperCase()}</div>
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: '600', color: isLoggedToday ? theme.accent : theme.dimmer }}>
                        {isLoggedToday ? '✓ SIGNED' : `+${activity.xp} XP`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'shadow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* EMERGENCY SHADOW TRANSMISSION INTERCEPT ROUTER CONTAINER */}
            <div style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.accent, letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>PROTECTIVE TRANSMISSION BUFFER</span>
                <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{theme.shadowLabel}</h3>
                <p style={{ fontSize: '11px', color: theme.dim, marginTop: '2px', lineHeight: '1.4' }}>{theme.tagline}</p>
              </div>

              {interceptStep === 'closed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    value={shadowText}
                    onChange={function(e) { setShadowText(e.target.value); }}
                    placeholder={theme.shadowPH}
                    style={{
                      width: '100%', height: '140px', padding: '14px', background: theme.bg3,
                      border: `1px solid ${theme.bd}`, borderRadius: '12px', color: theme.text,
                      fontSize: '13px', lineHeight: '1.5', resize: 'none', transition: 'border 0.2s'
                    }}
                  />
                  <button
                    onClick={function() {
                      if (!shadowText.trim()) return;
                      setInterceptStep('trigger');
                    }}
                    disabled={!shadowText.trim()}
                    style={{
                      width: '100%', padding: '14px', background: shadowText.trim() ? theme.accent : theme.bd,
                      borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: shadowText.trim() ? '#000' : theme.dim,
                      fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', cursor: shadowText.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
                    }}
                  >
                    {theme.analyzeBtn}
                  </button>
                </div>
              )}

              {/* SHADOW PIPELINE INTERPOLATION STEP: IDENTIFY SITUATIONAL TRIGGER */}
              {interceptStep === 'trigger' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ background: theme.bg3, borderLeft: `3px solid ${theme.accent}`, padding: '12px', borderRadius: '4px 12px 12px 4px' }}>
                    <p style={{ fontSize: '12px', color: theme.muted, whiteSpace: 'pre-line', lineHeight: '1.5' }}>{theme.interceptGreet}</p>
                  </div>
                  <textarea
                    value={interceptTriggerInput}
                    onChange={function(e) { setInterceptTriggerInput(e.target.value); }}
                    placeholder="Identify internal or external environmental conditions..."
                    style={{ width: '100%', height: '80px', padding: '12px', background: theme.bg3, border: `1px solid ${theme.bd}`, borderRadius: '12px', color: theme.text, fontSize: '12px', lineHeight: '1.5', resize: 'none' }}
                  />
                  <button
                    onClick={function() { if (interceptTriggerInput.trim()) setInterceptStep('outcome'); }}
                    disabled={!interceptTriggerInput.trim()}
                    style={{ width: '100%', padding: '12px', background: theme.accent, borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#000', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}
                  >
                    LOG REFLECTION STAGE II
                  </button>
                </div>
              )}

              {/* SHADOW PIPELINE INTERPOLATION STEP: IDENTIFY LOGICAL EXPECTED UTILITY OUTCOME */}
              {interceptStep === 'outcome' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ background: theme.bg3, borderLeft: `3px solid ${theme.accent}`, padding: '12px', borderRadius: '4px 12px 12px 4px' }}>
                    <p style={{ fontSize: '12px', color: theme.muted, whiteSpace: 'pre-line', lineHeight: '1.5' }}>{theme.interceptFollow}</p>
                  </div>
                  <textarea
                    value={interceptOutcomeInput}
                    onChange={function(e) { setInterceptOutcomeInput(e.target.value); }}
                    placeholder="Detail exactly what this dynamic action settles or resolves..."
                    style={{ width: '100%', height: '80px', padding: '12px', background: theme.bg3, border: `1px solid ${theme.bd}`, borderRadius: '12px', color: theme.text, fontSize: '12px', lineHeight: '1.5', resize: 'none' }}
                  />
                  <button
                    onClick={handleRunShadowAnalysis}
                    disabled={!interceptOutcomeInput.trim()}
                    style={{ width: '100%', padding: '12px', background: theme.accent, borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#000', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}
                  >
                    EXECUTE VECTOR PREDICTION
                  </button>
                </div>
              )}

              {/* SHADOW PIPELINE CONCLUSION VIEW: SYSTEM RETENTION MATRIX OUTPUT */}
              {interceptStep === 'matrix' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeUp 0.3s ease' }}>
                  <div style={{ background: `${theme.accent}0a`, border: `1px solid ${theme.accent}33`, padding: '16px', borderRadius: '12px', fontFamily: "'DM Mono', monospace", fontSize: '12px', lineHeight: '1.6', color: theme.text }}>
                    {theme.analysisText}
                  </div>
                  <button
                    onClick={function() {
                      setShadowText('');
                      setInterceptTriggerInput('');
                      setInterceptOutcomeInput('');
                      setInterceptStep('closed');
                    }}
                    style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${theme.bd}`, borderRadius: '12px', fontSize: '12px', color: theme.muted, cursor: 'pointer' }}
                  >
                    WIPE SYSTEM BUFFER & PURGE TRANSMISSION
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* REFLECTION COGNITIVE STAGING CONTAINER */}
            <div style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.dim, letterSpacing: '0.1em' }}>REFLECTIVE ENVELOPE STAGING</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.accent }}>
                  ENTRIES: {(userData.journalEntries || []).length} / {userData.isPro ? '∞' : FREE_JOURNAL_LIMIT}
                </span>
              </div>

              <div style={{ background: theme.bg3, border: `1px solid ${theme.bd}`, padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.text, lineHeight: '1.5' }}>
                  💡 <span style={{ color: theme.muted }}>PROMPT:</span> {REFLECTION_PROMPTS[activePromptIndex]}
                </p>
              </div>

              <textarea
                value={journalInput}
                onChange={function(e) { setJournalInput(e.target.value); }}
                placeholder={theme.journalPH}
                style={{
                  width: '100%', height: '110px', padding: '12px', background: theme.bg3,
                  border: `1px solid ${theme.bd}`, borderRadius: '12px', color: theme.text,
                  fontSize: '12px', lineHeight: '1.5', resize: 'none', marginBottom: '12px'
                }}
              />

              {/* MOOD SELECTION ROW INPUT */}
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: theme.dim, fontFamily: "'DM Mono', monospace" }}>AFFECTIVE VALUE:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {MOOD_EMOJIS.map(function(m) {
                    var isSelected = selectedMood === m;
                    return (
                      <button
                        key={m} onClick={function() { setSelectedMood(m); }}
                        style={{
                          fontSize: '14px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSelected ? theme.accentDim : 'transparent', border: isSelected ? `1px solid ${theme.accent}` : '1px solid transparent',
                          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCommitJournal}
                disabled={!journalInput.trim()}
                style={{
                  width: '100%', padding: '12px', background: journalInput.trim() ? theme.accent : theme.bd,
                  borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: journalInput.trim() ? '#000' : theme.dim,
                  fontFamily: "'DM Mono', monospace", cursor: journalInput.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
                }}
              >
                {theme.journalSave}
              </button>
            </div>

            {/* HISTORICAL ARCHIVAL SYSTEM LOG TREE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.dim, letterSpacing: '0.08em', paddingLeft: '4px' }}>LOG TRANSMISSION RECORD ARCHIVE</span>
              
              {(!userData.journalEntries || userData.journalEntries.length === 0) ? (
                <div style={{ border: `1px dashed ${theme.bd}`, padding: '24px', borderRadius: '12px', textAlign: 'center', color: theme.dimmer, fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  No historical entries registered within current local instance database.
                </div>
              ) : (
                userData.journalEntries.map(function(item) {
                  return (
                    <div key={item.id} style={{ background: theme.bg2, border: `1px solid ${theme.bd}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.accent }}>📅 {item.date}</span>
                        <span style={{ fontSize: '12px' }}>{item.mood}</span>
                      </div>
                      <p style={{ fontSize: '10px', color: theme.dim, fontStyle: 'italic', lineHeight: '1.4' }}>P: {item.prompt}</p>
                      <p style={{ fontSize: '12px', color: theme.text, lineHeight: '1.5', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{item.text}</p>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}
      </main>

      {/* FIXED NAV MASTER CONTROLLER */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: `${theme.bg}ee`, borderTop: `1px solid ${theme.bd}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto', display: 'flex', padding: '8px 8px 12px' }}>
          {[
            { id: 'dashboard', label: 'FRAME', icon: '🛡️' },
            { id: 'shadow', label: 'SHADOW', icon: '👁️' },
            { id: 'journal', label: 'LOGS', icon: '📓' }
          ].map(function(tabItem) {
            var isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={function() { setActiveTab(tabItem.id); }}
                style={{
                  flex: 1, padding: '8px 4px 4px', background: 'transparent', border: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '16px', filter: isActive ? `drop-shadow(0 0 6px ${theme.accent})` : 'none', opacity: isActive ? 1 : 0.4, transition: 'all 0.2s' }}>
                  {tabItem.icon}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', fontWeight: isActive ? '600' : '400', color: isActive ? theme.accent : theme.dim, letterSpacing: '0.05em' }}>
                  {tabItem.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* OVERLAY MODAL HUD SYSTEM COMPONENT: TOAST NOTIFICATION */}
      {xpNotification && (
        <XPToastComponent amount={xpNotification} theme={theme} onDone={function() { setXpNotification(null); }} />
      )}

      {/* OVERLAY MODAL HUD SYSTEM COMPONENT: LEVEL UP NOTIFIER */}
      {evolutionModal && (
        <LevelEvolutionModal stage={evolutionModal} theme={theme} onDone={function() { setEvolutionModal(null); }} />
      )}

      {/* OVERLAY MODAL HUD SYSTEM COMPONENT: CORE SYSTEM SETTINGS MANAGEMENT */}
      {showSettingsModal && (
        <SettingsPanel theme={theme} user={userData} onClose={function() { setShowSettingsModal(false); }} onReset={resetSystemDatabase} />
      )}

      {/* OVERLAY MODAL HUD SYSTEM COMPONENT: PREMIUM MONETIZATION SYSTEM STANDIN */}
      {showProModal && (
        <PremiumPaywallStandin triggerKey={proModalTriggerKey} theme={theme} onClose={function() { setShowProModal(false); }} />
      )}

    </div>
  );
}

// ─── ONBOARDING SUBSYSTEM SUB-ROUTER WIZARD ──────────────────────────────────
function OnboardingWizard({ onWizardComplete }) {
  var [stage, setStage] = useState('identity_matrix'); // 'identity_matrix', 'configuration_profile', 'timestamp_calibration'
  var [selectedArchetype, setSelectedArchetype] = useState('tactical');
  var [profileNameInput, setProfileNameInput] = useState('');
  var [timestampInput, setTimestampInput] = useState(getTodayString());

  var activeThemeMeta = THEMES[selectedArchetype];

  function processFinalSubmission() {
    if (!profileNameInput.trim()) return;
    onWizardComplete({
      themeArchetype: selectedArchetype,
      name: profileNameInput.trim(),
      ncDate: timestampInput,
      xp: 0,
      journalEntries: [],
      activityLog: [],
      loggedToday: {},
      loggedDate: getTodayString(),
      analyzeCount: 0,
      isPro: false
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: activeThemeMeta.bg, color: activeThemeMeta.text, fontFamily: activeThemeMeta.font, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', transition: 'all 0.5s ease' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: activeThemeMeta.bg2, border: `1px solid ${activeThemeMeta.bd}`, borderRadius: '24px', padding: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', animation: 'slideUp 0.4s ease' }}>
        
        {stage === 'identity_matrix' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ width: '48px', height: '48px', background: activeThemeMeta.bg3, border: `1px solid ${activeThemeMeta.bd2}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.02em', marginBottom: '6px' }}>Calibrate Interface Dynamic</h2>
            <p style={{ fontSize: '13px', color: activeThemeMeta.dim, lineHeight: '1.5', marginBottom: '20px' }}>Select the cognitive architecture profile that coordinates cleanly with your internal mental strategy.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <button
                onClick={function() { setSelectedArchetype('tactical'); }}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedArchetype === 'tactical' ? '#0a1628' : activeThemeMeta.bg3,
                  border: selectedArchetype === 'tactical' ? '1px solid #4a9eff' : `1px solid ${activeThemeMeta.bd}`
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: selectedArchetype === 'tactical' ? '#4a9eff' : activeThemeMeta.text }}>SYSTEMATIC / TACTICAL</div>
                <div style={{ fontSize: '11px', color: activeThemeMeta.dim, marginTop: '2px' }}>Direct, algorithmic, engineering-centric logic models.</div>
              </button>
              <button
                onClick={function() { setSelectedArchetype('supportive'); }}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedArchetype === 'supportive' ? '#1a0810' : activeThemeMeta.bg3,
                  border: selectedArchetype === 'supportive' ? '1px solid #e879a0' : `1px solid ${activeThemeMeta.bd}`
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: selectedArchetype === 'supportive' ? '#e879a0' : activeThemeMeta.text }}>EMPATHETIC / SUPPORTIVE</div>
                <div style={{ fontSize: '11px', color: activeThemeMeta.dim, marginTop: '2px' }}>Compassionate space, intuitive reflection, gentle validation framework.</div>
              </button>
            </div>

            <button
              onClick={function() { setStage('configuration_profile'); }}
              style={{ width: '100%', padding: '14px', background: activeThemeMeta.accent, border: 'none', borderRadius: '12px', color: '#000', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', cursor: 'pointer' }}
            >
              INITIALIZE ARCHETYPE ENGINE →
            </button>
          </div>
        )}

        {stage === 'configuration_profile' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Identify Call Sign</h2>
            <p style={{ fontSize: '13px', color: activeThemeMeta.dim, lineHeight: '1.5', marginBottom: '18px' }}>Input the name, signature, or local tracking variable your data identity should reference.</p>
            
            <input
              type="text" autoFocus value={profileNameInput}
              onChange={function(e) { setProfileNameInput(e.target.value); }}
              placeholder="Enter name or tracking identification label..."
              style={{
                width: '100%', padding: '14px', background: activeThemeMeta.bg3, border: `1px solid ${activeThemeMeta.bd2}`,
                borderRadius: '12px', color: activeThemeMeta.text, fontSize: '14px', marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={function() { setStage('identity_matrix'); }}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${activeThemeMeta.bd}`, borderRadius: '12px', color: activeThemeMeta.muted, fontSize: '12px', cursor: 'pointer' }}
              >
                ← BACK
              </button>
              <button
                onClick={function() { if (profileNameInput.trim()) setStage('timestamp_calibration'); }}
                disabled={!profileNameInput.trim()}
                style={{
                  flex: 2, padding: '12px', background: profileNameInput.trim() ? activeThemeMeta.accent : activeThemeMeta.bd,
                  border: 'none', borderRadius: '12px', color: profileNameInput.trim() ? '#000' : activeThemeMeta.dim, fontSize: '12px', fontWeight: '600', cursor: profileNameInput.trim() ? 'pointer' : 'default'
                }}
              >
                CALIBRATE CLOCK →
              </button>
            </div>
          </div>
        )}

        {stage === 'timestamp_calibration' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Timestamp Initialization</h2>
            <p style={{ fontSize: '13px', color: activeThemeMeta.dim, lineHeight: '1.5', marginBottom: '18px' }}>Select the baseline start calibration sequence date for tracking validation protocols.</p>
            
            <input
              type="date" value={timestampInput} max={getTodayString()}
              onChange={function(e) { setTimestampInput(e.target.value || getTodayString()); }}
              style={{
                width: '100%', padding: '14px', background: activeThemeMeta.bg3, border: `1px solid ${activeThemeMeta.bd2}`,
                borderRadius: '12px', color: activeThemeMeta.text, fontSize: '14px', marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={function() { setStage('configuration_profile'); }}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${activeThemeMeta.bd}`, borderRadius: '12px', color: activeThemeMeta.muted, fontSize: '12px', cursor: 'pointer' }}
              >
                ← BACK
              </button>
              <button
                onClick={processFinalSubmission}
                style={{ flex: 2, padding: '12px', background: activeThemeMeta.accent, border: 'none', borderRadius: '12px', color: '#000', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                CONFIRM DEPLOYMENT MATRIX
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── LOCAL HOOK HELPER OVERLAYS ──────────────────────────────────────────────
function XPToastComponent({ amount, theme, onDone }) {
  useEffect(function() {
    var timer = setTimeout(onDone, 2200);
    return function() { clearTimeout(timer); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', top: '72px', right: '16px', zIndex: 700, background: 'rgba(7, 10, 16, 0.96)',
      border: `1px solid ${theme.accent}`, borderRadius: '12px', padding: '10px 16px', display: 'flex',
      alignItems: 'center', gap: '8px', fontSize: '11px', color: theme.accent, fontFamily: "'DM Mono', monospace",
      letterSpacing: '0.1em', boxShadow: `0 0 24px ${theme.accent}22`, animation: 'fadeUp 0.2s ease-out'
    }}>
      ⚡ +{amount} VECTOR INTEGRITY CREDITS ACCRUED
    </div>
  );
}

function LevelEvolutionModal({ stage, theme, onDone }) {
  useEffect(function() {
    var timer = setTimeout(onDone, 3800);
    return function() { clearTimeout(timer); };
  }, [onDone]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'pulse 0.3s cubic-bezier(0, 0, 0.2, 1)' }}>
      <div style={{ textAlign: 'center', animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div style={{ fontSize: '64px', marginBottom: '14px', filter: `drop-shadow(0 0 20px ${stage.glow})` }}>{stage.emoji}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: stage.color, letterSpacing: '0.25em', marginBottom: '6px' }}>CHARACTER CORE ENGINE ADVANCED</div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>{stage.name.toUpperCase()}</h2>
        <p style={{ fontSize: '13px', color: theme.dim, lineHeight: '1.6', maxWidth: '320px', margin: '0 auto' }}>{stage.desc}</p>
      </div>
    </div>
  );
}

function SettingsPanel({ theme, user, onClose, onReset }) {
  var [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div onClick={function(e) { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: theme.bg2, border: `1px solid ${theme.bd}`, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', animation: 'slideUp 0.25s ease-out', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: '600', color: theme.text }}>LOCAL NODE COMPILATION CONTROL</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: theme.dim, fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: theme.bg, border: `1px solid ${theme.bd}`, borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>ID: {user.name}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: theme.dim, marginTop: '2px' }}>
            PROFILE COMPONENT // {user.themeArchetype.toUpperCase()} STAGE MODULE
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: theme.dimmer, marginTop: '6px' }}>
            LOCAL MATRIX CALIBRATION RECORDED SINCE: {user.ncDate}
          </div>
        </div>

        {showResetConfirm ? (
          <div style={{ background: '#180808', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#fca5a5', marginBottom: '12px', textAlign: 'center', lineHeight: '1.4' }}>
              CRITICAL: Wiping clean database removes all local arrays permanently. This action cannot be unmade.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={function() { setShowResetConfirm(false); }} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${theme.bd}`, borderRadius: '8px', color: theme.muted, fontSize: '11px', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}>ABORT RESET</button>
              <button onClick={onReset} style={{ flex: 1, padding: '10px', background: '#7f1d1d', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: "'DM Mono', monospace', fontWeight: '600', cursor: 'pointer' }}>CONFIRM PURGE</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={function() { setShowResetConfirm(true); }}
            style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: '12px', color: '#fca5a5', fontFamily: "'DM Mono', monospace", fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
          >
            ↻ ERASE CACHED INSTANCE DATA MATRIX
          </button>
        )}
      </div>
    </div>
  );
}

function PremiumPaywallStandin({ triggerKey, theme, onClose }) {
  var headers = { journal: 'Journal Storage Ceiling Exceeded', analyze: 'Analysis Engine Limit Hit', pro: 'Silo Prime Access' };
  var descriptors = { 
    journal: `Free storage instances permit up to ${FREE_JOURNAL_LIMIT} local encrypted journal files.`, 
    analyze: `Standard evaluation pipelines permit ${FREE_ANALYZE_LIMIT} predictive vector computations per user lifecycle.`, 
    pro: 'Unlock unlimited tracking matrices, multi-device sync arrays, and historical trend plotting graphs.' 
  };

  return (
    <div onClick={function(e) { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: theme.bg2, border: `1px solid ${theme.proBd}`, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', overflow: 'hidden', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div style={{ background: theme.proBg, padding: '20px', borderBottom: `1px solid ${theme.proBd}` }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👑</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text }}>{headers[triggerKey] || headers.pro}</h3>
          <p style={{ fontSize: '12px', color: theme.dim, marginTop: '4px', lineHeight: '1.5' }}>{descriptors[triggerKey] || descriptors.pro}</p>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ padding: '14px', background: theme.proBg, border: `1px solid ${theme.proBd}`, borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.proTxt, letterSpacing: '0.15em', marginBottom: '8px' }}>SILO COMPILATION SUBSYSTEM INSIGHTS:</div>
            {['Infinite local tracking registries', 'Unrestricted vector evaluation models', 'Deep historical trend mapping mechanics'].map(function(feat) {
              return <div key={feat} style={{ fontSize: '12px', color: theme.proTxt, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ {feat}</div>;
            })}
          </div>
          <div style={{ width: '100%', padding: '12px', background: theme.dimmer, borderRadius: '10px', fontSize: '11px', fontWeight: '600', color: theme.dim, fontFamily: "'DM Mono', monospace", textAlign: 'center', marginBottom: '12px' }}>
            SECURE STRIPE SUITE SUBSCRIPTION HUB INACTIVE
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${theme.bd}`, borderRadius: '10px', color: theme.dim, fontSize: '12px', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}>
            CONTINUE EVALUATION PARADIGM
          </button>
        </div>
      </div>
    </div>
  );
}
