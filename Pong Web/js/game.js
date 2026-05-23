"use strict";

// =============== GAME ENGINE ===============
const GW=1000, GH=600, PADW=14, PADH=100, BR=9;
const POWER = {
  GROW:{color:"#22c55e",label:"+"}, SHRINK:{color:"#ef4444",label:"-"}, SPEED:{color:"#3b82f6",label:">"},
  SLOW:{color:"#a855f7",label:"<"}, MULTI:{color:"#f59e0b",label:"x"}
};
const POWER_KEYS = Object.keys(POWER);
const CPU_DIFFICULTY = {
  easy:{r:0.06,e:60,m:5},
  medium:{r:0.12,e:30,m:7},
  hard:{r:0.20,e:14,m:9},
  master:{r:0.32,e:3,m:12}
};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function mkBall(s,d=1){ const a=(Math.random()*0.5-0.25)*Math.PI; return { x:GW/2, y:GH/2, vx:Math.cos(a)*s*d, vy:Math.sin(a)*s, speed:s, r:BR }; }

function createGame(o) {
  return { mode:o.mode, difficulty:o.difficulty, pointsToWin:o.pointsToWin, paddleSpeed:o.paddleSpeed, baseBallSpeed:o.ballSpeed, powerUpsEnabled:o.powerUpsEnabled,
    leftY:GH/2-PADH/2, rightY:GH/2-PADH/2, leftH:PADH, rightH:PADH, leftScore:0, rightScore:0,
    balls:[mkBall(o.ballSpeed, Math.random()>0.5?1:-1)], powerUps:[], powerSpawnTimer:0,
    paused:false, over:false, winner:null, keys:{w:false,s:false,up:false,down:false}, elapsed:0, countdown:2.0 };
}
function startRound(s,dir){ s.balls=[mkBall(s.baseBallSpeed, dir ?? (Math.random()>0.5?1:-1))]; s.powerUps=[]; s.powerSpawnTimer=0; s.leftH=PADH; s.rightH=PADH; s.countdown=2.0; }
function closest(balls,sign){ let best=null,bx=-1e9; for(const b of balls){ if((b.vx>0&&sign>0)||(b.vx<0&&sign<0)){ if(b.x>bx){bx=b.x;best=b;} } } return best||balls[0]; }
function reflect(b,py,ph,dx){ const rel=(b.y-(py+ph/2))/(ph/2); const ang=clamp(rel,-1,1)*(Math.PI/3.2); const sp=Math.min(b.speed*1.04,16); b.speed=sp; b.vx=Math.cos(ang)*sp*dx; b.vy=Math.sin(ang)*sp; }
function spawnPow(){ const k=POWER_KEYS[Math.floor(Math.random()*POWER_KEYS.length)]; return { type:k, x:GW/2+(Math.random()-0.5)*GW*0.5, y:60+Math.random()*(GH-120), r:14 }; }
function applyPow(s,k,side){
  if(k==="GROW"){ if(side==="left") s.leftH=Math.min(180,s.leftH+40); else s.rightH=Math.min(180,s.rightH+40); }
  else if(k==="SHRINK"){ if(side==="left") s.rightH=Math.max(50,s.rightH-30); else s.leftH=Math.max(50,s.leftH-30); }
  else if(k==="SPEED"){ s.balls.forEach(b=>{ b.speed=Math.min(b.speed*1.25,18); const a=Math.atan2(b.vy,b.vx); b.vx=Math.cos(a)*b.speed; b.vy=Math.sin(a)*b.speed; }); }
  else if(k==="SLOW"){ s.balls.forEach(b=>{ b.speed=Math.max(b.speed*0.75,4); const a=Math.atan2(b.vy,b.vx); b.vx=Math.cos(a)*b.speed; b.vy=Math.sin(a)*b.speed; }); }
  else if(k==="MULTI"){ const nb=[]; for(const b of s.balls){ for(let kk=0; kk<2; kk++){ const a=Math.atan2(b.vy,b.vx)+(kk===0?-0.3:0.3); nb.push({x:b.x,y:b.y,vx:Math.cos(a)*b.speed,vy:Math.sin(a)*b.speed,speed:b.speed,r:BR}); } } s.balls.push(...nb); }
}
function update(s, dt, cb) {
  if(s.paused||s.over) return;
  if(s.countdown>0){ s.countdown-=dt; return; }
  s.elapsed+=dt;
  const sp=s.paddleSpeed*60*dt;
  const leftUp = s.keys.w || (s.mode !== "2p" && s.keys.up);
  const leftDown = s.keys.s || (s.mode !== "2p" && s.keys.down);
  if(leftUp) s.leftY-=sp;
  if(leftDown) s.leftY+=sp;
  if(s.mode==="2p"){ if(s.keys.up) s.rightY-=sp; if(s.keys.down) s.rightY+=sp; }
  else { const b=closest(s.balls,1); const p=CPU_DIFFICULTY[s.difficulty]||CPU_DIFFICULTY.medium;
    const tgt=b.y+Math.sin(s.elapsed*1.7)*p.e; const c=s.rightY+s.rightH/2; const diff=tgt-c;
    const as=Math.min(p.m,Math.abs(diff)*p.r)*60*dt; if(Math.abs(diff)>4) s.rightY+=Math.sign(diff)*as; }
  s.leftY=clamp(s.leftY,0,GH-s.leftH); s.rightY=clamp(s.rightY,0,GH-s.rightH);
  for(let i=s.balls.length-1;i>=0;i--){ const b=s.balls[i];
    b.x+=b.vx*60*dt; b.y+=b.vy*60*dt;
    if(b.y-b.r<=0&&b.vy<0){ b.y=b.r; b.vy*=-1; cb.wall&&cb.wall(); }
    else if(b.y+b.r>=GH&&b.vy>0){ b.y=GH-b.r; b.vy*=-1; cb.wall&&cb.wall(); }
    if(b.vx<0 && b.x-b.r<=20+PADW && b.x-b.r>=10 && b.y>=s.leftY && b.y<=s.leftY+s.leftH){ b.x=20+PADW+b.r; reflect(b,s.leftY,s.leftH,1); cb.paddle&&cb.paddle(); }
    const rx=GW-20-PADW;
    if(b.vx>0 && b.x+b.r>=rx && b.x+b.r<=rx+PADW+10 && b.y>=s.rightY && b.y<=s.rightY+s.rightH){ b.x=rx-b.r; reflect(b,s.rightY,s.rightH,-1); cb.paddle&&cb.paddle(); }
    if(b.x+b.r<0){ s.rightScore++; cb.score&&cb.score(); s.balls.splice(i,1); }
    else if(b.x-b.r>GW){ s.leftScore++; cb.score&&cb.score(); s.balls.splice(i,1); }
  }
  if(s.balls.length===0){
    if(s.leftScore>=s.pointsToWin||s.rightScore>=s.pointsToWin){ s.over=true; s.winner=s.leftScore>s.rightScore?"left":"right"; cb.over&&cb.over(s.winner); }
    else { const d=s.leftScore>s.rightScore?-1:1; startRound(s,d); }
  }
  if(s.powerUpsEnabled){
    s.powerSpawnTimer+=dt;
    if(s.powerSpawnTimer>6 && s.powerUps.length<2){ s.powerSpawnTimer=0; s.powerUps.push(spawnPow()); }
    for(let pi=s.powerUps.length-1;pi>=0;pi--){ const p=s.powerUps[pi];
      for(const b of s.balls){ const dx=b.x-p.x, dy=b.y-p.y;
        if(dx*dx+dy*dy<=(b.r+p.r)*(b.r+p.r)){ applyPow(s,p.type,b.vx>0?"left":"right"); cb.power&&cb.power(); s.powerUps.splice(pi,1); break; } } }
  }
}
function drawBackground(ctx, t){
  ctx.fillStyle=t.bg; ctx.fillRect(0,0,GW,GH);
  if(t.stars || t.pattern==="stars"){ ctx.fillStyle="#ffffff30"; for(let i=0;i<78;i++){ const x=(i*173)%GW, y=(i*91)%GH; ctx.fillRect(x,y,(i%3)+1,(i%3)+1); } }
  if(t.grid || t.pattern==="grid"){ ctx.strokeStyle=t.centerLine+"55"; ctx.lineWidth=1;
    for(let x=0;x<GW;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,GH); ctx.stroke(); }
    for(let y=0;y<GH;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(GW,y); ctx.stroke(); } }
  if(t.pattern==="scanlines"){ ctx.fillStyle=t.centerLine+"22"; for(let y=0;y<GH;y+=8) ctx.fillRect(0,y,GW,2); }
  if(t.pattern==="dots"){ ctx.fillStyle=t.centerLine+"66"; for(let x=20;x<GW;x+=34){ for(let y=20;y<GH;y+=34){ ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); } } }
  if(t.pattern==="diagonal"){ ctx.strokeStyle=t.centerLine+"44"; ctx.lineWidth=2; for(let x=-GH;x<GW;x+=42){ ctx.beginPath(); ctx.moveTo(x,GH); ctx.lineTo(x+GH,0); ctx.stroke(); } }
  if(t.pattern==="circuit"){ ctx.strokeStyle=t.centerLine+"55"; ctx.lineWidth=2; for(let y=60;y<GH;y+=90){ ctx.beginPath(); ctx.moveTo(0,y); for(let x=0;x<GW;x+=90){ ctx.lineTo(x+40,y); ctx.lineTo(x+40,y+24); ctx.lineTo(x+85,y+24); } ctx.stroke(); } ctx.fillStyle=t.centerLine+"88"; for(let i=0;i<42;i++){ ctx.beginPath(); ctx.arc((i*97)%GW,(i*53)%GH,4,0,Math.PI*2); ctx.fill(); } }
  if(t.pattern==="rain"){ ctx.fillStyle=t.centerLine+"55"; ctx.font="bold 16px monospace"; for(let i=0;i<80;i++){ const x=(i*47)%GW, y=(i*83)%GH; ctx.fillText(i%2?"1":"0",x,y); } }
  if(t.pattern==="waves"){ ctx.strokeStyle=t.centerLine+"55"; ctx.lineWidth=2; for(let y=-8;y<=GH+16;y+=32){ ctx.beginPath(); for(let x=0;x<=GW+24;x+=24){ const yy=y+Math.sin((x+y)/62)*10; if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy); } ctx.stroke(); } }
  if(t.pattern==="hex"){ ctx.strokeStyle=t.centerLine+"44"; ctx.lineWidth=1.5; const R=24; for(let y=30;y<GH;y+=R*1.7){ for(let x=20;x<GW;x+=R*3){ const ox=x+((Math.floor(y/(R*1.7))%2)*R*1.5); ctx.beginPath(); for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; const px=ox+Math.cos(a)*R, py=y+Math.sin(a)*R; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); } ctx.closePath(); ctx.stroke(); } } }
}

function roundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr); ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); ctx.closePath(); ctx.fill();
}

function drawPaddleSkin(ctx,x,y,w,h,color,skin,t){
  if(t.glow){ ctx.shadowColor=color; ctx.shadowBlur=skin==="neon"?26:16; }
  ctx.fillStyle=color;
  if(skin==="rounded") roundRect(ctx,x+w*0.08,y,w*0.84,h,Math.min(w*0.84,h)/2);
  else if(skin==="slim") roundRect(ctx,x+w*0.25,y,w*0.5,h,6);
  else if(skin==="blocky"){ const blocks=5, gap=4, bh=(h-gap*(blocks-1))/blocks; for(let i=0;i<blocks;i++) roundRect(ctx,x,y+i*(bh+gap),w,bh,3); }
  else if(skin==="double"){ roundRect(ctx,x,y,w*0.42,h,5); roundRect(ctx,x+w*0.58,y,w*0.42,h,5); }
  else if(skin==="neon"){ roundRect(ctx,x-2,y-2,w+4,h+4,8); ctx.shadowBlur=0; ctx.fillStyle=t.bg; roundRect(ctx,x+2,y+4,w-4,h-8,5); ctx.fillStyle=color; }
  else ctx.fillRect(x,y,w,h);
  ctx.shadowBlur=0;
}

function drawStar(ctx,x,y,r,points=5){
  ctx.beginPath();
  for(let i=0;i<points*2;i++){ const a=-Math.PI/2+i*Math.PI/points; const rr=i%2===0?r:r*0.45; const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
  ctx.closePath(); ctx.fill();
}

function shadeColor(hex, percent){
  const c = hexToRgb(hex || "#ffffff");
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, c.r + amt));
  const g = Math.max(0, Math.min(255, c.g + amt));
  const b = Math.max(0, Math.min(255, c.b + amt));
  return `rgb(${r},${g},${b})`;
}

function drawBallSkin(ctx,b,color,skin,t){
  const x=b.x,y=b.y,r=b.r;
  const parts = t.ballParts || {};
  const part = (name, fallback) => parts[name] || fallback;
  if(t.glow && t.ballGlow !== false){ ctx.shadowColor=t.ballGlowColor || color; ctx.shadowBlur=20; }
  ctx.fillStyle=part("main", color);
  if(skin==="square"){
    roundRect(ctx,x-r,y-r,r*2,r*2,3);
  }
  else if(skin==="diamond"){
    ctx.beginPath(); ctx.moveTo(x,y-r*1.25); ctx.lineTo(x+r*1.25,y); ctx.lineTo(x,y+r*1.25); ctx.lineTo(x-r*1.25,y); ctx.closePath(); ctx.fill();
  }
  else if(skin==="star"){
    drawStar(ctx,x,y,r*1.35,5);
  }
  else if(skin==="soccer"){
    const base = part("base", "#ffffff");
    const patch = part("pattern", "#111111");
    const line = part("line", "#111111");
    ctx.fillStyle=base; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=line; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle=patch; drawStar(ctx,x,y,r*0.42,5);
    ctx.strokeStyle=line; ctx.lineWidth=1.4;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5-Math.PI/2;
      const sx=x+Math.cos(a)*r*0.48, sy=y+Math.sin(a)*r*0.48;
      const ex=x+Math.cos(a)*r*1.02, ey=y+Math.sin(a)*r*1.02;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo(x+Math.cos(a+0.25)*r*0.78,y+Math.sin(a+0.25)*r*0.78,ex,ey); ctx.stroke();
      ctx.fillStyle=patch; ctx.beginPath(); ctx.arc(ex,ey,r*0.16,0,Math.PI*2); ctx.fill();
    }
  }
  else if(skin==="basketball"){
    const main = part("main", "#f97316");
    const line = part("line", "#4a1f0a");
    const hi = part("highlight", "#fdba74");
    ctx.fillStyle=main; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=hi; ctx.globalAlpha=0.35; ctx.beginPath(); ctx.arc(x-r*0.35,y-r*0.38,r*0.32,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.strokeStyle=line; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-r*1.18,y); ctx.lineTo(x+r*1.18,y); ctx.moveTo(x,y-r*1.18); ctx.lineTo(x,y+r*1.18); ctx.stroke();
    ctx.beginPath(); ctx.arc(x-r*0.58,y,r*0.98,-Math.PI/2,Math.PI/2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+r*0.58,y,r*0.98,Math.PI/2,Math.PI*1.5); ctx.stroke();
  }
  else if(skin==="volleyball"){
    const light=part("base", shadeColor(color,55)), mid=part("panel", shadeColor(color,10)), dark=part("line", shadeColor(color,-35));
    ctx.fillStyle=light; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=dark; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=mid; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(x-r*0.25,y-r*0.1,r*0.95,-0.35*Math.PI,0.55*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+r*0.35,y+r*0.05,r*0.85,0.75*Math.PI,1.65*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-r*0.9,y+r*0.15); ctx.quadraticCurveTo(x,y-r*0.4,x+r*0.9,y-r*0.1); ctx.stroke();
  }
  else if(skin==="pokeball"){
    const top=part("top", shadeColor(color,0)), bottom=part("bottom", shadeColor(color,65)), outline=part("line", shadeColor(color,-80)), button=part("button", bottom);
    ctx.beginPath(); ctx.arc(x,y,r*1.18,Math.PI,0); ctx.fillStyle=top; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI); ctx.fillStyle=bottom; ctx.fill();
    ctx.strokeStyle=outline; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r*1.18,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-r*1.18,y); ctx.lineTo(x+r*1.18,y); ctx.stroke();
    ctx.fillStyle=button; ctx.beginPath(); ctx.arc(x,y,r*0.40,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
  else {
    ctx.fillStyle=part("main", color); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur=0;
}

function drawGame(ctx, s, t) {
  const ball = t.ball, pl=t.paddleLeft, pr=t.paddleRight;
  drawBackground(ctx,t);
  ctx.strokeStyle=t.centerLine; ctx.setLineDash([12,14]); ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(GW/2,20); ctx.lineTo(GW/2,GH-20); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=t.accent; ctx.font="bold 72px 'Press Start 2P', monospace"; ctx.textAlign="center";
  ctx.fillText(String(s.leftScore), GW/2-80, 90); ctx.fillText(String(s.rightScore), GW/2+80, 90);
  for(const p of s.powerUps){ const d=POWER[p.type]; ctx.beginPath(); ctx.fillStyle=d.color;
    if(t.glow){ ctx.shadowColor=d.color; ctx.shadowBlur=18; } ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle="#000"; ctx.font="bold 18px monospace"; ctx.textBaseline="middle"; ctx.fillText(d.label, p.x, p.y+1); ctx.textBaseline="alphabetic"; }
  drawPaddleSkin(ctx,20,s.leftY,PADW,s.leftH,pl,t.paddleSkin||"classic",t);
  drawPaddleSkin(ctx,GW-20-PADW,s.rightY,PADW,s.rightH,pr,t.paddleSkin||"classic",t);
  for(const b of s.balls){ drawBallSkin(ctx,b,ball,t.ballSkin||"circle",t); }
  if(s.countdown>0){ ctx.fillStyle=t.accent; ctx.font="bold 120px 'Press Start 2P', monospace"; ctx.textAlign="center"; ctx.fillText(String(Math.ceil(s.countdown)), GW/2, GH/2+40); }
}
