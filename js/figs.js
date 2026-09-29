/* ============================================================
   figs.js — 课程图解库（SVG 手绘图）
   原则：淡金描边 + 传统色点缀 + 朱砂点睛；每图独立可复用
   数据课内引用：section 加 fig:"fig-xxx"
   ============================================================ */
"use strict";

/* 复利曲线：10 万本金，复利 7% vs 单利 7% vs 余额宝 1.5%，30 年 */
function _compoundPath(rate, years, simple){
  let pts = [];
  for(let y = 0; y <= years; y += 1){
    const v = simple ? 10 * (1 + rate * y) : 10 * Math.pow(1 + rate, y);
    pts.push([y, v]);
  }
  return pts;
}
function _line(pts, x0, y0, w, h, vmax, ymax){
  const X = y => x0 + (y / ymax) * w;
  const Y = v => y0 + h - (v / vmax) * h;
  return pts.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ");
}
(function(){
  const years = 30, ymax = 30, vmax = 80; // 万元
  const g = { x0: 52, y0: 18, w: 600, h: 218 };
  const c1 = _line(_compoundPath(0.07, years, false), g.x0, g.y0, g.w, g.h, vmax, ymax);
  const c2 = _line(_compoundPath(0.07, years, true),  g.x0, g.y0, g.w, g.h, vmax, ymax);
  const c3 = _line(_compoundPath(0.015, years, true), g.x0, g.y0, g.w, g.h, vmax, ymax);
  const yTick = v => (g.y0 + g.h - (v / vmax) * g.h).toFixed(1);
  const xTick = y => (g.x0 + (y / ymax) * g.w).toFixed(1);
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-compound"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="复利与单利对比曲线">
    <g font-family="var(--sans)" font-size="12" fill="#6B6350">
      <text x="14" y="${yTick(80)}">80万</text><text x="14" y="${yTick(60)}">60万</text>
      <text x="14" y="${yTick(40)}">40万</text><text x="14" y="${yTick(20)}">20万</text>
      <text x="${xTick(0)}" y="262">0年</text><text x="${xTick(10)}" y="262">10年</text>
      <text x="${xTick(20)}" y="262">20年</text><text x="${xTick(30)}" y="262">30年</text>
    </g>
    <g stroke="rgba(139,125,94,.25)" stroke-width="1" stroke-dasharray="3 4">
      <line x1="${g.x0}" y1="${yTick(80)}" x2="${g.x0+g.w}" y2="${yTick(80)}"/>
      <line x1="${g.x0}" y1="${yTick(60)}" x2="${g.x0+g.w}" y2="${yTick(60)}"/>
      <line x1="${g.x0}" y1="${yTick(40)}" x2="${g.x0+g.w}" y2="${yTick(40)}"/>
    </g>
    <path d="${c3}" fill="none" stroke="#8B7D5E" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="${c2}" fill="none" stroke="#A68B4A" stroke-width="2.4"/>
    <path d="${c1}" fill="none" stroke="#9E2B22" stroke-width="3"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="475" y="46" fill="#9E2B22" font-weight="700">复利 7%：76万</text>
      <text x="430" y="128" fill="#A68B4A" font-weight="600">单利 7%：31万</text>
      <text x="330" y="228" fill="#8B7D5E">活期 1.5%：14万</text>
      <text x="70" y="140" fill="#4A4438" font-style="italic">前十年几乎贴地——大多数人放弃在这里</text>
      <path d="M255,132 C310,110 380,78 465,56" fill="none" stroke="#C9A227" stroke-width="1.4" stroke-dasharray="4 3"/>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="${g.x0}" y="284">本金 10 万 · 年化 7% · 三十年三兄弟</text>
    </g>
  </svg>`;
})();

/* 波动损耗：先 +50% 再 -50% 的锯齿 vs 稳稳的 +10% */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-geo"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="波动损耗对比">
    <g stroke="rgba(139,125,94,.3)" stroke-width="1" stroke-dasharray="3 4">
      <line x1="70" y1="240" x2="640" y2="240"/><line x1="70" y1="150" x2="640" y2="150"/><line x1="70" y1="60" x2="640" y2="60"/>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#6B6350">
      <text x="16" y="244">100万</text><text x="16" y="154">125万</text><text x="16" y="64">150万</text>
    </g>
    <path d="M70,240 L230,60 L400,240" fill="none" stroke="#9E2B22" stroke-width="3" stroke-linejoin="round"/>
    <path d="M430,240 L590,150" fill="none" stroke="#5FBF9A" stroke-width="3"/>
    <g font-family="var(--sans)" font-size="13">
      <text x="150" y="42" fill="#9E2B22" font-weight="700">+50% 冲到 150万</text>
      <text x="300" y="270" fill="#9E2B22" font-weight="700">-50% 跌回 75万（亏 25%）</text>
      <text x="500" y="130" fill="#3F8F72" font-weight="700">稳 +10%：121万</text>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="70" y="292">过山车两年 = 白坐，还倒贴；慢慢走反而先到。</text>
    </g>
  </svg>`;
})();

/* 风险收益阶梯：从国债到股票的风险工资 */
(function(){
  window.FIGS = window.FIGS || {};
  const steps = [
    { x: 60,  w: 90,  y: 210, t: "国债", r: "约 2.5%", c: "#8B7D5E" },
    { x: 180, w: 90,  y: 182, t: "存款", r: "约 3%",   c: "#A68B4A" },
    { x: 300, w: 90,  y: 148, t: "债券基金", r: "约 4.5%", c: "#B8933B" },
    { x: 420, w: 100, y: 96,  t: "股票指数", r: "约 8~10%", c: "#C9A227" },
  ];
  window.FIGS["fig-rr"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="风险收益阶梯">
    <g stroke="rgba(139,125,94,.35)" stroke-width="1">
      <line x1="40" y1="238" x2="660" y2="238"/>
    </g>
    ${steps.map(s=>`
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${238-s.y}" rx="6" fill="${s.c}" opacity=".18"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${238-s.y}" rx="6" fill="none" stroke="${s.c}" stroke-width="1.6"/>
    <text x="${s.x+s.w/2}" y="${s.y+22}" text-anchor="middle" font-family="var(--sans)" font-size="13.5" font-weight="700" fill="#4A4438">${s.t}</text>
    <text x="${s.x+s.w/2}" y="${s.y+40}" text-anchor="middle" font-family="var(--sans)" font-size="12.5" fill="${s.c}">${s.r}</text>`).join("")}
    <g font-family="var(--sans)" font-size="12.5" fill="#9E2B22" font-weight="600">
      <text x="545" y="80">越往右，风险工资越高——</text>
      <text x="545" y="98">但「工资」要用波动和心跳来挣</text>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="40" y="264">横着走：风险从左到右升高（长期持有的口径）</text>
      <text x="40" y="286">竖着看：年化收益随之抬高。谁承诺右边的收益、左边的风险，谁就是骗子</text>
    </g>
  </svg>`;
})();

/* 七亏二平一赚（HTML 全宽条形：比例真实、窄屏零横滑、文字完整） */
(function(){
  window.FIGS = window.FIGS || {};
  const rows721 = [
    { pct: 100, t: "七 亏 · 70%", d: "追涨杀跌 · 重仓押注 · 不设止损", c: "#9E2B22", f: "rgba(158,43,34,.14)" },
    { pct: 28.6, t: "二 平 · 20%", d: "拿不住 · 瞎折腾", c: "#8B7D5E", f: "rgba(139,125,94,.16)" },
    { pct: 14.3, t: "一 赚 · 10%", d: "有纪律 · 按计划", c: "#8C6D2F", f: "rgba(201,162,39,.2)" },
  ];
  window.FIGS["fig-721"] =
  `<div class="fig721">
    ${rows721.map(r=>`
    <div class="f721-grp">
      <div class="f721-bar" style="width:${r.pct}%;background:${r.f};border-color:${r.c}">
        <b style="color:${r.c}">${r.t}</b>
      </div>
      <div class="f721-sub">${r.d}</div>
    </div>`).join("")}
    <div class="f721-note">条宽 = 占比。决定你在哪一档的不是智商、不是消息，是动作——第七阶段整章讲纪律。</div>
  </div>`;
})();

/* 直融与间融：村里的钱怎么流动 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-bridge"] =
  `<svg viewBox="0 0 720 260" class="lesson-fig" role="img" aria-label="直接融资与间接融资">
    <defs>
      <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#C9A227"/></marker>
      <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#8B7D5E"/></marker>
    </defs>
    <g font-family="var(--sans)">
      <circle cx="90" cy="120" r="34" fill="rgba(201,162,39,.14)" stroke="#C9A227" stroke-width="2"/>
      <text x="90" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="#8C6D2F">有闲钱的人</text>
      <text x="90" y="133" text-anchor="middle" font-size="10.5" fill="#8C8470">张家有余粮</text>
      <circle cx="630" cy="120" r="34" fill="rgba(158,43,34,.1)" stroke="#9E2B22" stroke-width="2"/>
      <text x="630" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="#9E2B22">要用钱的人</text>
      <text x="630" y="133" text-anchor="middle" font-size="10.5" fill="#8C8470">李家想开铺</text>
      <path d="M132,86 C240,40 480,40 588,86" fill="none" stroke="#C9A227" stroke-width="2.2" marker-end="url(#arrG)"/>
      <text x="360" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#8C6D2F">直接融资：他直接入股（股票）或打欠条（债券）</text>
      <text x="360" y="66" text-anchor="middle" font-size="11.5" fill="#8C8470">赚了分红，亏了自己担——甜蜜与风险都归你</text>
      <path d="M132,150 C220,208 500,208 588,150" fill="none" stroke="#8B7D5E" stroke-width="2.2" stroke-dasharray="6 4" marker-end="url(#arrB)"/>
      <rect x="290" y="176" width="140" height="34" rx="8" fill="rgba(139,125,94,.16)" stroke="#8B7D5E" stroke-width="1.4"/>
      <text x="360" y="198" text-anchor="middle" font-size="12.5" font-weight="700" fill="#6B6350">银行（中间商）</text>
      <text x="360" y="234" text-anchor="middle" font-size="11.5" fill="#8C8470">赚利差、担坏账——你拿稳但薄的利息</text>
    </g>
  </svg>`;
})();

/* 通胀购买力缩水：100 万三十年 */
(function(){
  window.FIGS = window.FIGS || {};
  const bars = [
    { x: 90,  y: "今天", v: 100, h: 150 },
    { x: 240, y: "10年后", v: 74,  h: 111 },
    { x: 390, y: "20年后", v: 55,  h: 82 },
    { x: 540, y: "30年后", v: 41,  h: 61 },
  ];
  window.FIGS["fig-inflation"] =
  `<svg viewBox="0 0 720 260" class="lesson-fig" role="img" aria-label="通胀下购买力缩水">
    <line x1="50" y1="200" x2="680" y2="200" stroke="rgba(139,125,94,.35)" stroke-width="1"/>
    ${bars.map((b,i)=>`
    <rect x="${b.x}" y="${200-b.h}" width="86" height="${b.h}" rx="7"
      fill="${i===0?"rgba(201,162,39,.22)":"rgba(158,43,34,"+(0.08+i*0.06)+")"}"
      stroke="${i===0?"#C9A227":"#9E2B22"}" stroke-width="${i===0?2:1.6}"/>
    <text x="${b.x+43}" y="${196-b.h}" text-anchor="middle" font-family="var(--sans)" font-size="15" font-weight="700" fill="${i===0?"#8C6D2F":"#9E2B22"}">${b.v}万</text>
    <text x="${b.x+43}" y="224" text-anchor="middle" font-family="var(--sans)" font-size="12.5" fill="#6B6350">${b.y}</text>`).join("")}
    <g font-family="var(--sans)" font-size="12.5" fill="#4A4438">
      <text x="90" y="250">100 万存着不动，按 3% 通胀算——数字没少，能买的东西 30 年缩水近六成。通胀是唯一「确定发生」的亏损。</text>
    </g>
  </svg>`;
})();

/* ============ 第二批：宏观 · 市场 · 公司（2026-09-22 全课详细化） ============ */

/* GDP 三驾马车 */
(function(){
  window.FIGS = window.FIGS || {};
  const bars = [
    { x: 120, w: 320, y: 60,  t: "消费", v: "贡献约一半", c: "#C9A227", note: "主力引擎" },
    { x: 120, w: 160, y: 120, t: "投资", v: "约三分之一", c: "#A68B4A", note: "基建 · 地产 · 制造" },
    { x: 120, w: 60,  y: 180, t: "净出口", v: "占比最小", c: "#8B7D5E", note: "外需的脸色" },
  ];
  window.FIGS["fig-gdp-three"] =
  `<svg viewBox="0 0 720 250" class="lesson-fig" role="img" aria-label="GDP 三驾马车">
    <g font-family="var(--sans)">
      ${bars.map(b=>`
      <rect x="${b.x}" y="${b.y}" width="${b.w}" height="40" rx="8" fill="${b.c}" opacity=".2"/>
      <rect x="${b.x}" y="${b.y}" width="${b.w}" height="40" rx="8" fill="none" stroke="${b.c}" stroke-width="1.6"/>
      <text x="${b.x-14}" y="${b.y+25}" text-anchor="end" font-size="14.5" font-weight="700" fill="#4A4438">${b.t}</text>
      <text x="${b.x+16}" y="${b.y+25}" font-size="12.5" fill="#4A4438">${b.v}</text>
      <text x="${b.x+b.w+14}" y="${b.y+25}" font-size="11.5" fill="#8C8470">${b.note}</text>`).join("")}
      <text x="40" y="236" font-size="12.5" fill="#8C8470">GDP = 消费 + 投资 + 净出口。看新闻先问：这招打在哪匹马上？</text>
    </g>
  </svg>`;
})();

/* 经济周期四季波浪 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-cycle-seasons"] =
  `<svg viewBox="0 0 720 260" class="lesson-fig" role="img" aria-label="经济周期四季">
    <path d="M60,190 C110,80 170,80 220,140 C270,200 330,200 380,140 C430,80 490,80 540,140 C590,200 640,190 660,150"
      fill="none" stroke="#C9A227" stroke-width="3"/>
    <g font-family="var(--sans)" font-size="13" font-weight="700">
      <text x="95" y="66" fill="#3F8F72">复苏（春）· 股票</text>
      <text x="250" y="230" fill="#C0392B">过热（夏）· 商品</text>
      <text x="415" y="66" fill="#B0533A">滞胀（秋）· 现金</text>
      <text x="565" y="230" fill="#4A6FA5">衰退（冬）· 债券</text>
    </g>
    <g font-family="var(--sans)" font-size="11.5" fill="#8C8470">
      <text x="60" y="248">经济像四季轮转：增长与通胀两个旋钮的不同组合，决定哪个资产坐在风口——这正是美林时钟的骨架。</text>
    </g>
  </svg>`;
})();

/* CPI-PPI 剪刀差 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-cpi-ppi"] =
  `<svg viewBox="0 0 720 260" class="lesson-fig" role="img" aria-label="CPI 与 PPI 剪刀差">
    <line x1="50" y1="210" x2="680" y2="210" stroke="rgba(139,125,94,.35)"/>
    <path d="M60,190 C140,60 220,60 300,150 C380,220 460,200 540,170 C600,150 650,165 670,175"
      fill="none" stroke="#9E2B22" stroke-width="2.6"/>
    <path d="M60,195 C160,150 260,130 360,160 C460,190 560,180 670,185"
      fill="none" stroke="#C9A227" stroke-width="2.6"/>
    <g font-family="var(--sans)" font-size="13">
      <text x="120" y="52" fill="#9E2B22" font-weight="700">PPI（工厂出厂价）：波动剧烈</text>
      <text x="330" y="140" fill="#8C6D2F" font-weight="700">CPI（消费端物价）：温和黏性</text>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="50" y="240">上游原料涨价先打 PPI，再慢慢传给 CPI。剪刀口张开的方向，就是利润在哪一层被挤压的信号。</text>
    </g>
  </svg>`;
})();

/* 利率传导链 */
(function(){
  window.FIGS = window.FIGS || {};
  const chain = [
    { x: 30,  t: "央行政策利率", s: "7 天逆回购等", c: "#9E2B22" },
    { x: 260, t: "市场利率", s: "LPR · 国债收益率", c: "#C9A227" },
    { x: 490, t: "资产价格", s: "股 · 债 · 房估值", c: "#A68B4A" },
  ];
  window.FIGS["fig-rate-chain"] =
  `<svg viewBox="0 0 720 180" class="lesson-fig" role="img" aria-label="利率传导链">
    <defs><marker id="arrG2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#C9A227"/></marker></defs>
    ${chain.map(b=>`
    <rect x="${b.x}" y="40" width="200" height="56" rx="10" fill="${b.c}" opacity=".14"/>
    <rect x="${b.x}" y="40" width="200" height="56" rx="10" fill="none" stroke="${b.c}" stroke-width="1.8"/>
    <text x="${b.x+100}" y="64" text-anchor="middle" font-family="var(--sans)" font-size="13.5" font-weight="700" fill="#4A4438">${b.t}</text>
    <text x="${b.x+100}" y="84" text-anchor="middle" font-family="var(--sans)" font-size="11" fill="#8C8470">${b.s}</text>`).join("")}
    <line x1="234" y1="68" x2="256" y2="68" stroke="#C9A227" stroke-width="2.4" marker-end="url(#arrG2)"/>
    <line x1="464" y1="68" x2="486" y2="68" stroke="#C9A227" stroke-width="2.4" marker-end="url(#arrG2)"/>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="30" y="140">央行动的是源头：政策利率一动，折现率跟着动——所有资产定价公式的分母同时变化。</text>
      <text x="30" y="164">这就是「美联储打个喷嚏，全球市场都感冒」的力学原理。</text>
    </g>
  </svg>`;
})();

/* 美林时钟四象限 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-clock"] =
  `<svg viewBox="0 0 480 300" class="lesson-fig" role="img" aria-label="美林时钟四象限">
    <g font-family="var(--sans)">
      <circle cx="240" cy="140" r="92" fill="none" stroke="rgba(139,125,94,.35)" stroke-width="1.4"/>
      <line x1="240" y1="48" x2="240" y2="232" stroke="rgba(139,125,94,.3)"/>
      <line x1="148" y1="140" x2="332" y2="140" stroke="rgba(139,125,94,.3)"/>
      <text x="240" y="30" text-anchor="middle" font-size="12.5" fill="#8C8470">通胀 ↓ · 增长 ↑（右半 = 复苏带）</text>
      <text x="240" y="272" text-anchor="middle" font-size="12.5" fill="#8C8470">通胀 ↑ · 增长 ↓（左半 = 滞胀带）</text>
      <rect x="252" y="62" width="64" height="40" rx="8" fill="rgba(63,143,114,.16)" stroke="#3F8F72"/>
      <text x="284" y="80" text-anchor="middle" font-size="12.5" font-weight="700" fill="#3F8F72">复苏</text>
      <text x="284" y="96" text-anchor="middle" font-size="11" fill="#3F8F72">股票</text>
      <rect x="252" y="178" width="64" height="40" rx="8" fill="rgba(192,57,43,.14)" stroke="#C0392B"/>
      <text x="284" y="196" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C0392B">过热</text>
      <text x="284" y="212" text-anchor="middle" font-size="11" fill="#C0392B">商品</text>
      <rect x="164" y="178" width="64" height="40" rx="8" fill="rgba(176,83,58,.14)" stroke="#B0533A"/>
      <text x="196" y="196" text-anchor="middle" font-size="12.5" font-weight="700" fill="#B0533A">滞胀</text>
      <text x="196" y="212" text-anchor="middle" font-size="11" fill="#B0533A">现金</text>
      <rect x="164" y="62" width="64" height="40" rx="8" fill="rgba(74,111,165,.14)" stroke="#4A6FA5"/>
      <text x="196" y="80" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4A6FA5">衰退</text>
      <text x="196" y="96" text-anchor="middle" font-size="11" fill="#4A6FA5">债券</text>
      <path d="M296,74 A80,80 0 0 1 296,206" fill="none" stroke="rgba(201,162,39,.5)" stroke-width="1.6" stroke-dasharray="5 4"/>
      <path d="M184,206 A80,80 0 0 1 184,74" fill="none" stroke="rgba(201,162,39,.5)" stroke-width="1.6" stroke-dasharray="5 4"/>
      <text x="240" y="146" text-anchor="middle" font-size="11.5" fill="#8C6D2F" font-weight="700">顺时针轮动</text>
    </g>
  </svg>`;
})();

/* 一级与二级市场 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-market-layers"] =
  `<svg viewBox="0 0 720 200" class="lesson-fig" role="img" aria-label="一级与二级市场">
    <defs><marker id="arrG3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#A68B4A"/></marker></defs>
    <g font-family="var(--sans)">
      <rect x="40" y="40" width="180" height="52" rx="10" fill="rgba(201,162,39,.14)" stroke="#C9A227" stroke-width="1.8"/>
      <text x="130" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="#8C6D2F">企业（缺钱方）</text>
      <text x="130" y="82" text-anchor="middle" font-size="11" fill="#8C8470">发行新股 = IPO</text>
      <rect x="500" y="40" width="180" height="52" rx="10" fill="rgba(95,191,154,.12)" stroke="#5FBF9A" stroke-width="1.8"/>
      <text x="590" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="#3F8F72">投资者（出钱方）</text>
      <text x="590" y="82" text-anchor="middle" font-size="11" fill="#8C8470">申购 · 认购</text>
      <line x1="228" y1="56" x2="492" y2="56" stroke="#A68B4A" stroke-width="2.2" marker-end="url(#arrG3)"/>
      <text x="360" y="46" text-anchor="middle" font-size="12.5" font-weight="700" fill="#8C6D2F">一级市场：钱进企业，股票出厂</text>
      <line x1="492" y1="88" x2="228" y2="88" stroke="#A68B4A" stroke-width="2.2" stroke-dasharray="6 4" marker-end="url(#arrG3)"/>
      <text x="360" y="110" text-anchor="middle" font-size="12.5" font-weight="700" fill="#6B6350">二级市场：股票在投资者之间转手（你平时炒的）</text>
      <text x="40" y="152" font-size="12" fill="#8C8470">关键区别：一级市场的钱进企业口袋；二级市场只是股票换主人——企业拿不到一分钱。</text>
      <text x="40" y="178" font-size="12" fill="#8C8470">所以打新中签 = 参与一级市场；上市后买卖 = 二级市场博弈。</text>
    </g>
  </svg>`;
})();

/* A 股板块阶梯 */
(function(){
  window.FIGS = window.FIGS || {};
  const steps = [
    { x: 40,  t: "主板", d: "大蓝筹 · 沪深", r: "±10%", c: "#8B7D5E" },
    { x: 210, t: "创业板", d: "成长创新", r: "±20%", c: "#A68B4A" },
    { x: 380, t: "科创板", d: "硬科技", r: "±20%", c: "#B8933B" },
    { x: 550, t: "北交所", d: "专精特新", r: "±30%", c: "#C9A227" },
  ];
  window.FIGS["fig-a-layers"] =
  `<svg viewBox="0 0 720 250" class="lesson-fig" role="img" aria-label="A股多层次板块">
    <g font-family="var(--sans)">
      ${steps.map((s,i)=>`
      <rect x="${s.x}" y="${150-i*36}" width="130" height="${60+i*36-14}" rx="10" fill="${s.c}" opacity=".16"/>
      <rect x="${s.x}" y="${150-i*36}" width="130" height="${60+i*36-14}" rx="10" fill="none" stroke="${s.c}" stroke-width="1.8"/>
      <text x="${s.x+65}" y="${150-i*36+28}" text-anchor="middle" font-size="14" font-weight="700" fill="#4A4438">${s.t}</text>
      <text x="${s.x+65}" y="${150-i*36+48}" text-anchor="middle" font-size="11" fill="#6B6350">${s.d}</text>
      <text x="${s.x+65}" y="${150-i*36+66}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${s.c}">涨跌停 ${s.r}</text>`).join("")}
      <text x="40" y="228" font-size="12" fill="#8C8470">越往右：公司越年轻、波动越大、门槛越高。涨跌幅限制 = 每天的价格天花板与地板。</text>
    </g>
  </svg>`;
})();

/* 期权 vs 期货：线性与非线性 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-option-pnl"] =
  `<svg viewBox="0 0 720 260" class="lesson-fig" role="img" aria-label="期权与期货盈亏结构">
    <line x1="80" y1="130" x2="650" y2="130" stroke="rgba(139,125,94,.4)"/>
    <line x1="300" y1="30" x2="300" y2="230" stroke="rgba(139,125,94,.4)"/>
    <path d="M100,220 L300,130 L560,20" fill="none" stroke="#A68B4A" stroke-width="2.8"/>
    <path d="M100,185 L300,185 L560,45" fill="none" stroke="#9E2B22" stroke-width="2.8"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="420" y="70" fill="#9E2B22" font-weight="700">期权买方：亏损封底（权利金）</text>
      <text x="330" y="210" fill="#A68B4A" font-weight="700">期货：盈亏线性，两头都不封</text>
      <text x="84" y="248" fill="#8C8470">标的下跌</text>
      <text x="570" y="248" fill="#8C8470">标的上涨</text>
      <text x="306" y="46" fill="#8C8470">0</text>
    </g>
  </svg>`;
})();

/* 行业生命周期 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-industry-cycle"] =
  `<svg viewBox="0 0 720 240" class="lesson-fig" role="img" aria-label="行业生命周期">
    <path d="M60,190 C130,185 180,170 230,140 C300,100 360,60 440,48 C510,40 570,52 650,70"
      fill="none" stroke="#C9A227" stroke-width="3"/>
    <path d="M60,210 C160,208 260,200 360,196 C460,192 560,196 650,198"
      fill="none" stroke="#9E2B22" stroke-width="2" stroke-dasharray="6 4"/>
    <g font-family="var(--sans)" font-size="12.5" font-weight="700">
      <text x="70" y="172" fill="#8B7D5E">导入期</text>
      <text x="235" y="120" fill="#A68B4A">成长期</text>
      <text x="425" y="34" fill="#C9A227">成熟期</text>
      <text x="575" y="94" fill="#8C8470">衰退期</text>
    </g>
    <g font-family="var(--sans)" font-size="11" fill="#8C8470">
      <text x="60" y="120">玩家少</text>
      <text x="225" y="88">诸侯混战</text>
      <text x="430" y="66">剩者为王</text>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="60" y="232">实线=行业规模，虚线=利润率。成长期人人赚钱，成熟期只有龙头赚钱——波特五力说的就是这段。</text>
    </g>
  </svg>`;
})();

/* 杜邦分解树 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-dupont"] =
  `<svg viewBox="0 0 720 220" class="lesson-fig" role="img" aria-label="ROE 杜邦分解">
    <g font-family="var(--sans)">
      <rect x="290" y="20" width="140" height="44" rx="10" fill="rgba(201,162,39,.2)" stroke="#C9A227" stroke-width="2"/>
      <text x="360" y="48" text-anchor="middle" font-size="15" font-weight="700" fill="#8C6D2F">ROE 净资产收益率</text>
      <text x="130" y="120" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4A4438">净利率</text>
      <text x="130" y="140" text-anchor="middle" font-size="11" fill="#8C8470">产品有多赚钱</text>
      <text x="360" y="120" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4A4438">资产周转率</text>
      <text x="360" y="140" text-anchor="middle" font-size="11" fill="#8C8470">资产跑得多快</text>
      <text x="590" y="120" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4A4438">权益乘数</text>
      <text x="590" y="140" text-anchor="middle" font-size="11" fill="#8C8470">用了多少杠杆</text>
      <line x1="360" y1="64" x2="130" y2="104" stroke="rgba(139,125,94,.4)"/>
      <line x1="360" y1="64" x2="360" y2="104" stroke="rgba(139,125,94,.4)"/>
      <line x1="360" y1="64" x2="590" y2="104" stroke="rgba(139,125,94,.4)"/>
      <text x="360" y="182" text-anchor="middle" font-size="12" fill="#8C8470">三个乘数相乘 = ROE。高 ROE 靠哪种？靠杠杆撑起来的要打折看。</text>
    </g>
  </svg>`;
})();

/* 三表勾稽 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-three-st"] =
  `<svg viewBox="0 0 720 220" class="lesson-fig" role="img" aria-label="三大报表勾稽关系">
    <defs><marker id="arrG4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#C9A227"/></marker></defs>
    <g font-family="var(--sans)">
      <rect x="40" y="40" width="190" height="70" rx="10" fill="rgba(201,162,39,.14)" stroke="#C9A227" stroke-width="1.8"/>
      <text x="135" y="70" text-anchor="middle" font-size="13.5" font-weight="700" fill="#8C6D2F">利润表</text>
      <text x="135" y="92" text-anchor="middle" font-size="11" fill="#8C8470">一段时间赚没赚（成绩单）</text>
      <rect x="265" y="40" width="190" height="70" rx="10" fill="rgba(95,191,154,.12)" stroke="#5FBF9A" stroke-width="1.8"/>
      <text x="360" y="70" text-anchor="middle" font-size="13.5" font-weight="700" fill="#3F8F72">现金流量表</text>
      <text x="360" y="92" text-anchor="middle" font-size="11" fill="#8C8470">钱真进真出（验血报告）</text>
      <rect x="490" y="40" width="190" height="70" rx="10" fill="rgba(74,111,165,.12)" stroke="#4A6FA5" stroke-width="1.8"/>
      <text x="585" y="70" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4A6FA5">资产负债表</text>
      <text x="585" y="92" text-anchor="middle" font-size="11" fill="#8C8470">某一天的家底（存照）</text>
      <line x1="230" y1="75" x2="258" y2="75" stroke="#C9A227" stroke-width="2" marker-end="url(#arrG4)"/>
      <text x="244" y="66" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="#8C8470">利润</text>
      <line x1="455" y1="75" x2="483" y2="75" stroke="#C9A227" stroke-width="2" marker-end="url(#arrG4)"/>
      <text x="469" y="66" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="#8C8470">净额</text>
      <text x="360" y="160" text-anchor="middle" font-size="12.5" fill="#4A4438">勾稽口诀：利润表的净利润流进资产负债表的留存收益；现金流量表的期末现金 = 资产负债表的货币资金。</text>
      <text x="360" y="188" text-anchor="middle" font-size="12" fill="#9E2B22" font-weight="600">利润高增而经营现金流常年背离 → 排雷头号信号。</text>
    </g>
  </svg>`;
})();

/* ============ 第三批：技术 · 基金 · 纪律 · 配置 ============ */

/* 单根 K 线解剖 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-kline-anatomy"] =
  `<svg viewBox="0 0 720 240" class="lesson-fig" role="img" aria-label="K线解剖">
    <g font-family="var(--sans)">
      <line x1="180" y1="40" x2="180" y2="200" stroke="#C0392B" stroke-width="2"/>
      <rect x="152" y="90" width="56" height="80" fill="#C0392B"/>
      <text x="235" y="46" font-size="12" fill="#8C8470">最高价（上影线顶）</text>
      <line x1="228" y1="42" x2="184" y2="42" stroke="#8C8470" stroke-width="1" stroke-dasharray="3 2"/>
      <text x="235" y="97" font-size="12" fill="#8C8470">开盘价（红K：实体下沿）</text>
      <line x1="228" y1="92" x2="212" y2="92" stroke="#8C8470" stroke-width="1" stroke-dasharray="3 2"/>
      <text x="235" y="178" font-size="12" fill="#8C8470">收盘价（红K：实体上沿）</text>
      <line x1="228" y1="168" x2="212" y2="168" stroke="#8C8470" stroke-width="1" stroke-dasharray="3 2"/>
      <text x="235" y="210" font-size="12" fill="#8C8470">最低价（下影线底）</text>
      <text x="180" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="#C0392B">阳线（红）：收 > 开</text>
      <line x1="470" y1="50" x2="470" y2="190" stroke="#1E8449" stroke-width="2"/>
      <rect x="442" y="80" width="56" height="76" fill="#1E8449"/>
      <text x="470" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="#1E8449">阴线（绿）：收 < 开</text>
      <text x="525" y="120" font-size="12" fill="#8C8470">实体 = 开收之间</text>
      <text x="525" y="142" font-size="12" fill="#8C8470">影线 = 曾到过</text>
      <text x="525" y="164" font-size="12" fill="#8C8470">上影长 = 冲高回落</text>
      <text x="360" y="230" text-anchor="middle" font-size="12" fill="#8C8470">一根K线是一天多空交战记录：谁能把影线打回去、把实体守住，谁说了算。</text>
    </g>
  </svg>`;
})();

/* 均线金叉死叉 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-ma-golden"] =
  `<svg viewBox="0 0 720 240" class="lesson-fig" role="img" aria-label="均线金叉与死叉">
    <path d="M40,190 C120,170 200,120 300,95 C400,75 500,95 560,80 C600,72 640,70 680,66"
      fill="none" stroke="#8C8470" stroke-width="1.8"/>
    <path d="M40,205 C130,200 220,180 320,140 C420,100 520,105 600,110 C630,112 660,108 680,105"
      fill="none" stroke="#C9A227" stroke-width="2.6"/>
    <path d="M40,215 C150,214 260,205 380,175 C500,150 600,152 680,148"
      fill="none" stroke="#B0533A" stroke-width="2.6"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="52" y="176" fill="#8C8470">价格</text>
      <text x="345" y="128" fill="#C9A227" font-weight="700">MA20</text>
      <text x="580" y="140" fill="#B0533A" font-weight="700">MA60</text>
      <circle cx="295" cy="133" r="7" fill="none" stroke="#3F8F72" stroke-width="2.4"/>
      <text x="240" y="86" fill="#3F8F72" font-weight="700">金叉：短线上穿长线 = 转强信号</text>
      <circle cx="563" cy="107" r="7" fill="none" stroke="#9E2B22" stroke-width="2.4"/>
      <text x="470" y="192" fill="#9E2B22" font-weight="700">死叉：短线下穿长线 = 转弱信号</text>
      <text x="40" y="232" fill="#8C8470" font-size="12">金叉死叉在震荡市会反复打脸——它只在趋势市可靠（第四阶段第一课的边界）。</text>
    </g>
  </svg>`;
})();

/* 头肩顶形态标注 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-hs-top"] =
  `<svg viewBox="0 0 720 250" class="lesson-fig" role="img" aria-label="头肩顶形态">
    <path d="M60,180 C110,150 140,158 180,170 C220,182 250,120 285,95 C310,78 330,120 360,158 C400,175 440,168 480,180 C540,196 600,214 660,228"
      fill="none" stroke="#C9A227" stroke-width="2.8"/>
    <line x1="60" y1="172" x2="500" y2="188" stroke="#9E2B22" stroke-width="1.8" stroke-dasharray="7 4"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="140" y="140" fill="#4A4438" font-weight="700">左肩</text>
      <text x="270" y="66" fill="#9E2B22" font-weight="700">头（最高点）</text>
      <text x="392" y="146" fill="#4A4438" font-weight="700">右肩</text>
      <text x="508" y="176" fill="#9E2B22" font-weight="700">颈线（虚线）</text>
      <text x="540" y="206" fill="#9E2B22" font-weight="700">破位确认</text>
      <path d="M520,200 C560,196 600,204 636,220" fill="none" stroke="rgba(158,43,34,.55)" stroke-width="1.6" stroke-dasharray="4 3"/>
      <text x="60" y="240" fill="#8C8470" font-size="12">三峰中间最高；跌破颈线才叫确认，目标位 ≈ 头到颈线的垂直距离，自突破点向下投影。</text>
    </g>
  </svg>`;
})();

/* 基金风险光谱 */
(function(){
  window.FIGS = window.FIGS || {};
  const rows = [
    { t: "货币基金", d: "类活期 · 几乎不亏", w: 90,  c: "#8B7D5E" },
    { t: "纯债基金", d: "小起伏 · 债为主", w: 150, c: "#A68B4A" },
    { t: "固收+",   d: "八成债两成股", w: 215, c: "#B8933B" },
    { t: "混合基金", d: "股债灵活调配", w: 285, c: "#C0392B" },
    { t: "股票基金", d: "八成以上股票", w: 355, c: "#9E2B22" },
  ];
  window.FIGS["fig-fund-spectrum"] =
  `<svg viewBox="0 0 720 250" class="lesson-fig" role="img" aria-label="基金风险收益光谱">
    <g font-family="var(--sans)">
      ${rows.map((r,i)=>`
      <rect x="150" y="${18+i*44}" width="${r.w}" height="34" rx="8" fill="${r.c}" opacity=".18"/>
      <rect x="150" y="${18+i*44}" width="${r.w}" height="34" rx="8" fill="none" stroke="${r.c}" stroke-width="1.6"/>
      <text x="136" y="${40+i*44}" text-anchor="end" font-size="13.5" font-weight="700" fill="#4A4438">${r.t}</text>
      <text x="${150+r.w+12}" y="${40+i*44}" font-size="11.5" fill="#8C8470">${r.d}</text>`).join("")}
      <text x="150" y="240" font-size="12" fill="#8C8470">越往下：预期收益越高，波动与回撤也越大。选基金先选类型，再选经理——别拿货币基金的钱去买股票基金的事。</text>
    </g>
  </svg>`;
})();

/* 定投微笑曲线 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-dca-smile"] =
  `<svg viewBox="0 0 720 240" class="lesson-fig" role="img" aria-label="定投微笑曲线">
    <path d="M60,70 C160,140 240,190 360,195 C480,200 570,130 660,55"
      fill="none" stroke="#C9A227" stroke-width="3"/>
    <g stroke="rgba(158,43,34,.5)" stroke-width="1.6">
      <line x1="100" y1="88"  x2="100" y2="120"/>
      <line x1="180" y1="128" x2="180" y2="158"/>
      <line x1="260" y1="168" x2="260" y2="196"/>
      <line x1="340" y1="190" x2="340" y2="216"/>
      <line x1="420" y1="185" x2="420" y2="211"/>
      <line x1="500" y1="158" x2="500" y2="186"/>
    </g>
    <line x1="70" y1="163" x2="650" y2="163" stroke="#5FBF9A" stroke-width="1.8" stroke-dasharray="7 4"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="330" y="142" fill="#3F8F72" font-weight="700">定投平均成本（在腰部）</text>
      <text x="70" y="52" fill="#8C6D2F" font-weight="700">跌越多买越多</text>
      <text x="560" y="46" fill="#8C6D2F" font-weight="700">回到起点已盈利</text>
      <text x="60" y="232" fill="#8C8470" font-size="12">价格走了一个 V，成本却停在腰部——下跌段攒的便宜份额，是微笑的右半边。前提：标的必须长期向上。</text>
    </g>
  </svg>`;
})();

/* 止损与盈亏比 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-stop-loss"] =
  `<svg viewBox="0 0 720 230" class="lesson-fig" role="img" aria-label="止损与盈亏比">
    <line x1="70" y1="170" x2="660" y2="96" stroke="#5FBF9A" stroke-width="2.6" stroke-dasharray="8 4"/>
    <line x1="200" y1="156" x2="200" y2="196" stroke="#9E2B22" stroke-width="2.2"/>
    <line x1="200" y1="156" x2="200" y2="84" stroke="#3F8F72" stroke-width="2.2"/>
    <circle cx="200" cy="156" r="6" fill="#C9A227"/>
    <line x1="150" y1="196" x2="620" y2="196" stroke="rgba(139,125,94,.4)" stroke-dasharray="3 3"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="150" y="216" fill="#9E2B22" font-weight="700">止损 -2%（先写好）</text>
      <text x="322" y="104" fill="#3F8F72" font-weight="700">止盈 +4%：盈亏比 2:1</text>
      <text x="206" y="150" fill="#8C6D2F" font-weight="700">入场价（下单前就定好两条线）</text>
      <text x="70" y="120" fill="#8C8470">错 1 赔 2 时，胜率只需 34% 即长期正期望——这就是盈亏比思维的数学底。</text>
    </g>
  </svg>`;
})();

/* 再平衡：漂移与拉回 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-rebalance"] =
  `<svg viewBox="0 0 720 240" class="lesson-fig" role="img" aria-label="再平衡漂移与拉回">
    <line x1="60" y1="180" x2="660" y2="180" stroke="rgba(139,125,94,.4)"/>
    <path d="M70,100 C160,96 260,80 360,66 C450,54 520,60 580,70" fill="none" stroke="#C0392B" stroke-width="2.8"/>
    <path d="M70,120 C170,122 280,130 380,140 C470,148 540,146 600,140" fill="none" stroke="#4A6FA5" stroke-width="2.8"/>
    <line x1="60" y1="110" x2="660" y2="110" stroke="rgba(139,125,94,.35)" stroke-dasharray="6 4"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="80" y="86" fill="#C0392B" font-weight="700">股票（牛市里越涨占比越高 70→80%）</text>
      <text x="420" y="170" fill="#4A6FA5" font-weight="700">债券（占比被动变低）</text>
      <text x="60" y="126" fill="#8C8470">目标线 70/30</text>
      <text x="60" y="218" fill="#8C8470" font-size="12">再平衡 = 卖出涨多的、补入跌少的，把比例拉回目标——机械地「高抛低吸」，收益来源是波动本身。</text>
    </g>
  </svg>`;
})();
