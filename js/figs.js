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
    <line x1="452" y1="29" x2="452" y2="262" stroke="rgba(158,43,34,.28)" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="452" y="24" text-anchor="middle" fill="#9E2B22" font-size="11.5" font-weight="700">第 20 年 · 分水岭</text>
    <path d="${c3}" fill="none" stroke="#8B7D5E" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="${c2}" fill="none" stroke="#A68B4A" stroke-width="2.4"/>
    <path d="${c1}" fill="none" stroke="#9E2B22" stroke-width="3"/>
    <g font-family="var(--sans)" font-size="12.5">
      <text x="475" y="46" fill="#9E2B22" font-weight="700">复利 7%：76万</text>
      <text x="430" y="128" fill="#A68B4A" font-weight="600">单利 7%：31万</text>
      <text x="330" y="228" fill="#8B7D5E">活期 1.5%：14万</text>
      <text x="150" y="170" fill="#4A4438" font-style="italic">前十年几乎贴地——大多数人放弃在这里</text>
      <path d="M295,164 C340,120 400,80 465,56" fill="none" stroke="#C9A227" stroke-width="1.4" stroke-dasharray="4 3"/>
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

/* 七亏二平一赚 */
(function(){
  window.FIGS = window.FIGS || {};
  window.FIGS["fig-721"] =
  `<svg viewBox="0 0 720 210" class="lesson-fig" role="img" aria-label="七亏二平一赚分布">
    <g font-family="var(--sans)">
      <rect x="40"  y="52" width="420" height="54" rx="8" fill="rgba(158,43,34,.14)" stroke="#9E2B22" stroke-width="1.6"/>
      <rect x="466" y="52" width="120" height="54" rx="8" fill="rgba(139,125,94,.16)" stroke="#8B7D5E" stroke-width="1.4"/>
      <rect x="592" y="52" width="60"  height="54" rx="8" fill="rgba(201,162,39,.2)" stroke="#C9A227" stroke-width="1.8"/>
      <text x="250" y="76" text-anchor="middle" font-size="14" font-weight="700" fill="#9E2B22">七 亏 · 70%</text>
      <text x="250" y="95" text-anchor="middle" font-size="11.5" fill="#7A4440">追涨杀跌 · 重仓押注 · 不设止损</text>
      <text x="526" y="76" text-anchor="middle" font-size="14" font-weight="700" fill="#6B6350">二 平</text>
      <text x="526" y="95" text-anchor="middle" font-size="11.5" fill="#6B6350">拿不住 · 瞎折腾</text>
      <text x="622" y="76" text-anchor="middle" font-size="14" font-weight="700" fill="#8C6D2F">一 赚</text>
      <text x="622" y="95" text-anchor="middle" font-size="11.5" fill="#8C6D2F">有纪律</text>
      <text x="40" y="150" font-size="12.5" fill="#4A4438">决定你在哪一档的，不是智商、不是消息，是动作——所以第七阶段整章讲纪律。</text>
      <text x="40" y="174" font-size="12.5" fill="#8C8470">这是 A 股散户长期盈亏的经验口径，各研究样本略有出入，但格局从未变过。</text>
    </g>
  </svg>`;
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
