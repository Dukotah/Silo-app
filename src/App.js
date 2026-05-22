import React from 'react';

var e = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

// ─── SAFE CONDITIONAL RENDER ─────────────────────────────────────────────────
function cond(test, el) { return test ? el : null; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
var SK = 'silo_v8';
var XPL = 500;
var MAXLVL = 4;
var FJ = 3; // free journal limit
var FA = 2; // free analyze limit

function pad(n) { return String(n).padStart(2,'0'); }
function todayStr() { return new Date().toISOString().slice(0,10); }
function getStreak(d) { return Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/86400000)); }
function getTimeParts(d) {
  var s=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/1000));
  return {h:Math.floor((s%86400)/3600),m:Math.floor((s%3600)/60),s:s%60};
}
function getLevel(xp) { return Math.min(Math.floor(xp/XPL),MAXLVL); }
function getLvlXP(xp) { return xp%XPL; }
function getStats(log,acts) {
  var s={body:0,mind:0,soul:0};
  (log||[]).forEach(function(id){
    var a=acts.find(function(x){return x.id===id;});
    if(a)s[a.stat]=Math.min((s[a.stat]||0)+1,999);
  });
  return s;
}
function saveD(d) { try{localStorage.setItem(SK,JSON.stringify(d));}catch(x){} }
function loadD() { try{var r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(x){return null;} }
function clearD() { try{localStorage.removeItem(SK);}catch(x){} }

// ─── THEME ────────────────────────────────────────────────────────────────────
var TH={
  male:{
    accent:'#4a9eff',accentDim:'#0a1628',accentBorder:'#1e3a5f',
    accent2:'#22c55e',streak:'#f97316',
    bg:'#070a10',bg2:'#0a0e1a',bg3:'#0d1220',
    bd:'#151e30',bd2:'#1e3a5f',
    text:'#e2e8f0',muted:'#94a3b8',dim:'#475569',dimmer:'#2d3748',
    proCol:'#6d28d9',proBd:'#3b1a8a',proTxt:'#c4b5fd',proBg:'#0d0a2a',
    font:"'DM Mono',monospace",
  },
  female:{
    accent:'#e879a0',accentDim:'#1a0810',accentBorder:'#5a1830',
    accent2:'#34d399',streak:'#fb923c',
    bg:'#0a060e',bg2:'#110818',bg3:'#180d20',
    bd:'#221030',bd2:'#3d1545',
    text:'#f0e6f6',muted:'#c4a8d4',dim:'#7a5a8a',dimmer:'#3d2a4d',
    proCol:'#9333ea',proBd:'#4a1090',proTxt:'#d8b4fe',proBg:'#100820',
    font:"'DM Sans',sans-serif",
  }
};

// ─── COPY ─────────────────────────────────────────────────────────────────────
var CP={
  male:{
    charLabel:'YOUR OPERATIVE',streakLabel:'Days Clean',tagline:'Build yourself back.',
    shadowLabel:'SHADOW INBOX',shadowPH:'Write the message you want to send...',
    analyzeBtn:'ANALYZE IMPACT',journalSave:'LOG ENTRY',journalPH:"Write what's on your mind...",
    chamberTitle:'VENTING CHAMBER',interceptTitle:'I WANT TO REACH OUT',
    interceptSub:'Emergency intercept — process before you act',
    interceptGreet:'Hold your position. I\'m here.\n\nWhat triggered the urge right now?',
    interceptFollow:'Copy that. The pull is strongest when you\'re actually making progress.\n\nWhat outcome are you hoping for if you send it?',
    analysisText:'What will actually happen:\n\nSending this triggers a dopamine spike lasting about 8 minutes — then a 24-48 hour anxiety loop waiting for a reply that may never come.\n\nIf they don\'t reply: You spend two days rereading it.\n\nIf they do reply: The old dynamic reactivates. Same patterns. Same cost.\n\nYour streak is intact. Don\'t trade progress for 8 minutes of noise.',
    prompts:['What did you accomplish today that had nothing to do with them?','Name one tactical advantage you\'ve gained this week.','What would you brief your past self on from 30 days ago?','What\'s beneath the urge — what do you actually need?','Describe the version of you operating at full capacity.','What\'s one thing you\'ve reclaimed for yourself?','Where did you show up for yourself today?'],
    moods:['💪','📈','😤','😔','🔥','🌙'],
    greet:function(n){return n+'.';},
    onboard:[
      {icon:'⚡',title:'You have a character.',body:'Every action you take in real life evolves it. No-contact days, journal entries, training — they all stack.'},
      {icon:'🔒',title:'Shadow Inbox protects you.',body:'Write the message you\'re desperate to send. We analyse the impact — you never have to send it.'},
      {icon:'📈',title:'Progress is the product.',body:'Body, Mind, Soul — three stats that reflect your real recovery. Watch them grow as you rebuild.'},
    ],
    acts:[
      {id:'run',label:'Run / Sprint',xp:75,icon:'🏃',stat:'body'},
      {id:'gym',label:'Lift / Train',xp:100,icon:'🏋️',stat:'body'},
      {id:'cold',label:'Cold Shower',xp:60,icon:'🚿',stat:'body'},
      {id:'sleep',label:'8hrs Sleep',xp:45,icon:'🌙',stat:'body'},
      {id:'meditate',label:'Meditation',xp:55,icon:'🧘',stat:'mind'},
      {id:'journal',label:'Journaled',xp:40,icon:'📓',stat:'mind'},
      {id:'noscroll',label:'No Doomscroll',xp:35,icon:'📵',stat:'mind'},
      {id:'read',label:'Read / Learn',xp:40,icon:'📚',stat:'mind'},
      {id:'social',label:'Saw the Boys',xp:80,icon:'🤝',stat:'soul'},
      {id:'outside',label:'Time Outside',xp:50,icon:'🌲',stat:'soul'},
    ],
    milestones:[
      {days:1,xp:100,label:'First Hold',desc:"24 hours. You didn't break.",icon:'🔒'},
      {days:3,xp:200,label:'72-Hour Lock',desc:'Neural rewiring has begun.',icon:'🧠'},
      {days:7,xp:500,label:'One Week Op',desc:'The fog is clearing.',icon:'🎯',pro:true},
      {days:14,xp:750,label:'Fortnight Strong',desc:'Dopamine baseline restoring.',icon:'⚡',pro:true},
      {days:30,xp:1500,label:'30-Day Protocol',desc:'Full operational recovery.',icon:'🛡️',pro:true},
      {days:60,xp:3000,label:'Signal Silence',desc:'You are the signal now.',icon:'👁️',pro:true},
    ],
    chars:[
      {name:'Ghost',color:'#475569',glow:'rgba(71,85,105,0.5)',desc:'Barely holding together.',emoji:'🌑'},
      {name:'Survivor',color:'#64748b',glow:'rgba(100,116,139,0.5)',desc:'Still standing. That matters.',emoji:'🪨'},
      {name:'Operative',color:'#4a9eff',glow:'rgba(74,158,255,0.55)',desc:'Discipline is forming.',emoji:'⚡'},
      {name:'Agent',color:'#22c55e',glow:'rgba(34,197,94,0.55)',desc:'Sharper. Clearer. Stronger.',emoji:'🎯'},
      {name:'Commander',color:'#f59e0b',glow:'rgba(245,158,11,0.6)',desc:'Unshakeable. This is who you are.',emoji:'🔥'},
    ],
    emptyJ:'No entries yet.\nWrite your first log above.',
    emptyT:'Nothing logged today. Tap an activity to build your stats.',
    trainTitle:'MISSION LOG',progressTitle:'EVOLUTION',
  },
  female:{
    charLabel:'YOUR INNER SELF',streakLabel:'Days Free',tagline:'Become who you were before them.',
    shadowLabel:'UNSENT LETTER',shadowPH:"Write what you're holding back...",
    analyzeBtn:'SHOW ME THE TRUTH',journalSave:'SAVE ENTRY',journalPH:'Write freely — this is just for you...',
    chamberTitle:'SAFE SPACE',interceptTitle:'I WANT TO REACH OUT',
    interceptSub:"Take a breath — let's process this together",
    interceptGreet:"Hey, I've got you. You don't have to do anything right now.\n\nTell me what happened that made you want to reach out.",
    interceptFollow:"That makes complete sense. Your nervous system is looking for something familiar.\n\nYou're not weak for feeling this. What do you actually need right now?",
    analysisText:"What will most likely happen:\n\nSending this gives you about 8 minutes of relief — then your phone becomes something you can't put down while you wait.\n\nIf they don't reply: The silence will feel louder than anything they could say.\n\nIf they do reply: It rarely goes the way we imagine. You get pulled back.\n\nYour streak is beautiful. You've earned every single day.",
    prompts:['What felt good today, even something tiny?','Name one thing you did just for yourself this week.','What would you say to your best friend going through this?','What are you most proud of since you started this journey?','Describe the life you\'re building on the other side of this.',"What's something you rediscovered about yourself?",'Who showed up for you today?'],
    moods:['💛','🌸','😔','💪','✨','🌙'],
    greet:function(n){return n+'.';},
    onboard:[
      {icon:'🌸',title:'You have a character.',body:'She evolves as you heal. Every day of no-contact, every journal entry, every act of self-care makes her stronger.'},
      {icon:'💌',title:'Unsent Letter protects you.',body:'Write what you want to say to them. We help you process it — you never have to send it.'},
      {icon:'✨',title:'Watch yourself grow.',body:'Body, Mind, Soul — three parts of you that are rebuilding. Your character reflects exactly how far you\'ve come.'},
    ],
    acts:[
      {id:'walk',label:'Walk / Move',xp:60,icon:'🚶',stat:'body'},
      {id:'workout',label:'Workout',xp:90,icon:'💪',stat:'body'},
      {id:'sleep',label:'Good Sleep',xp:50,icon:'🌙',stat:'body'},
      {id:'selfcare',label:'Self-Care Ritual',xp:45,icon:'✨',stat:'soul'},
      {id:'meditate',label:'Meditate',xp:55,icon:'🧘',stat:'mind'},
      {id:'journal',label:'Journaled',xp:45,icon:'📔',stat:'mind'},
      {id:'noscroll',label:'No Spiral Scroll',xp:40,icon:'📵',stat:'mind'},
      {id:'creative',label:'Creative Time',xp:55,icon:'🎨',stat:'soul'},
      {id:'friends',label:'Time With Friends',xp:85,icon:'💛',stat:'soul'},
      {id:'nature',label:'Time in Nature',xp:50,icon:'🌸',stat:'soul'},
    ],
    milestones:[
      {days:1,xp:100,label:'First Step',desc:'One whole day. That took courage.',icon:'🌱'},
      {days:3,xp:200,label:'Three Days Strong',desc:'Your heart is starting to breathe.',icon:'🌸'},
      {days:7,xp:500,label:'One Week Free',desc:'A full week of choosing yourself.',icon:'🌙',pro:true},
      {days:14,xp:750,label:'Two Weeks Blooming',desc:'The emotional weight is lifting.',icon:'🌺',pro:true},
      {days:30,xp:1500,label:'One Month Reclaimed',desc:"You've rebuilt something real.",icon:'💎',pro:true},
      {days:60,xp:3000,label:'Fully Yourself',desc:'You were always enough.',icon:'👑',pro:true},
    ],
    chars:[
      {name:'Ember',color:'#9d4f7c',glow:'rgba(157,79,124,0.5)',desc:'Still finding your footing.',emoji:'🌑'},
      {name:'Seeker',color:'#c06a9a',glow:'rgba(192,106,154,0.5)',desc:'The fog is starting to lift.',emoji:'🌿'},
      {name:'Blooming',color:'#e879a0',glow:'rgba(232,121,160,0.55)',desc:'Growing into yourself again.',emoji:'🌸'},
      {name:'Radiant',color:'#f0abcc',glow:'rgba(240,171,204,0.55)',desc:'Soft, strong, unmistakably you.',emoji:'✨'},
      {name:'Sovereign',color:'#d8b4fe',glow:'rgba(216,180,254,0.6)',desc:'Whole. Healed. Unstoppable.',emoji:'👑'},
    ],
    emptyJ:'No entries yet.\nWrite your first entry above.',
    emptyT:'Nothing logged today. Tap an activity to grow your character.',
    trainTitle:'SELF-CARE LOG',progressTitle:'YOUR JOURNEY',
  }
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
var CSS="@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body,#root{height:100%;background:#070a10}body{overscroll-behavior:none;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}textarea,input{outline:none}button{cursor:pointer;border:none;background:none;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}input[type='date']::-webkit-calendar-picker-indicator{filter:invert(0.4);cursor:pointer}";

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
function row(x){return Object.assign({display:'flex',alignItems:'center'},x||{});}
function col(x){return Object.assign({display:'flex',flexDirection:'column'},x||{});}
function mn(sz,cl,x){return Object.assign({fontFamily:"'DM Mono',monospace",fontSize:sz,color:cl,letterSpacing:'0.08em'},x||{});}

// ─── CHARACTER SVG ────────────────────────────────────────────────────────────
function CharArt(props){
  var lv=props.level,cl=props.color,gl=props.glow,gn=props.gender;
  var iF=gn==='female';
  var op=0.28+(lv/MAXLVL)*0.72;
  var aw=6+lv;
  var rings=[];
  for(var ri=0;ri<=lv;ri++){
    rings.push(e('circle',{key:'r'+ri,cx:'100',cy:'125',r:String(52+ri*17),fill:'none',stroke:cl,strokeWidth:'0.8',opacity:Math.max(0.03,0.1-ri*0.02),style:{animation:'pulse '+(2.2+ri*0.6)+'s ease-in-out '+(ri*0.3)+'s infinite'}}));
  }
  rings.push(e('ellipse',{key:'sh',cx:'100',cy:'200',rx:String(28+lv*9),ry:'5',fill:cl,opacity:0.08+lv*0.04}));
  if(iF){
    rings.push(e('ellipse',{key:'hd',cx:'100',cy:'68',rx:'17',ry:'19',fill:cl,opacity:op}));
    rings.push(e('path',{key:'bd',d:'M83 85 Q100 78 117 85 L120 142 Q110 150 100 151 Q90 150 80 142 Z',fill:cl,opacity:op}));
    if(lv>=1){rings.push(e('ellipse',{key:'ht',cx:'100',cy:'53',rx:'21',ry:'7',fill:cl,opacity:op*0.7}));rings.push(e('path',{key:'hl',d:'M79 56 Q73 76 76 96',stroke:cl,strokeWidth:'5',fill:'none',opacity:op*0.65,strokeLinecap:'round'}));rings.push(e('path',{key:'hr',d:'M121 56 Q127 76 124 96',stroke:cl,strokeWidth:'5',fill:'none',opacity:op*0.65,strokeLinecap:'round'}));}
    rings.push(e('path',{key:'al',d:'M83 91 Q69 108 67 126',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ar',d:'M117 91 Q131 108 133 126',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ll',d:'M92 149 Q88 169 86 192',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'lr',d:'M108 149 Q112 169 114 192',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    if(lv>=4){
      rings.push(e('path',{key:'cr',d:'M85 44 L89 35 L95 41 L100 31 L105 41 L111 35 L115 44 Z',fill:cl,opacity:op}));
      rings.push(e('circle',{key:'cg',cx:'100',cy:'43',r:'3',fill:cl,style:{animation:'pulse 1.4s ease-in-out infinite'}}));
    }
    if(lv>=2){for(var pi=0;pi<5;pi++)rings.push(e('circle',{key:'p'+pi,cx:String(80+pi*10),cy:String(62+Math.sin(pi)*18),r:'1.8',fill:cl,opacity:0.55,style:{animation:'pulse '+(1+pi*0.3)+'s ease-in-out '+(pi*0.2)+'s infinite'}}));}
  } else {
    rings.push(e('ellipse',{key:'hd',cx:'100',cy:'65',rx:'17',ry:'19',fill:cl,opacity:op}));
    rings.push(e('path',{key:'bd',d:'M83 81 Q100 73 117 81 L123 140 Q111 148 100 149 Q89 148 77 140 Z',fill:cl,opacity:op}));
    rings.push(e('path',{key:'al',d:'M83 87 Q66 106 63 128',stroke:cl,strokeWidth:String(aw),fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ar',d:'M117 87 Q134 106 137 128',stroke:cl,strokeWidth:String(aw),fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ll',d:'M91 147 Q87 167 85 192',stroke:cl,strokeWidth:'8',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'lr',d:'M109 147 Q113 167 115 192',stroke:cl,strokeWidth:'8',fill:'none',opacity:op,strokeLinecap:'round'}));
    if(lv>=1)rings.push(e('path',{key:'hr',d:'M83 54 Q100 45 117 54',stroke:cl,strokeWidth:'4',fill:'none',opacity:op*0.6,strokeLinecap:'round'}));
    if(lv>=2)rings.push(e('path',{key:'am',d:'M83 81 Q100 75 117 81 L119 99 Q100 107 81 99 Z',fill:cl,opacity:0.18}));
    if(lv>=4){
      rings.push(e('g', { key: 'top-crown' },
        e('polygon', { points: "100,20 108,35 92,35", fill: cl, opacity: "0.8" }),
        e('circle', { cx: "100", cy: "15", r: "2.5", fill: cl, style: { animation: 'pulse 1s infinite' } })
      ));
    }
    if(lv>=2){for(var qi=0;qi<4;qi++)rings.push(e('circle',{key:'q'+qi,cx:String(76+qi*16),cy:String(66+Math.sin(qi*1.2)*17),r:'2.2',fill:cl,opacity:0.6,style:{animation:'pulse '+(1.2+qi*0.4)+'s ease-in-out '+(qi*0.25)+'s infinite'}}));}
  }
  rings.push(e('circle',{key:'el',cx:'94',cy:String(iF?67:63),r:String(2+lv*0.35),fill:cl,opacity:0.65+lv*0.07,style:{animation:lv>=1?'pulse 2.1s ease-in-out infinite':'none'}}));
  rings.push(e('circle',{key:'er',cx:'106',cy:String(iF?67:63),r:String(2+lv*0.35),fill:cl,opacity:0.65+lv*0.07,style:{animation:lv>=1?'pulse 2.1s ease-in-out 0.3s infinite':'none'}}));
  return e('svg',{viewBox:'0 0 200 230',xmlns:'http://www.w3.org/2000/svg',style:{width:'100%',maxWidth:180,filter:'drop-shadow(0 0 '+(14+lv*9)+'px '+gl+')',transition:'filter 1s ease'}},rings);
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
function StatBar(props){
  var pct=props.max>0?Math.min((props.val/props.max)*100,100):0;
  return e('div',{style:{flex:1}},
    e('div',{style:row({justifyContent:'space-between',marginBottom:4})},
      e('span',{style:mn(8,props.t.dim)},props.label),
      e('span',{style:mn(8,props.val>0?props.color:props.t.dimmer)},String(props.val))
    ),
    e('div',{style:{height:3,background:props.t.bd,borderRadius:2,overflow:'hidden'}},
      e('div',{style:{height:'100%',width:pct+'%',background:props.color,borderRadius:2,transition:'width 1s cubic-bezier(0.4,0,0.2,1)'}})
    )
  );
}

// ─── XP TOAST ────────────────────────────────────────────────────────────────
function XPToast(props){
  useEffect(function(){var t=setTimeout(props.onDone,2400);return function(){clearTimeout(t);};},[]);
  return e('div',{style:{position:'fixed',top:72,right:16,zIndex:700,background:'rgba(7,10,16,0.97)',border:'1px solid '+props.accent,borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:8,animation:'slideR 0.35s cubic-bezier(0.34,1.56,0.64,1)',fontSize:12,color:props.accent,fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',boxShadow:'0 0 28px '+props.accent+'33'}},'★ +'+props.amount+' XP');
}

// ─── LEVEL UP ─────────────────────────────────────────────────────────────────
function LvlUp(props){
  useEffect(function(){var t=setTimeout(props.onDone,3500);return function(){clearTimeout(t);};},[]);
  var c=props.char,t=props.t;
  return e('div',{style:{position:'fixed',inset:0,zIndex:800,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,animation:'fadeUp 0.3s ease'}},
    e('div',{style:{textAlign:'center',animation:'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{fontSize:64,marginBottom:16,filter:'drop-shadow(0 0 24px '+c.glow+')'}},c.emoji),
      e('div',{style:mn(10,c.color,{letterSpacing:'0.25em',marginBottom:8})},'FORM EVOLVED'),
      e('div',{style:{fontSize:28,fontWeight:700,color:t.text,marginBottom:8}},c.name),
      e('div',{style:{fontSize:14,color:t.dim,lineHeight:1.6}},c.desc)
    )
  );
}

// ─── OFFLINE ──────────────────────────────────────────────────────────────────
function Offline(props){
  return e('div',{style:{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:600,background:props.t.bg2,border:'1px solid '+props.t.bd,borderRadius:20,padding:'6px 14px',display:'flex',alignItems:'center',gap:6,fontSize:10,color:props.t.dim,fontFamily:"'DM Mono',monospace"}},'○ OFFLINE — CACHED DATA');
}

// ─── PRO MODAL ────────────────────────────────────────────────────────────────
function ProModal(props){
  var t=props.t;
  var labels={journal:'Journal limit reached',analyze:'Analysis limit reached',milestone:'Pro milestone locked',pro:'Silo Pro'};
  var icons={journal:'📓',analyze:'⚡',milestone:'🏆',pro:'👑'};
  var subs={journal:'Free plan includes '+FJ+' entries.',analyze:'Free plan includes '+FA+' analyses.',milestone:'Advanced milestones unlock with Silo Pro.',pro:'The full recovery toolkit — coming soon.'};
  var k=props.trigger||'pro';
  return e('div',{onClick:function(ev){if(ev.target===ev.currentTarget)props.onClose();},style:{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'flex-end',justifyContent:'center'}},
    e('div',{style:{width:'100%',maxWidth:480,background:t.bg2,border:'1px solid '+t.proBd,borderTopLeftRadius:24,borderTopRightRadius:24,overflow:'hidden',animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{width:36,height:4,background:t.bd,borderRadius:2,margin:'12px auto 0'}}),
      e('div',{style:{padding:'20px 22px 14px',background:t.proBg,borderBottom:'1px solid '+t.proBd}},
        e('div',{style:{fontSize:28,marginBottom:10}},icons[k]||'👑'),
        e('div',{style:{fontSize:17,fontWeight:700,color:t.text,marginBottom:4}},labels[k]||'Silo Pro'),
        e('div',{style:{fontSize:13,color:t.dim,lineHeight:1.6}},subs[k]||'')
      ),
      e('div',{style:{padding:'16px 22px 28px'}},
        e('div',{style:{padding:14,background:t.proBg,border:'1px solid '+t.proBd,borderRadius:14,marginBottom:14}},
          e('div',{style:mn(9,t.proTxt,{marginBottom:12,letterSpacing:'0.18em'})},'SILO PRO — COMING SOON'),
          ['Unlimited journaling','Unlimited AI analyses','All milestone unlocks','Priority support'].map(function(f){return e('div',{key:f,style:{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,color:t.proTxt}},'✓ '+f);})
        ),
        e('div',{style:{width:'100%',padding:14,background:t.dimmer,borderRadius:12,fontSize:12,fontWeight:700,color:t.dim,fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',marginBottom:10,textAlign:'center',opacity:0.8}},'PAYMENTS NOT YET ACTIVE'),
        e('button',{onClick:props.onClose,style:{width:'100%',padding:12,background:'transparent',border:'1px solid '+t.bd,borderRadius:12,fontSize:13,color:t.dim,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'CONTINUE FREE')
      )
    )
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings(props){
  var st=useState(false);var conf=st[0],setConf=st[1];
  var t=props.t,u=props.user;
  return e('div',{onClick:function(ev){if(ev.target===ev.currentTarget)props.onClose();},style:{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'flex-end',justifyContent:'center'}},
    e('div',{style:{width:'100%',maxWidth:480,background:t.bg2,border:'1px solid '+t.bd,borderTopLeftRadius:24,borderTopRightRadius:24,animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{width:36,height:4,background:t.bd,borderRadius:2,margin:'12px auto 0'}}),
      e('div',{style:row({justifyContent:'space-between',padding:'16px 20px 12px'})},
        e('span',{style:mn(13,t.text,{fontWeight:600})},'SETTINGS'),
        e('button',{onClick:props.onClose,style:{width:28,height:28,background:t.bg,border:'1px solid '+t.bd,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:t.dim,cursor:'pointer',fontSize:14}},'✕')
      ),
      e('div',{style:{padding:'0 20px 28px'}},
        e('div',{style:{background:t.bg,border:'1px solid '+t.bd,borderRadius:14,padding:'14px 16px',marginBottom:14}},
          e('div',{style:{fontSize:15,fontWeight:600,color:t.text,marginBottom:3}},u.name),
          e('div',{style:mn(11,t.dim,{marginBottom:2})},(u.gender==='female'?'Healing path':'Operative mode')+' · Free plan'),
          e('div',{style:mn(11,t.dimmer)},'No-contact since '+new Date(u.ncDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))
        ),
        conf
          ? e('div',{style:{background:'#150806',border:'1px solid #7c2d12',borderRadius:12,padding:16}},
              e('div',{style:{fontSize:13,color:'#fca5a5',marginBottom:14,textAlign:'center',lineHeight:1.5}},'This will permanently delete all your data. Cannot be undone.'),
              e('div',{style:row({gap:8})},
                e('button',{onClick:function(){setConf(false);},style:{flex:1,padding:12,background:'transparent',border:'1px solid '+t.bd,borderRadius:10,fontSize:13,color:t.dim,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'CANCEL'),
                e('button',{onClick:props.onReset,style:{flex:1,padding:12,background:'#7c2d12',border:'none',borderRadius:10,fontSize:13,color:'#fff',fontFamily:"'DM Mono',monospace",fontWeight:700,cursor:'pointer'}},'YES, RESET')
              )
            )
          : e('button',{onClick:function(){setConf(true);},style:{width:'100%',padding:14,background:'transparent',border:'1px solid #7c2d12',borderRadius:12,fontSize:13,color:'#fca5a5',fontFamily:"'DM Mono',monospace",display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer'}},'↺ RESET ALL DATA')
      )
    )
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboard(props){
  var ps=useState('splash');var phase=ps[0],setPhase=ps[1];
  var gs=useState(null);var gender=gs[0],setGender=gs[1];
  var ns=useState('');var name=ns[0],setName=ns[1];
  var ds=useState(todayStr());var ncDate=ds[0],setNcDate=ds[1];
  var t=gender?TH[gender]:TH.male;
  var cp=gender?CP[gender]:CP.male;
  var acc=gender?t.accent:'#4a9eff';
  var phases=['splash','i0','i1','i2','gender','name','date'];
  function next(){var i=phases.indexOf(phase);if(i<phases.length-1)setPhase(phases[i+1]);}
  function back(){var i=phases.indexOf(phase);if(i>0)setPhase(phases[i-1]);}
  function finish(){if(!name.trim()||!gender)return;props.onComplete({gender:gender,name:name.trim(),ncDate:ncDate,xp:0,journalEntries:[],activityLog:[],loggedToday:{},loggedDate:todayStr(),analyzeCount:0,isPro:false});}
  var introIdx=phase==='i0'?0:phase==='i1'?1:phase==='i2'?2:-1;
  var slide=introIdx>=0?cp.onboard[introIdx]:null;

  // Build page based on phase
  var content;
  if(phase==='splash'){
    content=e('div',{style:{textAlign:'center',animation:'fadeUp 0.5s ease'}},
      e('div',{style:{width:56,height:56,background:'#0a0e1a',border:'1px solid #1e3a5f',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:22}},'🔒'),
      e('div',{style:{fontSize:36,fontWeight:700,letterSpacing:'0.2em',color:'#e2e8f0',marginBottom:10}},'SILO'),
      e('div',{style:{fontSize:13,color:'#475569',marginBottom:48,lineHeight:1.7}},'Private recovery.\nNo-contact, rebuilt.'),
      e('button',{onClick:next,style:{width:'100%',padding:16,background:'#4a9eff',borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'0.08em',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'GET STARTED'),
      e('div',{style:{marginTop:14,fontSize:10,color:'#2d3748',letterSpacing:'0.08em'}},'All data stored privately on your device.')
    );
  } else if(introIdx>=0&&slide){
    content=e('div',{key:phase,style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:row({justifyContent:'center',gap:6,marginBottom:36})},
        [0,1,2].map(function(i){return e('div',{key:i,style:{height:3,width:i===introIdx?24:8,background:i<=introIdx?acc:'#1a2035',borderRadius:2,transition:'all 0.3s'}});})
      ),
      e('div',{style:{textAlign:'center',marginBottom:32}},
        e('div',{style:{fontSize:52,marginBottom:20}},slide.icon),
        e('div',{style:{fontSize:20,fontWeight:700,color:'#e2e8f0',marginBottom:12,lineHeight:1.3}},slide.title),
        e('div',{style:{fontSize:14,color:'#475569',lineHeight:1.7}},slide.body)
      ),
      e('button',{onClick:next,style:{width:'100%',padding:16,background:acc,borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'0.08em',fontFamily:"'DM Mono',monospace",cursor:'pointer',marginBottom:10}},introIdx<2?'NEXT →':"LET'S GO →"),
      cond(introIdx>0,e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:'#2d3748',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK'))
    );
  } else if(phase==='gender'){
    content=e('div',{style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:{fontSize:22,fontWeight:700,color:'#e2e8f0',marginBottom:8}},'Your path, your way.'),
      e('div',{style:{fontSize:13,color:'#475569',marginBottom:24,lineHeight:1.6}},'Silo adapts its tone and your character to what works for you.'),
      [{id:'male',emoji:'⚡',title:'As a man',sub:'Direct, tactical, no-nonsense'},{id:'female',emoji:'🌸',title:'As a woman',sub:'Warm, gentle, emotionally supportive'}].map(function(o){
        return e('button',{key:o.id,onClick:function(){setGender(o.id);setPhase('name');},style:{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',background:'#0a0e1a',border:'1px solid #151e30',borderRadius:14,textAlign:'left',fontFamily:"'DM Mono',monospace",width:'100%',marginBottom:10,cursor:'pointer'}},
          e('span',{style:{fontSize:24}},o.emoji),
          e('div',null,e('div',{style:{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:2}},o.title),e('div',{style:{fontSize:11,color:'#475569'}},o.sub)),
          e('span',{style:{marginLeft:'auto',color:'#2d3748'}},'→')
        );
      }),
      e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:'#2d3748',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK'),
      e('div',{style:{marginTop:12,fontSize:10,color:'#1e2a3a',textAlign:'center'}},'Language preference only. Never shared.')
    );
  } else if(phase==='name'){
    content=e('div',{style:{animation:'fadeUp 0.4s ease'}});
  }
  return content;
}

export default Onboard;
