import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, onValue } from "firebase/database";

// ── FIREBASE CONFIG ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCksLnzmDvqAc0gHvVQN9s5OlityjuhJR0",
  authDomain: "vvd-ate-a-dry-pickford.firebaseapp.com",
  databaseURL: "https://vvd-ate-a-dry-pickford-9e45d-default-rtdb.firebaseio.com",
  projectId: "vvd-ate-a-dry-pickford",
  storageBucket: "vvd-ate-a-dry-pickford.firebasestorage.app",
  messagingSenderId: "324028384681",
  appId: "1:324028384681:web:e34299f1316b3b6ced70b8",
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp, "https://vvd-ate-a-dry-pickford-9e45d-default-rtdb.firebaseio.com");

// ── MATCH DATA (UTC timestamps, source: official FIFA CET times) ─
const MATCHES_DATA = [
  { id:1,  group:"A", home:"🇲🇽 Mexico",        away:"🇿🇦 South Africa",  utc:Date.UTC(2026,5,11,20,0),  round:"Round 1" },
  { id:2,  group:"A", home:"🇰🇷 South Korea",    away:"🇨🇿 Czechia",        utc:Date.UTC(2026,5,12,2,0),   round:"Round 1" },
  { id:3,  group:"A", home:"🇨🇿 Czechia",        away:"🇿🇦 South Africa",  utc:Date.UTC(2026,5,18,16,0),  round:"Round 2" },
  { id:4,  group:"A", home:"🇲🇽 Mexico",         away:"🇰🇷 South Korea",   utc:Date.UTC(2026,5,19,6,0),   round:"Round 2" },
  { id:5,  group:"A", home:"🇨🇿 Czechia",        away:"🇲🇽 Mexico",         utc:Date.UTC(2026,5,25,2,0),   round:"Round 3" },
  { id:6,  group:"A", home:"🇿🇦 South Africa",  away:"🇰🇷 South Korea",   utc:Date.UTC(2026,5,25,2,0),   round:"Round 3" },
  { id:7,  group:"B", home:"🇨🇦 Canada",         away:"🇧🇦 Bosnia-Herz.",  utc:Date.UTC(2026,5,12,19,0),  round:"Round 1" },
  { id:8,  group:"B", home:"🇶🇦 Qatar",           away:"🇨🇭 Switzerland",   utc:Date.UTC(2026,5,13,19,0),  round:"Round 1" },
  { id:9,  group:"B", home:"🇨🇭 Switzerland",    away:"🇧🇦 Bosnia-Herz.",  utc:Date.UTC(2026,5,18,19,0),  round:"Round 2" },
  { id:10, group:"B", home:"🇨🇦 Canada",         away:"🇶🇦 Qatar",          utc:Date.UTC(2026,5,18,22,0),  round:"Round 2" },
  { id:11, group:"B", home:"🇨🇭 Switzerland",    away:"🇨🇦 Canada",         utc:Date.UTC(2026,5,24,19,0),  round:"Round 3" },
  { id:12, group:"B", home:"🇧🇦 Bosnia-Herz.",   away:"🇶🇦 Qatar",          utc:Date.UTC(2026,5,24,19,0),  round:"Round 3" },
  { id:13, group:"C", home:"🇧🇷 Brazil",         away:"🇲🇦 Morocco",        utc:Date.UTC(2026,5,13,23,0),  round:"Round 1" },
  { id:14, group:"C", home:"🇭🇹 Haiti",           away:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland", utc:Date.UTC(2026,5,14,1,0),   round:"Round 1" },
  { id:15, group:"C", home:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland", away:"🇲🇦 Morocco",  utc:Date.UTC(2026,5,19,22,0),  round:"Round 2" },
  { id:16, group:"C", home:"🇧🇷 Brazil",         away:"🇭🇹 Haiti",          utc:Date.UTC(2026,5,20,2,0),   round:"Round 2" },
  { id:17, group:"C", home:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland", away:"🇧🇷 Brazil",   utc:Date.UTC(2026,5,24,23,0),  round:"Round 3" },
  { id:18, group:"C", home:"🇲🇦 Morocco",        away:"🇭🇹 Haiti",          utc:Date.UTC(2026,5,24,23,0),  round:"Round 3" },
  { id:19, group:"D", home:"🇺🇸 USA",            away:"🇵🇾 Paraguay",       utc:Date.UTC(2026,5,12,22,0),  round:"Round 1" },
  { id:20, group:"D", home:"🇦🇺 Australia",      away:"🇹🇷 Türkiye",         utc:Date.UTC(2026,5,13,4,0),   round:"Round 1" },
  { id:21, group:"D", home:"🇺🇸 USA",            away:"🇦🇺 Australia",      utc:Date.UTC(2026,5,19,19,0),  round:"Round 2" },
  { id:22, group:"D", home:"🇹🇷 Türkiye",         away:"🇵🇾 Paraguay",       utc:Date.UTC(2026,5,20,3,0),   round:"Round 2" },
  { id:23, group:"D", home:"🇹🇷 Türkiye",         away:"🇺🇸 USA",            utc:Date.UTC(2026,5,26,2,0),   round:"Round 3" },
  { id:24, group:"D", home:"🇵🇾 Paraguay",       away:"🇦🇺 Australia",      utc:Date.UTC(2026,5,26,2,0),   round:"Round 3" },
  { id:25, group:"E", home:"🇩🇪 Germany",        away:"🇨🇼 Curaçao",         utc:Date.UTC(2026,5,14,18,0),  round:"Round 1" },
  { id:26, group:"E", home:"🇨🇮 Côte d'Ivoire", away:"🇪🇨 Ecuador",         utc:Date.UTC(2026,5,14,23,0),  round:"Round 1" },
  { id:27, group:"E", home:"🇩🇪 Germany",        away:"🇨🇮 Côte d'Ivoire",  utc:Date.UTC(2026,5,20,20,0),  round:"Round 2" },
  { id:28, group:"E", home:"🇪🇨 Ecuador",        away:"🇨🇼 Curaçao",         utc:Date.UTC(2026,5,21,0,0),   round:"Round 2" },
  { id:29, group:"E", home:"🇪🇨 Ecuador",        away:"🇩🇪 Germany",         utc:Date.UTC(2026,5,25,20,0),  round:"Round 3" },
  { id:30, group:"E", home:"🇨🇼 Curaçao",        away:"🇨🇮 Côte d'Ivoire",  utc:Date.UTC(2026,5,25,20,0),  round:"Round 3" },
  { id:31, group:"F", home:"🇳🇱 Netherlands",   away:"🇯🇵 Japan",           utc:Date.UTC(2026,5,14,21,0),  round:"Round 1" },
  { id:32, group:"F", home:"🇸🇪 Sweden",         away:"🇹🇳 Tunisia",         utc:Date.UTC(2026,5,15,1,0),   round:"Round 1" },
  { id:33, group:"F", home:"🇹🇳 Tunisia",        away:"🇯🇵 Japan",           utc:Date.UTC(2026,5,20,4,0),   round:"Round 2" },
  { id:34, group:"F", home:"🇳🇱 Netherlands",   away:"🇸🇪 Sweden",          utc:Date.UTC(2026,5,20,18,0),  round:"Round 2" },
  { id:35, group:"F", home:"🇯🇵 Japan",          away:"🇸🇪 Sweden",          utc:Date.UTC(2026,5,25,23,0),  round:"Round 3" },
  { id:36, group:"F", home:"🇹🇳 Tunisia",        away:"🇳🇱 Netherlands",    utc:Date.UTC(2026,5,25,23,0),  round:"Round 3" },
  { id:37, group:"G", home:"🇧🇪 Belgium",        away:"🇪🇬 Egypt",           utc:Date.UTC(2026,5,15,20,0),  round:"Round 1" },
  { id:38, group:"G", home:"🇮🇷 IR Iran",        away:"🇳🇿 New Zealand",    utc:Date.UTC(2026,5,16,1,0),   round:"Round 1" },
  { id:39, group:"G", home:"🇧🇪 Belgium",        away:"🇮🇷 IR Iran",         utc:Date.UTC(2026,5,21,19,0),  round:"Round 2" },
  { id:40, group:"G", home:"🇳🇿 New Zealand",   away:"🇪🇬 Egypt",           utc:Date.UTC(2026,5,22,1,0),   round:"Round 2" },
  { id:41, group:"G", home:"🇪🇬 Egypt",          away:"🇮🇷 IR Iran",         utc:Date.UTC(2026,5,27,3,0),   round:"Round 3" },
  { id:42, group:"G", home:"🇳🇿 New Zealand",   away:"🇧🇪 Belgium",         utc:Date.UTC(2026,5,27,3,0),   round:"Round 3" },
  { id:43, group:"H", home:"🇪🇸 Spain",          away:"🇨🇻 Cabo Verde",      utc:Date.UTC(2026,5,15,17,0),  round:"Round 1" },
  { id:44, group:"H", home:"🇸🇦 Saudi Arabia",  away:"🇺🇾 Uruguay",         utc:Date.UTC(2026,5,15,23,0),  round:"Round 1" },
  { id:45, group:"H", home:"🇪🇸 Spain",          away:"🇸🇦 Saudi Arabia",   utc:Date.UTC(2026,5,21,17,0),  round:"Round 2" },
  { id:46, group:"H", home:"🇺🇾 Uruguay",        away:"🇨🇻 Cabo Verde",      utc:Date.UTC(2026,5,21,23,0),  round:"Round 2" },
  { id:47, group:"H", home:"🇨🇻 Cabo Verde",     away:"🇸🇦 Saudi Arabia",   utc:Date.UTC(2026,5,27,1,0),   round:"Round 3" },
  { id:48, group:"H", home:"🇺🇾 Uruguay",        away:"🇪🇸 Spain",           utc:Date.UTC(2026,5,27,1,0),   round:"Round 3" },
  { id:49, group:"I", home:"🇫🇷 France",         away:"🇸🇳 Senegal",         utc:Date.UTC(2026,5,16,20,0),  round:"Round 1" },
  { id:50, group:"I", home:"🇮🇶 Iraq",           away:"🇳🇴 Norway",          utc:Date.UTC(2026,5,16,23,0),  round:"Round 1" },
  { id:51, group:"I", home:"🇫🇷 France",         away:"🇮🇶 Iraq",            utc:Date.UTC(2026,5,22,22,0),  round:"Round 2" },
  { id:52, group:"I", home:"🇳🇴 Norway",         away:"🇸🇳 Senegal",         utc:Date.UTC(2026,5,23,0,0),   round:"Round 2" },
  { id:53, group:"I", home:"🇳🇴 Norway",         away:"🇫🇷 France",          utc:Date.UTC(2026,5,26,20,0),  round:"Round 3" },
  { id:54, group:"I", home:"🇸🇳 Senegal",        away:"🇮🇶 Iraq",            utc:Date.UTC(2026,5,26,20,0),  round:"Round 3" },
  { id:55, group:"J", home:"🇦🇹 Austria",        away:"🇯🇴 Jordan",          utc:Date.UTC(2026,5,16,4,0),   round:"Round 1" },
  { id:56, group:"J", home:"🇦🇷 Argentina",      away:"🇩🇿 Algeria",         utc:Date.UTC(2026,5,17,2,0),   round:"Round 1" },
  { id:57, group:"J", home:"🇦🇷 Argentina",      away:"🇦🇹 Austria",         utc:Date.UTC(2026,5,22,18,0),  round:"Round 2" },
  { id:58, group:"J", home:"🇯🇴 Jordan",         away:"🇩🇿 Algeria",         utc:Date.UTC(2026,5,23,3,0),   round:"Round 2" },
  { id:59, group:"J", home:"🇩🇿 Algeria",        away:"🇦🇹 Austria",         utc:Date.UTC(2026,5,28,3,0),   round:"Round 3" },
  { id:60, group:"J", home:"🇯🇴 Jordan",         away:"🇦🇷 Argentina",       utc:Date.UTC(2026,5,28,3,0),   round:"Round 3" },
  { id:61, group:"K", home:"🇵🇹 Portugal",       away:"🇨🇩 Congo DR",        utc:Date.UTC(2026,5,17,18,0),  round:"Round 1" },
  { id:62, group:"K", home:"🇺🇿 Uzbekistan",     away:"🇨🇴 Colombia",        utc:Date.UTC(2026,5,18,2,0),   round:"Round 1" },
  { id:63, group:"K", home:"🇵🇹 Portugal",       away:"🇺🇿 Uzbekistan",      utc:Date.UTC(2026,5,23,18,0),  round:"Round 2" },
  { id:64, group:"K", home:"🇨🇴 Colombia",       away:"🇨🇩 Congo DR",        utc:Date.UTC(2026,5,24,2,0),   round:"Round 2" },
  { id:65, group:"K", home:"🇨🇴 Colombia",       away:"🇵🇹 Portugal",        utc:Date.UTC(2026,5,28,0,30),  round:"Round 3" },
  { id:66, group:"K", home:"🇨🇩 Congo DR",       away:"🇺🇿 Uzbekistan",      utc:Date.UTC(2026,5,28,0,30),  round:"Round 3" },
  { id:67, group:"L", home:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", away:"🇭🇷 Croatia",  utc:Date.UTC(2026,5,17,21,0),  round:"Round 1" },
  { id:68, group:"L", home:"🇬🇭 Ghana",          away:"🇵🇦 Panama",          utc:Date.UTC(2026,5,17,23,0),  round:"Round 1" },
  { id:69, group:"L", home:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", away:"🇬🇭 Ghana",    utc:Date.UTC(2026,5,23,21,0),  round:"Round 2" },
  { id:70, group:"L", home:"🇵🇦 Panama",         away:"🇭🇷 Croatia",         utc:Date.UTC(2026,5,23,23,0),  round:"Round 2" },
  { id:71, group:"L", home:"🇵🇦 Panama",         away:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", utc:Date.UTC(2026,5,27,22,0), round:"Round 3" },
  { id:72, group:"L", home:"🇭🇷 Croatia",        away:"🇬🇭 Ghana",           utc:Date.UTC(2026,5,27,22,0),  round:"Round 3" },
  // ROUND OF 32 (28 Jun - 4 Jul)
  { id:73,  group:null, home:"2nd A", away:"2nd B",          utc:Date.UTC(2026,5,28,19,0),  round:"Round of 32" },
  { id:74,  group:null, home:"1st C", away:"2nd F",          utc:Date.UTC(2026,5,29,17,0),  round:"Round of 32" },
  { id:75,  group:null, home:"1st E", away:"3rd A/B/C/D/F",  utc:Date.UTC(2026,5,29,20,30), round:"Round of 32" },
  { id:76,  group:null, home:"1st F", away:"2nd C",          utc:Date.UTC(2026,5,30,1,0),   round:"Round of 32" },
  { id:77,  group:null, home:"2nd E", away:"2nd I",          utc:Date.UTC(2026,5,30,17,0),  round:"Round of 32" },
  { id:78,  group:null, home:"1st I", away:"3rd C/D/F/G/H",  utc:Date.UTC(2026,5,30,21,0),  round:"Round of 32" },
  { id:79,  group:null, home:"1st A", away:"3rd C/E/F/H/I",  utc:Date.UTC(2026,6,1,1,0),   round:"Round of 32" },
  { id:80,  group:null, home:"1st L", away:"3rd E/H/I/J/K",  utc:Date.UTC(2026,6,1,16,0),  round:"Round of 32" },
  { id:81,  group:null, home:"1st G", away:"3rd A/E/H/I/J",  utc:Date.UTC(2026,6,1,20,0),  round:"Round of 32" },
  { id:82,  group:null, home:"1st D", away:"3rd B/E/F/I/J",  utc:Date.UTC(2026,6,2,0,0),   round:"Round of 32" },
  { id:83,  group:null, home:"1st H", away:"2nd J",          utc:Date.UTC(2026,6,2,19,0),  round:"Round of 32" },
  { id:84,  group:null, home:"2nd K", away:"2nd L",          utc:Date.UTC(2026,6,2,23,0),  round:"Round of 32" },
  { id:85,  group:null, home:"1st B", away:"3rd E/F/G/I/J",  utc:Date.UTC(2026,6,3,3,0),   round:"Round of 32" },
  { id:86,  group:null, home:"2nd D", away:"2nd G",          utc:Date.UTC(2026,6,3,18,0),  round:"Round of 32" },
  { id:87,  group:null, home:"1st J", away:"2nd H",          utc:Date.UTC(2026,6,3,22,0),  round:"Round of 32" },
  { id:88,  group:null, home:"1st K", away:"3rd D/E/I/J/L",  utc:Date.UTC(2026,6,4,1,30),  round:"Round of 32" },
  // ROUND OF 16 (4 Jul - 7 Jul)
  { id:89,  group:null, home:"R32 W1", away:"R32 W3",  utc:Date.UTC(2026,6,4,17,0),  round:"Round of 16" },
  { id:90,  group:null, home:"R32 W2", away:"R32 W4",  utc:Date.UTC(2026,6,4,21,0),  round:"Round of 16" },
  { id:91,  group:null, home:"R32 W5", away:"R32 W6",  utc:Date.UTC(2026,6,5,20,0),  round:"Round of 16" },
  { id:92,  group:null, home:"R32 W7", away:"R32 W8",  utc:Date.UTC(2026,6,6,0,0),   round:"Round of 16" },
  { id:93,  group:null, home:"R32 W9", away:"R32 W10", utc:Date.UTC(2026,6,6,19,0),  round:"Round of 16" },
  { id:94,  group:null, home:"R32 W11",away:"R32 W12", utc:Date.UTC(2026,6,7,0,0),   round:"Round of 16" },
  { id:95,  group:null, home:"R32 W13",away:"R32 W14", utc:Date.UTC(2026,6,7,16,0),  round:"Round of 16" },
  { id:96,  group:null, home:"R32 W15",away:"R32 W16", utc:Date.UTC(2026,6,7,20,0),  round:"Round of 16" },
  // QUARTER FINALS (9-12 Jul)
  { id:97,  group:null, home:"R16 W1", away:"R16 W2",  utc:Date.UTC(2026,6,9,20,0),  round:"Quarter Final" },
  { id:98,  group:null, home:"R16 W3", away:"R16 W4",  utc:Date.UTC(2026,6,10,19,0), round:"Quarter Final" },
  { id:99,  group:null, home:"R16 W5", away:"R16 W6",  utc:Date.UTC(2026,6,11,21,0), round:"Quarter Final" },
  { id:100, group:null, home:"R16 W7", away:"R16 W8",  utc:Date.UTC(2026,6,12,1,0),  round:"Quarter Final" },
  // SEMI FINALS (14-15 Jul)
  { id:101, group:null, home:"QF W1",  away:"QF W2",   utc:Date.UTC(2026,6,14,19,0), round:"Semi Final" },
  { id:102, group:null, home:"QF W3",  away:"QF W4",   utc:Date.UTC(2026,6,15,19,0), round:"Semi Final" },
  // THIRD PLACE (18 Jul)
  { id:103, group:null, home:"SF L1",  away:"SF L2",   utc:Date.UTC(2026,6,18,21,0), round:"3rd Place" },
  // FINAL (19 Jul)
  { id:104, group:null, home:"SF W1",  away:"SF W2",   utc:Date.UTC(2026,6,19,19,0), round:"🏆 Final" },
];

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

const TZ_ZONES = {ET:"America/New_York",UK:"Europe/London",DE:"Europe/Berlin",SA:"Africa/Johannesburg"};
const TZ_LABELS = {ET:"ET",UK:"BST",DE:"CEST",SA:"SAST"};

function formatKickoff(utcMs, tzKey) {
  const zone = TZ_ZONES[tzKey]||"America/New_York";
  const time = new Intl.DateTimeFormat("en-GB",{timeZone:zone,hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(utcMs));
  return `${time} ${TZ_LABELS[tzKey]}`;
}

function getDateLabel(utcMs, tzKey) {
  const zone = TZ_ZONES[tzKey]||"America/New_York";
  return new Intl.DateTimeFormat("en-GB",{timeZone:zone,weekday:"short",day:"numeric",month:"short"}).format(new Date(utcMs));
}

function formatCountdown(ms) {
  if (ms<=0) return null;
  const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sc=s%60;
  if (d>0) return `${d}d ${h}h ${m}m`;
  if (h>0) return `${h}h ${m}m ${sc}s`;
  return `${m}m ${sc}s`;
}

const calcPoints=(pred,actual)=>{
  if(!actual||!pred||pred.home===""||pred.away==="")return 0;
  const ph=parseInt(pred.home),pa=parseInt(pred.away),ah=parseInt(actual.home),aa=parseInt(actual.away);
  if(isNaN(ph)||isNaN(pa))return 0;
  if(ph===ah&&pa===aa)return 5;
  const pr=ph>pa?"H":ph<pa?"A":"D",ar=ah>aa?"H":ah<aa?"A":"D";
  if(pr===ar)return 3;
  return 0;
};

const TZ=[{key:"ET",label:"🇺🇸 ET"},{key:"UK",label:"🇬🇧 BST"},{key:"DE",label:"🇩🇪 CEST"},{key:"SA",label:"🇿🇦 SAST"}];
const ADMIN_PIN="Dambudzo@1983";
const WC_IMG="data:image/jpeg;base64,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";

// Get joker slot for a match
const getJokerSlot=(m)=>{
  if(!m.group) return "ko";
  if(m.round==="Round 1") return "r1";
  if(m.round==="Round 2") return "r2";
  if(m.round==="Round 3") return "r3";
  return "ko";
};
const JOKER_LABELS={r1:"Round 1",r2:"Round 2",r3:"Round 3",ko:"Knockouts"};

const Countdown=({utc,style})=>{
  const [cd,setCd]=useState(formatCountdown(utc-Date.now()));
  useEffect(()=>{
    if(!cd)return;
    const t=setInterval(()=>{
      const val=formatCountdown(utc-Date.now());
      setCd(val);
      if(!val)clearInterval(t);
    },1000);
    return()=>clearInterval(t);
  },[utc]);
  if(!cd)return null;
  return <span style={style}>⏳ {cd}</span>;
};


const Bg=()=>(
  <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none",background:"#0a1628"}}>
    <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 20% 20%, rgba(241,196,15,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(52,152,219,0.07) 0%, transparent 50%)`}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#f1c40f,#e67e22,#e74c3c,#9b59b6,#3498db,#1abc9c,#f1c40f)"}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:8,background:"linear-gradient(90deg,#1abc9c,#3498db,#9b59b6,#e74c3c,#e67e22,#f1c40f,#1abc9c)"}}/>
    <svg style={{position:"absolute",top:"-60px",left:"-60px",opacity:0.08}} width="280" height="280" viewBox="0 0 280 280">
      <circle cx="140" cy="140" r="130" fill="none" stroke="#f1c40f" strokeWidth="3"/>
      <circle cx="140" cy="140" r="100" fill="none" stroke="#e67e22" strokeWidth="2"/>
      <circle cx="140" cy="140" r="70" fill="none" stroke="#e74c3c" strokeWidth="3"/>
      <line x1="10" y1="140" x2="270" y2="140" stroke="#f1c40f" strokeWidth="1.5"/>
      <line x1="140" y1="10" x2="140" y2="270" stroke="#f1c40f" strokeWidth="1.5"/>
    </svg>
    <svg style={{position:"absolute",bottom:"-60px",right:"-60px",opacity:0.08}} width="280" height="280" viewBox="0 0 280 280">
      <circle cx="140" cy="140" r="130" fill="none" stroke="#3498db" strokeWidth="3"/>
      <circle cx="140" cy="140" r="100" fill="none" stroke="#f1c40f" strokeWidth="2"/>
      <circle cx="140" cy="140" r="70" fill="none" stroke="#e74c3c" strokeWidth="3"/>
      <line x1="10" y1="140" x2="270" y2="140" stroke="#3498db" strokeWidth="1.5"/>
      <line x1="140" y1="10" x2="140" y2="270" stroke="#3498db" strokeWidth="1.5"/>
    </svg>
  </div>
);

const Toast=({t})=>(<div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",padding:"12px 24px",borderRadius:30,color:"#fff",fontWeight:700,fontSize:14,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.4)",background:t.type==="error"?"#e74c3c":"#27ae60"}}>{t.msg}</div>);

export default function App() {
  const [view,setView]=useState(()=>localStorage.getItem("vvd_pid")?"predict":"home");
  const [name,setName]=useState(()=>localStorage.getItem("vvd_name")||"");
  const [playerId,setPlayerId]=useState(()=>localStorage.getItem("vvd_pid")||"");
  const [preds,setPreds]=useState({});
  const [joker,setJoker]=useState({r1:null,r2:null,r3:null,ko:null}); // one joker per round group
  const [allPlayers,setAllPlayers]=useState({});
  const [results,setResults]=useState({});
  const [tab,setTab]=useState("TODAY");
  const [atab,setAtab]=useState("A");
  const [tz,setTz]=useState(()=>localStorage.getItem("vvd_tz")||"UK");
  const [toast,setToast]=useState(null);
  const [now]=useState(Date.now());
  // tick moved to Countdown component
  const [pin,setPin]=useState(""),  [auth,setAuth]=useState(false);
  const [adminSection,setAdminSection]=useState("results");
  const [lbRound,setLbRound]=useState("all");
  const [ainputs,setAinputs]=useState({});
  const [saving,setSaving]=useState(false);
  const [fbReady,setFbReady]=useState(false);

  // Tick every second for countdown
  // countdown timer is in Countdown component

  // Listen to all players + results from Firebase
  useEffect(()=>{
    const u1=onValue(ref(db,"players"),snap=>{
      const val=snap.val();
      console.log("Firebase players raw:", JSON.stringify(val));
      setAllPlayers(val||{});
      setFbReady(true);
    });
    const u2=onValue(ref(db,"results"),snap=>{
      const raw=snap.val()||{};
      // Normalize keys to both string and number for safe lookup
      const normalized={};
      Object.entries(raw).forEach(([k,v])=>{normalized[k]=v;normalized[Number(k)]=v;});
      setResults(normalized);
    });
    return()=>{u1();u2();};
  },[]);

  // Load my own predictions + joker from Firebase when playerId is known
  useEffect(()=>{
    if(!playerId)return;
    const u=onValue(ref(db,`players/${playerId}`),snap=>{
      const d=snap.val();
      if(d){
        setJoker(d.jokerUsed||{r1:null,r2:null,r3:null,ko:null});
        // Only load predictions on first load, not on every Firebase update
        setPreds(prev=>{
          if(Object.keys(prev).length===0) return d.predictions||{};
          return prev;
        });
        setLocalPreds(prev=>{
          if(Object.keys(prev).length===0) return d.predictions||{};
          return prev;
        });
      }
    });
    return()=>u();
  },[playerId]);

  const toast2=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2800);};
  const locked=(m)=>m.utc<=now||!!results[m.id];

  const handleJoin=async()=>{
    if(playerId) return setView("predict"); // already registered
    if(!name.trim())return toast2("Enter your name!","error");
    if(!fbReady)return toast2("Connecting...","error");
    const id=name.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");
    if(!id)return toast2("Name has invalid characters","error");
    // Check if name already taken (case-insensitive)
    const nameLower=name.trim().toLowerCase();
    const nameTaken=Object.values(allPlayers).some(p=>p&&p.name&&p.name.toLowerCase()===nameLower);
    if(nameTaken && !allPlayers[id]){
      return toast2("That name is already taken — try a different one","error");
    }
    // Check if ID already taken by someone else
    const existing=allPlayers[id];
    if(existing && existing.name!==name.trim()){
      return toast2("Name taken — try a different one","error");
    }
    setSaving(true);
    await update(ref(db,`players/${id}`),{name:name.trim(),tz,joinedAt:existing?.joinedAt||Date.now()});
    setPlayerId(id);
    localStorage.setItem("vvd_name",name.trim());
    localStorage.setItem("vvd_pid",id);
    localStorage.setItem("vvd_tz",tz);
    setSaving(false);
    setView("predict");
    toast2(`Welcome${existing?"back":""}, ${name.trim()}! 🎉`);
  };

  // localPreds mirrors preds but updates instantly without Firebase re-renders
  const [localPreds,setLocalPreds]=useState({});

  // Sync localPreds when Firebase updates preds (only on initial load)
  useEffect(()=>{
    setLocalPreds(prev=>{
      // Only update fields that aren't currently being edited
      return {...preds,...prev};
    });
  },[preds]);

  const handlePredChange=(matchId,side,val)=>{
    if(!/^\d*$/.test(val)||parseInt(val)>20)return;
    const newPred={...localPreds[matchId],[side]:val};
    setLocalPreds(p=>({...p,[matchId]:newPred}));
  };

  const handlePredBlur=async(matchId)=>{
    const pred=localPreds[matchId];
    if(!pred)return;
    const updated={...preds,[matchId]:pred};
    setPreds(updated);
    if(playerId) await update(ref(db,`players/${playerId}`),{predictions:updated});
  };

  const saveJoker=async(m)=>{
    const slot=getJokerSlot(m);
    const updated={...joker,[slot]:m.id};
    setJoker(updated);
    if(playerId) await update(ref(db,`players/${playerId}`),{jokerUsed:updated});
    toast2(`🃏 ${JOKER_LABELS[slot]} Joker played! 2× points!`);
  };

  const removeJoker=async(m)=>{
    const slot=getJokerSlot(m);
    const updated={...joker,[slot]:null};
    setJoker(updated);
    if(playerId) await update(ref(db,`players/${playerId}`),{jokerUsed:updated});
    toast2(`🃏 ${JOKER_LABELS[slot]} Joker removed`);
  };

  const myPts=MATCHES_DATA.reduce((acc,m)=>{
    const a=results[m.id];if(!a)return acc;
    const p=preds[m.id];if(!p)return acc;
    let pt=calcPoints(p,a);
    const slot=getJokerSlot(m);
    if(joker&&joker[slot]==m.id)pt*=2;
    return acc+pt;
  },0);

  const getBoard=()=>{
    const entries=Object.entries(allPlayers);
    if(entries.length===0) return [];
    return entries.map(([id,player])=>{
      if(!player||typeof player!=='object') return{id,name:id,pts:0,isMe:id===playerId,rank:0};
      let pts=0;
      try{
        MATCHES_DATA.forEach(m=>{
          const a=results[m.id];if(!a)return;
          const pred=player.predictions?.[m.id];if(!pred)return;
          let pt=calcPoints(pred,a);
          const jk=player.jokerUsed;
          if(jk){const sl=getJokerSlot(m);if(typeof jk==='object'?jk[sl]==m.id:jk==m.id)pt*=2;}
          pts+=pt;
        });
      }catch(e){console.error("getBoard error",id,e);}
      return{id,name:player.name||id,pts,isMe:id===playerId};
    }).sort((a,b)=>b.pts-a.pts).map((p,i)=>({...p,rank:i+1}));
  };

  const s={
    root:{minHeight:"100vh",background:"#0a1628",fontFamily:"'Barlow Condensed',sans-serif",color:"#fff",position:"relative",overflowX:"hidden"},
    wrap:{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 20px 40px",minHeight:"100vh"},
    imgBanner:{width:"calc(100% + 40px)",marginLeft:"-20px",position:"relative",marginBottom:16},
    title:{fontSize:26,fontWeight:900,letterSpacing:3,margin:"0 0 4px",textTransform:"uppercase",color:"#fff",textAlign:"center",lineHeight:1.2},
    acc:{color:"#f1c40f"},
    sub:{color:"#7f8c9a",fontSize:11,letterSpacing:5,textTransform:"uppercase",marginBottom:3},
    cred:{color:"#f1c40f",fontSize:10,letterSpacing:3,opacity:0.7,marginBottom:20},
    card:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"22px",width:"100%",maxWidth:380,display:"flex",flexDirection:"column",gap:11,backdropFilter:"blur(10px)"},
    lbl:{fontSize:10,letterSpacing:3,color:"#7f8c9a",textTransform:"uppercase"},
    inp:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"12px 14px",color:"#fff",fontSize:15,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"},
    tzrow:{display:"flex",gap:6},
    tzb:{flex:1,padding:"9px 4px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#7f8c9a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},
    tzba:{background:"rgba(241,196,15,0.15)",border:"1px solid rgba(241,196,15,0.5)",color:"#f1c40f"},
    btn:{background:"linear-gradient(135deg,#f1c40f,#e67e22)",border:"none",borderRadius:10,padding:"13px",color:"#0a1628",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",width:"100%"},
    btn2:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"11px",color:"#7f8c9a",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",width:"100%"},
    hint:{color:"#4a5568",fontSize:11,letterSpacing:1,marginTop:14,textAlign:"center"},
    status:{fontSize:11,textAlign:"center",color:fbReady?"#27ae60":"#e67e22"},
    hdr:{position:"sticky",top:0,zIndex:10,background:"rgba(10,22,40,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"},
    htitle:{fontSize:15,fontWeight:800,letterSpacing:2,color:"#f1c40f"},
    hsub:{fontSize:10,color:"#7f8c9a",marginTop:2},
    nb:{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 11px",color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600},
    pts:{background:"linear-gradient(135deg,rgba(241,196,15,0.15),rgba(230,126,34,0.1))",borderBottom:"1px solid rgba(241,196,15,0.2)",padding:"11px 16px",display:"flex",alignItems:"center",gap:10,zIndex:1,position:"relative"},
    pn:{fontSize:42,fontWeight:900,color:"#f1c40f",lineHeight:1},
    pt:{fontSize:9,color:"#7f8c9a",letterSpacing:3,textTransform:"uppercase"},
    jt:{marginLeft:"auto",fontSize:10,color:"#e67e22",fontWeight:700},
    tzbar:{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)",zIndex:1,position:"relative"},
    tzbl:{fontSize:9,color:"#4a5568",letterSpacing:1,textTransform:"uppercase",marginRight:3},
    tzm:{padding:"3px 9px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,color:"#7f8c9a",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},
    tzma:{background:"rgba(241,196,15,0.15)",border:"1px solid rgba(241,196,15,0.4)",color:"#f1c40f"},
    tabs:{display:"flex",overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"relative",zIndex:1,scrollbarWidth:"none"},
    tab:{flexShrink:0,padding:"10px 12px",background:"none",border:"none",color:"#7f8c9a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",whiteSpace:"nowrap"},
    taba:{color:"#f1c40f",borderBottom:"2px solid #f1c40f"},
    todaytab:{color:"#1abc9c",borderBottom:"2px solid #1abc9c"},
    ml:{padding:"7px 9px 80px",position:"relative",zIndex:1},
    rh:{fontSize:9,fontWeight:800,letterSpacing:4,color:"#3498db",textTransform:"uppercase",padding:"12px 3px 5px",borderBottom:"1px solid rgba(52,152,219,0.2)",marginBottom:7},
    mc:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:11,padding:"10px 12px",marginBottom:7},
    jc:{border:"1px solid rgba(241,196,15,0.5)",background:"rgba(241,196,15,0.05)"},
    lc:{opacity:0.8},
    mm:{display:"flex",gap:5,marginBottom:7,alignItems:"center",flexWrap:"wrap"},
    db:{fontSize:11,fontWeight:700,color:"#f1c40f"},
    cd:{fontSize:9,fontWeight:800,background:"rgba(241,196,15,0.12)",color:"#f1c40f",padding:"2px 6px",borderRadius:4},
    ko:{fontSize:8,fontWeight:700,background:"rgba(255,255,255,0.07)",color:"#7f8c9a",padding:"2px 5px",borderRadius:3},
    fb:{fontSize:8,fontWeight:700,background:"rgba(39,174,96,0.2)",color:"#27ae60",padding:"2px 5px",borderRadius:3},
    gb:{fontSize:8,fontWeight:700,background:"rgba(52,152,219,0.2)",color:"#3498db",padding:"2px 5px",borderRadius:3},
    mr:{display:"flex",alignItems:"center",gap:5},
    tn:{flex:1,fontSize:12,fontWeight:700,lineHeight:1.3,color:"#fff"},
    sb:{display:"flex",alignItems:"center",gap:3},
    si:{width:48,height:48,textAlign:"center",fontSize:20,fontWeight:900,background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#f1c40f",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",appearance:"none"},
    sl:{background:"rgba(255,255,255,0.03)",color:"#555",cursor:"not-allowed",opacity:0.5,border:"1px solid rgba(255,255,255,0.05)"},
    col:{fontSize:15,fontWeight:900,color:"#4a5568"},
    rr:{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:7,paddingTop:7,borderTop:"1px solid rgba(255,255,255,0.06)"},
    rt:{fontSize:10,color:"#7f8c9a"},
    pp:{fontSize:11,fontWeight:800,padding:"2px 9px",borderRadius:20,color:"#fff"},
    ac:{marginTop:7},
    jb:{background:"rgba(241,196,15,0.1)",border:"1px solid rgba(241,196,15,0.35)",borderRadius:6,padding:"5px 11px",color:"#f1c40f",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"},
    ja:{fontSize:10,fontWeight:800,color:"#f1c40f"},
    lbwrap:{padding:"14px 14px 80px"},
    lbsub:{fontSize:12,color:"#7f8c9a",marginBottom:12},
    lbcard:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:7},
    lbme:{border:"1px solid rgba(241,196,15,0.4)",background:"rgba(241,196,15,0.06)"},
    lbrank:{fontSize:20,width:32,textAlign:"center"},
    lbname:{flex:1,fontSize:16,fontWeight:700},
    lbpts:{fontSize:24,fontWeight:900,color:"#f1c40f"},
    lbptsl:{fontSize:11,color:"#7f8c9a",fontWeight:400},
    sv:{flex:1,background:"rgba(39,174,96,0.15)",border:"1px solid rgba(39,174,96,0.4)",borderRadius:6,padding:"7px",color:"#27ae60",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},
    cl:{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.3)",borderRadius:6,padding:"7px 10px",color:"#e74c3c",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},
  };

  const MatchCard=({m,isToday,onTabChange})=>{
    const pred=localPreds[m.id]||preds[m.id]||{home:"",away:""};
    const actual=results[m.id];
    const pts=actual?calcPoints(pred,actual):null;
    const slot=getJokerSlot(m);
    const isJ=joker&&joker[slot]==m.id;
    const slotUsed=joker&&joker[slot]!=null;
    const lk=locked(m);
    const hasPred=pred.home!==""&&pred.away!=="";
    const isSaved=hasPred&&preds[m.id]&&preds[m.id].home===pred.home&&preds[m.id].away===pred.away;
    // countdown handled by Countdown component below
    return(
      <div style={{...s.mc,...(isJ?s.jc:{}),...(lk?s.lc:{})}}>
        {isToday&&!actual&&!lk&&(
          <div
            onClick={()=>onTabChange&&onTabChange(m.group||"KO")}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:7,marginBottom:9,cursor:"pointer",background:isSaved?"rgba(39,174,96,0.12)":"rgba(139,0,0,0.12)",border:isSaved?"1px solid rgba(39,174,96,0.5)":"1px solid rgba(139,0,0,0.5)"}}>
            <span style={{fontSize:11,fontWeight:800,color:isSaved?"#27ae60":"#8b0000",letterSpacing:0.5}}>
              {isSaved?"✅ Good to go 👍":"🔮 Make prediction"}
            </span>
            <span style={{fontSize:10,color:isSaved?"#27ae60":"#8b0000",fontWeight:600}}>
              {m.home.split(" ").pop()} vs {m.away.split(" ").pop()} →
            </span>
          </div>
        )}
        <div style={s.mm}>
          <span style={s.db}>⏱ {formatKickoff(m.utc,tz)}</span>
          <span style={{fontSize:9,color:"#4a5568"}}>📅 {getDateLabel(m.utc,tz)}</span>
          {isToday&&m.group&&<span style={s.gb}>Grp {m.group}</span>}
          {!lk&&<Countdown utc={m.utc} style={s.cd}/>}
          {lk&&!actual&&<span style={s.ko}>🔒 Started</span>}
          {actual&&<span style={s.fb}>✅ Final</span>}
          {!actual&&pred.home!==""&&pred.away!==""&&preds[m.id]&&preds[m.id].home===pred.home&&preds[m.id].away===pred.away&&<span style={{fontSize:9,fontWeight:700,background:"rgba(39,174,96,0.15)",color:"#27ae60",padding:"2px 6px",borderRadius:4}}>✅ Saved</span>}
        </div>
        <div style={s.mr}>
          <span style={s.tn}>{m.home}</span>
          <div style={s.sb}>
            <input style={{...s.si,...(lk?s.sl:{})}} value={pred.home===undefined?"":pred.home} onChange={e=>handlePredChange(m.id,"home",e.target.value)} placeholder="–" maxLength={2} inputMode="numeric" pattern="[0-9]*" type="tel" disabled={lk}/>
            <span style={s.col}>:</span>
            <input style={{...s.si,...(lk?s.sl:{})}} value={pred.away===undefined?"":pred.away} onChange={e=>handlePredChange(m.id,"away",e.target.value)} placeholder="–" maxLength={2} inputMode="numeric" pattern="[0-9]*" type="tel" disabled={lk}/>
          </div>
          <span style={{...s.tn,textAlign:"right"}}>{m.away}</span>
        </div>
        {!lk&&pred.home!==""&&pred.away!==""&&<div style={{marginTop:6}}>
          <button
            onMouseDown={e=>{e.preventDefault();handlePredBlur(m.id);toast2("✅ Prediction saved!");}}
            style={{background:"linear-gradient(135deg,rgba(39,174,96,0.2),rgba(39,174,96,0.1))",border:"1px solid rgba(39,174,96,0.5)",borderRadius:7,padding:"6px 16px",color:"#27ae60",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",letterSpacing:1,textTransform:"uppercase",touchAction:"manipulation"}}>
            💾 Save Prediction
          </button>
        </div>}
        {actual&&<div style={s.rr}><span style={s.rt}>Result: {actual.home}–{actual.away}</span><span style={{...s.pp,background:pts===5?"#27ae60":pts>=1?"#e67e22":"#c0392b"}}>{isJ?`🃏 ${pts*2}pts`:`${pts}pts`}</span></div>}
        {!lk&&<div style={s.ac}>{!slotUsed&&<button style={s.jb} onClick={()=>saveJoker(m)}>🃏 Play {JOKER_LABELS[slot]} Joker</button>}{isJ&&<div style={{display:'flex',alignItems:'center',gap:8}}><span style={s.ja}>🃏 JOKER ACTIVE — 2×</span><button style={{background:'rgba(231,76,60,0.12)',border:'1px solid rgba(231,76,60,0.4)',borderRadius:5,padding:'3px 9px',color:'#e74c3c',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>removeJoker(m)}>✕ Remove</button></div>}{slotUsed&&!isJ&&<span style={{fontSize:9,color:'#4a5568',letterSpacing:1}}>🃏 {JOKER_LABELS[slot]} joker already used on another match</span>}</div>}
      </div>
    );
  };

  // ── HOME ──────────────────────────────────────────────────────
  if(view==="home") return(
    <div style={s.root}><Bg/>
    <div style={s.wrap}>
      <div style={s.imgBanner}>
        <img src={WC_IMG} style={{width:"100%",height:"auto",display:"block"}} alt="World Cup"/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(to bottom,rgba(10,22,40,0) 0%,rgba(10,22,40,0.7) 50%,rgba(10,22,40,1) 100%)"}}/>
      </div>
      <h1 style={s.title}>VVD Ate A<span style={s.acc}> Dry Pickford</span></h1>
      <p style={s.sub}>A Scoreline Prediction Game</p>
      <p style={s.cred}>created by master g</p>
      <div style={s.card}>
        {playerId ? (
          // Already registered — show locked name
          <>
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{fontSize:11,letterSpacing:3,color:"#7f8c9a",textTransform:"uppercase",marginBottom:6}}>REGISTERED AS</div>
              <div style={{fontSize:26,fontWeight:900,color:"#f1c40f",letterSpacing:1}}>{name}</div>
              <div style={{fontSize:10,color:"#27ae60",marginTop:4,letterSpacing:1}}>✅ Your name is locked to this device</div>
            </div>
            <label style={s.lbl}>YOUR TIME ZONE</label>
            <div style={s.tzrow}>{TZ.map(t=>(<button key={t.key} style={{...s.tzb,...(tz===t.key?s.tzba:{})}} onClick={()=>setTz(t.key)}>{t.label}</button>))}</div>
            <button style={s.btn} onClick={()=>{localStorage.setItem("vvd_tz",tz);setView("predict");toast2(`Welcome back, ${name}! 🎉`);}}>🔗 Enter My Group</button>
            <button style={{...s.btn2,fontSize:11,opacity:0.6}} onClick={()=>{if(window.confirm("This will remove your name and all predictions from this device. Are you sure?")){{localStorage.clear();setName("");setPlayerId("");setPreds({});setLocalPreds({});setJoker(null);toast2("Cleared");}}}}>🗑 Remove this device registration</button>
          </>
        ) : (
          // Not registered yet — show name input
          <>
            <label style={s.lbl}>CHOOSE YOUR NAME</label>
            <input style={s.inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleJoin()}/>
            <div style={{fontSize:10,color:"#e67e22",letterSpacing:0.5}}>⚠️ Choose carefully — your name will be locked to this device once you join</div>
            <label style={s.lbl}>YOUR TIME ZONE</label>
            <div style={s.tzrow}>{TZ.map(t=>(<button key={t.key} style={{...s.tzb,...(tz===t.key?s.tzba:{})}} onClick={()=>setTz(t.key)}>{t.label}</button>))}</div>
            <button style={s.btn} onClick={handleJoin} disabled={saving}>{saving?"Joining...":"🔗 Join My Group"}</button>
          </>
        )}
      </div>
      <p style={s.status}>{fbReady?"🟢 Connected to live server":"🟡 Connecting..."}</p>
      <p style={s.hint}>Exact score = 5pts · Correct result = 3pts · Joker = 2× · 48 teams · 12 groups</p>
    </div>
    {toast&&<Toast t={toast}/>}
    </div>
  );

  // ── PREDICT ───────────────────────────────────────────────────
  if(view==="predict"){
    const isKO=tab==="KO", isToday=tab==="TODAY";
    const todayMs=MATCHES_DATA.filter(m=>{
      const zone=TZ_ZONES[tz];
      const ls=new Intl.DateTimeFormat("en-CA",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(m.utc));
      const ts=new Intl.DateTimeFormat("en-CA",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      return ls===ts;
    });
    const ms=isToday?todayMs:isKO?MATCHES_DATA.filter(m=>!m.group):MATCHES_DATA.filter(m=>m.group===tab);
    const rounds={};ms.forEach(m=>{if(!rounds[m.round])rounds[m.round]=[];rounds[m.round].push(m);});
    return(
      <div style={s.root}><Bg/>
      {toast&&<Toast t={toast}/>}
      <div style={s.hdr}>
        <div><div style={s.htitle}>VVD ATE A DRY PICKFORD ⚽</div><div style={s.hsub}>{name} · {TZ.find(t=>t.key===tz)?.label} · <span style={{color:"#e74c3c"}}>🔴 Live</span></div></div>
        <div style={{display:"flex",gap:5}}>
          <button style={s.nb} onClick={()=>setView("leaderboard")}>🏅 {getBoard().length}</button>
          <button style={s.nb} onClick={()=>setView("home")}>🏠</button>
          <button style={s.nb} onClick={()=>setView("admin")}>⚙️</button>

        </div>
      </div>
      <div style={s.pts}><span style={s.pn}>{myPts}</span><span style={s.pt}>MY POINTS</span><span style={s.jt}>🃏 {Object.values(joker||{}).filter(Boolean).length}/4 Jokers</span></div>
      <div style={s.tzbar}><span style={s.tzbl}>Times:</span>{TZ.map(t=>(<button key={t.key} style={{...s.tzm,...(tz===t.key?s.tzma:{})}} onClick={()=>setTz(t.key)}>{t.label}</button>))}</div>
      <div style={s.tabs}>
        <button style={{...s.tab,...(tab==="TODAY"?s.todaytab:{})}} onClick={()=>setTab("TODAY")}>📅 Today{todayMs.length>0?` (${todayMs.length})`:""}</button>
        {[...GROUPS,"KO"].map(t=>(<button key={t} style={{...s.tab,...(tab===t?s.taba:{})}} onClick={()=>setTab(t)}>{t==="KO"?"⚡KO":`Grp ${t}`}</button>))}
      </div>
      <div style={s.ml}>
        {isToday&&todayMs.length===0&&(<div style={{textAlign:"center",padding:"40px 20px",color:"#7f8c9a"}}><div style={{fontSize:36,marginBottom:10}}>📭</div><div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:5}}>No matches today</div><div style={{fontSize:12}}>Check the group tabs for upcoming fixtures</div></div>)}
        {Object.entries(rounds).map(([round,rm])=>(
          <div key={round}>
            <div style={s.rh}>{isToday?`TODAY · ${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}`:round}</div>
            {rm.map(m=><MatchCard key={m.id} m={m} isToday={isToday} onTabChange={t=>{setTab(t);}}/>)}
          </div>
        ))}
      </div>
      </div>
    );
  }

  // ── LEADERBOARD ───────────────────────────────────────────────
  if(view==="leaderboard"){
    const ROUND_FILTERS=[
      {key:"all",    label:"🏆 All Rounds"},
      {key:"Round 1",       label:"Round 1"},
      {key:"Round 2",       label:"Round 2"},
      {key:"Round 3",       label:"Round 3"},
      {key:"Round of 32",   label:"Round of 32"},
      {key:"Round of 16",   label:"Round of 16"},
      {key:"Quarter Final", label:"Quarter Finals"},
      {key:"Semi Final",    label:"Semi Finals"},
      {key:"3rd Place",     label:"3rd Place"},
      {key:"🏆 Final",      label:"🏆 Final"},
    ];

    const filteredMatches = lbRound==="all"
      ? MATCHES_DATA
      : MATCHES_DATA.filter(m=>m.round===lbRound);

    let ranked=[];
    try{
      ranked=Object.entries(allPlayers).map(([id,p])=>{
        if(!p) return {id,name:id,pts:0,isMe:id===playerId};
        let pts=0;
        if(p.predictions){
          Object.entries(p.predictions).forEach(([mid,pred])=>{
            try{
              const m=filteredMatches.find(x=>String(x.id)===String(mid));
              if(!m) return;
              const a=results[String(mid)]||results[Number(mid)];if(!a||!pred)return;
              let pt=calcPoints(pred,a);
              const jk=p.jokerUsed;
              if(jk){
                const sl=getJokerSlot(m);
                if(typeof jk==='object'?String(jk[sl])===String(mid):String(jk)===String(mid))pt*=2;
              }
              pts+=pt;
            }catch(e){}
          });
        }
        return{id,name:p.name||id,pts,isMe:id===playerId};
      }).sort((a,b)=>b.pts-a.pts).map((p,i)=>({...p,rank:i+1}));
    }catch(e){console.error(e);}

    const activeFilter=ROUND_FILTERS.find(f=>f.key===lbRound)||ROUND_FILTERS[0];

    return(
      <div style={{background:"#0a1628",minHeight:"100vh",fontFamily:"'Barlow Condensed',sans-serif",color:"#fff",position:"relative",overflow:"hidden"}}>
        <Bg/>
        {toast&&<Toast t={toast}/>}
        <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(10,22,40,0.97)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:3,color:"#f1c40f"}}>🏅 LEADERBOARD</div>
          <button style={s.nb} onClick={()=>setView("predict")}>⬅ Back</button>
        </div>

        {/* Round filter dropdown */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"relative",zIndex:5}}>
          <div style={{position:"relative",display:"inline-block",width:"100%"}}>
            <select
              value={lbRound}
              onChange={e=>setLbRound(e.target.value)}
              style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(241,196,15,0.3)",borderRadius:8,color:"#f1c40f",fontSize:13,fontWeight:700,fontFamily:"inherit",cursor:"pointer",appearance:"none",WebkitAppearance:"none",outline:"none"}}>
              {ROUND_FILTERS.map(f=>(
                <option key={f.key} value={f.key} style={{background:"#0a1628",color:"#fff"}}>{f.label}</option>
              ))}
            </select>
            <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#f1c40f",pointerEvents:"none",fontSize:12}}>▼</div>
          </div>
        </div>

        <div style={{padding:"14px 14px 80px",position:"relative",zIndex:1}}>
          <div style={{fontSize:12,color:"#7f8c9a",marginBottom:14}}>
            {ranked.length} player{ranked.length!==1?"s":""} · {lbRound==="all"?Object.keys(results).length+" results":filteredMatches.filter(m=>results[m.id]).length+"/"+filteredMatches.length+" results"} in · {fbReady?"🔴 Live":"🟡 Connecting..."}
          </div>
          {ranked.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#7f8c9a"}}><div style={{fontSize:36,marginBottom:10}}>👥</div><div style={{color:"#fff",fontSize:14}}>No players yet</div></div>}
          {ranked.map(p=>(
            <div key={p.id} style={{background:p.isMe?"rgba(241,196,15,0.06)":"rgba(255,255,255,0.04)",border:p.isMe?"1px solid rgba(241,196,15,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:7}}>
              <div style={{fontSize:22,width:34,textAlign:"center"}}>{p.rank===1?"🥇":p.rank===2?"🥈":p.rank===3?"🥉":`#${p.rank}`}</div>
              <div style={{flex:1,fontSize:17,fontWeight:700,color:"#fff"}}>{p.name}{p.isMe?" (You)":""}</div>
              <div style={{fontSize:26,fontWeight:900,color:"#f1c40f"}}>{p.pts}<span style={{fontSize:12,color:"#7f8c9a",fontWeight:400}}> pts</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

    if(view==="admin"){
    if(!auth) return(
      <div style={s.root}><Bg/>
      <div style={{...s.wrap,paddingTop:60}}>
        <div style={{fontSize:44,marginBottom:14}}>🔐</div>
        <h2 style={{...s.title,fontSize:20,marginBottom:20}}>ADMIN <span style={s.acc}>PANEL</span></h2>
        <div style={{...s.card,maxWidth:320}}>
          <label style={s.lbl}>ADMIN PIN</label>
          <input style={{...s.inp,letterSpacing:4,textAlign:"center"}} type="password" placeholder="••••••" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pin===ADMIN_PIN?setAuth(true):toast2("Wrong PIN!","error"))}/>
          <button style={s.btn} onClick={()=>pin===ADMIN_PIN?setAuth(true):toast2("Wrong PIN!","error")}>Enter</button>
          <button style={s.btn2} onClick={()=>setView("predict")}>⬅ Back</button>
        </div>
      </div>
      {toast&&<Toast t={toast}/>}
      </div>
    );
    const isKO=atab==="KO";
    const am=isKO?MATCHES_DATA.filter(m=>!m.group):MATCHES_DATA.filter(m=>m.group===atab);
    const rounds={};am.forEach(m=>{if(!rounds[m.round])rounds[m.round]=[];rounds[m.round].push(m);});
    const saveResult=async(matchId)=>{
      const inp=ainputs[matchId];
      if(!inp||inp.home===""||inp.away==="")return toast2("Enter both scores!","error");
      await set(ref(db,`results/${matchId}`),{home:inp.home,away:inp.away});
      toast2("✅ Result saved — leaderboard updated live!");
    };
    const clearResult=async(matchId)=>{
      await set(ref(db,`results/${matchId}`),null);
      setAinputs(a=>{const n={...a};delete n[matchId];return n;});
      toast2("Result cleared");
    };
    return(
      <div style={s.root}><Bg/>
      {toast&&<Toast t={toast}/>}
      <div style={s.hdr}><div style={s.htitle}>⚙️ ADMIN</div><button style={s.nb} onClick={()=>setView("predict")}>⬅ Back</button></div>

      {/* Admin sub-tabs */}
      <div style={{display:"flex",borderBottom:"2px solid rgba(241,196,15,0.3)",background:"rgba(10,22,40,0.8)"}}>
        <button style={{flex:1,padding:"11px",background:"none",border:"none",color:adminSection==="results"?"#f1c40f":"#7f8c9a",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",borderBottom:adminSection==="results"?"3px solid #f1c40f":"none",textTransform:"uppercase",letterSpacing:1}} onClick={()=>setAdminSection("results")}>📋 Results</button>
        <button style={{flex:1,padding:"11px",background:"none",border:"none",color:adminSection==="players"?"#e74c3c":"#7f8c9a",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",borderBottom:adminSection==="players"?"3px solid #e74c3c":"none",textTransform:"uppercase",letterSpacing:1}} onClick={()=>setAdminSection("players")}>👥 Players</button>
      </div>

      {adminSection==="players"&&(
        <div style={{padding:"12px 12px 80px"}}>
          <div style={{fontSize:10,color:"#7f8c9a",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Registered Players — tap to delete</div>
          {Object.entries(allPlayers).map(([id,player])=>(
            <div key={id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{player.name||id}</div>
                <div style={{fontSize:10,color:"#7f8c9a",marginTop:2}}>{id} · {player.tz||"?"}</div>
              </div>
              <button style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.4)",borderRadius:7,padding:"7px 12px",color:"#e74c3c",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
                onClick={async()=>{
                  if(window.confirm(`Delete ${player.name||id}? This removes all their predictions.`)){
                    await set(ref(db,`players/${id}`),null);
                    toast2(`${player.name||id} removed`);
                  }
                }}>🗑 Delete</button>
            </div>
          ))}
          {Object.keys(allPlayers).length===0&&<div style={{textAlign:"center",color:"#7f8c9a",padding:"30px"}}>No players registered yet</div>}
        </div>
      )}

      {adminSection==="results"&&<>
      <div style={s.tabs}>{[...GROUPS,"KO"].map(t=>(<button key={t} style={{...s.tab,...(atab===t?s.taba:{})}} onClick={()=>setAtab(t)}>{t==="KO"?"⚡KO":`Grp ${t}`}</button>))}</div>
      <div style={s.ml}>{Object.entries(rounds).map(([round,rm])=>(
        <div key={round}><div style={s.rh}>{round}</div>
        {rm.map(m=>{
          const ex=results[m.id];
          const inp=ainputs[m.id]||{home:ex?.home||"",away:ex?.away||""};
          return(
            <div key={m.id} style={{...s.mc,...(ex?{border:"1px solid rgba(39,174,96,0.4)",background:"rgba(39,174,96,0.05)"}:{})}}>
              <div style={s.mm}><span style={s.db}>📅 {getDateLabel(m.utc,"ET")} · ⏱ {formatKickoff(m.utc,"ET")}</span>{ex&&<span style={s.fb}>✅ {ex.home}–{ex.away}</span>}</div>
              <div style={s.mr}>
                <span style={{...s.tn,fontSize:11}}>{m.home}</span>
                <div style={s.sb}>
                  <input style={s.si} value={inp.home} onChange={e=>setAinputs(a=>({...a,[m.id]:{...inp,home:e.target.value}}))} placeholder="–" maxLength={2} inputMode="numeric" pattern="[0-9]*"/>
                  <span style={s.col}>:</span>
                  <input style={s.si} value={inp.away} onChange={e=>setAinputs(a=>({...a,[m.id]:{...inp,away:e.target.value}}))} placeholder="–" maxLength={2} inputMode="numeric" pattern="[0-9]*"/>
                </div>
                <span style={{...s.tn,textAlign:"right",fontSize:11}}>{m.away}</span>
              </div>
              <div style={{display:"flex",gap:7,marginTop:7}}>
                <button style={s.sv} onClick={()=>saveResult(m.id)}>💾 Save Result</button>
                {ex&&<button style={s.cl} onClick={()=>clearResult(m.id)}>✕</button>}
              </div>
            </div>
          );
        })}
        </div>
      ))}</div>
      </>}
      </div>
    );
  }
}
