/* ============================================================
   charts.js — 轻量图表渲染器（纯 SVG，无依赖）
   klineSVG: 蜡烛图（A股惯例红涨绿跌）
   finTable: 简化财报表
   ============================================================ */
"use strict";
function klineSVG(cs, w=360, h=200){
  const pad = 16, cw = (w - 2*pad) / cs.length;
  const his = cs.flatMap(c => [c.h, c.l]);
  const lo = Math.min(...his), hi = Math.max(...his);
  const span = (hi - lo) || 1;
  const Y = v => Math.round((pad + (h - 2*pad) * (1 - (v - lo) / span)) * 10) / 10;
  let s = `<svg viewBox="0 0 ${w} ${h}" class="kchart" role="img" aria-label="K线图">`;
  for(let i = 1; i <= 3; i++){
    const y = Math.round(pad + (h - 2*pad) * i / 4);
    s += `<line class="kgrid" x1="${pad}" x2="${w-pad}" y1="${y}" y2="${y}"/>`;
  }
  cs.forEach((c, i) => {
    const x = Math.round(pad + cw*i + cw/2);
    const up = c.c >= c.o, col = up ? "#B94A40" : "#2A7A68";
    const bw = Math.max(4, Math.round(cw * 0.55));
    const y1 = Y(Math.max(c.o, c.c)), y2 = Y(Math.min(c.o, c.c));
    s += `<line x1="${x}" x2="${x}" y1="${Y(c.h)}" y2="${Y(c.l)}" stroke="${col}" stroke-width="1.5"/>`;
    s += `<rect x="${x - bw/2}" y="${y1}" width="${bw}" height="${Math.max(2, y2 - y1)}" fill="${col}" rx="1"/>`;
  });
  s += `</svg>`;
  return s;
}

function finTable(rows, unit="亿元"){
  return `<div class="fin-t"><table><thead><tr><th>项目</th><th>金额（${unit}）</th></tr></thead>
  <tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td class="num">${esc(String(r[1]))}</td></tr>`).join("")}</tbody></table></div>`;
}
