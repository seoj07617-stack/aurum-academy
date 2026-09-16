/* ============================================================
   ui.js — 视觉组件：图标 / 环形进度 / 数字滚动 / 提示 / 撒花 / 金句
   ============================================================ */
"use strict";
const _svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS = {
  home:   _svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M9.5 21v-6h5v6"/>'),
  map:    _svg('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>'),
  zap:    _svg('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>'),
  book:   _svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  chart:  _svg('<path d="M3 3v18h18"/><path d="M7.5 14v3M12 9.5V17M16.5 12v5"/>'),
  shield: _svg('<path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3z"/><path d="m9 12 2 2 4-4.5"/>'),
  flame:  _svg('<path d="M12 2.5c.8 3.4 4.6 4.6 4.6 9a4.6 4.6 0 0 1-9.2 0c0-2.4 1.6-3.5 1.6-6 1.2.9 2.4 1 3-3z"/>'),
  lock:   _svg('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  check:  _svg('<path d="m4.5 12.5 5 5L20 6.5"/>'),
  x:      _svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  chevR:  _svg('<path d="m9 5.5 6.5 6.5L9 18.5"/>'),
  chevL:  _svg('<path d="M15 5.5 8.5 12l6.5 6.5"/>'),
  award:  _svg('<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.5-1.8 8 5.2-3 5.2 3-1.8-8"/>'),
  target: _svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
  clock:  _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>'),
  refresh:_svg('<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>'),
  brain:  _svg('<path d="M12 4a4 4 0 0 0-4 4 3.2 3.2 0 0 0 0 6.4V16a4 4 0 0 0 8 0v-1.6a3.2 3.2 0 0 0 0-6.4 4 4 0 0 0-4-4z"/><path d="M12 4v16"/>'),
  edit:   _svg('<path d="m4 20 .8-3.8L16.2 4.8a2 2 0 0 1 3 3L7.8 19.2 4 20z"/>'),
  trash:  _svg('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
  star:   _svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.2-5.4-2.9L6.6 20l1-6.2L3.2 9.5l6.1-.9L12 3z"/>'),
  scale:  _svg('<path d="M12 3v18M7 21h10M3 8l4-2 4 2M13 8l4-2 4 2"/><path d="M3 8c0 1.8 1.8 3.2 4 3.2S11 9.8 11 8M13 8c0 1.8 1.8 3.2 4 3.2s4-1.4 4-3.2"/>'),
  globe:  _svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>'),
  layers: _svg('<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3.5 12.5 8.5 4.7 8.5-4.7M3.5 16.5 12 21.2l8.5-4.7"/>'),
  trend:  _svg('<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  coins:  _svg('<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M3 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3"/><path d="M15 9c3.3 0 6 1.3 6 3v5c0 1.7-2.7 3-6 3-2 0-3.8-.5-4.9-1.3"/>'),
  moon:   _svg('<path d="M20.4 14.2A8.3 8.3 0 0 1 9.8 3.6 8.3 8.3 0 1 0 20.4 14.2z"/>'),
  sun:    _svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/>'),
  search: _svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>')
};
const icon = (n, cls="") => `<span class="ic ${cls}">${ICONS[n]||""}</span>`;

/* SVG 渐变定义（页面顶部注入一次） */
const GOLD_DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gold-grad-def" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#8C6D2F"/><stop offset="50%" stop-color="#C9A227"/><stop offset="100%" stop-color="#E5CE8A"/>
</linearGradient>
<radialGradient id="coinFace" cx="36%" cy="30%" r="92%">
<stop offset="0%" stop-color="#FDFAF0"/><stop offset="16%" stop-color="#F8ECBF"/>
<stop offset="55%" stop-color="#E3C167"/><stop offset="88%" stop-color="#C89F35"/>
<stop offset="100%" stop-color="#A57F22"/>
</radialGradient>
<linearGradient id="coinEdge" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#8C6D2F"/><stop offset="50%" stop-color="#EED9A0"/><stop offset="100%" stop-color="#8C6D2F"/>
</linearGradient>
</defs></svg>`;

/* 铜钱徽标 V6·珠圈光芒版：外圈珍珠点环 + 内圈太阳芒纹（自方孔放射） */
const COIN_RAYS = (() => {
  let s = "";
  for(let i = 0; i < 48; i++){
    const a = (i / 48) * Math.PI * 2 + 0.065;
    const long = i % 4 === 0;                      // 每四条一长芒，其余短芒
    const r1 = long ? 12.4 : 14.2, r2 = long ? 19.6 : 18.2;
    const x1 = (32 + r1 * Math.cos(a)).toFixed(2), y1 = (32 + r1 * Math.sin(a)).toFixed(2);
    const x2 = (32 + r2 * Math.cos(a)).toFixed(2), y2 = (32 + r2 * Math.sin(a)).toFixed(2);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7A5A16" stroke-opacity=".4" stroke-width="${long ? 1 : .8}"/>`;
  }
  return s;
})();
const COIN_PEARLS = (() => {
  let s = "";
  for(let i = 0; i < 40; i++){
    const a = (i / 40) * Math.PI * 2;
    const x = (32 + 23.8 * Math.cos(a)).toFixed(2), y = (32 + 23.8 * Math.sin(a)).toFixed(2);
    s += `<circle cx="${x}" cy="${y}" r=".95" fill="#7A5A16" fill-opacity=".52"/>`;
  }
  return s;
})();
const COIN_EMBLEM = `<svg viewBox="0 0 64 64" aria-hidden="true">
<circle cx="32" cy="32" r="30" fill="url(#coinFace)" stroke="url(#coinEdge)" stroke-width="2.2"/>
<circle cx="32" cy="32" r="27.6" fill="none" stroke="#FFF9E6" stroke-opacity=".6" stroke-width="1.2"/>
<circle cx="32" cy="32" r="26.3" fill="none" stroke="#7A5A16" stroke-opacity=".5" stroke-width="1.1"/>
${COIN_PEARLS}
<circle cx="32" cy="32" r="21.2" fill="none" stroke="#FFF6DC" stroke-opacity=".45" stroke-width="1"/>
<circle cx="32" cy="32" r="20.2" fill="none" stroke="#7A5A16" stroke-opacity=".38" stroke-width=".9"/>
${COIN_RAYS}
<rect x="24.5" y="24.5" width="15" height="15" fill="rgba(88,64,14,.16)" stroke="#7A5A16" stroke-width="2.1"/>
<path d="M25.4 38.6V25.4h13.2" fill="none" stroke="rgba(255,249,226,.85)" stroke-width="1.2" stroke-linecap="round"/>
<path d="M38.6 25.4v13.2H25.4" fill="none" stroke="rgba(78,56,10,.5)" stroke-width="1.2" stroke-linecap="round"/>
<path d="M13.5 24.5A20.5 20.5 0 0 1 24.5 13.5" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="2.2" stroke-linecap="round"/>
<path d="M50.5 39.5A20.5 20.5 0 0 1 39.5 50.5" fill="none" stroke="rgba(96,70,14,.28)" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="20.5" cy="18.5" r="1.5" fill="rgba(255,255,255,.9)"/>
<g class="coin-shine">
<path d="M32 7A25 25 0 0 1 57 32" fill="none" stroke="rgba(255,251,235,.85)" stroke-width="5" stroke-linecap="round"/>
</g>
</svg>`;
function coinEmblem(){ return COIN_EMBLEM; }

/* 环形进度（铜钱形 V3「花穿」：方孔转 45° 成菱孔——古钱真实铸法变体，
   四角收圆、顶点外缀钱印点，数字居菱心（水平中线最宽处）） */
function ring(pct, size=110, label="", sub="", sw=9){
  const r = (size - sw)/2, c = 2*Math.PI*r;
  const off = c * (1 - Math.max(0, Math.min(1, pct/100)));
  const cx = size/2;
  const hs = Math.round(size * 0.21);              /* 菱孔半边（转45°后对角线=hs*2.83） */
  const side = hs * 2;
  const fs = Math.max(14, Math.round(size * 0.19));
  const dot = Math.max(1.1, size * 0.012);
  const dp = hs * 1.52;                            /* 钱印点：菱形四顶点外侧 */
  const pts = [[cx+dp,cx],[cx-dp,cx],[cx,cx+dp],[cx,cx-dp]].map(p =>
    `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${dot}" fill="#A8842C" fill-opacity=".5"/>`).join("");
  return `
  <div class="ring-block">
    <div class="ring-wrap" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle class="ring-track" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke-width="${sw}"/>
        <circle class="ring-val" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke-width="${sw}"
          stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/>
        <circle cx="${cx}" cy="${cx}" r="${r - sw*0.85}" fill="none" stroke="#A8842C" stroke-opacity=".14" stroke-width="1"/>
        <rect class="ring-hole" x="${cx-hs}" y="${cx-hs}" width="${side}" height="${side}"
          rx="${(hs*0.32).toFixed(1)}" fill="none" stroke="url(#gold-grad-def)" stroke-width="1.6"
          transform="rotate(45 ${cx} ${cx})"/>
        ${pts}
      </svg>
      <div class="ring-num" style="font-size:${fs}px"><b class="countup" data-to="${Math.round(pct)}">0</b></div>
    </div>
    <div class="ring-cap"><span>${label}</span>${sub?`<em>${sub}</em>`:""}</div>
  </div>`;
}
function mountAnimations(root=document){
  $$(".ring-val", root).forEach(el => requestAnimationFrame(()=>
    requestAnimationFrame(()=> el.style.strokeDashoffset = el.dataset.off )));
  $$(".countup", root).forEach(el => {
    const to = +el.dataset.to || 0, dur = 950, t0 = performance.now();
    const step = t => { const p = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-p,3);
      el.textContent = Math.round(to*e); if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  $$(".bar>i", root).forEach(el => { const w = el.dataset.w;
    el.style.width = "0%"; requestAnimationFrame(()=>requestAnimationFrame(()=> el.style.width = w+"%")); });
}

/* Toast */
function toast(msg, type=""){
  const host = $("#toasts"); if(!host) return;
  const t = document.createElement("div");
  t.className = "toast "+type;
  t.innerHTML = `${icon(type==="gold"?"star":"check")}<span>${msg}</span>`;
  host.appendChild(t);
  setTimeout(()=>{ t.style.transition="all .5s"; t.style.opacity="0"; t.style.transform="translateY(10px)";
    setTimeout(()=>t.remove(), 520); }, 2600);
}
const UI = { toast };

/* 撒铜钱（庆祝）：evenodd 路径镂出真实方孔 */
function confetti(n=26){
  const colors = ["#C9A227","#E5CE8A","#A8842C","#F2E3B3"];
  for(let i=0;i<n;i++){
    const d = document.createElement("i");
    const sz = 7 + Math.random()*8;
    d.style.cssText = `position:fixed;z-index:300;top:-4vh;left:${Math.random()*100}vw;width:${sz}px;height:${sz}px;
      pointer-events:none;display:block;
      animation:fallDown ${1.6+Math.random()*1.8}s ${Math.random()*.7}s cubic-bezier(.3,.4,.6,1) forwards`;
    d.innerHTML = `<svg viewBox="0 0 64 64" width="${sz}" height="${sz}">
      <path fill="${colors[i%colors.length]}" fill-opacity=".92" fill-rule="evenodd"
        d="M32 4a28 28 0 1 0 0 56 28 28 0 1 0 0-56ZM24 24h16v16H24Z"/>
      <path d="M12 24A21 21 0 0 1 24 12" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 4600);
  }
}

/* 每日金句（按一年中的第几天轮换） */
const QUOTES = [
  ["风险来自于你不知道自己在做什么。","沃伦 · 巴菲特"],
  ["市场先生每天都在报价，但你可以选择不理他。","本杰明 · 格雷厄姆"],
  ["截断亏损，让利润奔跑。","交易铁律"],
  ["别人贪婪时我恐惧，别人恐惧时我贪婪。","沃伦 · 巴菲特"],
  ["价格是你付出的，价值是你得到的。","沃伦 · 巴菲特"],
  ["重要的不是对错频次，而是对时赚多少、错时亏多少。","乔治 · 索罗斯"],
  ["投资第一原则是不要亏损，第二原则是记住第一条。","沃伦 · 巴菲特"],
  ["市场保持非理性的时间，可能比你保持不破产的时间更长。","约翰 · 梅纳德 · 凯恩斯"],
  ["计划你的交易，交易你的计划。","交易铁律"],
  ["分散化是对无知的保护。","查理 · 芒格"],
  ["慢即是快，少即是多。","投资箴言"],
  ["趋势是你的朋友，直到它拐弯为止。","交易谚语"],
  ["仓位决定心态，止损决定生死。","交易铁律"],
  ["知己知彼，百战不殆。","孙子兵法"],
  ["反者道之动，弱者道之用。","道德经"],
  ["知行合一：未有知而不行者，知而不行只是未知。","王阳明"],
];
function quoteOfToday(){
  const d = new Date();
  const doy = Math.floor((d - new Date(d.getFullYear(),0,0)) / 864e5);
  return QUOTES[doy % QUOTES.length];
}

function greet(){
  const h = new Date().getHours();
  return h<5?"夜深了":h<9?"早上好":h<12?"上午好":h<14?"中午好":h<18?"下午好":h<23?"晚上好":"夜深了";
}
function stageBadge(st){
  const info = stageInfo(st.id);
  const locked = !stageUnlocked(st.id);
  return `<div class="mini-stage" data-go="#/stage/${st.id}">
    <span class="dot" style="background:${st.hue}">${st.cn||"章"}</span>
    <div style="flex:1;min-width:0">
      <div class="between" style="gap:8px"><b style="font-size:13.5px">${st.title}</b>
      <span class="pct num">${locked?"🔒":info.pct+"%"}</span></div>
      <div class="bar thin" style="margin-top:5px"><i data-w="${info.pct}"></i></div>
    </div></div>`;
}
