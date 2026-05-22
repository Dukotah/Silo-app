import React from 'react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
var STORAGE_KEY = 'silo_v8';
var XPL = 500;
var MAX_LEVEL = 4;
var FREE_JOURNAL = 3;
var FREE_ANALYZE = 2;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function getStreak(d) { return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)); }
function getTimeParts(d) {
  var s = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  return { h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
function getLevel(xp) { return Math.min(Math.floor(xp / XPL), MAX_LEVEL); }
function getLevelXP(xp) { return xp % XPL; }
function getStats(log, acts) {
  var s = { body: 0, mind: 0, soul: 0 };
  (log || []).forEach(function(id) {
    var a = acts.find(function(x) { return x.id === id; });
    if (a) s[a.stat] = Math.min((s[a.stat] || 0) + 1, 999);
  });
  return s;
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}
function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
function clearData() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

// ─── THEME CONFIG ─────────────────────────────────────────────────────────────
var THEME = {
  male: {
    accent: '#4a9eff', accentDim: '#0a1628', accentBorder: '#1e3a5f',
    accent2: '#22c55e', streakCol: '#f97316',
    bg: '#070a10', bg2: '#0a0e1a', bg3: '#0d1220',
    border: '#151e30', border2: '#1e3a5f',
    text: '#e2e8f0', muted: '#94a3b8', dim: '#475569', dimmer: '#2d3748',
    proCol: '#6d28d9', proBorder: '#3b1a8a', proText: '#c4b5fd', proBg: '#0d0a2a',
    font: "'DM Mono', monospace",
  },
  female: {
    accent: '#e879a0', accentDim: '#1a0810', accentBorder: '#5a1830',
    accent2: '#34d399', streakCol: '#fb923c',
    bg: '#0a060e', bg2: '#110818', bg3: '#180d20',
    border: '#221030', border2: '#3d1545',
    text: '#f0e6f6', muted: '#c4a8d4', dim: '#7a5a8a', dimmer: '#3d2a4d',
    proCol: '#9333ea', proBorder: '#4a1090', proText: '#d8b4fe', proBg: '#100820',
    font: "'DM Sans', sans-serif",
  }
};

// ─── COPY CONFIG ──────────────────────────────────────────────────────────────
var COPY = {
  male: {
    tagline: 'Build yourself back.',
    charLabel: 'YOUR OPERATIVE',
    streakLabel: 'Days Clean',
    shadowLabel: 'SHADOW INBOX',
    shadowPlaceholder: 'Write the message you want to send...',
    analyzeBtn: 'ANALYZE IMPACT',
    journalSave: 'LOG ENTRY',
    journalPlaceholder: 'Write what\'s on your mind...',
    chamberTitle: 'VENTING CHAMBER',
    interceptTitle: 'I WANT TO REACH OUT',
    interceptSub: 'Emergency intercept — process before you act',
    interceptGreeting: 'Hold your position. I\'m here.\n\nWhat triggered the urge right now?',
    interceptFollowup: 'Copy that. The pull is strongest when you\'re actually making progress.\n\nWhat outcome are you hoping for if you send it?',
    analysisText: 'What will actually happen:\n\nSending this triggers a dopamine spike lasting about 8 minutes — then a 24-48 hour anxiety loop waiting for a reply that may never come.\n\nIf they don\'t reply: You spend two days rereading it.\n\nIf they do reply: The old dynamic reactivates. Same patterns. Same cost.\n\nWhat this is really saying: "I need external validation that I\'m okay." That\'s a real need — it just can\'t be met by that contact.\n\nYour streak is intact. Don\'t trade progress for 8 minutes of noise.',
    prompts: [
      'What did you accomplish today that had nothing to do with them?',
      'Name one tactical advantage you\'ve gained this week.',
      'What would you brief your past self on from 30 days ago?',
      'What\'s beneath the urge — what do you actually need?',
      'Describe the version of you operating at full capacity.',
      'What\'s one thing you\'ve reclaimed for yourself?',
      'Where did you show up for yourself today?',
    ],
    moods: ['💪', '📈', '😤', '😔', '🔥', '🌙'],
    greeting: function(n) { return n + '.'; },
    onboard: [
      { icon: '⚡', title: 'You have a character.', body: 'Every action you take in real life evolves it. No-contact days, journal entries, training — they all stack.' },
      { icon: '🔒', title: 'Shadow Inbox protects you.', body: 'Write the message you\'re desperate to send. We analyse the impact — you never have to send it.' },
      { icon: '📈', title: 'Progress is the product.', body: 'Body, Mind, Soul — three stats that reflect your real recovery. Watch them grow as you rebuild.' },
    ],
    activities: [
      { id: 'run',      label: 'Run / Sprint',  xp: 75,  icon: '🏃', stat: 'body' },
      { id: 'gym',      label: 'Lift / Train',  xp: 100, icon: '🏋️', stat: 'body' },
      { id: 'cold',     label: 'Cold Shower',   xp: 60,  icon: '🚿', stat: 'body' },
      { id: 'sleep',    label: '8hrs Sleep',    xp: 45,  icon: '🌙', stat: 'body' },
      { id: 'meditate', label: 'Meditation',    xp: 55,  icon: '🧘', stat: 'mind' },
      { id: 'journal',  label: 'Journaled',     xp: 40,  icon: '📓', stat: 'mind' },
      { id: 'noscroll', label: 'No Doomscroll', xp: 35,  icon: '📵', stat: 'mind' },
      { id: 'read',     label: 'Read / Learn',  xp: 40,  icon: '📚', stat: 'mind' },
      { id: 'social',   label: 'Saw the Boys',  xp: 80,  icon: '🤝', stat: 'soul' },
      { id: 'outside',  label: 'Time Outside',  xp: 50,  icon: '🌲', stat: 'soul' },
    ],
    milestones: [
      { days: 1,  xp: 100,  label: 'First Hold',       desc: '24 hours. You didn\'t break.', icon: '🔒' },
      { days: 3,  xp: 200,  label: '72-Hour Lock',     desc: 'Neural rewiring has begun.',   icon: '🧠' },
      { days: 7,  xp: 500,  label: 'One Week Op',      desc: 'The fog is clearing.',         icon: '🎯', pro: true },
      { days: 14, xp: 750,  label: 'Fortnight Strong', desc: 'Dopamine baseline restoring.', icon: '⚡', pro: true },
      { days: 30, xp: 1500, label: '30-Day Protocol',  desc: 'Full operational recovery.',   icon: '🛡️', pro: true },
      { days: 60, xp: 3000, label: 'Signal Silence',   desc: 'You are the signal now.',      icon: '👁️', pro: true },
    ],
    chars: [
      { name: 'Ghost',     color: '#475569', glow: 'rgba(71,85,105,0.5)',    desc: 'Barely holding together.',            emoji: '🌑' },
      { name: 'Survivor',  color: '#64748b', glow: 'rgba(100,116,139,0.5)',  desc: 'Still standing. That matters.',       emoji: '🪨' },
      { name: 'Operative', color: '#4a9eff', glow: 'rgba(74,158,255,0.55)', desc: 'Discipline is forming.',              emoji: '⚡' },
      { name: 'Agent',     color: '#22c55e', glow: 'rgba(34,197,94,0.55)',  desc: 'Sharper. Clearer. Stronger.',         emoji: '🎯' },
      { name: 'Commander', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)',  desc: 'Unshakeable. This is who you are.',   emoji: '🔥' },
    ],
    emptyJournal: 'No entries yet.\nWrite your first log above.',
    emptyTrain: 'Nothing logged today. Tap an activity to build your stats.',
    progressTitle: 'EVOLUTION',
    trainTitle: 'MISSION LOG',
  },
  female: {
    tagline: 'Become who you were before them.',
    charLabel: 'YOUR INNER SELF',
    streakLabel: 'Days Free',
    shadowLabel: 'UNSENT LETTER',
    shadowPlaceholder: 'Write what you\'re holding back...',
    analyzeBtn: 'SHOW ME THE TRUTH',
    journalSave: 'SAVE ENTRY',
    journalPlaceholder: 'Write freely — this is just for you...',
    chamberTitle: 'SAFE SPACE',
    interceptTitle: 'I WANT TO REACH OUT',
    interceptSub: 'Take a breath — let\'s process this together',
    interceptGreeting: 'Hey, I\'ve got you. You don\'t have to do anything right now.\n\nTell me what happened that made you want to reach out.',
    interceptFollowup: 'That makes complete sense. Your nervous system is looking for something familiar.\n\nYou\'re not weak for feeling this. What do you actually need right now?',
    analysisText: 'What will most likely happen:\n\nSending this gives you about 8 minutes of relief — then your phone becomes something you can\'t put down while you wait.\n\nIf they don\'t reply: The silence will feel louder than anything they could say.\n\nIf they do reply: It rarely goes the way we imagine. You get pulled back into patterns you\'ve been working to leave.\n\nWhat this is really saying: "I need to feel like I still matter to you." That need is valid — it just deserves to be met by someone who can actually show up for you.\n\nYour streak is beautiful. You\'ve earned every single day.',
    prompts: [
      'What felt good today, even something tiny?',
      'Name one thing you did just for yourself this week.',
      'What would you say to your best friend going through this?',
      'What are you most proud of since you started this journey?',
      'Describe the life you\'re building on the other side of this.',
      'What\'s something you rediscovered about yourself?',
      'Who showed up for you today?',
    ],
    moods: ['💛', '🌸', '😔', '💪', '✨', '🌙'],
    greeting: function(n) { return n + '.'; },
    onboard: [
      { icon: '🌸', title: 'You have a character.', body: 'She evolves as you heal. Every day of no-contact, every journal entry, every act of self-care makes her stronger.' },
      { icon: '💌', title: 'Unsent Letter protects you.', body: 'Write what you want to say to them. We help you process it — you never have to send it.' },
      { icon: '✨', title: 'Watch yourself grow.', body: 'Body, Mind, Soul — three parts of you that are rebuilding. Your character reflects exactly how far you\'ve come.' },
    ],
    activities: [
      { id: 'walk',     label: 'Walk / Move',      xp: 60,  icon: '🚶', stat: 'body' },
      { id: 'workout',  label: 'Workout',           xp: 90,  icon: '💪', stat: 'body' },
      { id: 'sleep',    label: 'Good Sleep',        xp: 50,  icon: '🌙', stat: 'body' },
      { id: 'selfcare', label: 'Self-Care Ritual',  xp: 45,  icon: '✨', stat: 'soul' },
      { id: 'meditate', label: 'Meditate',          xp: 55,  icon: '🧘', stat: 'mind' },
      { id: 'journal',  label: 'Journaled',         xp: 45,  icon: '📔', stat: 'mind' },
      { id: 'noscroll', label: 'No Spiral Scroll',  xp: 40,  icon: '📵', stat: 'mind' },
      { id: 'creative', label: 'Creative Time',     xp: 55,  icon: '🎨', stat: 'soul' },
      { id: 'friends',  label: 'Time With Friends', xp: 85,  icon: '💛', stat: 'soul' },
      { id: 'nature',   label: 'Time in Nature',    xp: 50,  icon: '🌸', stat: 'soul' },
    ],
    milestones: [
      { days: 1,  xp: 100,  label: 'First Step',          desc: 'One whole day. That took courage.',   icon: '🌱' },
      { days: 3,  xp: 200,  label: 'Three Days Strong',   desc: 'Your heart is starting to breathe.',  icon: '🌸' },
      { days: 7,  xp: 500,  label: 'One Week Free',       desc: 'A full week of choosing yourself.',   icon: '🌙', pro: true },
      { days: 14, xp: 750,  label: 'Two Weeks Blooming',  desc: 'The emotional weight is lifting.',    icon: '🌺', pro: true },
      { days: 30, xp: 1500, label: 'One Month Reclaimed', desc: 'You\'ve rebuilt something real.',     icon: '💎', pro: true },
      { days: 60, xp: 3000, label: 'Fully Yourself',      desc: 'You were always enough.',             icon: '👑', pro: true },
    ],
    chars: [
      { name: 'Ember',    color: '#9d4f7c', glow: 'rgba(157,79,124,0.5)',   desc: 'Still finding your footing.',         emoji: '🌑' },
      { name: 'Seeker',   color: '#c06a9a', glow: 'rgba(192,106,154,0.5)',  desc: 'The fog is starting to lift.',        emoji: '🌿' },
      { name: 'Blooming', color: '#e879a0', glow: 'rgba(232,121,160,0.55)', desc: 'Growing into yourself again.',        emoji: '🌸' },
      { name: 'Radiant',  color: '#f0abcc', glow: 'rgba(240,171,204,0.55)', desc: 'Soft, strong, unmistakably you.',     emoji: '✨' },
      { name: 'Sovereign',color: '#d8b4fe', glow: 'rgba(216,180,254,0.6)',  desc: 'Whole. Healed. Unstoppable.',         emoji: '👑' },
    ],
    emptyJournal: 'No entries yet.\nWrite your first entry above.',
    emptyTrain: 'Nothing logged today. Tap an activity to grow your character.',
    progressTitle: 'YOUR JOURNEY',
    trainTitle: 'SELF-CARE LOG',
  }
};

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
var GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #070a10; }
  body { overscroll-behavior: none; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
  textarea, input { outline: none; }
  button { cursor: pointer; border: none; background: none; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-7px); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.35s ease forwards; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
`;

// ─── createElement SHORTHAND ──────────────────────────────────────────────────
var e = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useCallback = React.useCallback;

// ─── STYLE HELPERS ─────────────────────────────────────────────────────────────
function row(extra) { return Object.assign({ display: 'flex', alignItems: 'center' }, extra || {}); }
function col(extra) { return Object.assign({ display: 'flex', flexDirection: 'column' }, extra || {}); }
function mono(size, color, extra) {
  return Object.assign({ fontFamily: "'DM Mono', monospace", fontSize: size, color: color, letterSpacing: '0.08em' }, extra || {});
}

// ─── COMPONENT: LOADING ────────────────────────────────────────────────────────
function Loading() {
  return e('div', {
    style: { minHeight: '100vh', background: '#070a10', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }, e('div', {
    style: { width: 10, height: 10, borderRadius: '50%', background: '#4a9eff', animation: 'pulse 1s ease-in-out infinite' }
  }));
}

// ─── COMPONENT: STAT BAR ──────────────────────────────────────────────────────
function StatBar(props) {
  var label = props.label, val = props.val, max = props.max, color = props.color, t = props.t;
  var pct = max > 0 ? Math.min((val / max) * 100, 100) : 0;
  return e('div', { style: { flex: 1 } },
    e('div', { style: row({ justifyContent: 'space-between', marginBottom: 4 }) },
      e('span', { style: mono(8, t.dim) }, label),
      e('span', { style: mono(8, val > 0 ? color : t.dimmer) }, String(val))
    ),
    e('div', { style: { height: 3, background: t.border, borderRadius: 2, overflow: 'hidden' } },
      e('div', { style: { height: '100%', width: pct + '%', background: color, borderRadius: 2, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' } })
    )
  );
}

// ─── COMPONENT: XP TOAST ──────────────────────────────────────────────────────
function XPToast(props) {
  useEffect(function() {
    var t = setTimeout(props.onDone, 2400);
    return function() { clearTimeout(t); };
  }, []);
  return e('div', {
    style: {
      position: 'fixed', top: 72, right: 16, zIndex: 700,
      background: 'rgba(7,10,16,0.97)', border: '1px solid ' + props.accent,
      borderRadius: 12, padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      fontSize: 12, color: props.accent, fontFamily: "'DM Mono', monospace",
      letterSpacing: '0.1em', boxShadow: '0 0 28px ' + props.accent + '33'
    }
  }, '★ +' + props.amount + ' XP');
}

// ─── COMPONENT: LEVEL UP BANNER ───────────────────────────────────────────────
function LevelUpBanner(props) {
  useEffect(function() {
    var t = setTimeout(props.onDone, 3500);
    return function() { clearTimeout(t); };
  }, []);
  var c = props.char, t = props.t;
  return e('div', {
    style: {
      position: 'fixed', inset: 0, zIndex: 800,
      background: 'rgba(0,0,0,0.9)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeUp 0.3s ease'
    }
  }, e('div', { style: { textAlign: 'center', animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' } },
    e('div', { style: { fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 0 24px ' + c.glow + ')' } }, c.emoji),
    e('div', { style: mono(10, c.color, { letterSpacing: '0.25em', marginBottom: 8 }) }, 'FORM EVOLVED'),
    e('div', { style: { fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 8 } }, c.name),
    e('div', { style: { fontSize: 14, color: t.dim, lineHeight: 1.6 } }, c.desc)
  ));
}

// ─── COMPONENT: OFFLINE BADGE ─────────────────────────────────────────────────
function OfflineBadge(props) {
  return e('div', {
    style: {
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 600, background: props.t.bg2, border: '1px solid ' + props.t.border,
      borderRadius: 20, padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 10, color: props.t.dim, fontFamily: "'DM Mono', monospace"
    }
  }, '○ OFFLINE — SHOWING CACHED DATA');
}

// ─── COMPONENT: CHARACTER ART (SVG) ───────────────────────────────────────────
function CharacterArt(props) {
  var level = props.level, color = props.color, glow = props.glow, gender = props.gender;
  var iF = gender === 'female';
  var op = 0.28 + (level / MAX_LEVEL) * 0.72;
  var armW = 6 + level;

  var rings = [];
  for (var i = 0; i <= level; i++) {
    rings.push(e('circle', {
      key: 'ring' + i, cx: '100', cy: '125', r: String(52 + i * 17),
      fill: 'none', stroke: color, strokeWidth: '0.8',
      opacity: Math.max(0.03, 0.1 - i * 0.02),
      style: { animation: 'pulse ' + (2.2 + i * 0.6) + 's ease-in-out ' + (i * 0.3) + 's infinite' }
    }));
  }

  var bodyParts = [];
  bodyParts.push(e('ellipse', { key: 'shadow', cx: '100', cy: '200', rx: String(28 + level * 9), ry: '5', fill: color, opacity: 0.08 + level * 0.04 }));

  if (iF) {
    bodyParts.push(e('ellipse', { key: 'head', cx: '100', cy: '68', rx: '17', ry: '19', fill: color, opacity: op }));
    bodyParts.push(e('path', { key: 'body', d: 'M83 85 Q100 78 117 85 L120 142 Q110 150 100 151 Q90 150 80 142 Z', fill: color, opacity: op }));
    if (level >= 1) {
      bodyParts.push(e('ellipse', { key: 'hair-top', cx: '100', cy: '53', rx: '21', ry: '7', fill: color, opacity: op * 0.7 }));
      bodyParts.push(e('path', { key: 'hair-l', d: 'M79 56 Q73 76 76 96', stroke: color, strokeWidth: '5', fill: 'none', opacity: op * 0.65, strokeLinecap: 'round' }));
      bodyParts.push(e('path', { key: 'hair-r', d: 'M121 56 Q127 76 124 96', stroke: color, strokeWidth: '5', fill: 'none', opacity: op * 0.65, strokeLinecap: 'round' }));
    }
    bodyParts.push(e('path', { key: 'arm-l', d: 'M83 91 Q69 108 67 126', stroke: color, strokeWidth: '7', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'arm-r', d: 'M117 91 Q131 108 133 126', stroke: color, strokeWidth: '7', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'leg-l', d: 'M92 149 Q88 169 86 192', stroke: color, strokeWidth: '7', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'leg-r', d: 'M108 149 Q112 169 114 192', stroke: color, strokeWidth: '7', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    if (level >= 4) {
      bodyParts.push(e('path', { key: 'crown', d: 'M85 44 L89 35 L95 41 L100 31 L105 41 L111 35 L115 44 Z', fill: color, opacity: op }));
      bodyParts.push(e('circle', { key: 'crown-gem', cx: '100', cy: '43', r: '3', fill: color, style: { animation: 'pulse 1.4s ease-in-out infinite' } }));
    }
    if (level >= 2) {
      for (var pi = 0; pi < 5; pi++) {
        bodyParts.push(e('circle', { key: 'p' + pi, cx: String(80 + pi * 10), cy: String(62 + Math.sin(pi) * 18), r: '1.8', fill: color, opacity: 0.55, style: { animation: 'pulse ' + (1 + pi * 0.3) + 's ease-in-out ' + (pi * 0.2) + 's infinite' } }));
      }
    }
  } else {
    bodyParts.push(e('ellipse', { key: 'head', cx: '100', cy: '65', rx: '17', ry: '19', fill: color, opacity: op }));
    bodyParts.push(e('path', { key: 'body', d: 'M83 81 Q100 73 117 81 L123 140 Q111 148 100 149 Q89 148 77 140 Z', fill: color, opacity: op }));
    bodyParts.push(e('path', { key: 'arm-l', d: 'M83 87 Q66 106 63 128', stroke: color, strokeWidth: String(armW), fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'arm-r', d: 'M117 87 Q134 106 137 128', stroke: color, strokeWidth: String(armW), fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'leg-l', d: 'M91 147 Q87 167 85 192', stroke: color, strokeWidth: '8', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    bodyParts.push(e('path', { key: 'leg-r', d: 'M109 147 Q113 167 115 192', stroke: color, strokeWidth: '8', fill: 'none', opacity: op, strokeLinecap: 'round' }));
    if (level >= 1) bodyParts.push(e('path', { key: 'hair', d: 'M83 54 Q100 45 117 54', stroke: color, strokeWidth: '4', fill: 'none', opacity: op * 0.6, strokeLinecap: 'round' }));
    if (level >= 2) bodyParts.push(e('path', { key: 'armor', d: 'M83 81 Q100 75 117 81 L119 99 Q100 107 81 99 Z', fill: color, opacity: 0.18 }));
    if (level >= 4) {
      bodyParts.push(e('path', { key: 'crown', d: 'M85 49 L88 37 L100 29 L112 37 L115 49', fill: color, opacity: op * 0.85 }));
      bodyParts.push(e('circle', { key: 'crown-gem', cx: '100', cy: '31', r: '4', fill: color, style: { animation: 'pulse 1.4s ease-in-out infinite' } }));
    }
    if (level >= 2) {
      for (var qi = 0; qi < 4; qi++) {
        bodyParts.push(e('circle', { key: 'q' + qi, cx: String(76 + qi * 16), cy: String(66 + Math.sin(qi * 1.2) * 17), r: '2.2', fill: color, opacity: 0.6, style: { animation: 'pulse ' + (1.2 + qi * 0.4) + 's ease-in-out ' + (qi * 0.25) + 's infinite' } }));
      }
    }
  }

  bodyParts.push(e('circle', { key: 'eye-l', cx: '94', cy: String(iF ? 67 : 63), r: String(2 + level * 0.35), fill: color, opacity: 0.65 + level * 0.07, style: { animation: level >= 1 ? 'pulse 2.1s ease-in-out infinite' : 'none' } }));
  bodyParts.push(e('circle', { key: 'eye-r', cx: '106', cy: String(iF ? 67 : 63), r: String(2 + level * 0.35), fill: color, opacity: 0.65 + level * 0.07, style: { animation: level >= 1 ? 'pulse 2.1s ease-in-out 0.3s infinite' : 'none' } }));

  return e('svg', {
    viewBox: '0 0 200 230',
    xmlns: 'http://www.w3.org/2000/svg',
    style: { width: '100%', maxWidth: 180, filter: 'drop-shadow(0 0 ' + (14 + level * 9) + 'px ' + glow + ')', transition: 'filter 1s ease' }
  }, rings.concat(bodyParts));
}

// ─── COMPONENT: UPGRADE MODAL ─────────────────────────────────────────────────
function UpgradeModal(props) {
  var t = props.t;
  var info = {
    journal:   { title: 'Journal limit reached',  sub: 'Free plan includes ' + FREE_JOURNAL + ' entries.', icon: '📓' },
    analyze:   { title: 'Analysis limit reached', sub: 'Free plan includes ' + FREE_ANALYZE + ' analyses.', icon: '⚡' },
    milestone: { title: 'Pro milestone locked',   sub: 'Advanced milestones unlock with Silo Pro.', icon: '🏆' },
    pro:       { title: 'Silo Pro',               sub: 'The full recovery toolkit — coming soon.', icon: '👑' },
  };
  var r = info[props.trigger] || info.pro;
  return e('div', {
    onClick: function(ev) { if (ev.target === ev.currentTarget) props.onClose(); },
    style: { position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  },
    e('div', { style: { width: '100%', maxWidth: 480, background: t.bg2, border: '1px solid ' + t.proBorder, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' } },
      e('div', { style: { width: 36, height: 4, background: t.border, borderRadius: 2, margin: '12px auto 0' } }),
      e('div', { style: { padding: '20px 22px 14px', background: t.proBg, borderBottom: '1px solid ' + t.proBorder } },
        e('div', { style: { fontSize: 28, marginBottom: 10 } }, r.icon),
        e('div', { style: { fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 4 } }, r.title),
        e('div', { style: { fontSize: 13, color: t.dim, lineHeight: 1.6 } }, r.sub)
      ),
      e('div', { style: { padding: '16px 22px 28px' } },
        e('div', { style: { padding: 14, background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 14, marginBottom: 14 } },
          e('div', { style: mono(9, t.proText, { marginBottom: 12, letterSpacing: '0.18em' }) }, 'SILO PRO — COMING SOON'),
          ['Unlimited journaling', 'Unlimited AI analyses', 'All milestone unlocks', 'Priority support'].map(function(f) {
            return e('div', { key: f, style: row({ gap: 8, marginBottom: 8, fontSize: 13, color: t.proText }) }, '✓ ' + f);
          })
        ),
        e('div', { style: { width: '100%', padding: 14, background: t.dimmer, borderRadius: 12, fontSize: 12, fontWeight: 700, color: t.dim, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center', opacity: 0.8 } }, 'PAYMENTS NOT YET ACTIVE'),
        e('button', { onClick: props.onClose, style: { width: '100%', padding: 12, background: 'transparent', border: '1px solid ' + t.border, borderRadius: 12, fontSize: 13, color: t.dim, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, 'CONTINUE FREE')
      )
    )
  );
}

// ─── COMPONENT: SETTINGS PANEL ────────────────────────────────────────────────
function SettingsPanel(props) {
  var t = props.t;
  var user = props.user;
  var confirming = useState(false);
  var setConfirming = confirming[1];
  confirming = confirming[0];

  return e('div', {
    onClick: function(ev) { if (ev.target === ev.currentTarget) props.onClose(); },
    style: { position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  },
    e('div', { style: { width: '100%', maxWidth: 480, background: t.bg2, border: '1px solid ' + t.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' } },
      e('div', { style: { width: 36, height: 4, background: t.border, borderRadius: 2, margin: '12px auto 0' } }),
      e('div', { style: row({ justifyContent: 'space-between', padding: '16px 20px 12px' }) },
        e('span', { style: mono(13, t.text, { fontWeight: 600 }) }, 'SETTINGS'),
        e('button', { onClick: props.onClose, style: { width: 28, height: 28, background: t.bg, border: '1px solid ' + t.border, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.dim, cursor: 'pointer', fontSize: 14 } }, '✕')
      ),
      e('div', { style: { padding: '0 20px 28px' } },
        e('div', { style: { background: t.bg, border: '1px solid ' + t.border, borderRadius: 14, padding: '14px 16px', marginBottom: 14 } },
          e('div', { style: { fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 3 } }, user.name),
          e('div', { style: mono(11, t.dim, { marginBottom: 2 }) }, (user.gender === 'female' ? 'Healing path' : 'Operative mode') + ' · Free plan'),
          e('div', { style: mono(11, t.dimmer) }, 'No-contact since ' + new Date(user.ncDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
        ),
        confirming
          ? e('div', { style: { background: '#150806', border: '1px solid #7c2d12', borderRadius: 12, padding: 16 } },
              e('div', { style: { fontSize: 13, color: '#fca5a5', marginBottom: 14, textAlign: 'center', lineHeight: 1.5 } }, 'This will permanently delete all your data. Cannot be undone.'),
              e('div', { style: row({ gap: 8 }) },
                e('button', { onClick: function() { setConfirming(false); }, style: { flex: 1, padding: 12, background: 'transparent', border: '1px solid ' + t.border, borderRadius: 10, fontSize: 13, color: t.dim, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, 'CANCEL'),
                e('button', { onClick: props.onReset, style: { flex: 1, padding: 12, background: '#7c2d12', border: 'none', borderRadius: 10, fontSize: 13, color: '#fff', fontFamily: "'DM Mono', monospace", fontWeight: 700, cursor: 'pointer' } }, 'YES, RESET')
              )
            )
          : e('button', { onClick: function() { setConfirming(true); }, style: { width: '100%', padding: 14, background: 'transparent', border: '1px solid #7c2d12', borderRadius: 12, fontSize: 13, color: '#fca5a5', fontFamily: "'DM Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' } },
              '↺ RESET ALL DATA'
            )
      )
    )
  );
}

// ─── COMPONENT: ONBOARDING ────────────────────────────────────────────────────
function Onboarding(props) {
  var phaseState = useState('splash');
  var phase = phaseState[0], setPhase = phaseState[1];
  var genderState = useState(null);
  var gender = genderState[0], setGender = genderState[1];
  var nameState = useState('');
  var name = nameState[0], setName = nameState[1];
  var ncDateState = useState(todayStr());
  var ncDate = ncDateState[0], setNcDate = ncDateState[1];

  var t = gender ? THEME[gender] : THEME.male;
  var copy = gender ? COPY[gender] : COPY.male;
  var phases = ['splash', 'intro0', 'intro1', 'intro2', 'gender', 'name', 'date'];

  function next() {
    var idx = phases.indexOf(phase);
    if (idx < phases.length - 1) setPhase(phases[idx + 1]);
  }
  function back() {
    var idx = phases.indexOf(phase);
    if (idx > 0) setPhase(phases[idx - 1]);
  }
  function finish() {
    if (!name.trim() || !gender) return;
    props.onComplete({ gender: gender, name: name.trim(), ncDate: ncDate, xp: 0, journalEntries: [], activityLog: [], loggedToday: {}, loggedDate: todayStr(), analyzeCount: 0, isPro: false });
  }

  var introIdx = phase.startsWith('intro') ? parseInt(phase.replace('intro', '')) : -1;
  var slides = copy.onboard;

  var bgColor = gender ? t.bg : '#070a10';
  var accentColor = gender ? t.accent : '#4a9eff';

  return e('div', { style: { minHeight: '100vh', background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Mono', monospace" } },
    e('style', null, GLOBAL_CSS),
    e('div', { style: { width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 } },

      // SPLASH
      phase === 'splash' && e('div', { style: { textAlign: 'center', animation: 'fadeUp 0.5s ease' } },
        e('div', { style: { width: 56, height: 56, background: '#0a0e1a', border: '1px solid #1e3a5f', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22 } }, '🔒'),
        e('div', { style: { fontSize: 36, fontWeight: 700, letterSpacing: '0.2em', color: '#e2e8f0', marginBottom: 10 } }, 'SILO'),
        e('div', { style: { fontSize: 13, color: '#475569', marginBottom: 48, lineHeight: 1.7 } }, 'Private recovery.\nNo-contact, rebuilt.'),
        e('button', { onClick: next, style: { width: '100%', padding: 16, background: '#4a9eff', borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, 'GET STARTED'),
        e('div', { style: { marginTop: 14, fontSize: 10, color: '#2d3748', letterSpacing: '0.08em' } }, 'All data stored privately on your device.')
      ),

      // INTRO SLIDES
      introIdx >= 0 && e('div', { key: phase, style: { animation: 'fadeUp 0.4s ease' } },
        e('div', { style: row({ justifyContent: 'center', gap: 6, marginBottom: 36 }) },
          [0, 1, 2].map(function(i) {
            return e('div', { key: i, style: { height: 3, width: i === introIdx ? 24 : 8, background: i <= introIdx ? accentColor : '#1a2035', borderRadius: 2, transition: 'all 0.3s' } });
          })
        ),
        e('div', { style: { textAlign: 'center', marginBottom: 32 } },
          e('div', { style: { fontSize: 52, marginBottom: 20 } }, slides[introIdx] ? slides[introIdx].icon : ''),
          e('div', { style: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.3 } }, slides[introIdx] ? slides[introIdx].title : ''),
          e('div', { style: { fontSize: 14, color: '#475569', lineHeight: 1.7 } }, slides[introIdx] ? slides[introIdx].body : '')
        ),
        e('button', { onClick: next, style: { width: '100%', padding: 16, background: accentColor, borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', fontFamily: "'DM Mono', monospace", cursor: 'pointer', marginBottom: 10 } }, introIdx < 2 ? 'NEXT →' : "LET'S GO →"),
        introIdx > 0 && e('button', { onClick: back, style: { width: '100%', padding: 10, background: 'transparent', fontSize: 12, color: '#2d3748', fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, '← BACK')
      ),

      // GENDER
      phase === 'gender' && e('div', { style: { animation: 'fadeUp 0.4s ease' } },
        e('div', { style: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 } }, 'Your path, your way.'),
        e('div', { style: { fontSize: 13, color: '#475569', marginBottom: 24, lineHeight: 1.6 } }, 'Silo adapts its tone and your character to what works for you.'),
        [
          { id: 'male', emoji: '⚡', title: 'As a man', sub: 'Direct, tactical, no-nonsense' },
          { id: 'female', emoji: '🌸', title: 'As a woman', sub: 'Warm, gentle, emotionally supportive' }
        ].map(function(o) {
          return e('button', { key: o.id, onClick: function() { setGender(o.id); setPhase('name'); }, style: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#0a0e1a', border: '1px solid #151e30', borderRadius: 14, textAlign: 'left', fontFamily: "'DM Mono', monospace", width: '100%', marginBottom: 10, cursor: 'pointer' } },
            e('span', { style: { fontSize: 24 } }, o.emoji),
            e('div', null,
              e('div', { style: { fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 } }, o.title),
              e('div', { style: { fontSize: 11, color: '#475569' } }, o.sub)
            ),
            e('span', { style: { marginLeft: 'auto', color: '#2d3748' } }, '→')
          );
        }),
        e('button', { onClick: back, style: { width: '100%', padding: 10, background: 'transparent', fontSize: 12, color: '#2d3748', fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, '← BACK'),
        e('div', { style: { marginTop: 12, fontSize: 10, color: '#1e2a3a', textAlign: 'center' } }, 'Language preference only. Never shared.')
      ),

      // NAME
      phase === 'name' && e('div', { style: { animation: 'fadeUp 0.4s ease' } },
        e('div', { style: { fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 8 } }, gender === 'female' ? "What's your name?" : 'What should we call you?'),
        e('div', { style: { fontSize: 13, color: t.dim, marginBottom: 24, lineHeight: 1.6 } }, gender === 'female' ? 'Your character will carry your name.' : 'Your operative needs a name.'),
        e('input', {
          autoFocus: true, value: name,
          onChange: function(ev) { setName(ev.target.value); },
          onKeyDown: function(ev) { if (ev.key === 'Enter' && name.trim()) setPhase('date'); },
          placeholder: gender === 'female' ? 'Your name...' : 'Name or callsign...',
          style: { width: '100%', padding: '14px 16px', background: t.bg3, border: '1px solid ' + t.border2, borderRadius: 12, fontSize: 15, color: t.text, fontFamily: t.font, marginBottom: 14 }
        }),
        e('button', { onClick: function() { if (name.trim()) setPhase('date'); }, disabled: !name.trim(), style: { width: '100%', padding: 16, background: name.trim() ? t.accent : '#151e30', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, color: name.trim() ? '#fff' : t.dim, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 10, cursor: name.trim() ? 'pointer' : 'default', transition: 'all 0.2s' } }, 'CONTINUE →'),
        e('button', { onClick: back, style: { width: '100%', padding: 10, background: 'transparent', fontSize: 12, color: t.dimmer, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, '← BACK')
      ),

      // DATE
      phase === 'date' && e('div', { style: { animation: 'fadeUp 0.4s ease' } },
        e('div', { style: { fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 8 } }, gender === 'female' ? 'Almost there, ' + name + '.' : 'Good. ' + name + '.'),
        e('div', { style: { fontSize: 13, color: t.dim, marginBottom: 6, lineHeight: 1.6 } }, 'When did you go no-contact?'),
        e('div', { style: { fontSize: 12, color: t.dimmer, marginBottom: 20, lineHeight: 1.6 } }, 'Your streak and character track from this date. Defaults to today.'),
        e('input', {
          type: 'date', value: ncDate, max: todayStr(),
          onChange: function(ev) { setNcDate(ev.target.value); },
          style: { width: '100%', padding: '14px 16px', background: t.bg3, border: '1px solid ' + t.border2, borderRadius: 12, fontSize: 14, color: t.text, fontFamily: "'DM Mono', monospace", marginBottom: 14, colorScheme: 'dark' }
        }),
        e('button', { onClick: finish, style: { width: '100%', padding: 16, background: t.accent, border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: 10, cursor: 'pointer' } }, gender === 'female' ? 'BEGIN MY JOURNEY →' : 'INITIATE PROTOCOL →'),
        e('button', { onClick: back, style: { width: '100%', padding: 10, background: 'transparent', fontSize: 12, color: t.dimmer, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, '← BACK')
      )
    )
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
var TABS = [
  { id: 'HOME',     label: 'Home',    glyph: '⬡' },
  { id: 'JOURNAL',  label: 'Journal', glyph: '◎' },
  { id: 'TRAIN',    label: 'Train',   glyph: '◈' },
  { id: 'PROGRESS', label: 'Progress',glyph: '◇' },
];

export default function App() {
  var s_loaded       = useState(false);
  var s_user         = useState(null);
  var s_messages     = useState([]);
  var s_tab          = useState('HOME');
  var s_upgrade      = useState(null);
  var s_settings     = useState(false);
  var s_toast        = useState(null);
  var s_levelUp      = useState(null);
  var s_offline      = useState(!navigator.onLine);
  var s_tick         = useState(0);
  var s_shadow       = useState('');
  var s_analyzing    = useState(false);
  var s_showAnalyzed = useState(false);
  var s_showShadow   = useState(true);
  var s_intercept    = useState(false);
  var s_chatInput    = useState('');
  var s_entry        = useState('');
  var s_expanded     = useState(null);
  var s_promptIdx    = useState(0);
  var s_mood         = useState(null);

  var loaded = s_loaded[0], setLoaded = s_loaded[1];
  var user = s_user[0], setUser = s_user[1];
  var messages = s_messages[0], setMessages = s_messages[1];
  var tab = s_tab[0], setTab = s_tab[1];
  var upgrade = s_upgrade[0], setUpgrade = s_upgrade[1];
  var showSettings = s_settings[0], setShowSettings = s_settings[1];
  var toast = s_toast[0], setToast = s_toast[1];
  var levelUp = s_levelUp[0], setLevelUp = s_levelUp[1];
  var isOffline = s_offline[0], setIsOffline = s_offline[1];
  var shadow = s_shadow[0], setShadow = s_shadow[1];
  var analyzing = s_analyzing[0], setAnalyzing = s_analyzing[1];
  var showAnalyzed = s_showAnalyzed[0], setShowAnalyzed = s_showAnalyzed[1];
  var showShadow = s_showShadow[0], setShowShadow = s_showShadow[1];
  var interceptOpen = s_intercept[0], setInterceptOpen = s_intercept[1];
  var chatInput = s_chatInput[0], setChatInput = s_chatInput[1];
  var entry = s_entry[0], setEntry = s_entry[1];
  var expanded = s_expanded[0], setExpanded = s_expanded[1];
  var promptIdx = s_promptIdx[0], setPromptIdx = s_promptIdx[1];
  var mood = s_mood[0], setMood = s_mood[1];

  var chatEndRef = useRef(null);
  var prevLevelRef = useRef(0);

  // Online/offline
  useEffect(function() {
    function goOn()  { setIsOffline(false); }
    function goOff() { setIsOffline(true); }
    window.addEventListener('online', goOn);
    window.addEventListener('offline', goOff);
    return function() { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, []);

  // Load from storage
  useEffect(function() {
    try {
      var saved = loadData();
      if (saved && saved.user) {
        var u = Object.assign({}, saved.user);
        if (!Array.isArray(u.activityLog)) u.activityLog = [];
        if (!Array.isArray(u.journalEntries)) u.journalEntries = [];
        if (!u.loggedToday) u.loggedToday = {};
        if (!u.analyzeCount) u.analyzeCount = 0;
        if (u.loggedDate !== todayStr()) { u.loggedToday = {}; u.loggedDate = todayStr(); }
        setUser(u);
        prevLevelRef.current = getLevel(u.xp);
        if (saved.messages) setMessages(saved.messages);
      }
    } catch(err) {}
    setLoaded(true);
  }, []);

  // Save to storage
  useEffect(function() {
    if (user) saveData({ user: user, messages: messages });
  }, [user, messages]);

  // Tick for streak counter
  useEffect(function() {
    var id = setInterval(function() { s_tick[1](function(n) { return n + 1; }); }, 1000);
    return function() { clearInterval(id); };
  }, []);

  // Scroll chat
  useEffect(function() {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, analyzing]);

  if (!loaded) return e(Loading, null);

  if (!user) return e(Onboarding, {
    onComplete: function(u) {
      var copy = COPY[u.gender];
      var initMsg = [{
        role: 'assistant',
        text: u.gender === 'female'
          ? 'Hey, ' + u.name + '. Welcome to your space.\n\nYour character starts as Ember — quiet, still finding footing. Every action you take makes her stronger. Every day of no-contact, every entry, every thing you do for yourself.\n\nFive forms to grow through. This is just the beginning.'
          : u.name + '. Protocol initiated.\n\nYou start as Ghost — unformed, running on fumes. Every rep logged, every day of no contact, every decision not to reach out evolves your operative.\n\nFive levels. One direction: forward.'
      }];
      setUser(u);
      setMessages(initMsg);
      setMood(copy.moods[0]);
      prevLevelRef.current = 0;
    }
  });

  // Derived values
  var t     = THEME[user.gender];
  var copy  = COPY[user.gender];
  var chars = copy.chars;
  var streak = getStreak(user.ncDate);
  var tp     = getTimeParts(user.ncDate);
  var level  = getLevel(user.xp);
  var lvlXP  = getLevelXP(user.xp);
  var char   = chars[level];
  var stats  = getStats(user.activityLog, copy.activities);
  var maxStat = Math.max(stats.body, stats.mind, stats.soul, 1);
  var nextMil = copy.milestones.find(function(m) { return m.days > streak; });

  function awardXP(amt) {
    setUser(function(u) {
      var newXP  = u.xp + amt;
      var newLvl = getLevel(newXP);
      var oldLvl = getLevel(u.xp);
      if (newLvl > oldLvl && newLvl <= MAX_LEVEL) {
        setTimeout(function() { setLevelUp(chars[newLvl]); }, 300);
      }
      return Object.assign({}, u, { xp: newXP });
    });
    setToast(amt);
  }

  function handleAnalyze() {
    if (!shadow.trim()) return;
    if (!user.isPro && user.analyzeCount >= FREE_ANALYZE) { setUpgrade('analyze'); return; }
    setShowAnalyzed(false); setShowShadow(false);
    var preview = shadow.slice(0, 80) + (shadow.length > 80 ? '…' : '');
    setMessages(function(m) { return m.concat([{ role: 'user', text: '[' + copy.shadowLabel + ']: "' + preview + '"' }]); });
    setUser(function(u) { return Object.assign({}, u, { analyzeCount: u.analyzeCount + 1 }); });
    setAnalyzing(true);
    setTimeout(function() {
      setAnalyzing(false);
      setMessages(function(m) { return m.concat([{ role: 'assistant', text: copy.analysisText }]); });
      setShowAnalyzed(true);
      awardXP(25);
    }, 2800);
  }

  function handleSaveJournal() {
    if (!entry.trim()) return;
    if (!user.isPro && user.journalEntries.length >= FREE_JOURNAL) { setUpgrade('journal'); return; }
    var newEntry = { id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), text: entry, mood: mood || copy.moods[0], xp: 40 };
    setUser(function(u) { return Object.assign({}, u, { journalEntries: [newEntry].concat(u.journalEntries) }); });
    setEntry('');
    awardXP(40);
  }

  function handleActivity(id, xp) {
    if (user.loggedToday[id]) return;
    setUser(function(u) {
      var newLogged = Object.assign({}, u.loggedToday, { [id]: true });
      var newLog = (u.activityLog || []).concat([id]);
      return Object.assign({}, u, { loggedToday: newLogged, loggedDate: todayStr(), activityLog: newLog });
    });
    awardXP(xp);
  }

  function handleReset() {
    clearData();
    setUser(null); setMessages([]);
    setShowSettings(false);
  }

  function sendIntercept() {
    if (!chatInput.trim()) return;
    var val = chatInput; setChatInput('');
    setMessages(function(m) { return m.concat([{ role: 'user', text: val }, { role: 'assistant', text: copy.interceptFollowup }]); });
    setInterceptOpen(false); setTab('HOME');
  }

  // Style shortcuts
  var card = { background: t.bg2, border: '1px solid ' + t.border, borderRadius: 16, overflow: 'hidden', marginBottom: 12 };
  var cardHdr = Object.assign({ padding: '12px 16px', borderBottom: '1px solid ' + t.border, background: t.bg }, row({ justifyContent: 'space-between' }));
  var m9 = function(color, extra) { return mono(9, color || t.dim, extra); };
  var taStyle = { width: '100%', background: 'transparent', border: 'none', resize: 'none', padding: '12px 14px', fontSize: 14, color: t.muted, fontFamily: t.font, lineHeight: 1.75, outline: 'none', minHeight: 72, boxSizing: 'border-box' };
  var msgAI = { alignSelf: 'flex-start', maxWidth: '86%', background: t.bg2, border: '1px solid ' + t.border, borderRadius: '14px 14px 14px 2px', padding: '11px 14px', fontSize: 14, color: t.muted, lineHeight: 1.75, whiteSpace: 'pre-wrap' };
  var msgU  = { alignSelf: 'flex-end', maxWidth: '74%', background: t.accentDim, border: '1px solid ' + t.accentBorder, borderRadius: '14px 14px 2px 14px', padding: '11px 14px', fontSize: 14, color: t.muted, lineHeight: 1.65, whiteSpace: 'pre-wrap' };

  // ── Build page content per tab ──────────────────────────────────────────────
  var pageContent;

  // ── HOME ──
  if (tab === 'HOME') {
    pageContent = e('div', null,
      // Pro bar
      e('button', { onClick: function() { setUpgrade('pro'); }, style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 12, marginBottom: 14, cursor: 'pointer' } },
        e('div', { style: row({ gap: 7, fontSize: 11, color: t.proText, fontFamily: "'DM Mono', monospace" }) }, '♛ Silo Pro — unlimited everything'),
        e('span', { style: m9(t.dim) }, 'COMING SOON')
      ),

      // Character hero card
      e('div', { style: Object.assign({}, card, { marginBottom: 12, background: 'linear-gradient(145deg,' + t.bg2 + ' 0%,' + t.bg3 + ' 100%)' }) },
        e('div', { style: cardHdr },
          e('span', { style: m9(t.muted, { fontWeight: 600 }) }, copy.charLabel),
          e('span', { style: m9(char.color, { fontWeight: 600 }) }, char.emoji + ' ' + char.name.toUpperCase())
        ),
        e('div', { style: row({ padding: '20px 16px', alignItems: 'center', gap: 16 }) },
          // SVG character
          e('div', { style: { width: 160, flexShrink: 0, position: 'relative' } },
            e(CharacterArt, { level: level, color: char.color, glow: char.glow, gender: user.gender }),
            e('div', { style: { position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: t.bg, border: '1px solid ' + char.color + '44', borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap' } },
              e('span', { style: m9(char.color, { letterSpacing: '0.1em' }) }, 'LV.' + (level + 1))
            )
          ),
          // Info panel
          e('div', { style: { flex: 1, minWidth: 0 } },
            e('div', { style: { fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 2, fontFamily: "'DM Mono', monospace" } }, copy.greeting(user.name)),
            e('div', { style: { fontSize: 12, color: t.dim, marginBottom: 14, lineHeight: 1.5 } }, char.desc),
            // XP bar
            e('div', { style: { marginBottom: 12 } },
              e('div', { style: row({ justifyContent: 'space-between', marginBottom: 4 }) },
                e('span', { style: m9() }, 'FORM XP'),
                e('span', { style: m9(char.color) }, lvlXP + '/' + XPL)
              ),
              e('div', { style: { height: 5, background: t.border, borderRadius: 3, overflow: 'hidden' } },
                e('div', { style: { height: '100%', width: ((lvlXP / XPL) * 100) + '%', background: char.color, borderRadius: 3, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px ' + char.glow } })
              ),
              e('div', { style: m9(t.dimmer, { marginTop: 4 }) }, level < MAX_LEVEL ? (XPL - lvlXP) + ' XP to ' + chars[level + 1].name : '✦ MAX FORM')
            ),
            // Stat bars
            e('div', { style: row({ gap: 8 }) },
              e(StatBar, { label: 'BODY', val: stats.body, max: maxStat, color: t.accent2, t: t }),
              e(StatBar, { label: 'MIND', val: stats.mind, max: maxStat, color: t.accent,  t: t }),
              e(StatBar, { label: 'SOUL', val: stats.soul, max: maxStat, color: t.streakCol, t: t })
            )
          )
        )
      ),

      // Streak + milestone pills (compact, secondary)
      e('div', { style: row({ gap: 8, marginBottom: 12 }) },
        e('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: t.bg2, border: '1px solid ' + t.border, borderRadius: 12 } },
          e('span', { style: { fontSize: 14 } }, '🔥'),
          e('div', null,
            e('div', { style: m9(t.dim, { marginBottom: 1 }) }, copy.streakLabel.toUpperCase()),
            e('div', { style: { fontSize: 16, fontWeight: 700, color: t.streakCol, fontFamily: "'DM Mono', monospace", lineHeight: 1 } }, streak + e('span', { style: { fontSize: 10, color: t.dim, fontWeight: 400 } }, ' days'))
          )
        ),
        e('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: t.bg2, border: '1px solid ' + t.border, borderRadius: 12 } },
          e('span', { style: { fontSize: 14 } }, '★'),
          e('div', { style: { minWidth: 0 } },
            e('div', { style: m9(t.dim, { marginBottom: 1 }) }, 'NEXT GOAL'),
            nextMil
              ? e('div', { style: { fontSize: 12, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, nextMil.icon + ' ' + nextMil.label)
              : e('div', { style: { fontSize: 12, color: t.accent2 } }, 'All done 🏆')
          )
        )
      ),

      // Emergency intercept button
      e('button', { onClick: function() { setInterceptOpen(true); }, style: { width: '100%', padding: '14px 16px', background: 'transparent', border: '1px solid #7c2d12', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontFamily: t.font, cursor: 'pointer' } },
        e('div', { style: row({ gap: 12 }) },
          e('div', { style: { width: 34, height: 34, background: '#150806', border: '1px solid #7c2d12', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 } }, '⚠'),
          e('div', { style: { textAlign: 'left' } },
            e('div', { style: { fontSize: 12, fontWeight: 700, color: '#fca5a5', letterSpacing: '0.05em', fontFamily: "'DM Mono', monospace" } }, copy.interceptTitle),
            e('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 1 } }, copy.interceptSub)
          )
        ),
        e('span', { style: { color: '#7c2d12', fontSize: 16 } }, '→')
      ),

      // Venting chamber
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) },
            e('span', { style: { fontSize: 13 } }, '💬'),
            e('span', { style: m9(t.muted, { fontWeight: 600 }) }, copy.chamberTitle)
          ),
          e('div', { style: row({ gap: 4 }) }, e('span', { style: m9() }, '👁 PRIVATE'))
        ),
        // Messages
        e('div', { style: { padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 11, minHeight: 110, maxHeight: 260, overflowY: 'auto' } },
          messages.map(function(msg, i) {
            return e('div', { key: i, style: msg.role === 'user' ? msgU : msgAI }, msg.text);
          }),
          analyzing && e('div', { style: { alignSelf: 'flex-start', display: 'flex', gap: 5, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 } },
            [0, 1, 2].map(function(i) {
              return e('div', { key: i, style: { width: 6, height: 6, borderRadius: '50%', background: t.accent, animation: 'bounce 1.2s ease-in-out ' + (i * 0.2) + 's infinite' } });
            })
          ),
          e('div', { ref: chatEndRef })
        ),
        // Analyze limit notice
        !user.isPro && user.analyzeCount >= FREE_ANALYZE && showShadow &&
          e('div', { style: { margin: '0 14px 10px', padding: '8px 12px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            e('span', { style: { fontSize: 11, color: t.proText } }, 'Analysis limit reached (' + FREE_ANALYZE + '/' + FREE_ANALYZE + ')'),
            e('button', { onClick: function() { setUpgrade('analyze'); }, style: { fontSize: 9, color: t.proCol, background: 'transparent', border: 'none', fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, 'UPGRADE →')
          ),
        // Shadow inbox
        showShadow && e('div', { style: { margin: '0 14px 14px', background: t.bg, border: '1px solid ' + t.border, borderRadius: 12, overflow: 'hidden' } },
          e('div', { style: row({ gap: 5, padding: '8px 13px', borderBottom: '1px solid ' + t.border }) },
            e('span', { style: { fontSize: 10 } }, '🔒'),
            e('span', { style: m9() }, copy.shadowLabel)
          ),
          e('textarea', { style: taStyle, value: shadow, onChange: function(ev) { setShadow(ev.target.value); }, placeholder: copy.shadowPlaceholder, rows: 3 }),
          e('div', { style: row({ justifyContent: 'space-between', padding: '8px 13px', borderTop: '1px solid ' + t.border }) },
            e('span', { style: m9() }, shadow.length + ' chars · never sent'),
            e('button', { onClick: handleAnalyze, disabled: !shadow.trim() || analyzing, style: { display: 'flex', alignItems: 'center', gap: 5, background: shadow.trim() && !analyzing ? t.accentDim : t.bg2, border: '1px solid ' + (shadow.trim() && !analyzing ? t.accentBorder : t.border), borderRadius: 8, padding: '6px 12px', fontSize: 9, fontWeight: 700, color: shadow.trim() && !analyzing ? t.accent : t.dim, fontFamily: "'DM Mono', monospace", cursor: shadow.trim() && !analyzing ? 'pointer' : 'default' } },
              '⚡ ' + copy.analyzeBtn
            )
          )
        ),
        showAnalyzed && !showShadow && e('div', { style: { padding: '0 14px 14px', display: 'flex', justifyContent: 'center' } },
          e('button', { onClick: function() { setShowShadow(true); setShowAnalyzed(false); setShadow(''); }, style: { background: 'transparent', border: '1px solid ' + t.border, borderRadius: 9, padding: '7px 14px', fontSize: 9, color: t.dim, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, '+ NEW MESSAGE')
        )
      )
    );
  }

  // ── JOURNAL ──
  else if (tab === 'JOURNAL') {
    pageContent = e('div', null,
      // Pro bar
      e('button', { onClick: function() { setUpgrade('pro'); }, style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 12, marginBottom: 14, cursor: 'pointer' } },
        e('div', { style: row({ gap: 7, fontSize: 11, color: t.proText, fontFamily: "'DM Mono', monospace" }) }, '♛ Silo Pro — unlimited everything'),
        e('span', { style: m9(t.dim) }, 'COMING SOON')
      ),
      // New entry card
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '✏'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, 'NEW ENTRY')),
          e('span', { style: { fontSize: 9, color: t.accent2, fontFamily: "'DM Mono', monospace", fontWeight: 600 } }, '+40 XP')
        ),
        e('div', { style: { padding: '14px 15px' } },
          e('div', { style: row({ justifyContent: 'space-between', marginBottom: 7 }) },
            e('span', { style: m9() }, "TODAY'S PROMPT"),
            e('button', { onClick: function() { setPromptIdx(function(i) { return (i + 1) % copy.prompts.length; }); }, style: { background: 'transparent', border: 'none', fontSize: 10, color: t.accent, fontFamily: "'DM Mono', monospace", cursor: 'pointer' } }, 'NEXT →')
          ),
          e('div', { style: { fontSize: 13, color: t.dim, fontStyle: 'italic', marginBottom: 12, lineHeight: 1.65, borderLeft: '2px solid ' + t.border2, paddingLeft: 12 } }, copy.prompts[promptIdx]),
          e('textarea', { style: Object.assign({}, taStyle, { background: t.bg, border: '1px solid ' + t.border, borderRadius: 10, minHeight: 96, padding: '12px 14px' }), placeholder: copy.journalPlaceholder, value: entry, onChange: function(ev) { setEntry(ev.target.value); }, rows: 4 }),
          e('div', { style: row({ justifyContent: 'space-between', marginTop: 10 }) },
            e('div', { style: row({ gap: 4 }) },
              copy.moods.map(function(m2) {
                return e('button', { key: m2, onClick: function() { setMood(m2); }, style: { fontSize: 16, background: mood === m2 ? t.accentDim : 'transparent', border: mood === m2 ? '1px solid ' + t.accentBorder : '1px solid transparent', borderRadius: 8, padding: '3px 5px', cursor: 'pointer' } }, m2);
              })
            ),
            e('button', { onClick: handleSaveJournal, disabled: !entry.trim(), style: { display: 'flex', alignItems: 'center', gap: 5, background: entry.trim() ? t.accentDim : t.bg2, border: '1px solid ' + (entry.trim() ? t.accentBorder : t.border), borderRadius: 9, padding: '8px 14px', fontSize: 9, fontWeight: 700, color: entry.trim() ? t.accent : t.dim, fontFamily: "'DM Mono', monospace", cursor: entry.trim() ? 'pointer' : 'default' } },
              '✓ ' + copy.journalSave
            )
          ),
          !user.isPro && e('div', { style: row({ gap: 8, marginTop: 10 }) },
            e('div', { style: { flex: 1, height: 2, background: t.border, borderRadius: 1 } },
              e('div', { style: { height: '100%', width: Math.min((user.journalEntries.length / FREE_JOURNAL) * 100, 100) + '%', background: user.journalEntries.length >= FREE_JOURNAL ? t.proCol : t.dim, borderRadius: 1, transition: 'width 0.6s ease' } })
            ),
            user.journalEntries.length >= FREE_JOURNAL
              ? e('span', { style: { fontSize: 9, color: t.proText, cursor: 'pointer', fontFamily: "'DM Mono', monospace" }, onClick: function() { setUpgrade('journal'); } }, 'Limit reached')
              : e('span', { style: m9() }, user.journalEntries.length + '/' + FREE_JOURNAL + ' free')
          )
        )
      ),
      // Entry log
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '📖'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, 'ENTRY LOG')),
          e('span', { style: m9() }, user.journalEntries.length + ' ENTRIES')
        ),
        user.journalEntries.length === 0
          ? e('div', { style: { padding: '32px 20px', textAlign: 'center' } },
              e('div', { style: { fontSize: 32, marginBottom: 12, opacity: 0.4 } }, user.gender === 'female' ? '📔' : '📓'),
              e('div', { style: { fontSize: 13, color: t.dimmer, lineHeight: 1.7, whiteSpace: 'pre-line' } }, copy.emptyJournal)
            )
          : user.journalEntries.map(function(en, i) {
              var isExp = expanded === en.id;
              return e('div', { key: en.id, onClick: function() { setExpanded(isExp ? null : en.id); }, style: { borderBottom: i < user.journalEntries.length - 1 ? '1px solid ' + t.border : 'none', cursor: 'pointer' } },
                e('div', { style: row({ justifyContent: 'space-between', padding: '12px 15px' }) },
                  e('div', { style: row({ gap: 10, flex: 1, minWidth: 0 }) },
                    e('span', { style: { fontSize: 18, flexShrink: 0 } }, en.mood),
                    e('div', { style: { minWidth: 0 } },
                      e('div', { style: { fontSize: 13, color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, en.text.slice(0, 52) + (en.text.length > 52 ? '...' : '')),
                      e('div', { style: m9(null, { marginTop: 2 }) }, en.date + ' · +' + en.xp + ' XP')
                    )
                  ),
                  e('span', { style: { color: t.dim, flexShrink: 0, marginLeft: 8, fontSize: 12 } }, isExp ? '▲' : '▼')
                ),
                isExp && e('div', { style: { padding: '0 15px 14px', fontSize: 14, color: t.dim, lineHeight: 1.75, borderTop: '1px solid ' + t.border, paddingTop: 12 } }, en.text)
              );
            })
      )
    );
  }

  // ── TRAIN ──
  else if (tab === 'TRAIN') {
    var todayCount = Object.keys(user.loggedToday).length;
    pageContent = e('div', null,
      e('button', { onClick: function() { setUpgrade('pro'); }, style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 12, marginBottom: 14, cursor: 'pointer' } },
        e('div', { style: row({ gap: 7, fontSize: 11, color: t.proText, fontFamily: "'DM Mono', monospace" }) }, '♛ Silo Pro — unlimited everything'),
        e('span', { style: m9(t.dim) }, 'COMING SOON')
      ),
      // Summary card
      e('div', { style: Object.assign({}, card, { background: 'linear-gradient(145deg,' + t.bg2 + ',' + t.bg3 + ')' }) },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '⚡'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, copy.trainTitle)),
          e('span', { style: m9(char.color, { fontWeight: 600 }) }, todayCount + ' logged today')
        ),
        e('div', { style: { padding: '14px 15px' } },
          e('div', { style: { fontSize: 12, color: t.dim, marginBottom: 12, lineHeight: 1.6 } }, user.gender === 'female' ? 'Every activity builds your character. BODY, MIND, and SOUL grow with every action.' : 'Each logged activity builds your operative. BODY, MIND, and SOUL drive character evolution.'),
          e('div', { style: row({ gap: 10 }) },
            e(StatBar, { label: 'BODY', val: stats.body, max: maxStat, color: t.accent2, t: t }),
            e(StatBar, { label: 'MIND', val: stats.mind, max: maxStat, color: t.accent,  t: t }),
            e(StatBar, { label: 'SOUL', val: stats.soul, max: maxStat, color: t.streakCol, t: t })
          )
        )
      ),
      // Activity grid
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '+'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, 'LOG ACTIVITY')),
          e('span', { style: m9(null, { fontSize: 8 }) }, 'ONCE DAILY · RESETS MIDNIGHT')
        ),
        todayCount === 0 && e('div', { style: { padding: '14px 15px 0', textAlign: 'center' } },
          e('div', { style: { fontSize: 11, color: t.dimmer, fontFamily: "'DM Mono', monospace" } }, copy.emptyTrain)
        ),
        e('div', { style: { padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          copy.activities.map(function(a) {
            var done = !!user.loggedToday[a.id];
            var sc = a.stat === 'body' ? t.accent2 : a.stat === 'mind' ? t.accent : t.streakCol;
            return e('button', { key: a.id, onClick: function() { handleActivity(a.id, a.xp); }, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', background: done ? 'rgba(16,38,14,0.8)' : t.bg, border: '1px solid ' + (done ? '#14532d' : t.border), borderRadius: 12, fontFamily: t.font, cursor: 'pointer', transition: 'all 0.15s' } },
              e('div', { style: row({ gap: 9 }) },
                e('span', { style: { fontSize: 16 } }, a.icon),
                e('div', null,
                  e('div', { style: { fontSize: 11, color: done ? '#4ade80' : t.muted, textAlign: 'left', fontWeight: done ? 600 : 400 } }, a.label),
                  e('div', { style: mono(8, done ? '#16a34a' : sc, { letterSpacing: '0.05em' }) }, '+' + a.xp + ' XP · ' + a.stat.toUpperCase())
                )
              ),
              e('div', { style: { width: 20, height: 20, borderRadius: '50%', background: done ? '#14532d' : t.bg2, border: '1px solid ' + (done ? '#22c55e' : t.border), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 } }, done ? '✓' : '+')
            );
          })
        )
      )
    );
  }

  // ── PROGRESS ──
  else {
    pageContent = e('div', null,
      e('button', { onClick: function() { setUpgrade('pro'); }, style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 12, marginBottom: 14, cursor: 'pointer' } },
        e('div', { style: row({ gap: 7, fontSize: 11, color: t.proText, fontFamily: "'DM Mono', monospace" }) }, '♛ Silo Pro — unlimited everything'),
        e('span', { style: m9(t.dim) }, 'COMING SOON')
      ),
      // Evolution card
      e('div', { style: Object.assign({}, card, { background: 'linear-gradient(145deg,' + t.bg2 + ',' + t.bg3 + ')' }) },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '★'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, copy.progressTitle))
        ),
        // Character forms row
        e('div', { style: { padding: '16px 14px', display: 'flex', gap: 6, justifyContent: 'space-between' } },
          chars.map(function(c, i) {
            var reached = level >= i;
            var current = level === i;
            var glowStyle = current ? { boxShadow: '0 0 16px ' + c.glow } : {};
            return e('div', { key: i, style: col({ flex: 1, alignItems: 'center', gap: 5 }) },
              e('div', { style: Object.assign({ width: '100%', aspectRatio: '1', background: reached ? 'rgba(255,255,255,0.06)' : t.bg, border: '1px solid ' + (reached ? c.color : t.border), borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: current ? 24 : 16, transition: 'all 0.4s' }, glowStyle) }, c.emoji),
              e('div', { style: mono(7, reached ? c.color : t.dimmer, { textAlign: 'center', lineHeight: 1.3 }) },
                c.name.toUpperCase(), e('br'), e('span', { style: { color: t.dimmer } }, 'Lv.' + (i + 1))
              )
            );
          })
        ),
        // XP bar
        e('div', { style: { padding: '0 14px 16px' } },
          e('div', { style: row({ justifyContent: 'space-between', marginBottom: 5 }) },
            e('span', { style: m9() }, 'XP PROGRESS'),
            e('span', { style: m9(char.color) }, level < MAX_LEVEL ? lvlXP + ' / ' + XPL : 'MAX FORM')
          ),
          e('div', { style: { height: 5, background: t.border, borderRadius: 3, overflow: 'hidden' } },
            e('div', { style: { height: '100%', width: (level < MAX_LEVEL ? (lvlXP / XPL) * 100 : 100) + '%', background: char.color, borderRadius: 3, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px ' + char.glow } })
          )
        )
      ),
      // Stat breakdown
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '📊'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, 'STAT OVERVIEW')),
          e('span', { style: m9() }, (user.activityLog || []).length + ' TOTAL ACTIONS')
        ),
        (user.activityLog || []).length === 0
          ? e('div', { style: { padding: '28px 20px', textAlign: 'center' } },
              e('div', { style: { fontSize: 28, marginBottom: 10, opacity: 0.35 } }, '📊'),
              e('div', { style: { fontSize: 13, color: t.dimmer, lineHeight: 1.7 } }, 'No activities logged yet.\nHead to TRAIN to start building your stats.')
            )
          : e('div', { style: { padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 12 } },
              [
                { label: 'BODY', val: stats.body, color: t.accent2,    icon: '💪', acts: copy.activities.filter(function(a) { return a.stat === 'body'; }) },
                { label: 'MIND', val: stats.mind, color: t.accent,     icon: '🧠', acts: copy.activities.filter(function(a) { return a.stat === 'mind'; }) },
                { label: 'SOUL', val: stats.soul, color: t.streakCol,  icon: '✨', acts: copy.activities.filter(function(a) { return a.stat === 'soul'; }) },
              ].map(function(s) {
                return e('div', { key: s.label },
                  e('div', { style: row({ justifyContent: 'space-between', marginBottom: 6 }) },
                    e('div', { style: row({ gap: 6 }) },
                      e('span', { style: { fontSize: 14 } }, s.icon),
                      e('span', { style: { fontSize: 12, fontWeight: 600, color: s.color, fontFamily: "'DM Mono', monospace" } }, s.label)
                    ),
                    e('span', { style: mono(11, s.color, { fontWeight: 600 }) }, s.val + ' actions')
                  ),
                  e('div', { style: { height: 4, background: t.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 } },
                    e('div', { style: { height: '100%', width: (s.val / maxStat * 100) + '%', background: s.color, borderRadius: 2, transition: 'width 1s ease' } })
                  ),
                  e('div', { style: m9(t.dimmer, { fontSize: 8 }) }, s.acts.map(function(a) { return a.label; }).join(' · '))
                );
              })
            )
      ),
      // Milestones
      e('div', { style: card },
        e('div', { style: cardHdr },
          e('div', { style: row({ gap: 7 }) }, e('span', { style: { fontSize: 13 } }, '🏆'), e('span', { style: m9(t.muted, { fontWeight: 600 }) }, 'MILESTONES')),
          e('span', { style: m9() }, streak + 'd streak')
        ),
        e('div', { style: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 } },
          copy.milestones.map(function(mil, i) {
            var reached = streak >= mil.days;
            var locked  = mil.pro && !user.isPro && !reached;
            return e('div', { key: i, onClick: function() { if (locked) setUpgrade('milestone'); }, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: reached ? 'rgba(5,46,13,0.7)' : locked ? t.proBg : t.bg, border: '1px solid ' + (reached ? '#14532d' : locked ? t.proBorder : t.border), borderRadius: 12, position: 'relative', overflow: 'hidden', cursor: locked ? 'pointer' : 'default', transition: 'all 0.25s' } },
              locked && e('div', { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' } },
                e('div', { style: row({ gap: 6, padding: '5px 12px', background: t.proBg, border: '1px solid ' + t.proBorder, borderRadius: 8, fontSize: 9, color: t.proText, fontFamily: "'DM Mono', monospace" }) }, '♛ PRO — COMING SOON')
              ),
              e('div', { style: { width: 38, height: 38, background: reached ? 'rgba(5,46,13,0.8)' : t.bg2, border: '1px solid ' + (reached ? '#166534' : t.border), borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, mil.icon),
              e('div', { style: { flex: 1 } },
                e('div', { style: row({ gap: 6, marginBottom: 2, flexWrap: 'wrap' }) },
                  e('span', { style: { fontSize: 13, fontWeight: 600, color: reached ? '#4ade80' : t.muted } }, mil.label),
                  reached && e('span', { style: { fontSize: 8, background: 'rgba(5,46,13,0.8)', border: '1px solid #166534', color: '#4ade80', borderRadius: 4, padding: '2px 6px', fontFamily: "'DM Mono', monospace" } }, 'REACHED')
                ),
                e('div', { style: { fontSize: 12, color: reached ? '#4ade80' : t.dimmer } }, mil.desc)
              ),
              e('div', { style: { textAlign: 'right', flexShrink: 0 } },
                e('div', { style: mono(12, reached ? '#22c55e' : t.dim, { fontWeight: 600 }) }, '+' + mil.xp),
                e('div', { style: m9(t.dimmer, { fontSize: 8 }) }, mil.days + 'D')
              )
            );
          })
        )
      )
    );
  }

  // ── MAIN RENDER ─────────────────────────────────────────────────────────────
  return e('div', { style: { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: t.font } },
    e('style', null, GLOBAL_CSS),

    // Overlays
    toast    && e(XPToast,      { amount: toast, accent: t.accent, onDone: function() { setToast(null); } }),
    levelUp  && e(LevelUpBanner,{ char: levelUp, t: t, onDone: function() { setLevelUp(null); } }),
    upgrade  && e(UpgradeModal, { trigger: upgrade, t: t, onClose: function() { setUpgrade(null); } }),
    showSettings && e(SettingsPanel, { user: user, t: t, onReset: handleReset, onClose: function() { setShowSettings(false); } }),
    isOffline && e(OfflineBadge, { t: t }),

    // Scroll area
    e('div', { style: { position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', padding: '0 16px 100px' } },

      // Header
      e('header', { style: row({ justifyContent: 'space-between', paddingTop: 16, paddingBottom: 4 }) },
        e('div', { style: row({ gap: 9 }) },
          e('div', { style: { width: 30, height: 30, background: t.bg3, border: '1px solid ' + t.border2, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 } }, '🔒'),
          e('span', { style: { fontSize: 15, fontWeight: 700, letterSpacing: '0.2em', fontFamily: "'DM Mono', monospace" } }, 'SILO')
        ),
        e('div', { style: row({ gap: 8 }) },
          e('div', { style: row({ gap: 5, padding: '5px 11px', background: t.accentDim, border: '1px solid ' + t.accentBorder, borderRadius: 8 }) },
            e('span', { style: { fontSize: 11 } }, '★'),
            e('span', { style: mono(11, t.accent, { fontWeight: 600 }) }, String(user.xp))
          ),
          e('div', { style: row({ gap: 5, padding: '5px 11px', background: t.bg2, border: '1px solid ' + t.border, borderRadius: 8 }) },
            e('span', { style: { fontSize: 11 } }, '🔥'),
            e('span', { style: mono(11, t.streakCol, { fontWeight: 600 }) }, streak + 'd')
          ),
          e('button', { onClick: function() { setShowSettings(true); }, style: { width: 32, height: 32, background: t.bg2, border: '1px solid ' + t.border, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.dim, cursor: 'pointer', fontSize: 14 } }, '⚙')
        )
      ),

      // Tab nav (top)
      e('nav', { style: { display: 'flex', gap: 2, margin: '10px 0 16px', background: t.bg2, border: '1px solid ' + t.border, borderRadius: 12, padding: 3 } },
        TABS.map(function(tb) {
          var on = tab === tb.id;
          return e('button', { key: tb.id, onClick: function() { setTab(tb.id); }, style: { flex: 1, padding: '9px 4px', background: on ? t.accentDim : 'transparent', border: '1px solid ' + (on ? t.accentBorder : 'transparent'), borderRadius: 10, fontSize: 8, fontWeight: on ? 700 : 400, color: on ? t.accent : t.dim, letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', transition: 'all 0.2s' } },
            e('span', { style: { fontSize: 13 } }, tb.glyph),
            tb.label.toUpperCase()
          );
        })
      ),

      // Page content
      pageContent,

      // Footer
      e('div', { style: { marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, fontSize: 8, color: t.dimmer, letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace" } },
        'SILO v8.0 · PRIVATE · ZERO-KNOWLEDGE'
      )
    ),

    // Fixed bottom nav
    e('nav', { style: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: t.bg + 'ee', borderTop: '1px solid ' + t.border, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } },
      e('div', { style: { maxWidth: 560, margin: '0 auto', display: 'flex', padding: '8px 8px 12px' } },
        TABS.map(function(tb) {
          var on = tab === tb.id;
          return e('button', { key: tb.id, onClick: function() { setTab(tb.id); }, style: { flex: 1, padding: '8px 4px 4px', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' } },
            e('span', { style: { fontSize: 16, filter: on ? 'drop-shadow(0 0 8px ' + t.accent + ')' : 'none', transition: 'filter 0.2s' } }, tb.glyph),
            e('span', { style: mono(8, on ? t.accent : t.dimmer, { fontWeight: on ? 700 : 400, transition: 'color 0.2s' }) }, tb.label.toUpperCase()),
            on && e('div', { style: { width: 20, height: 2, background: t.accent, borderRadius: 1, marginTop: 1 } })
          );
        })
      )
    ),

    // Intercept modal
    interceptOpen && e('div', {
      onClick: function(ev) { if (ev.target === ev.currentTarget) setInterceptOpen(false); },
      style: { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
      e('div', { style: { width: '100%', maxWidth: 480, background: t.bg, border: '1px solid #dc2626', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' } },
        e('div', { style: { width: 36, height: 4, background: '#7c2d12', borderRadius: 2, margin: '12px auto 0' } }),
        e('div', { style: row({ justifyContent: 'space-between', padding: '12px 16px 10px', background: t.bg2, borderBottom: '1px solid ' + t.border, marginTop: 4 }) },
          e('div', { style: row({ gap: 9 }) },
            e('div', { style: { width: 28, height: 28, background: '#150806', border: '1px solid #7c2d12', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 } }, '⚠'),
            e('div', null,
              e('div', { style: mono(11, '#fca5a5', { fontWeight: 700, letterSpacing: '0.08em' }) }, 'EMERGENCY INTERCEPT'),
              e('div', { style: mono(9, '#6b7280') }, streak + 'd streak · ' + user.xp + ' XP at risk')
            )
          ),
          e('button', { onClick: function() { setInterceptOpen(false); }, style: { width: 28, height: 28, background: 'transparent', border: '1px solid ' + t.border, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.dim, cursor: 'pointer', fontSize: 14 } }, '✕')
        ),
        e('div', { style: { flex: 1, overflowY: 'auto', padding: '14px 16px' } },
          e('div', { style: Object.assign({}, msgAI, { marginBottom: 14, animation: 'fadeUp 0.4s ease' }) }, copy.interceptGreeting),
          e('div', { style: { background: t.bg, border: '1px solid ' + t.border, borderRadius: 12, overflow: 'hidden' } },
            e('div', { style: row({ gap: 5, padding: '8px 13px', borderBottom: '1px solid ' + t.border }) },
              e('span', { style: { fontSize: 10 } }, '🔒'),
              e('span', { style: m9() }, copy.shadowLabel)
            ),
            e('textarea', { style: taStyle, value: shadow, onChange: function(ev) { setShadow(ev.target.value); }, placeholder: copy.shadowPlaceholder, rows: 3 }),
            e('div', { style: row({ justifyContent: 'space-between', padding: '8px 13px', borderTop: '1px solid ' + t.border }) },
              e('span', { style: m9() }, shadow.length + ' chars'),
              e('button', { onClick: function() { setInterceptOpen(false); setTimeout(handleAnalyze, 120); }, disabled: !shadow.trim(), style: { display: 'flex', alignItems: 'center', gap: 5, background: shadow.trim() ? t.accentDim : t.bg2, border: '1px solid ' + (shadow.trim() ? t.accentBorder : t.border), borderRadius: 8, padding: '6px 12px', fontSize: 9, fontWeight: 700, color: shadow.trim() ? t.accent : t.dim, fontFamily: "'DM Mono', monospace", cursor: shadow.trim() ? 'pointer' : 'default' } },
                '⚡ ' + copy.analyzeBtn
              )
            )
          )
        ),
        e('div', { style: row({ gap: 8, padding: '10px 16px 20px', borderTop: '1px solid ' + t.border }) },
          e('input', { value: chatInput, onChange: function(ev) { setChatInput(ev.target.value); }, onKeyDown: function(ev) { if (ev.key === 'Enter') sendIntercept(); }, placeholder: user.gender === 'female' ? "Or just tell me what's going on..." : 'Or just talk about it...', style: { flex: 1, background: t.bg2, border: '1px solid ' + t.border, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: t.muted, fontFamily: t.font } }),
          e('button', { onClick: sendIntercept, style: { width: 36, height: 36, background: t.accentDim, border: '1px solid ' + t.accentBorder, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent, flexShrink: 0, cursor: 'pointer', fontSize: 16 } }, '→')
        )
      )
    )
  );
}
