"use strict";

// =============== THEMES ===============
const THEMES = {
  classic: { name:"Clássico", bg:"#000", paddleLeft:"#fff", paddleRight:"#fff", ball:"#fff", centerLine:"#444", glow:false, grid:false, pattern:"none", ballSkin:"circle", paddleSkin:"classic",
    uiBg:"#0a0a0a", uiBgGradient:"radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 40%)",
    panelBg:"rgba(15,15,18,0.85)", panelBorder:"rgba(255,255,255,0.12)", text:"#ededed", textMuted:"#8a8a8a",
    inputBg:"rgba(255,255,255,0.06)", inputBorder:"rgba(255,255,255,0.18)", accent:"#fff", accent2:"#bbb",
    btnPrimaryBg:"linear-gradient(135deg, #fff, #bbb)", btnPrimaryColor:"#0a0a0a", shadow:"0 20px 80px rgba(0,0,0,0.6)" },
  neon: { name:"Neon", bg:"#0a0014", paddleLeft:"#00ffe1", paddleRight:"#ff2bd6", ball:"#fff200", centerLine:"#5a00ff", glow:true, grid:true, pattern:"grid", ballSkin:"diamond", paddleSkin:"neon",
    uiBg:"#0a0014", uiBgGradient:"radial-gradient(circle at 20% 20%, rgba(255,0,229,0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,255,225,0.14), transparent 40%)",
    panelBg:"rgba(8,4,22,0.85)", panelBorder:"rgba(255,255,255,0.08)", text:"#ededed", textMuted:"#9a8fbf",
    inputBg:"rgba(255,255,255,0.05)", inputBorder:"rgba(255,255,255,0.15)", accent:"#ff00e5", accent2:"#00ffe1",
    btnPrimaryBg:"linear-gradient(135deg, #ff00e5, #00ffe1)", btnPrimaryColor:"#0a0014", shadow:"0 20px 80px rgba(255,0,229,0.25)" },
  retro: { name:"Retrô", bg:"#2b1d0e", paddleLeft:"#f4c95d", paddleRight:"#e08e45", ball:"#fff3c4", centerLine:"#7a5a2f", glow:false, grid:false, pattern:"scanlines", ballSkin:"square", paddleSkin:"blocky",
    uiBg:"#1a1108", uiBgGradient:"radial-gradient(circle at 30% 20%, rgba(244,201,93,0.18), transparent 50%)",
    panelBg:"rgba(43,29,14,0.92)", panelBorder:"rgba(244,201,93,0.18)", text:"#fff3c4", textMuted:"#c9a86b",
    inputBg:"rgba(244,201,93,0.06)", inputBorder:"rgba(244,201,93,0.25)", accent:"#f4c95d", accent2:"#e08e45",
    btnPrimaryBg:"linear-gradient(135deg, #f4c95d, #e08e45)", btnPrimaryColor:"#2b1d0e", shadow:"0 20px 80px rgba(244,201,93,0.2)" },
  space: { name:"Espacial", bg:"#040814", paddleLeft:"#7dd3fc", paddleRight:"#a78bfa", ball:"#fbbf24", centerLine:"#1e293b", glow:true, grid:false, stars:true, pattern:"stars", ballSkin:"star", paddleSkin:"rounded",
    uiBg:"#020611", uiBgGradient:"radial-gradient(circle at 30% 20%, rgba(125,211,252,0.18), transparent 45%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.18), transparent 45%)",
    panelBg:"rgba(4,8,20,0.88)", panelBorder:"rgba(125,211,252,0.18)", text:"#e2e8f0", textMuted:"#94a3b8",
    inputBg:"rgba(125,211,252,0.05)", inputBorder:"rgba(125,211,252,0.22)", accent:"#7dd3fc", accent2:"#a78bfa",
    btnPrimaryBg:"linear-gradient(135deg, #7dd3fc, #a78bfa)", btnPrimaryColor:"#040814", shadow:"0 20px 80px rgba(125,211,252,0.2)" },
  matrix: { name:"Matrix", bg:"#000", paddleLeft:"#00ff66", paddleRight:"#33ff99", ball:"#aaff00", centerLine:"#003311", glow:true, grid:false, pattern:"rain", ballSkin:"diamond", paddleSkin:"neon",
    uiBg:"#000400", uiBgGradient:"radial-gradient(circle at 30% 30%, rgba(0,255,102,0.15), transparent 45%)",
    panelBg:"rgba(0,15,5,0.92)", panelBorder:"rgba(0,255,102,0.25)", text:"#a0ffb0", textMuted:"#5fbf6f",
    inputBg:"rgba(0,255,102,0.05)", inputBorder:"rgba(0,255,102,0.30)", accent:"#00ff66", accent2:"#aaff00",
    btnPrimaryBg:"linear-gradient(135deg, #00ff66, #aaff00)", btnPrimaryColor:"#001000", shadow:"0 20px 80px rgba(0,255,102,0.25)" },
  light: { name:"Claro", bg:"#f5f5f7", paddleLeft:"#1e293b", paddleRight:"#e11d48", ball:"#1a1a1f", centerLine:"#c2c2cc", glow:false, grid:false, pattern:"dots", ballSkin:"circle", paddleSkin:"rounded",
    uiBg:"#ebebf0", uiBgGradient:"radial-gradient(circle at 20% 20%, rgba(225,29,72,0.10), transparent 45%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.10), transparent 45%)",
    panelBg:"rgba(255,255,255,0.92)", panelBorder:"rgba(0,0,0,0.10)", text:"#1a1a1f", textMuted:"#5e5e6b",
    inputBg:"rgba(0,0,0,0.04)", inputBorder:"rgba(0,0,0,0.15)", accent:"#e11d48", accent2:"#0ea5e9",
    btnPrimaryBg:"linear-gradient(135deg, #e11d48, #0ea5e9)", btnPrimaryColor:"#fff", shadow:"0 20px 60px rgba(0,0,0,0.12)", overlayBg:"rgba(235,235,240,0.78)" },
  ocean: { name:"Oceano", bg:"#031923", paddleLeft:"#38bdf8", paddleRight:"#2dd4bf", ball:"#e0f2fe", centerLine:"#0e7490", glow:true, grid:false, pattern:"waves", ballSkin:"volleyball", paddleSkin:"rounded",
    uiBg:"#04131b", uiBgGradient:"radial-gradient(circle at 20% 20%, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(45,212,191,0.14), transparent 45%)",
    panelBg:"rgba(3,25,35,0.90)", panelBorder:"rgba(56,189,248,0.22)", text:"#e0f2fe", textMuted:"#7dd3fc",
    inputBg:"rgba(56,189,248,0.06)", inputBorder:"rgba(56,189,248,0.24)", accent:"#38bdf8", accent2:"#2dd4bf",
    btnPrimaryBg:"linear-gradient(135deg, #38bdf8, #2dd4bf)", btnPrimaryColor:"#031923", shadow:"0 20px 80px rgba(56,189,248,0.22)" },
  sunset: { name:"Pôr do sol", bg:"#1f0f1b", paddleLeft:"#fb7185", paddleRight:"#f59e0b", ball:"#fde68a", centerLine:"#7c2d12", glow:true, grid:false, pattern:"diagonal", ballSkin:"basketball", paddleSkin:"double",
    uiBg:"#1f0f1b", uiBgGradient:"radial-gradient(circle at 20% 20%, rgba(251,113,133,0.20), transparent 44%), radial-gradient(circle at 80% 80%, rgba(245,158,11,0.16), transparent 44%)",
    panelBg:"rgba(31,15,27,0.90)", panelBorder:"rgba(251,113,133,0.22)", text:"#fff7ed", textMuted:"#fda4af",
    inputBg:"rgba(251,113,133,0.06)", inputBorder:"rgba(251,113,133,0.24)", accent:"#fb7185", accent2:"#f59e0b",
    btnPrimaryBg:"linear-gradient(135deg, #fb7185, #f59e0b)", btnPrimaryColor:"#1f0f1b", shadow:"0 20px 80px rgba(251,113,133,0.22)" }
};


const CUSTOM_BACKGROUNDS = {
  none: { name:"Limpo", grid:false, stars:false, pattern:"none" },
  grid: { name:"Grade neon", grid:true, stars:false, pattern:"grid" },
  stars: { name:"Estrelado", grid:false, stars:true, pattern:"stars" },
  scanlines: { name:"Scanlines", grid:false, stars:false, pattern:"scanlines" },
  dots: { name:"Pontos", grid:false, stars:false, pattern:"dots" },
  diagonal: { name:"Diagonal", grid:false, stars:false, pattern:"diagonal" },
  circuit: { name:"Circuito", grid:false, stars:false, pattern:"circuit" },
  rain: { name:"Chuva digital", grid:false, stars:false, pattern:"rain" },
  waves: { name:"Ondas", grid:false, stars:false, pattern:"waves" },
  hex: { name:"Hexágonos", grid:false, stars:false, pattern:"hex" }
};

const BALL_SKINS = {
  circle: { name:"Clássica" },
  square: { name:"Quadrada" },
  diamond: { name:"Diamante" },
  star: { name:"Estrela" },
  soccer: { name:"Futebol" },
  basketball: { name:"Basquete" },
  volleyball: { name:"Vôlei" },
  pokeball: { name:"Pokébola" }
};

const PADDLE_SKINS = {
  classic: { name:"Clássico" },
  rounded: { name:"Arredondado" },
  slim: { name:"Fino" },
  blocky: { name:"Blocos" },
  double: { name:"Duplo" },
  neon: { name:"Neon" }
};

const THEME_NAME_KEYS = { classic:"themeClassic", neon:"themeNeon", retro:"themeRetro", space:"themeSpace", matrix:"themeMatrix", light:"themeLight", ocean:"themeOcean", sunset:"themeSunset" };
const BACKGROUND_NAME_KEYS = { none:"bgNone", grid:"bgGrid", stars:"bgStars", scanlines:"bgScanlines", dots:"bgDots", diagonal:"bgDiagonal", circuit:"bgCircuit", rain:"bgRain", waves:"bgWaves", hex:"bgHex" };
const BALL_SKIN_NAME_KEYS = { circle:"ballSkinCircle", square:"ballSkinSquare", diamond:"ballSkinDiamond", star:"ballSkinStar", soccer:"ballSkinSoccer", basketball:"ballSkinBasketball", volleyball:"ballSkinVolleyball", pokeball:"ballSkinPokeball" };
const PADDLE_SKIN_NAME_KEYS = { classic:"paddleSkinClassic", rounded:"paddleSkinRounded", slim:"paddleSkinSlim", blocky:"paddleSkinBlocky", double:"paddleSkinDouble", neon:"paddleSkinNeon" };
function themeDisplayName(key){ return t(THEME_NAME_KEYS[key] || ""); }
function backgroundDisplayName(key){ return t(BACKGROUND_NAME_KEYS[key] || ""); }
function ballSkinDisplayName(key){ return t(BALL_SKIN_NAME_KEYS[key] || ""); }
function paddleSkinDisplayName(key){ return t(PADDLE_SKIN_NAME_KEYS[key] || ""); }


function hexToRgb(hex){
  const clean = String(hex || "#000000").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c=>c+c).join("") : clean.padEnd(6, "0").slice(0,6);
  const n = parseInt(full, 16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}
function rgba(hex, alpha){
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}
function readableText(bg){
  const c = hexToRgb(bg);
  const luminance = (0.2126*c.r + 0.7152*c.g + 0.0722*c.b) / 255;
  return luminance > 0.58 ? "#111111" : "#f4f4f4";
}

function colorFromCss(value, fallback){
  const v = String(value || "").trim();
  if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if(m){
    const toHex = n => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2,"0");
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }
  return fallback || "#000000";
}
function patternKeyFromTheme(theme){
  if(theme.pattern) return theme.pattern;
  if(theme.stars) return "stars";
  if(theme.grid) return "grid";
  return "none";
}
function customFromTheme(theme){
  return {
    colors:{
      bg: colorFromCss(theme.bg, "#000000"),
      paddleLeft: colorFromCss(theme.paddleLeft, "#ffffff"),
      paddleRight: colorFromCss(theme.paddleRight, "#ffffff"),
      ball: colorFromCss(theme.ball, "#ffffff"),
      centerLine: colorFromCss(theme.centerLine, "#444444"),
      uiBg: colorFromCss(theme.uiBg, theme.bg || "#000000"),
      panelBg: colorFromCss(theme.panelBg, theme.uiBg || theme.bg || "#101010"),
      panelBorder: colorFromCss(theme.panelBorder, theme.accent || "#ffffff"),
      text: colorFromCss(theme.text, "#ededed"),
      textMuted: colorFromCss(theme.textMuted, "#888888"),
      accent: colorFromCss(theme.accent, theme.ball || "#ffffff"),
      accent2: colorFromCss(theme.accent2, theme.paddleLeft || "#bbbbbb")
    },
    customBackground: patternKeyFromTheme(theme),
    ballSkin: theme.ballSkin || "circle",
    paddleSkin: theme.paddleSkin || "classic",
    ballParts: defaultBallParts(theme.ballSkin || "circle", theme.ball || "#ffffff"),
    ballGlowEnabled: theme.glow !== false,
    ballGlowColor: colorFromCss(theme.ball, "#ffffff")
  };
}
function defaultBallParts(skin, color){
  const c = color || "#ffffff";
  if(skin === "pokeball") return { top:"#ef4444", bottom:"#ffffff", line:"#111111", button:"#ffffff" };
  if(skin === "basketball") return { main:"#f97316", line:"#4a1f0a", highlight:"#fdba74" };
  if(skin === "soccer") return { base:"#ffffff", pattern:"#111111", line:"#111111" };
  if(skin === "volleyball") return { base:"#ffffff", panel:"#dbeafe", line:"#64748b" };
  return { main:c };
}
function ballSkinParts(skin){
  if(skin === "pokeball") return [["top",t("ballPartTop")],["bottom",t("ballPartBottom")],["line",t("ballPartLine")],["button",t("ballPartButton")]];
  if(skin === "basketball") return [["main",t("ballPartMainAlt")],["line",t("ballPartLines")],["highlight",t("ballPartHighlight")]];
  if(skin === "soccer") return [["base",t("ballPartBase")],["pattern",t("ballPartPattern")],["line",t("ballPartLine")]];
  if(skin === "volleyball") return [["base",t("ballPartBase")],["panel",t("ballPartPanel")],["line",t("ballPartLines")]];
  return [["main",t("ballPartMain")]];
}
function makeCustomTheme(base, colors){
  const bg = colors.bg || base.bg;
  const uiBg = colors.uiBg || bg;
  const panelBg = colors.panelBg || uiBg;
  const text = colors.text || readableText(uiBg);
  const textMuted = colors.textMuted || colors.accent2 || base.textMuted;
  const accent = colors.accent || colors.ball || base.accent;
  const accent2 = colors.accent2 || colors.paddleLeft || base.accent2;
  const bgConfig = CUSTOM_BACKGROUNDS[colors.customBackground] || CUSTOM_BACKGROUNDS[patternKeyFromTheme(base)] || CUSTOM_BACKGROUNDS.none;
  const skin = colors.ballSkin || base.ballSkin || "circle";
  return {
    ...base,
    name:"Personalizado",
    bg,
    paddleLeft: colors.paddleLeft || base.paddleLeft,
    paddleRight: colors.paddleRight || base.paddleRight,
    ball: colors.ball || base.ball,
    ballParts: colors.ballParts || defaultBallParts(skin, colors.ball || base.ball),
    ballGlow: colors.ballGlowEnabled !== false,
    ballGlowColor: colors.ballGlowColor || colors.ball || base.ball,
    centerLine: colors.centerLine || accent,
    glow: true,
    grid: bgConfig.grid,
    stars: bgConfig.stars,
    pattern: bgConfig.pattern,
    ballSkin: skin,
    paddleSkin: colors.paddleSkin || base.paddleSkin || "classic",
    uiBg,
    uiBgGradient:`radial-gradient(circle at 20% 20%, ${rgba(accent,0.16)}, transparent 42%), radial-gradient(circle at 80% 80%, ${rgba(accent2,0.14)}, transparent 42%)`,
    panelBg: rgba(panelBg, 0.92),
    panelBorder: colors.panelBorder ? rgba(colors.panelBorder, 0.38) : rgba(accent, 0.28),
    text,
    textMuted,
    inputBg: rgba(accent, 0.08),
    inputBorder: colors.panelBorder ? rgba(colors.panelBorder, 0.35) : rgba(accent, 0.35),
    accent,
    accent2,
    btnPrimaryBg:`linear-gradient(135deg, ${accent}, ${accent2})`,
    btnPrimaryColor: readableText(accent),
    shadow:`0 20px 80px ${rgba(accent, 0.22)}`,
    overlayBg: rgba(uiBg, 0.78)
  };
}

function applyTheme(t) {
  const r = document.body.style;
  r.setProperty("--ui-bg", t.uiBg);
  r.setProperty("--ui-gradient", t.uiBgGradient);
  r.setProperty("--panel-bg", t.panelBg);
  r.setProperty("--panel-border", t.panelBorder);
  r.setProperty("--text", t.text);
  r.setProperty("--text-muted", t.textMuted);
  r.setProperty("--input-bg", t.inputBg);
  r.setProperty("--input-border", t.inputBorder);
  r.setProperty("--accent", t.accent);
  r.setProperty("--accent-2", t.accent2);
  r.setProperty("--btn-primary-bg", t.btnPrimaryBg);
  r.setProperty("--btn-primary-color", t.btnPrimaryColor);
  r.setProperty("--shadow", t.shadow);
  r.setProperty("--overlay-bg", t.overlayBg || "rgba(0,0,0,0.7)");
  document.body.style.background = t.uiBg;
}
