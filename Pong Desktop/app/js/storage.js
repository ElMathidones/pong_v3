"use strict";

// =============== SETTINGS / STORAGE ===============
const SETTINGS_KEY = "pong_moderno_settings_v1";
const SCORES_KEY = "pong_moderno_scores_v1";
const DEFAULTS = {
  themeKey:"classic", language:"pt", useCustomColors:false, customBackground:"none", ballSkin:"circle", paddleSkin:"classic", ballGlowEnabled:true, ballGlowColor:"#ffffff",
  customColors:{ bg:"#000000", paddleLeft:"#ffffff", paddleRight:"#ffffff", ball:"#ffffff", centerLine:"#444444", uiBg:"#0a0a0a", panelBg:"#0f0f12", panelBorder:"#ffffff", text:"#ededed", textMuted:"#8a8a8a", accent:"#ffffff", accent2:"#bbbbbb" },
  ballParts:{ main:"#ffffff" },
  master:0.7, sfx:0.8, music:0.4, musicTrack:"synthwave", customMusicName:"",
  difficulty:"medium", pointsToWin:7, paddleSpeed:7, ballSpeed:6, powerUpsEnabled:true, playerName:"Jogador", showFps:true,
};
function loadSettings(){ try{ const r=localStorage.getItem(SETTINGS_KEY); if(!r) return {...DEFAULTS}; const p=JSON.parse(r); return {...DEFAULTS,...p,customColors:{...DEFAULTS.customColors,...(p.customColors||{})},ballParts:{...DEFAULTS.ballParts,...(p.ballParts||{})}}; } catch{ return {...DEFAULTS}; } }
function saveSettings(s){ try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }catch{} }
function loadScores(){ try{ return JSON.parse(localStorage.getItem(SCORES_KEY)) || []; }catch{ return []; } }
function saveScores(arr){ try{ localStorage.setItem(SCORES_KEY, JSON.stringify(arr)); }catch{} }
