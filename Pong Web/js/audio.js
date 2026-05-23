"use strict";

// =============== AUDIO ENGINE ===============
const N = { C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.0, A3:220.0, B3:246.94, C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.0, A4:440.0, B4:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.0 };
const TRACKS = {
  synthwave:{ name:"Synthwave", bpm:110,
    bass:[N.A3,0,N.A3,0,N.E3,0,N.G3,0,N.F3,0,N.F3,0,N.C4,0,N.E3,0],
    lead:[N.A4,N.C5,N.E5,N.C5,N.A4,N.E5,N.D5,N.C5,N.F4,N.A4,N.C5,N.A4,N.G4,N.B4,N.D5,N.B4],
    pattern:[1,0,2,0,1,0,2,0,1,0,2,0,1,0,2,2] },
  arcade:{ name:"Arcade", bpm:140,
    bass:[N.C3,N.C3,N.G3,N.C3,N.C3,N.C3,N.G3,N.C3,N.F3,N.F3,N.C4,N.F3,N.G3,N.G3,N.D4,N.G3],
    lead:[N.E5,N.G5,N.E5,N.C5,N.E5,N.G5,N.A5,N.G5,N.F5,N.A5,N.F5,N.D5,N.E5,N.G5,N.E5,N.C5],
    pattern:[1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2] },
  calm:{ name:"Calmo", bpm:80,
    bass:[N.D3,0,0,0,N.A3,0,0,0,N.F3,0,0,0,N.G3,0,0,0],
    lead:[N.D4,N.F4,N.A4,N.F4,N.A4,N.D5,N.A4,N.F4,N.F4,N.A4,N.C5,N.A4,N.G4,N.B4,N.D5,N.B4],
    pattern:[1,0,0,0,0,0,2,0,1,0,0,0,0,0,2,0] },
  pulse:{ name:"Pulse Drive", bpm:128,
    bass:[N.E3,0,N.E3,N.G3,N.A3,0,N.A3,N.G3,N.D3,0,N.D3,N.F3,N.G3,0,N.B3,N.G3],
    lead:[N.E4,N.G4,N.B4,N.G4,N.A4,N.C5,N.E5,N.C5,N.D4,N.F4,N.A4,N.F4,N.G4,N.B4,N.D5,N.B4],
    pattern:[1,0,2,0,1,2,0,2,1,0,2,0,1,2,2,0] },
  cosmic:{ name:"Cosmic Run", bpm:96,
    bass:[N.C3,0,0,N.G3,0,0,N.A3,0,N.F3,0,0,N.C4,0,N.G3,0,0],
    lead:[N.C5,N.E5,N.G5,N.E5,N.B4,N.D5,N.G5,N.D5,N.A4,N.C5,N.E5,N.C5,N.G4,N.B4,N.D5,N.B4],
    pattern:[1,0,0,2,0,0,2,0,1,0,0,2,0,2,0,0] },
};
class AudioEngine {
  constructor(){ this.ctx=null; this.master=null; this.sfx=null; this.musicG=null; this.timer=null; this.custom=null; this.cur=null; this.vol={master:0.7,sfx:0.8,music:0.4}; }
  ensure(){ if(this.ctx) return; const C=window.AudioContext||window.webkitAudioContext; this.ctx=new C();
    this.master=this.ctx.createGain(); this.sfx=this.ctx.createGain(); this.musicG=this.ctx.createGain();
    this.sfx.connect(this.master); this.musicG.connect(this.master); this.master.connect(this.ctx.destination); this.applyVol(); }
  resume(){ this.ensure(); if(this.ctx.state==="suspended") this.ctx.resume(); }
  setVol(v){ this.vol={...this.vol,...v}; if(this.ctx) this.applyVol(); if(this.custom) this.custom.volume = this.vol.master*this.vol.music; }
  applyVol(){ this.master.gain.value=this.vol.master; this.sfx.gain.value=this.vol.sfx; this.musicG.gain.value=this.vol.music; }
  beep(f=440,d=0.08,t="square",g=0.4){ this.ensure(); const ct=this.ctx.currentTime; const o=this.ctx.createOscillator(); const gn=this.ctx.createGain();
    o.type=t; o.frequency.setValueAtTime(f,ct); gn.gain.setValueAtTime(0,ct); gn.gain.linearRampToValueAtTime(g,ct+0.005); gn.gain.exponentialRampToValueAtTime(0.0001,ct+d);
    o.connect(gn); gn.connect(this.sfx); o.start(ct); o.stop(ct+d+0.02); }
  paddleHit(){ this.beep(520,0.06,"square",0.35); }
  wallHit(){ this.beep(320,0.05,"square",0.30); }
  score(){ this.beep(660,0.10,"sawtooth",0.35); setTimeout(()=>this.beep(880,0.15,"sawtooth",0.35),90); }
  powerUp(){ this.beep(700,0.08,"triangle",0.4); setTimeout(()=>this.beep(1050,0.08,"triangle",0.4),70); setTimeout(()=>this.beep(1400,0.12,"triangle",0.4),140); }
  click(){ this.beep(880,0.04,"sine",0.25); }
  win(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.beep(f,0.18,"triangle",0.4), i*120)); }
  lose(){ [400,320,260,200].forEach((f,i)=>setTimeout(()=>this.beep(f,0.2,"sawtooth",0.35), i*140)); }
  stopMusic(){ if(this.timer){ clearInterval(this.timer); this.timer=null; } if(this.custom){ this.custom.pause(); this.custom.currentTime=0; this.custom=null; } this.cur=null; }
  playMusic(key, url=null){ this.ensure();
    if (this.cur === key && key!=="custom") return;
    if (this.cur === key && key==="custom" && this.custom && url && this.custom.src.indexOf(url)>=0) return;
    this.stopMusic(); this.cur=key;
    if (key==="custom" && url){ this.custom = new Audio(url); this.custom.loop=true; this.custom.volume=this.vol.master*this.vol.music; this.custom.play().catch(()=>{}); return; }
    const t = TRACKS[key] || TRACKS.synthwave; const step = 60/t.bpm/2;
    let i=0;
    const play = ()=> { const ct=this.ctx.currentTime;
      const bn=t.bass[i%t.bass.length]; if(bn) this.note(bn,ct,step*0.95,"sawtooth",0.18);
      const ln=t.lead[i%t.lead.length]; if(ln) this.note(ln,ct,step*0.85,"triangle",0.12);
      if(t.pattern[i%t.pattern.length]===1) this.kick(ct);
      if(t.pattern[i%t.pattern.length]===2) this.hat(ct);
      i++; };
    play(); this.timer=setInterval(play, step*1000);
  }
  note(f,t,d,ty="triangle",g=0.15){ const o=this.ctx.createOscillator(); const gn=this.ctx.createGain();
    o.type=ty; o.frequency.setValueAtTime(f,t); gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(g,t+0.01); gn.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(gn); gn.connect(this.musicG); o.start(t); o.stop(t+d+0.02); }
  kick(t){ const o=this.ctx.createOscillator(); const g=this.ctx.createGain(); o.type="sine";
    o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(40,t+0.18);
    g.gain.setValueAtTime(0.35,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.2); o.connect(g); g.connect(this.musicG); o.start(t); o.stop(t+0.25); }
  hat(t){ const bs=this.ctx.sampleRate*0.05; const bf=this.ctx.createBuffer(1,bs,this.ctx.sampleRate); const dat=bf.getChannelData(0);
    for(let i=0;i<bs;i++) dat[i]=Math.random()*2-1;
    const src=this.ctx.createBufferSource(); src.buffer=bf;
    const hp=this.ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=6000;
    const g=this.ctx.createGain(); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
    src.connect(hp); hp.connect(g); g.connect(this.musicG); src.start(t); }
}
const audio = new AudioEngine();
