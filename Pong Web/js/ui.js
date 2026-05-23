"use strict";

// =============== APP ===============
const app = { settings:loadSettings(), screen:"menu", mode:"cpu", game:null, paused:false, gameOver:null, scoresFilter:"", customMusicUrl:null, fs:false, customizeScrollTop:0, customizePageScroll:0 };
const stage = document.getElementById("stage");
const keys = {};
let raf = null;

function setTheme(){ const base = THEMES[app.settings.themeKey]||THEMES.neon; const customData = {...app.settings.customColors, customBackground:app.settings.customBackground, ballSkin:app.settings.ballSkin, paddleSkin:app.settings.paddleSkin, ballParts:app.settings.ballParts, ballGlowEnabled:app.settings.ballGlowEnabled, ballGlowColor:app.settings.ballGlowColor};
  const theme = app.settings.useCustomColors ? makeCustomTheme(base, customData) : base; applyTheme(theme); return theme; }
function el(tag, attrs={}, ...children){
  const e=document.createElement(tag);
  for(const k in attrs){ if(k==="className") e.className=attrs[k]; else if(k==="style") Object.assign(e.style,attrs[k]); else if(k.startsWith("on")) e[k.toLowerCase()]=attrs[k]; else if(k==="html") e.innerHTML=attrs[k]; else e.setAttribute(k,attrs[k]); }
  for(const c of children){ if(c==null) continue; e.appendChild(typeof c==="string"?document.createTextNode(c):c); }
  return e;
}



function makePongLogo(tag="div", className="", style={}){
  const logo = el(tag,{className:(className+" pong-logo").trim(), style});
  logo.textContent = "P•NG";
  return logo;
}

function rememberCustomizeScroll(){
  const pane = stage.querySelector(".customize-controls.scrollable");
  if(pane) app.customizeScrollTop = pane.scrollTop;
  app.customizePageScroll = window.scrollY || document.documentElement.scrollTop || 0;
}
function restoreCustomizeScroll(){
  const pane = stage.querySelector(".customize-controls.scrollable");
  if(pane && Number.isFinite(app.customizeScrollTop)) pane.scrollTop = app.customizeScrollTop;
  const y = Number.isFinite(app.customizePageScroll) ? app.customizePageScroll : 0;
  if(y) window.scrollTo(0, y);
}

function paint() {
  const t = setTheme();
  audio.setVol({master:app.settings.master, sfx:app.settings.sfx, music:app.settings.music});
  audio.resume();
  if(app.settings.musicTrack==="custom" && !app.customMusicUrl) audio.stopMusic();
  else audio.playMusic(app.settings.musicTrack, app.settings.musicTrack==="custom"?app.customMusicUrl:null);

  const wasCustomize = app.screen==="customize";
  if(wasCustomize) rememberCustomizeScroll();
  stage.innerHTML = "";
  document.body.classList.toggle("customize-screen", app.screen==="customize");
  document.body.classList.toggle("customize-simple-screen", app.screen==="customize" && !app.settings.useCustomColors);
  stage.classList.toggle("customize-stage", app.screen==="customize");
  if(app.screen==="menu") renderMenu(t);
  else if(app.screen==="settings") renderSettings(t);
  else if(app.screen==="customize") renderCustomize(t);
  else if(app.screen==="scores") renderScores(t);
  else if(app.screen==="help") renderHelp(t);
  else if(app.screen==="play") renderPlay(t);
  if(wasCustomize && app.screen==="customize") requestAnimationFrame(restoreCustomizeScroll);
}

function btn(label,onclick,primary=false,small=false){
  return el("button",{className:(small?"btn-small":"btn")+(primary?" btn-primary":""), onclick:()=>{ audio.click(); onclick(); }}, label);
}
function field(label, child, full=false){
  const f=el("div",{className:"field"+(full?" full":"")}); f.appendChild(el("label",{className:"label"},label));
  const inner=el("div",{className:"field-input"}); inner.appendChild(child); f.appendChild(inner); return f;
}
function dropdown(value, options, onChange){
  const wrap = el("div",{className:"dd"});
  let open=false;
  const trig=el("button",{className:"dd-trigger",onclick:()=>{ open=!open; menu.style.display=open?"block":"none"; }});
  const cur=options.find(o=>o.value===value); trig.textContent=cur?cur.label:"—";
  const menu=el("div",{className:"dd-menu",style:{display:"none"}});
  options.forEach(o=>{ const it=el("div",{className:"dd-item"+(o.value===value?" active":""), onclick:()=>{ audio.click(); onChange(o.value); open=false; menu.style.display="none"; }},o.label); menu.appendChild(it); });
  wrap.appendChild(trig); wrap.appendChild(menu);
  document.addEventListener("mousedown",(e)=>{ if(!wrap.contains(e.target)){ open=false; menu.style.display="none"; } });
  return wrap;
}

function renderLanguageSwitcher(){
  const switcher = el("div", {className:"language-switcher", ariaLabel:"Language selector"});
  Object.entries(LANGUAGES).forEach(([code, info])=>{
    const b = el("button", {
      className:"lang-btn"+(app.settings.language===code?" active":""),
      title:info.label,
      onclick:()=>{
        if(app.settings.language===code) return;
        audio.click();
        app.settings.language = code;
        saveSettings(app.settings);
        paint();
      }
    }, info.short);
    switcher.appendChild(b);
  });
  stage.appendChild(switcher);
}

function renderMenu(theme){
  const p = el("div",{className:"panel"});
  const title = makePongLogo("h1", "title");
  p.appendChild(title);
  const list = el("div",{className:"menu-list"});
  list.appendChild(btn(`${t("playerOne")} (${t("vsCpu")} - ${t(app.settings.difficulty)})`, ()=>startGame("cpu"), true));
  list.appendChild(btn(t("twoPlayersLocal"), ()=>startGame("2p")));
  list.appendChild(btn(t("settings"), ()=>nav("settings")));
  list.appendChild(btn(t("customize"), ()=>nav("customize")));
  list.appendChild(btn(t("scores"), ()=>nav("scores")));
  list.appendChild(btn(t("howToPlay"), ()=>nav("help")));
  p.appendChild(list);
  p.appendChild(el("div",{className:"footer",html:t("footer")}));
  stage.appendChild(p);
  renderLanguageSwitcher();
}

function renderSettings(theme){
  const p = el("div",{className:"panel wide"});
  p.appendChild(el("h2",{className:"h2"},t("settings").toUpperCase()));
  const fields = el("div",{className:"fields-grid"});
  const nameI = el("input",{type:"text",value:app.settings.playerName, oninput:(e)=>{ app.settings.playerName=e.target.value.slice(0,20); saveSettings(app.settings); }});
  fields.appendChild(field(t("playerName"), nameI, true));
  fields.appendChild(field(t("fullscreen"), btn(app.fs?t("exitFullscreen"):t("enterFullscreen"), toggleFs), true));
  fields.appendChild(field(t("masterVolume", {value:Math.round(app.settings.master*100)}), mkSlider("master",0,1,0.05)));
  fields.appendChild(field(t("sfxVolume", {value:Math.round(app.settings.sfx*100)}), mkSlider("sfx",0,1,0.05)));
  fields.appendChild(field(t("musicVolume", {value:Math.round(app.settings.music*100)}), mkSlider("music",0,1,0.05), true));
  const musicOpts = Object.entries(TRACKS).map(([k,v])=>({value:k,label:v.name})).concat([{value:"custom",label:app.settings.customMusicName?t("customMusic", {name:app.settings.customMusicName}):t("customMusicUpload")}]);
  fields.appendChild(field(t("musicTrack"), dropdown(app.settings.musicTrack, musicOpts, v=>{ app.settings.musicTrack=v; saveSettings(app.settings); paint(); })));
  fields.appendChild(field(t("cpuDifficulty"), dropdown(app.settings.difficulty, [{value:"easy",label:t("easy")},{value:"medium",label:t("medium")},{value:"hard",label:t("hard")},{value:"master",label:t("master")}], v=>{ app.settings.difficulty=v; saveSettings(app.settings); paint(); })));
  const fileI = el("input",{type:"file", accept:"audio/*", onchange:(e)=>{
    const f=e.target.files[0]; if(!f) return;
    if(app.customMusicUrl) URL.revokeObjectURL(app.customMusicUrl);
    app.customMusicUrl = URL.createObjectURL(f); app.settings.musicTrack="custom"; app.settings.customMusicName=f.name; saveSettings(app.settings); paint();
  }});
  fields.appendChild(field(t("uploadMusic"), fileI, true));
  fields.appendChild(field(t("pointsToWin", {value:app.settings.pointsToWin}), mkSlider("pointsToWin",3,15,1,true)));
  fields.appendChild(field(t("paddleSpeed", {value:app.settings.paddleSpeed}), mkSlider("paddleSpeed",4,12,1,true)));
  fields.appendChild(field(t("ballSpeed", {value:app.settings.ballSpeed}), mkSlider("ballSpeed",4,12,1,true)));
  const tog = el("label",{className:"toggle"});
  const c = el("input",{type:"checkbox"}); c.checked=app.settings.powerUpsEnabled; c.onchange=()=>{ app.settings.powerUpsEnabled=c.checked; saveSettings(app.settings); paint(); };
  tog.appendChild(c); tog.appendChild(el("span",{},app.settings.powerUpsEnabled?t("enabled"):t("disabled")));
  fields.appendChild(field(t("powerUpsDuringGame"), tog));
  p.appendChild(fields);
  p.appendChild(btn(t("back"), ()=>nav("menu"), true));
  stage.appendChild(p);
}

function mkSlider(key,min,max,step,int=false){
  const r=el("input",{type:"range",min,max,step,value:app.settings[key]});
  r.oninput=(e)=>{ const v=int?parseInt(e.target.value,10):parseFloat(e.target.value); app.settings[key]=v; saveSettings(app.settings); paint(); };
  return r;
}


function selectField(label, value, options, onChange){
  return field(label, dropdown(value, options.map(o=>({value:o.value,label:o.label})), onChange), true);
}

function applyCustomBaseFromTheme(themeKey){
  const base = THEMES[themeKey] || THEMES.classic;
  const data = customFromTheme(base);
  app.settings.customColors = data.colors;
  app.settings.customBackground = data.customBackground;
  app.settings.ballSkin = data.ballSkin;
  app.settings.paddleSkin = data.paddleSkin;
  app.settings.ballParts = data.ballParts;
  app.settings.ballGlowEnabled = data.ballGlowEnabled;
  app.settings.ballGlowColor = data.ballGlowColor;
}
function enableCustomColors(enabled){
  app.settings.useCustomColors = enabled;
  if(enabled) applyCustomBaseFromTheme(app.settings.themeKey);
  saveSettings(app.settings);
  paint();
}
function currentCustomData(){
  return {...app.settings.customColors, customBackground:app.settings.customBackground, ballSkin:app.settings.ballSkin, paddleSkin:app.settings.paddleSkin, ballParts:app.settings.ballParts, ballGlowEnabled:app.settings.ballGlowEnabled, ballGlowColor:app.settings.ballGlowColor};
}
function customThemeForPreview(){
  const base = THEMES[app.settings.themeKey] || THEMES.classic;
  return app.settings.useCustomColors ? makeCustomTheme(base, currentCustomData()) : base;
}

function refreshCustomizePreview(){
  const canvas = document.querySelector(".custom-game-preview canvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const theme = customThemeForPreview();
  const previewState = {
    leftY:190, rightY:250, leftH:120, rightH:90, leftScore:3, rightScore:2,
    balls:[{x:500,y:300,vx:0,vy:0,speed:0,r:15}], powerUps:[
      {type:"GROW",x:405,y:235,r:14},
      {type:"MULTI",x:610,y:370,r:14}
    ],
    countdown:0
  };
  drawGame(ctx, previewState, theme);
}

function customGamePreview(){
  const box = el("div",{className:"custom-game-preview"});
  box.appendChild(el("div",{className:"preview-title"},t("previewGame")));
  const cv = el("canvas",{width:GW,height:GH});
  box.appendChild(cv);
  setTimeout(refreshCustomizePreview, 0);
  return box;
}

function skinPreview(kind, key){
  const cv = el("canvas",{className:"skin-preview",width:120,height:70});
  setTimeout(()=>{
    const ctx=cv.getContext("2d");
    const theme = customThemeForPreview();
    ctx.fillStyle=theme.bg; ctx.fillRect(0,0,120,70);
    const oldScaleX = GW/120, oldScaleY = GH/70;
    ctx.save(); ctx.scale(120/GW,70/GH);
    if(kind==="ball") drawBallSkin(ctx,{x:GW/2,y:GH/2,r:70},theme.ball,key,theme);
    else drawPaddleSkin(ctx,GW/2-45,GH/2-160,90,320,theme.paddleLeft,key,theme);
    ctx.restore();
  },0);
  return cv;
}

function renderCustomize(theme){
  const p = el("div",{className:"panel wide customize-wide"+(app.settings.useCustomColors?"":" customize-simple")});
  p.appendChild(el("h2",{className:"h2"},t("customize").toUpperCase()));

  const sec1 = el("div",{className:"section theme-section"});
  sec1.appendChild(el("p",{className:"section-title"},t("themeInterface")));
  const grid = el("div",{className:"themes-grid compact"});
  Object.entries(THEMES).forEach(([k,th])=>{
    const card = el("button",{className:"theme-card"+(app.settings.themeKey===k && !app.settings.useCustomColors?" active":""),
      style:{background:th.bg, borderColor: app.settings.themeKey===k?th.accent:"rgba(255,255,255,0.12)"},
      onclick:()=>{ audio.click(); app.settings.themeKey=k; app.settings.useCustomColors=false; saveSettings(app.settings); paint(); }});
    const prev = el("div",{className:"theme-preview"});
    prev.appendChild(el("div",{className:"tp-paddle",style:{background:th.paddleLeft}}));
    prev.appendChild(el("div",{className:"tp-ball",style:{background:th.ball, boxShadow: th.glow?`0 0 8px ${th.ball}`:"none"}}));
    prev.appendChild(el("div",{className:"tp-paddle",style:{background:th.paddleRight}}));
    card.appendChild(prev);
    card.appendChild(el("span",{style:{color:th.accent}}, themeDisplayName(k) || th.name));
    grid.appendChild(card);
  });
  sec1.appendChild(grid);
  if(!app.settings.useCustomColors) p.appendChild(sec1);

  const card = el("div",{className:"colors-card customize-shell"});
  const togRow = el("div",{className:"custom-toggle-row"});
  const tog = el("label",{className:"toggle"});
  const cb = el("input",{type:"checkbox"}); cb.checked=app.settings.useCustomColors;
  cb.onchange=()=>enableCustomColors(cb.checked);
  tog.appendChild(cb); tog.appendChild(el("span",{},app.settings.useCustomColors?t("customColorsOn"):t("customColorsOff")));
  togRow.appendChild(tog); card.appendChild(togRow);

  if(app.settings.useCustomColors){
    const layout = el("div",{className:"customize-layout v42"});
    const left = el("div",{className:"customize-controls scrollable"});
    const right = el("div",{className:"customize-preview-sticky"});

    left.appendChild(selectField(t("matchBackground"), app.settings.customBackground || "none",
      Object.entries(CUSTOM_BACKGROUNDS).map(([value,item])=>({value,label:backgroundDisplayName(value) || item.name})),
      v=>{ app.settings.customBackground=v; saveSettings(app.settings); paint(); }));

    const ballSkins = el("div",{className:"skin-options first"});
    ballSkins.appendChild(el("p",{className:"preview-title"},t("ballModels")));
    const ballGrid = el("div",{className:"skin-grid compact-skins"});
    Object.entries(BALL_SKINS).forEach(([key,item])=>{
      const b=el("button",{className:"skin-card"+((app.settings.ballSkin||"circle")===key?" active":""),
        onclick:()=>{ audio.click(); app.settings.ballSkin=key; app.settings.ballParts=defaultBallParts(key, app.settings.customColors.ball); saveSettings(app.settings); paint(); }});
      b.appendChild(skinPreview("ball",key));
      b.appendChild(el("span",{},ballSkinDisplayName(key) || item.name));
      ballGrid.appendChild(b);
    });
    ballSkins.appendChild(ballGrid);
    left.appendChild(ballSkins);

    const ballParts = el("div",{className:"color-category ball-parts"});
    ballParts.appendChild(el("p",{className:"preview-title"},t("selectedBallColors")));
    const partDefs = ballSkinParts(app.settings.ballSkin || "circle");
    const totalBallCards = partDefs.length + (app.settings.ballGlowEnabled !== false ? 1 : 0);
    const bpGrid = el("div",{className:`colors-grid split mini count-${totalBallCards}`});
    partDefs.forEach(([key,label])=>bpGrid.appendChild(mkBallPartColor(label,key)));
    if(app.settings.ballGlowEnabled !== false){
      bpGrid.appendChild(mkStandaloneColor(t("glowColor"), app.settings.ballGlowColor || app.settings.customColors.ball, v=>{ app.settings.ballGlowColor=v; saveSettings(app.settings); setTheme(); refreshCustomizePreview(); }));
    }
    ballParts.appendChild(bpGrid);
    const glowRow = el("label",{className:"toggle glow-toggle left-toggle"});
    const glowCb = el("input",{type:"checkbox"}); glowCb.checked = app.settings.ballGlowEnabled !== false;
    glowCb.onchange=()=>{ app.settings.ballGlowEnabled=glowCb.checked; saveSettings(app.settings); setTheme(); refreshCustomizePreview(); paint(); };
    glowRow.appendChild(glowCb); glowRow.appendChild(el("span",{},t("ballGlow")));
    ballParts.appendChild(glowRow);
    left.appendChild(ballParts);

    const paddleSkins = el("div",{className:"skin-options"});
    paddleSkins.appendChild(el("p",{className:"preview-title"},t("paddleModels")));
    const paddleGrid = el("div",{className:"skin-grid compact-skins"});
    Object.entries(PADDLE_SKINS).forEach(([key,item])=>{
      const b=el("button",{className:"skin-card"+((app.settings.paddleSkin||"classic")===key?" active":""),
        onclick:()=>{ audio.click(); app.settings.paddleSkin=key; saveSettings(app.settings); paint(); }});
      b.appendChild(skinPreview("paddle",key));
      b.appendChild(el("span",{},paddleSkinDisplayName(key) || item.name));
      paddleGrid.appendChild(b);
    });
    paddleSkins.appendChild(paddleGrid);
    left.appendChild(paddleSkins);

    const gameColors = el("div",{className:"color-category"});
    gameColors.appendChild(el("p",{className:"preview-title"},t("gameColorsTitle")));
    const gameGrid = el("div",{className:"colors-grid split mini"});
    gameGrid.appendChild(mkColor(t("background"),"bg"));
    gameGrid.appendChild(mkColor(t("leftPaddle"),"paddleLeft"));
    gameGrid.appendChild(mkColor(t("rightPaddle"),"paddleRight"));
    gameGrid.appendChild(mkColor(t("centerLine"),"centerLine"));
    gameColors.appendChild(gameGrid);
    left.appendChild(gameColors);

    const uiColors = el("div",{className:"color-category"});
    uiColors.appendChild(el("p",{className:"preview-title"},t("interfaceMenuColors")));
    const uiGrid = el("div",{className:"colors-grid split mini"});
    uiGrid.appendChild(mkColor(t("interfaceBackground"),"uiBg"));
    uiGrid.appendChild(mkColor(t("panelBackground"),"panelBg"));
    uiGrid.appendChild(mkColor(t("textColor"),"text"));
    uiGrid.appendChild(mkColor(t("accentColor"),"accent"));
    uiGrid.appendChild(mkColor(t("secondAccent"),"accent2"));
    uiGrid.appendChild(mkColor(t("borderColor"),"panelBorder"));
    uiColors.appendChild(uiGrid);
    left.appendChild(uiColors);

    right.appendChild(customGamePreview());
    right.appendChild(customMenuPreview());
    const backHolder = el("div",{className:"custom-preview-actions"});
    backHolder.appendChild(btn(t("back"), ()=>nav("menu"), true));
    right.appendChild(backHolder);
    layout.appendChild(left); layout.appendChild(right); card.appendChild(layout);
  }
  if(app.settings.useCustomColors){
    p.appendChild(card);
  }else{
    const compact = el("div",{className:"customize-narrow"});
    compact.appendChild(card);
    compact.appendChild(btn(t("back"), ()=>nav("menu"), true));
    p.appendChild(compact);
  }
  stage.appendChild(p);
}

function customMenuPreview(){
  const theme = customThemeForPreview();
  const box = el("div",{className:"custom-menu-preview"});
  box.appendChild(el("div",{className:"preview-title"},t("previewInterface")));
  const mock = el("div",{className:"menu-preview-box", style:{background:theme.panelBg,borderColor:theme.panelBorder,color:theme.text}});  const previewTitle = makePongLogo("div", "menu-preview-title", {color:theme.accent});
  mock.appendChild(previewTitle);
  mock.appendChild(el("div",{className:"menu-preview-btn primary", style:{background:theme.btnPrimaryBg,color:theme.btnPrimaryColor}},t("playerOne")));
  mock.appendChild(el("div",{className:"menu-preview-btn", style:{borderColor:theme.inputBorder,color:theme.text}},t("customize").toUpperCase()));
  mock.appendChild(el("div",{className:"menu-preview-footer", style:{color:theme.textMuted}},t("previewMenu")));
  box.appendChild(mock);
  return box;
}

function mkBallPartColor(label, key){
  if(!app.settings.ballParts) app.settings.ballParts = defaultBallParts(app.settings.ballSkin || "circle", app.settings.customColors.ball);
  if(!app.settings.ballParts[key]) app.settings.ballParts[key] = defaultBallParts(app.settings.ballSkin || "circle", app.settings.customColors.ball)[key] || app.settings.customColors.ball;
  const w=el("div",{className:"color-field"}); w.appendChild(el("label",{},label));
  const c=el("input",{type:"color",value:app.settings.ballParts[key]});
  const hex=el("span",{className:"color-hex"},app.settings.ballParts[key].toUpperCase());
  const updateColor=(e)=>{
    app.settings.ballParts[key]=e.target.value;
    if(key === "main") app.settings.customColors.ball = e.target.value;
    hex.textContent=e.target.value.toUpperCase();
    saveSettings(app.settings);
    setTheme();
    refreshCustomizePreview();
  };
  c.oninput=updateColor; c.onchange=updateColor;
  w.appendChild(c); w.appendChild(hex); return w;
}
function mkStandaloneColor(label, value, onUpdate){
  const w=el("div",{className:"color-field"}); w.appendChild(el("label",{},label));
  const c=el("input",{type:"color",value:value || "#ffffff"});
  const hex=el("span",{className:"color-hex"},(value || "#ffffff").toUpperCase());
  const updateColor=(e)=>{ hex.textContent=e.target.value.toUpperCase(); onUpdate(e.target.value); };
  c.oninput=updateColor; c.onchange=updateColor;
  w.appendChild(c); w.appendChild(hex); return w;
}
function mkColor(label, key){
  const w=el("div",{className:"color-field"}); w.appendChild(el("label",{},label));
  const c=el("input",{type:"color",value:app.settings.customColors[key]});
  const hex=el("span",{className:"color-hex"},app.settings.customColors[key].toUpperCase());
  const updateColor=(e)=>{
    app.settings.customColors[key]=e.target.value;
    hex.textContent=e.target.value.toUpperCase();
    saveSettings(app.settings);
    setTheme();
    refreshCustomizePreview();
  };
  c.oninput=updateColor;
  c.onchange=updateColor;
  w.appendChild(c); w.appendChild(hex);
  return w;
}

function renderScores(theme){
  const p = el("div",{className:"panel wide"});
  p.appendChild(el("h2",{className:"h2"},t("scores").toUpperCase()));
  const fil = el("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px",justifyContent:"center",marginBottom:"16px"}});
  [["",t("all")],["cpu-easy",t("cpuEasy")],["cpu-medium",t("cpuMedium")],["cpu-hard",t("cpuHard")],["cpu-master",t("cpuMaster")],["2p",t("twoPlayers")]].forEach(([k,l])=>{
    const b = btn(l, ()=>{ app.scoresFilter=k; paint(); }, false, true);
    if(app.scoresFilter===k) b.classList.add("active");
    fil.appendChild(b);
  });
  p.appendChild(fil);
  const all = loadScores().filter(s=>!app.scoresFilter || s.mode===app.scoresFilter).sort((a,b)=>b.score-a.score).slice(0,10);
  const list = el("div",{style:{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"20px"}});
  if(all.length===0) list.appendChild(el("p",{style:{textAlign:"center",color:"var(--text-muted)",padding:"20px"}},t("noScores")));
  all.forEach((s,i)=>{ const row=el("div",{style:{display:"grid",gridTemplateColumns:"50px 1fr 110px 80px 60px",gap:"10px",alignItems:"center",padding:"10px 12px",background:"var(--input-bg)",border:"1px solid var(--input-border)",borderRadius:"8px",fontSize:"13px"}});
    row.appendChild(el("span",{style:{color:"var(--accent)",fontFamily:'"Press Start 2P",monospace',fontSize:"12px"}}, "#"+(i+1)));
    row.appendChild(el("span",{style:{fontWeight:"700"}}, s.player_name));
    row.appendChild(el("span",{style:{color:"var(--text-muted)",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px"}}, s.mode));
    row.appendChild(el("span",{style:{textAlign:"right",fontWeight:"700"}}, s.score+" pts"));
    row.appendChild(el("span",{style:{color:"var(--text-muted)",fontSize:"11px",textAlign:"right"}}, (s.duration_seconds||0)+"s"));
    list.appendChild(row); });
  p.appendChild(list);
  p.appendChild(btn(t("back"), ()=>nav("menu"), true));
  stage.appendChild(p);
}

function renderHelp(theme){
  const p = el("div",{className:"panel wide"});
  p.appendChild(el("h2",{className:"h2"},t("howToPlay").toUpperCase()));
  p.appendChild(el("ul",{className:"",html:t("helpHtml"),
    style:{textAlign:"left",listStyle:"none",padding:0,margin:"0 0 16px",display:"flex",flexDirection:"column",gap:"10px",fontSize:"14px"}}));
  p.appendChild(el("p",{className:"section-title",style:{marginTop:"16px"}},t("powerUps")));
  p.appendChild(el("ul",{html:t("powerUpsHtml"),
    style:{textAlign:"left",listStyle:"none",padding:0,margin:"0 0 16px",display:"flex",flexDirection:"column",gap:"10px",fontSize:"14px"}}));
  p.appendChild(btn(t("back"), ()=>nav("menu"), true));
  stage.appendChild(p);
}

function renderPlay(theme){
  const wrap = el("div",{className:"play-wrap"});
  const hud = el("div",{className:"hud"});
  const left=el("div",{className:"hud-left"});
  left.appendChild(el("span",{className:"tag"}, app.mode==="2p"?t("twoPlayers"):t("vsCpu")));
  left.appendChild(el("span",{className:"tag-muted"}, app.settings.playerName));
  hud.appendChild(left);
  const rightHud = el("div",{className:"hud-right"});
  const fpsLabel = el("span",{className:"tag-muted fps-counter"}, "FPS: --");
  if(app.settings.showFps !== false) rightHud.appendChild(fpsLabel);
  hud.appendChild(rightHud);
  wrap.appendChild(hud);
  const holder = el("div",{className:"canvas-holder"});
  const cv = el("canvas",{width:GW,height:GH,style:{background:theme.bg}});
  holder.appendChild(cv);
  if(app.paused && !app.gameOver){
    const ov = el("div",{className:"overlay"});
    const inner=el("div",{className:"inner"});
    inner.appendChild(el("h2",{},t("paused")));
    inner.appendChild(btn(t("resume"),()=>{ app.paused=false; paint(); }, true));
    inner.appendChild(btn(t("restart"),()=>startGame(app.mode)));
    inner.appendChild(btn(t("mainMenu"),()=>nav("menu")));
    ov.appendChild(inner); holder.appendChild(ov);
  }
  if(app.gameOver){
    const ov = el("div",{className:"overlay"});
    const inner=el("div",{className:"inner"});
    inner.appendChild(el("h2",{},app.gameOver.winner==="left"?t("youWon"):(app.mode==="2p"?t("player2Won"):t("youLost"))));
    inner.appendChild(el("p",{},t("scoreTime", {score:app.gameOver.score, duration:app.gameOver.duration})));
    if(!app.gameOver.saved){
      inner.appendChild(btn(t("saveScore"),()=>{ const arr=loadScores(); arr.push({player_name:app.settings.playerName,score:app.gameOver.score,mode:app.gameOver.mode,duration_seconds:app.gameOver.duration,created_at:new Date().toISOString()}); saveScores(arr); app.gameOver.saved=true; paint(); },true));
    } else {
      inner.appendChild(el("p",{style:{color:"#22c55e"}},t("scoreSaved")));
    }
    inner.appendChild(btn(t("playAgain"),()=>startGame(app.mode)));
    inner.appendChild(btn(t("mainMenu"),()=>nav("menu")));
    ov.appendChild(inner); holder.appendChild(ov);
  }
  wrap.appendChild(holder);
  wrap.appendChild(el("div",{className:"hint"}, app.mode==="2p"?t("hint2p"):t("hintCpu")));
  stage.appendChild(wrap);
  // Game loop
  if(raf) cancelAnimationFrame(raf);
  const ctx = cv.getContext("2d");
  let lastTs = performance.now();
  let fpsLast = lastTs;
  let fpsFrames = 0;
  const cb = {
    paddle:()=>audio.paddleHit(), wall:()=>audio.wallHit(), score:()=>audio.score(), power:()=>audio.powerUp(),
    over:(w)=>{ if(w==="left") audio.win(); else audio.lose();
      const mode = app.mode==="2p"?"2p":`cpu-${app.settings.difficulty}`;
      app.gameOver = { winner:w, score:app.game.leftScore, mode, duration:Math.round(app.game.elapsed) };
      paint();
    }
  };
  const loop = (ts)=>{ const dt=Math.min(0.05,(ts-lastTs)/1000); lastTs=ts;
    fpsFrames++;
    if(app.settings.showFps !== false && (ts - fpsLast) >= 300){ fpsLabel.textContent = `FPS: ${Math.round((fpsFrames*1000)/(ts-fpsLast))}`; fpsFrames = 0; fpsLast = ts; }
    app.game.keys = { w:!!keys["w"]||!!keys["W"], s:!!keys["s"]||!!keys["S"], up:!!keys["ArrowUp"], down:!!keys["ArrowDown"] };
    app.game.paused = app.paused;
    update(app.game, dt, cb);
    const currentTheme = setTheme();
    render2(ctx, app.game, currentTheme);
    if(!app.game.over) raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
function render2(ctx,s,t){ drawGame(ctx,s,t); }

function startGame(mode){
  audio.click(); app.mode=mode; app.paused=false; app.gameOver=null;
  app.game = createGame({mode, difficulty:app.settings.difficulty, pointsToWin:app.settings.pointsToWin, paddleSpeed:app.settings.paddleSpeed, ballSpeed:app.settings.ballSpeed, powerUpsEnabled:app.settings.powerUpsEnabled});
  startRound(app.game);
  app.screen = "play"; paint();
}
function nav(s){ if(raf){ cancelAnimationFrame(raf); raf=null; } app.screen=s; app.paused=false; app.gameOver=null; if(s!=="play") app.game=null; paint(); }
function toggleFs(){ try{
  if(window.desktopAPI && window.desktopAPI.toggleFullscreen){ window.desktopAPI.toggleFullscreen(); return; }
  if(!document.fullscreenElement){ const el=document.documentElement; (el.requestFullscreen||el.webkitRequestFullscreen).call(el); }
  else { (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
} catch(e){} }

let wasFullscreen = false;
if(window.desktopAPI && window.desktopAPI.onFullscreenChange){
  window.desktopAPI.onFullscreenChange((isFullscreen)=>{
    app.fs = !!isFullscreen;
    document.body.classList.toggle("fs", app.fs);
    paint();
  });
}

document.addEventListener("fullscreenchange",()=>{
  const nowFullscreen = !!document.fullscreenElement;
  const exitedFullscreen = wasFullscreen && !nowFullscreen;
  app.fs = nowFullscreen;
  wasFullscreen = nowFullscreen;
  document.body.classList.toggle("fs",app.fs);
  if(exitedFullscreen && app.screen==="play" && !app.paused && !app.gameOver){
    app.paused = true;
  }
  paint();
});

window.addEventListener("keydown",(e)=>{ keys[e.key]=true;
  if(e.key==="Escape" && app.screen==="play"){
    if(document.fullscreenElement){
      app.paused = true;
      audio.click();
      paint();
      return;
    }
    app.paused=!app.paused; audio.click(); paint();
  }
  if(e.key==="F11"){ e.preventDefault(); toggleFs(); }
  if(["ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
});
window.addEventListener("keyup",(e)=>{ keys[e.key]=false; });

paint();
