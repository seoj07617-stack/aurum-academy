/* ============================================================
   figs_extra.js — 课程图解库·扩展（v16）
   覆盖 macro/markets/technical/funds/discipline/portfolio/company/models
   风格与 figs.js 一致：淡金描边 + 传统色点缀 + 朱砂点睛
   ============================================================ */
"use strict";
(function(){
  window.FIGS = window.FIGS || {};

  /* ── 美林时钟：两轴四象限（macro·两轴四象限） ── */
  const quad = [
    { x: 96,  y: 52,  t: "衰退", sub: "增长↓ 通胀↓", win: "债券领跑", c: "#8B7D5E" },
    { x: 404, y: 52,  t: "复苏", sub: "增长↑ 通胀↓", win: "股票领跑", c: "#B8933B" },
    { x: 404, y: 178, t: "过热", sub: "增长↑ 通胀↑", win: "商品领跑", c: "#C9A227" },
    { x: 96,  y: 178, t: "滞胀", sub: "增长↓ 通胀↑", win: "现金为王", c: "#9E2B22" }
  ];
  window.FIGS["fig-clock"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="美林时钟四象限">
    <g stroke="rgba(139,125,94,.4)" stroke-width="1" fill="none">
      <path d="M 300 118 A 90 90 0 0 1 300 182" marker-end="url(#arr)"/>
      <path d="M 420 182 A 90 90 0 0 1 420 118" marker-end="url(#arr)" transform="rotate(180 360 150)"/>
      <path d="M 300 182 A 90 90 0 0 1 300 118" transform="rotate(180 360 150)"/>
      <path d="M 420 118 A 90 90 0 0 1 420 182" transform="rotate(180 360 150)"/>
    </g>
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#8B7D5E"/></marker></defs>
    <circle cx="360" cy="150" r="52" fill="rgba(201,162,39,.12)" stroke="#C9A227" stroke-width="1.6"/>
    <text x="360" y="144" text-anchor="middle" font-family="var(--sans)" font-size="13" font-weight="700" fill="#4A4438">增长 × 通胀</text>
    <text x="360" y="163" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#8C8470">两把尺子定四季</text>
    ${quad.map(q=>`
    <rect x="${q.x}" y="${q.y}" width="220" height="88" rx="10" fill="${q.c}" opacity=".10"/>
    <rect x="${q.x}" y="${q.y}" width="220" height="88" rx="10" fill="none" stroke="${q.c}" stroke-width="1.6"/>
    <text x="${q.x+18}" y="${q.y+30}" font-family="var(--sans)" font-size="15" font-weight="700" fill="#4A4438">${q.t}</text>
    <text x="${q.x+18}" y="${q.y+52}" font-family="var(--sans)" font-size="12" fill="#8C8470">${q.sub}</text>
    <text x="${q.x+18}" y="${q.y+74}" font-family="var(--sans)" font-size="13" font-weight="700" fill="${q.c}">${q.win}</text>`).join("")}
    <text x="360" y="284" text-anchor="middle" font-family="var(--sans)" font-size="12" fill="#9E2B22" font-weight="600">顺时针转：复苏买股 → 过热买商品 → 滞胀握现金 → 衰退买债券</text>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 收益率曲线：正常 vs 倒挂（markets·收益率曲线与信用分层） ── */
  window.FIGS["fig-curve"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="收益率曲线正常与倒挂">
    <g stroke="rgba(139,125,94,.35)" stroke-width="1">
      <line x1="60" y1="240" x2="660" y2="240"/>
      <line x1="60" y1="240" x2="60" y2="34"/>
    </g>
    <g font-family="var(--sans)" font-size="11.5" fill="#8C8470">
      <text x="60" y="258" text-anchor="middle">3个月</text><text x="200" y="258" text-anchor="middle">2年</text>
      <text x="380" y="258" text-anchor="middle">10年</text><text x="620" y="258" text-anchor="middle">30年</text>
      <text x="34" y="140" text-anchor="middle" transform="rotate(-90 34 140)">收益率 →</text>
      <text x="360" y="280" text-anchor="middle">期限越长，要求的补偿越多</text>
    </g>
    <path d="M 60 210 C 200 190, 340 150, 620 92" fill="none" stroke="#C9A227" stroke-width="2.4"/>
    <path d="M 60 150 C 200 130, 340 160, 620 196" fill="none" stroke="#9E2B22" stroke-width="2.4" stroke-dasharray="7 5"/>
    <circle cx="150" cy="196" r="4" fill="#C9A227"/><circle cx="150" cy="137" r="4" fill="#9E2B22"/>
    <g font-family="var(--sans)" font-size="13" font-weight="700">
      <text x="480" y="72" fill="#C9A227">正常：远期更高</text>
      <text x="480" y="90" font-size="11.5" font-weight="400" fill="#8C8470">市场相信明天会更好</text>
      <text x="470" y="222" fill="#9E2B22">倒挂：短端反超</text>
      <text x="470" y="240" font-size="11.5" font-weight="400" fill="#8C8470">集体投票「未来更差」——衰退预警</text>
    </g>
    <text x="60" y="24" font-family="var(--sans)" font-size="12" fill="#4A4438" font-weight="600">曲线是市场的预期投票器：盯住 10 年期国债，等于盯住集体预期</text>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── K线关键形态：锤子线与看涨吞没（technical·常见关键形态） ── */
  const candles = [
    { x: 90,  o: 120, c: 168, hi: 112, lo: 176, up: false },
    { x: 150, o: 150, c: 196, hi: 144, lo: 204, up: false },
    { x: 210, o: 178, c: 224, hi: 172, lo: 252, up: false },
    { x: 270, o: 236, c: 224, hi: 262, lo: 204, up: true, hammer: true },
    { x: 330, o: 212, c: 200, hi: 218, lo: 206, up: false },
    { x: 390, o: 226, c: 176, hi: 232, lo: 170, up: true, engulf: true },
    { x: 450, o: 160, c: 130, hi: 154, lo: 166, up: true }
  ];
  window.FIGS["fig-kline"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="锤子线与看涨吞没形态">
    ${candles.map(k=>{
      const top = Math.min(k.o,k.c), h = Math.abs(k.o-k.c) || 2;
      const fill = k.up ? "#F5E9C9" : "#9E2B22", stroke = k.up ? "#C9A227" : "#9E2B22";
      return `<line x1="${k.x}" y1="${k.hi}" x2="${k.x}" y2="${k.lo}" stroke="${stroke}" stroke-width="1.6"/>
      <rect x="${k.x-13}" y="${top}" width="26" height="${h}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
    }).join("")}
    <g stroke="rgba(158,43,34,.5)" stroke-width="1" stroke-dasharray="4 4" fill="none">
      <circle cx="270" cy="230" r="38"/>
      <circle cx="390" cy="200" r="42"/>
    </g>
    <g font-family="var(--sans)" font-size="12.5" font-weight="700" fill="#9E2B22">
      <text x="270" y="286" text-anchor="middle">锤子线：长下影承接</text>
      <text x="418" y="270" text-anchor="middle">看涨吞没：实体全包</text>
    </g>
    <text x="560" y="120" font-family="var(--sans)" font-size="12" fill="#8C8470">下跌末端出现 →</text>
    <text x="560" y="138" font-family="var(--sans)" font-size="12" fill="#8C8470">待次日放量确认</text>
    <text x="60" y="52" font-family="var(--sans)" font-size="12" fill="#4A4438" font-weight="600">位置决定价值：同样的锤子线，下跌末端是信号，半山腰是噪音</text>
    <text x="60" y="284" font-family="var(--sans)" font-size="11.5" fill="#8C8470">实心＝阴线（收＜开）　空心＝阳线（收＞开）　影线＝当期触过的最高最低</text>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 定投微笑曲线（funds·微笑曲线） ── */
  const X = t => 80 + t * 17, Y = v => 216 - (v - 0.55) / 0.5 * 170;
  const price = pts => pts.map((p,i)=>(i?"L":"M")+X(p[0]).toFixed(1)+","+Y(p[1]).toFixed(1)).join(" ");
  window.FIGS["fig-smile"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="定投微笑曲线">
    <g stroke="rgba(139,125,94,.35)" stroke-width="1">
      <line x1="60" y1="240" x2="660" y2="240"/><line x1="60" y1="240" x2="60" y2="34"/>
    </g>
    <path d="${price([[0,1.0],[2,0.9],[4,0.78],[6,0.66],[8,0.6],[10,0.64],[12,0.72],[14,0.82],[16,0.92],[17,1.0]])}" fill="none" stroke="#C9A227" stroke-width="2.4"/>
    <path d="${price([[0,0.98],[2,0.93],[4,0.88],[6,0.83],[8,0.79],[10,0.785],[12,0.78],[14,0.78],[16,0.78],[17,0.78]])}" fill="none" stroke="#9E2B22" stroke-width="2" stroke-dasharray="7 5"/>
    ${[[3,0.83],[6,0.68],[9,0.61],[12,0.72],[15,0.87]].map(p=>`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.6" fill="#B8933B"/>`).join("")}
    <g font-family="var(--sans)" font-size="12.5" font-weight="700">
      <text x="470" y="56" fill="#C9A227">指数价格：坐了趟过山车</text>
      <text x="440" y="140" fill="#9E2B22">你的定投成本：一路下移后趴在 0.78</text>
    </g>
    <text x="536" y="118" font-family="var(--sans)" font-size="11.5" fill="#8C8470">指数回到 1.0 才回本</text>
    <text x="500" y="163" font-family="var(--sans)" font-size="11.5" fill="#8C8470">反弹到 0.8 你已盈利</text>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="60" y="264">低位不停扣（恐惧时不缴械）＋ 高位肯止盈（贪婪时肯落袋）＝ 微笑成立</text>
      <text x="60" y="286">圆点＝每期定投买到的份额：越跌，同样的钱买得越多</text>
    </g>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 回本不对称（discipline·止损的重新理解） ── */
  const pairs = [
    { l: "亏10%", d: 60,  b: 66,  x: 110 },
    { l: "亏20%", d: 110, b: 125, x: 240 },
    { l: "亏30%", d: 150, b: 172, x: 370 },
    { l: "亏50%", d: 200, b: 232, x: 500 }
  ];
  window.FIGS["fig-asym"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="回本不对称">
    <g stroke="rgba(139,125,94,.35)" stroke-width="1"><line x1="70" y1="248" x2="660" y2="248"/></g>
    ${pairs.map(p=>`
    <rect x="${p.x-46}" y="${248-p.d}" width="42" height="${p.d}" rx="4" fill="#9E2B22" opacity=".82"/>
    <rect x="${p.x+6}"  y="${248-p.b}" width="42" height="${p.b}" rx="4" fill="none" stroke="#C9A227" stroke-width="2"/>
    <text x="${p.x-25}" y="${248-p.d-8}" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#9E2B22" font-weight="700">${p.l}</text>
    <text x="${p.x+27}" y="${248-p.b-8}" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#B8933B" font-weight="700">回${Math.round(p.b)}%</text>`).join("")}
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="110" y="270">实心＝实际亏损</text>
      <text x="250" y="270">空心＝回本所需涨幅</text>
      <text x="60" y="290" font-size="12.5" fill="#9E2B22" font-weight="600">跌得越深，回本越贵——−50% 要 +100% 才回得来，深亏押上的是复利的时间</text>
    </g>
    <text x="60" y="36" font-family="var(--sans)" font-size="12" fill="#4A4438" font-weight="600">止损保护的不是这一笔的钱，是未来三十年的复利曲线</text>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 核心-卫星结构（portfolio·核心-卫星） ── */
  window.FIGS["fig-cs"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="核心卫星结构">
    <circle cx="300" cy="150" r="118" fill="none" stroke="#B8933B" stroke-width="1.8" stroke-dasharray="8 6"/>
    <circle cx="300" cy="150" r="72" fill="rgba(201,162,39,.14)" stroke="#C9A227" stroke-width="2"/>
    <text x="300" y="142" text-anchor="middle" font-family="var(--sans)" font-size="15" font-weight="700" fill="#4A4438">核心 70–90%</text>
    <text x="300" y="162" text-anchor="middle" font-family="var(--sans)" font-size="12" fill="#8C8470">宽基指数＋债券</text>
    <text x="300" y="180" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#8C8470">求稳：吃市场 beta</text>
    <g font-family="var(--sans)" font-size="12.5" font-weight="700" fill="#B8933B">
      <text x="300" y="52" text-anchor="middle">卫星 10–30%</text>
      <text x="300" y="270" text-anchor="middle">行业·主题·个股：求进，博超额</text>
    </g>
    <g font-family="var(--sans)" font-size="12" fill="#8C8470">
      <text x="520" y="96">卫星腰斩，组合只抖一抖——</text>
      <text x="520" y="116">容错内置在结构里</text>
      <text x="520" y="150">单卫星 ≤ 20%，</text>
      <text x="520" y="170">风格不与核心重复</text>
      <text x="520" y="204" fill="#9E2B22" font-weight="600">卫星连赢两年想「加码」时，</text>
      <text x="520" y="224" fill="#9E2B22" font-weight="600">正是纪律该压住你的时刻</text>
    </g>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 杜邦分解（company·ROE 与杜邦分解） ── */
  const nodes = [
    { x: 60,  t: "净利率", s: "赚多少", eg: "茅台：50%+", c: "#B8933B" },
    { x: 290, t: "周转率", s: "转多快", eg: "超市：一年近10次", c: "#B8933B" },
    { x: 520, t: "权益乘数", s: "借多少", eg: "银行：10倍杠杆", c: "#9E2B22" }
  ];
  window.FIGS["fig-dupont"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="杜邦分解">
    <rect x="250" y="34" width="220" height="56" rx="10" fill="rgba(201,162,39,.14)" stroke="#C9A227" stroke-width="2"/>
    <text x="360" y="58" text-anchor="middle" font-family="var(--sans)" font-size="15" font-weight="700" fill="#4A4438">ROE 净资产收益率</text>
    <text x="360" y="78" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#8C8470">＝ 三者连乘，同样 20%，成色不同</text>
    <g stroke="rgba(139,125,94,.5)" stroke-width="1.4" fill="none">
      <path d="M 360 90 L 360 112 M 120 112 L 600 112 M 120 112 L 120 132 M 360 112 L 360 132 M 600 112 L 600 132"/>
    </g>
    ${nodes.map(n=>`
    <rect x="${n.x}" y="132" width="140" height="82" rx="10" fill="${n.c}" opacity=".1"/>
    <rect x="${n.x}" y="132" width="140" height="82" rx="10" fill="none" stroke="${n.c}" stroke-width="1.8"/>
    <text x="${n.x+70}" y="158" text-anchor="middle" font-family="var(--sans)" font-size="14" font-weight="700" fill="#4A4438">${n.t}</text>
    <text x="${n.x+70}" y="178" text-anchor="middle" font-family="var(--sans)" font-size="11.5" fill="#8C8470">${n.s}</text>
    <text x="${n.x+70}" y="200" text-anchor="middle" font-family="var(--sans)" font-size="12" font-weight="700" fill="${n.c}">${n.eg}</text>`).join("")}
    <text x="60" y="252" font-family="var(--sans)" font-size="12" fill="#4A4438" font-weight="600">三种赚钱模式：靠利润率、靠周转、靠杠杆——靠乘数堆出的 ROE 最脆弱</text>
    <text x="60" y="278" font-family="var(--sans)" font-size="11.5" fill="#9E2B22" font-weight="600">看到高 ROE 先拆成分：是生意好，还是借出来的</text>
  </svg>`;
})();

(function(){
  window.FIGS = window.FIGS || {};
  /* ── 市场先生钟摆（models·源流：从格雷厄姆到巴菲特） ── */
  window.FIGS["fig-mr"] =
  `<svg viewBox="0 0 720 300" class="lesson-fig" role="img" aria-label="市场先生情绪钟摆">
    <path d="M 130 120 A 230 230 0 0 1 590 120" fill="none" stroke="rgba(139,125,94,.45)" stroke-width="1.6" stroke-dasharray="7 6"/>
    <g stroke="#C9A227" stroke-width="2" fill="none">
      <line x1="360" y1="96" x2="200" y2="196"/><line x1="360" y1="96" x2="520" y2="196" opacity=".45"/>
    </g>
    <circle cx="360" cy="96" r="7" fill="#C9A227"/>
    <circle cx="200" cy="196" r="24" fill="#9E2B22" opacity=".85"/>
    <circle cx="520" cy="196" r="24" fill="none" stroke="#C9A227" stroke-width="2"/>
    <g font-family="var(--sans)" font-size="13" font-weight="700">
      <text x="140" y="248" fill="#9E2B22">恐慌·抑郁</text>
      <text x="470" y="248" fill="#B8933B">狂热·亢奋</text>
    </g>
    <g font-family="var(--sans)" font-size="11.5" fill="#8C8470">
      <text x="128" y="268">把便宜货塞给你</text>
      <text x="486" y="268">用天价求购你的筹码</text>
    </g>
    <text x="360" y="82" text-anchor="middle" font-family="var(--sans)" font-size="12.5" font-weight="700" fill="#4A4438">冷静区：他报价，你定价</text>
    <text x="360" y="150" text-anchor="middle" font-family="var(--sans)" font-size="12" fill="#9E2B22" font-weight="600">利用他的情绪，绝不被他的情绪支配</text>
    <text x="60" y="290" font-family="var(--sans)" font-size="11.5" fill="#8C8470">他每天报一个价——你可以成交，也可以不理他；他抑郁时你不必恐慌，他亢奋时你不必踏空</text>
  </svg>`;
})();
