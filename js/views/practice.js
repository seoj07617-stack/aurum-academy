/* ============================================================
   views/practice.js — 实操训练
   形态速认（K线）/ 财报诊室 / 计算特训 / 宏观图表
   题型：mc 选择 / num 数值 / tf 判断 / click 点图 / clock 象限 / order 排序
   ============================================================ */
"use strict";
function pracXP(ok){
  const t = dayKey();
  if(!S.prac || S.prac.d !== t) S.prac = { d: t, n: 0 };
  if(!ok || S.prac.n >= 40) return;
  S.prac.n += 2; award(2, "实操训练");
}

/* 统一答题渲染：把 q 渲染进 mount，判分后回调 cb(ok)
   视觉：题号章 + 金边选项卡 + 判卷印章 + 批注卡 + 深墨盘面卡 */
const CNUM = ["壹","贰","叁","肆","伍","陆","柒","捌"];
function stem(no, txt){ return `<div class="q-stem"><span class="no">${CNUM[no % 8]}</span><div class="txt">${txt}</div></div>`; }
function renderAnswer(mount, q, cb, noIdx = 0){
  let host = null;   /* 判卷章与批注的容器 */
  function ensureHost(){
    if(!host){
      host = document.createElement("div");
      host.style.position = "relative";
      mount.appendChild(host);
    }
    return host;
  }
  function grade(ok, why){
    const h = ensureHost();
    h.insertAdjacentHTML("beforeend",
      `<span class="stamp ${ok?"ok":"no"}">${ok?"正确":"再想"}</span>
       <div class="anno"><span class="tagline">讲 评</span><p>${why || q.why || ""}</p></div>`);
    pracXP(ok); if(ok && window.FX) FX.fly(h.querySelector(".stamp")); cb(ok); /* 答对：飞星反馈 */
  }
  const type = q.t || "mc";
  if(type === "mc"){
    mount.innerHTML = stem(noIdx, q.q) + `<div style="margin-top:12px">${
      q.opts.map((o,i)=>`<div class="prac-opt" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></div>`).join("")}</div>`;
    let done = false;
    $$(".prac-opt", mount).forEach(o => o.addEventListener("click", () => {
      if(done) return; done = true;
      const i = +o.dataset.i, ok = i === q.a;
      $$(".prac-opt", mount).forEach(x => {
        if(+x.dataset.i === q.a) x.classList.add("right");
        else if(x === o) x.classList.add("wrong");
        else x.classList.add("dim");
      });
      grade(ok, q.why);
    }));
  }
  else if(type === "tf"){
    mount.innerHTML = stem(noIdx, q.q) + `
      <div class="row" style="margin-top:14px">
        <button class="btn btn-ghost tfbtn" data-v="1">对</button>
        <button class="btn btn-ghost tfbtn" data-v="0">错</button>
      </div>`;
    let done = false;
    $$(".tfbtn", mount).forEach(b => b.addEventListener("click", () => {
      if(done) return; done = true;
      const ok = (!!+b.dataset.v) === !!q.a;
      b.style.borderColor = ok ? "var(--down)" : "var(--rose)";
      b.style.background = ok ? "rgba(42,122,104,.14)" : "rgba(180,91,82,.14)";
      grade(ok, q.why);
    }));
  }
  else if(type === "num"){
    mount.innerHTML = stem(noIdx, q.q) + `
      <div class="row" style="margin-top:12px">
        <input class="inp num" id="numIn" inputmode="decimal" placeholder="输入数值" style="max-width:180px;font-size:16px">
        ${q.unit?`<span class="muted">${q.unit}</span>`:""}
        <button class="btn btn-gold btn-sm" id="numGo">提交</button>
      </div>`;
    const check = () => {
      const v = parseFloat($("#numIn", mount).value);
      if(isNaN(v)){ toast("请输入数值"); return; }
      const ok = Math.abs(v - q.ans) <= (q.tol ?? 0.01);
      $("#numIn", mount).disabled = true; $("#numGo", mount).disabled = true;
      $("#numIn", mount).style.borderColor = ok ? "var(--down)" : "var(--rose)";
      grade(ok, q.why + (q.unit ? `（正确答案：${q.ans}${q.unit}）` : `（正确答案：${q.ans}）`));
    };
    $("#numGo", mount).addEventListener("click", check);
    $("#numIn", mount).addEventListener("keydown", e => { if(e.key === "Enter") check(); });
  }
  else if(type === "click"){
    mount.innerHTML = stem(noIdx, q.q) + `
      <div style="margin-top:12px" id="clickChart">
        <div class="chart-card"><span class="cap">练习盘 · 点击 K 线作答</span>${klineSVG(q.cs)}</div>
      </div>`;
    let done = false;
    const svg = $("svg", mount);
    const candles = $$("rect", svg);
    candles.forEach((r, i) => {
      r.style.cursor = "pointer";
      r.addEventListener("click", () => {
        if(done) return; done = true;
        const ok = i === q.a;
        r.setAttribute("stroke", ok ? "#7BD3BC" : "#E9908A");
        r.setAttribute("stroke-width", "3");
        if(!ok){ candles[q.a].setAttribute("stroke", "#7BD3BC"); candles[q.a].setAttribute("stroke-width", "3"); }
        grade(ok, q.why);
      });
    });
  }
  else if(type === "clock"){
    const QD = [
      { id:"tl", name:"滞胀", hint:"增长↓ 通胀↑" },
      { id:"tr", name:"过热", hint:"增长↑ 通胀↑" },
      { id:"bl", name:"衰退", hint:"增长↓ 通胀↓" },
      { id:"br", name:"复苏", hint:"增长↑ 通胀↓" }
    ];
    mount.innerHTML = stem(noIdx, q.q) + `
      <div class="clock-wrap">
        <div class="clock-axis-y">通胀 ↑</div>
        <div class="clock-grid">
          ${QD.map(d=>`<div class="clock-q" data-id="${d.id}"><b>${d.name}</b><span>${d.hint}</span></div>`).join("")}
        </div>
        <div class="clock-axis-x">经济增长 →</div>
      </div>`;
    let done = false;
    $$(".clock-q", mount).forEach(z => z.addEventListener("click", () => {
      if(done) return; done = true;
      const ok = z.dataset.id === q.a;
      z.style.borderColor = ok ? "var(--down)" : "var(--rose)";
      z.style.background = ok ? "rgba(42,122,104,.14)" : "rgba(180,91,82,.14)";
      $$(".clock-q", mount).forEach(x => { if(x.dataset.id === q.a && x !== z){ x.style.borderColor = "var(--down)"; x.style.background = "rgba(42,122,104,.14)"; } });
      grade(ok, q.why);
    }));
  }
  else if(type === "order"){
    let picks = [];
    mount.innerHTML = stem(noIdx, q.q) + `
      <div class="row" style="flex-wrap:wrap;margin-top:12px" id="ordWrap">
        ${[...q.items].sort(() => Math.random()-.5).map(n =>
          `<button class="btn btn-ghost btn-sm orditem" data-n="${n}"><span class="slot"></span>${n}</button>`).join("")}
      </div>
      <div class="tiny" style="margin-top:8px">已选：<span id="ordPicks" class="num">0/${q.items.length}</span> · 点击顺序即排序</div>`;
    let done = false;
    $$(".orditem", mount).forEach(b => b.addEventListener("click", () => {
      if(done || b.disabled) return;
      b.disabled = true; b.style.opacity = .45;
      const slot = $(".slot", b);
      if(slot) slot.textContent = picks.length + 1;
      picks.push(b.dataset.n);
      $("#ordPicks", mount).textContent = picks.length + "/" + q.items.length;
      if(picks.length === q.items.length){
        done = true;
        const ok = picks.join("|") === q.correct.join("|");
        picks.forEach((n, i) => {
          const b = $$(".orditem", mount).find(x => x.dataset.n === n && x.disabled);
          const want = q.correct[i];
          if(n === want) b.style.borderColor = "var(--down)";
          else { const rb = $$(".orditem", mount).find(x => x.dataset.n === want && x.disabled); if(rb) rb.style.borderColor = "var(--down)"; b.style.borderColor = "var(--rose)"; }
        });
        grade(ok, q.why);
      }
    }));
  }
}

VIEWS.practice = function(mode){
  mode = ["pattern","report","drill","macro","market","terminal"].includes(mode) ? mode : "pattern";
  const el = document.createElement("div");
  const TABS = [["pattern","形态速认"],["report","财报诊室"],["drill","计算特训"],["macro","宏观图表"],["market","实盘复盘"],["terminal","行情终端"]];

  el.innerHTML = `
  <div class="wrap st">
    <div class="page-head">
      <div class="kicker">PRACTICE LAB · 实操</div>
      <h1 style="font-size:27px;margin-top:8px">实操训练</h1>
      <p class="muted small" style="margin-top:4px">图要亲眼看，账要亲手算——把第三、四阶段的「知识」磨成「手艺」。</p>
      <div class="seg" style="margin-top:14px">
        ${TABS.map(t=>`<button data-t="${t[0]}" class="${mode===t[0]?"on":""}">${t[1]}</button>`).join("")}
      </div>
    </div>
    <div id="pracBody"></div>
  </div>`;
  const body = $("#pracBody", el);
  $$(".seg button", el).forEach(b => b.addEventListener("click", () => go(`#/practice/${b.dataset.t}`)));

  /* ---------- 形态速认 ---------- */
  if(mode === "pattern"){
    let deck = [], pi = 0, qi = 0, score = 0;
    const newDeck = () => {
      deck = [...PATTERNS].sort(() => Math.random() - .5);
      deck.forEach(p => p.qs.sort(() => Math.random() - .5));
      pi = 0; qi = 0; score = 0;
    };
    function render(){
      if(pi >= deck.length){
        body.innerHTML = `
        <div class="glass glass-pad" style="padding:40px 30px;text-align:center">
          <div class="kicker" style="justify-content:center">本组成绩</div>
          <h2 style="font-family:var(--serif);font-size:26px;margin:12px 0">${score} / ${deck.reduce((a,p)=>a+p.qs.length,0)}</h2>
          <p class="muted small">识形态，更要记纪律——错过的组合会再次出现。</p>
          <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
            <button class="btn btn-gold" id="pAgain">${icon("refresh")} 再来一组</button>
            <button class="btn btn-ghost" data-go="#/lesson/s4l1">${icon("book")} 回看课程</button>
          </div>
        </div>`;
        $("#pAgain", body).addEventListener("click", () => { newDeck(); render(); });
        $$("[data-go]", body).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
        return;
      }
      const p = deck[pi], it = p.qs[qi];
      const isClick = it.t === "click";
      body.innerHTML = `
      <div class="glass q-card">
        <div class="between" style="margin-bottom:10px">
          <span class="tiny">形态 ${pi+1}/${deck.length} · 题 ${qi+1}/${p.qs.length} · 答对 ${score}</span>
          <span class="tag">${isClick ? "点图作答" : "看图识形态"}</span>
        </div>
        ${isClick ? "" : `<div id="pChart"><div class="chart-card"><span class="cap">练习盘 · 形态辨认</span>${klineSVG(p.cs)}</div></div>`}
        <div style="margin-top:16px" id="pAns"></div>
        <div class="between" style="margin-top:16px">
          <span class="tiny">识形态 · 更要记纪律</span>
          <button class="btn btn-gold btn-sm" id="pNext" style="visibility:hidden">${(pi===deck.length-1&&qi===p.qs.length-1)?"看成绩":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>`;
      renderAnswer($("#pAns", body), isClick ? { ...it, cs: p.cs } : it, ok => {
        if(ok) score++;
        $("#pNext", body).style.visibility = "";
      }, qi);
      $("#pNext", body).addEventListener("click", () => {
        qi++;
        if(qi >= deck[pi].qs.length){ pi++; qi = 0; }
        render();
      });
    }
    newDeck(); render();
  }

  /* ---------- 财报诊室 ---------- */
  if(mode === "report"){
    function renderList(){
      body.innerHTML = `
      <div class="stack">
        ${CASES.map((c,i)=>`
        <div class="glass glass-pad hover" data-case="${i}" style="cursor:pointer">
          <div class="between">
            <div class="card-title" style="margin:0">${icon("chart")} 病例 ${i+1} · ${c.name}</div>
            <span class="tag num">${icon("target")} ${c.qs.length} 道诊断</span>
          </div>
          <p class="small muted" style="margin-top:6px">${c.intro}</p>
        </div>`).join("")}
      </div>`;
      $$(".glass[data-case]", body).forEach(n => n.addEventListener("click", () => renderCase(CASES[+n.dataset.case])));
    }
    function renderCase(c){
      const picks = c.qs.map(() => null);
      let doneCount = 0;
      body.innerHTML = `
      <div class="glass q-card">
        <div class="crumb" style="margin-bottom:6px"><a href="#/practice/report" id="caseBack">财报诊室</a> ${icon("chevR")} ${c.name}</div>
        <h2 style="font-size:20px">${c.name}</h2>
        <p class="small muted" style="margin:6px 0 10px">${c.intro}</p>
        ${finTable(c.rows)}
        <hr class="divider">
        ${c.qs.map((q,qi)=>`
        <div style="margin:16px 0">
          <b style="font-size:15.5px">问题 ${qi+1} · ${q.q}</b>
          <div style="margin-top:8px" id="caseQ${qi}"></div>
        </div>`).join("")}
        <div class="between" style="margin-top:16px">
          <button class="btn btn-ghost btn-sm" id="caseBack2">返回病例列表</button>
          <button class="btn btn-gold" id="caseSubmit">提交诊断</button>
        </div>
      </div>`;
      c.qs.forEach((q, qi) => {
        renderAnswer($(`#caseQ${qi}`, body), q, ok => {
          picks[qi] = ok ? "✓" : "✗"; doneCount++;
        }, qi);
      });
      $("#caseBack", body).addEventListener("click", renderList);
      $("#caseBack2", body).addEventListener("click", renderList);
      $("#caseSubmit", body).addEventListener("click", () => {
        if(doneCount < c.qs.length){ toast("还有问题未作答"); return; }
        const ok = picks.filter(p => p === "✓").length;
        if(ok === c.qs.length) confetti(24);
        $("#caseSubmit", body).disabled = true;
        $("#caseSubmit", body).textContent = `诊断完成 ${ok}/${c.qs.length}`;
        toast(`诊断完成：${ok}/${c.qs.length} 正确`, ok === c.qs.length ? "gold" : "");
      });
    }
    renderList();
  }

  /* ---------- 计算特训 ---------- */
  if(mode === "drill"){
    let round = [], ri = 0, streak = 0, best = 0;
    const newRound = () => { round = Array.from({length:10}, () => makeDrill()); ri = 0; streak = 0; best = 0; };
    function render(){
      if(ri >= round.length){
        body.innerHTML = `
        <div class="glass glass-pad" style="padding:40px 30px;text-align:center">
          <div class="kicker" style="justify-content:center">本组成绩</div>
          <h2 style="font-family:var(--serif);font-size:26px;margin:12px 0">最高连对 <span class="gold-text">${best}</span></h2>
          <p class="muted small">先算赔率，再谈看法——这 10 题练的就是下单前的肌肉记忆。</p>
          <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
            <button class="btn btn-gold" id="dAgain">${icon("refresh")} 换一组（题目随机）</button>
          </div>
        </div>`;
        $("#dAgain", body).addEventListener("click", () => { newRound(); render(); });
        return;
      }
      const it = round[ri];
      body.innerHTML = `
      <div class="glass q-card">
        <div class="between" style="margin-bottom:10px">
          <span class="tiny">第 ${ri+1}/10 题 · 当前连对 ${streak}</span>
          <span class="tag">${it.t === "num" ? "动手计算" : "快速判断"}</span>
        </div>
        <div id="dAns"></div>
        <div class="between" style="margin-top:16px">
          <span class="tiny">答对 +2 XP</span>
          <button class="btn btn-gold btn-sm" id="dNext" style="visibility:hidden">${ri===9?"看成绩":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>`;
      renderAnswer($("#dAns", body), it, ok => {
        if(ok){ streak++; best = Math.max(best, streak); }
        else streak = 0;
        $("#dNext", body).style.visibility = "";
      }, ri);
      $("#dNext", body).addEventListener("click", () => { ri++; render(); });
    }
    newRound(); render();
  }

  /* ---------- 宏观图表 ---------- */
  if(mode === "macro"){
    let deck = [], mi = 0, score = 0;
    const newDeck = () => {
      deck = [];
      [...CURVES].sort(() => Math.random()-.5).slice(0,3).forEach(cv => {
        const others = CURVES.filter(x => x.name !== cv.name).map(x => x.name);
        const opts = [cv.name, ...others].sort(() => Math.random()-.5);
        deck.push({ t:"mc", q:"识别这条收益率曲线的形态", chart:{ series:cv.series, labels:cv.labels },
          opts, a: opts.indexOf(cv.name),
          why:cv.name + "：" + (cv.name.includes("倒挂") ? "短端高于长端，紧缩过度或衰退预期，历史上多次领先衰退。" :
             cv.name.includes("平坦") ? "长短端利差抹平，增长预期转弱的信号。" :
             cv.name.includes("驼峰") ? "中端凸起，常见于政策过渡期，市场定价『先紧后松』。" :
             "长端高于短端，市场定价增长与温和通胀——最健康的形态。") });
      });
      [...CLOCK_QS].sort(() => Math.random()-.5).forEach(x => deck.push({ t:"clock", ...x }));
      [...MACRO_TF].sort(() => Math.random()-.5).slice(0,3).forEach(x => deck.push({ t:"tf", ...x }));
      deck.push({ t:"order", ...RISK_ORDER });
      deck.sort(() => Math.random()-.5);
      mi = 0; score = 0;
    };
    function render(){
      if(mi >= deck.length){
        body.innerHTML = `
        <div class="glass glass-pad" style="padding:40px 30px;text-align:center">
          <div class="kicker" style="justify-content:center">本组成绩</div>
          <h2 style="font-family:var(--serif);font-size:26px;margin:12px 0">${score} / ${deck.length}</h2>
          <p class="muted small">宏观是天气：不决定你开不开车，但决定你穿什么、走哪条路。</p>
          <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
            <button class="btn btn-gold" id="mAgain">${icon("refresh")} 再来一组</button>
            <button class="btn btn-ghost" data-go="#/lesson/s1l5">${icon("book")} 回看美林时钟</button>
          </div>
        </div>`;
        $("#mAgain", body).addEventListener("click", () => { newDeck(); render(); });
        $$("[data-go]", body).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
        return;
      }
      const it = deck[mi];
      const chartHtml = it.chart
        ? `<div class="chart-card"><span class="cap">练习盘 · 收益率曲线</span>${lineSVG(it.chart.series, it.chart.labels)}</div>`
        : "";
      body.innerHTML = `
      <div class="glass q-card">
        <div class="between" style="margin-bottom:10px">
          <span class="tiny">题 ${mi+1}/${deck.length} · 答对 ${score}</span>
          <span class="tag">宏观图表</span>
        </div>
        ${chartHtml}
        <div style="margin-top:14px" id="macroAns"></div>
        <div class="between" style="margin-top:16px">
          <span class="tiny">先定位象限，再谈资产</span>
          <button class="btn btn-gold btn-sm" id="xNext" style="visibility:hidden">${mi===deck.length-1?"看成绩":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>`;
      renderAnswer($("#macroAns", body), it, ok => {
        if(ok) score++;
        $("#xNext", body).style.visibility = "";
      }, mi);
      $("#xNext", body).addEventListener("click", () => { mi++; render(); });
    }
    newDeck(); render();
  }

  /* ---------- 行情终端：lightweight-charts 可交互盘面（剧本合成数据，形态还原真实行情） ---------- */
  if(mode === "market"){
    /* === 实盘复盘 · KLineChart 真实行情（v22 B任务）=== */
    const CD = window.CHART_DATA || {};
    const KEYS = Object.keys(CD);
    let kc = null, curSym = KEYS[0], quiz = null, qi = 0, qScore = 0, cutIdx = -1, qMeta = null;
    const ind = { MA: true, BOLL: false, MACD: false, RSI: false };

    function emaArr(v, n){ const k = 2/(n+1); const o = []; let e = v[0]; for(let i=0;i<v.length;i++){ e = i? v[i]*k + e*(1-k) : v[i]; o.push(e); } return o; }
    function maArr(v, n){ const o = []; let s = 0; for(let i=0;i<v.length;i++){ s += v[i]; if(i>=n) s -= v[i-n]; o.push(i>=n-1? s/n : null); } return o; }
    function rsiArr(cl, n){ const o = new Array(cl.length).fill(null); if(cl.length <= n) return o; let ag = 0, al = 0; for(let i=1;i<=n;i++){ const d = cl[i]-cl[i-1]; ag += Math.max(d,0); al += Math.max(-d,0); } ag /= n; al /= n; o[n] = al===0? 100 : 100-100/(1+ag/al); for(let i=n+1;i<cl.length;i++){ const d = cl[i]-cl[i-1]; ag = (ag*(n-1)+Math.max(d,0))/n; al = (al*(n-1)+Math.max(-d,0))/n; o[i] = al===0? 100 : 100-100/(1+ag/al); } return o; }
    function macdArr(cl){ const e12 = emaArr(cl,12), e26 = emaArr(cl,26); const dif = cl.map((_,i)=>e12[i]-e26[i]); const dea = emaArr(dif,9); return { dif, dea }; }
    function fmtV(v){ return v>=1e8? (v/1e8).toFixed(1)+"亿" : v>=1e4? (v/1e4).toFixed(1)+"万" : String(v); }
    function fmtD(ts){ const d = new Date(ts); return (d.getMonth()+1)+"月"+d.getDate()+"日"; }
    window.__mkq = makeQuiz; /* 测试钩子 */

    function makeQuiz(bars, t){
      const cl = bars.slice(0, t+1).map(x=>x.close);
      const pool = [];
      const md = macdArr(cl);
      let sig = 0, cross = 0;
      for(let i = Math.max(1, t-29); i <= t; i++){
        const p = md.dif[i-1]-md.dea[i-1], n2 = md.dif[i]-md.dea[i];
        if(p <= 0 && n2 > 0){ sig = 1; cross++; } else if(p >= 0 && n2 < 0){ sig = -1; cross++; }
      }
      if(cross > 0) pool.push({ q:"截至出题日，MACD(12,26,9) 最近 30 个交易日发出的信号是？",
        opts: sig>0? ["金叉（DIF 上穿 DEA）","死叉（DIF 下穿 DEA）"] : ["死叉（DIF 下穿 DEA）","金叉（DIF 上穿 DEA）"], a:0,
        why:"出题日 DIF="+md.dif[t].toFixed(4)+"，DEA="+md.dea[t].toFixed(4)+"，30 日内出现 "+cross+" 次交叉，最近一次是"+(sig>0?"金叉——多头动能转强。":"死叉——空头动能占优。")+"提醒：指标是行情的记录，不是行情的预言；它只负责描述，不负责承诺。" });
      const rs = rsiArr(cl, 14), r = rs[t];
      if(r != null){
        const zone = r>=70? 0 : r<=30? 1 : 2;
        pool.push({ q:"截至出题日，RSI(14) 处于什么状态？", opts:["超买区（≥70）","超卖区（≤30）","中性区（30~70）"], a:zone,
          why:"出题日 RSI(14) = "+r.toFixed(1)+"。"+(zone===0?"短期涨得急，情绪偏热——这不是卖出指令，是提醒你别人可能正在贪婪（钟摆不会永远停在一端）。":zone===1?"短期跌得狠，情绪偏冷——恐惧里常有便宜货，但接飞刀之前先等右侧信号。":"不上不下，处于指标失效区——这时候别拿它当决策依据。") });
      }
      const m5 = maArr(cl,5), m20 = maArr(cl,20);
      if(m20[t] != null){
        const up = m5[t] > m20[t];
        pool.push({ q:"截至出题日，短周期均线的位置关系是？", opts:["MA5 在 MA20 上方（短期偏强）","MA5 在 MA20 下方（短期偏弱）"], a: up?0:1,
          why:"出题日 MA5="+m5[t].toFixed(3)+"，MA20="+m20[t].toFixed(3)+"。"+(up?"短周期成本线站上长周期成本线，短期趋势向上——均线是趋势的影子，只描述、不预测。":"短周期成本线跌破长周期成本线，短期趋势转弱——此时更该做的是核对纪律线，而不是猜底。") });
      }
      if(t >= 6){
        const v = bars[t].volume, v5 = (bars[t-1].volume+bars[t-2].volume+bars[t-3].volume+bars[t-4].volume+bars[t-5].volume)/5;
        const ratio = v/v5;
        const st = ratio>1.5? 0 : ratio<0.6? 1 : 2;
        pool.push({ q:"出题日当天的量能状态是（对比前五日均量）？", opts:["明显放量（>1.5 倍）","明显缩量（<0.6 倍）","大致持平（0.6~1.5 倍）"], a:st,
          why:"当日成交量 "+fmtV(v)+"，前五日均量 "+fmtV(v5)+"，量比 "+ratio.toFixed(2)+"。"+(st===0?"放量 = 分歧加大，位置决定意义：低位放量与高位放量含义完全相反。":st===1?"缩量 = 观望，多空都懒得出手，此时价格信号的含金量要打折。":"量能平稳，当日没有额外的资金信号，把注意力放回价格结构。") });
      }
      return pool.sort(()=>Math.random()-.5).slice(0, 2);
    }

    function drawChart(upto){
      const host = $("#mkChart", body);
      if(!host) return;
      host.innerHTML = "";
      if(kc){ try{ klinecharts.dispose(kc); }catch(e){} kc = null; }
      if(!window.klinecharts){ host.innerHTML = '<p class="muted small" style="padding:20px">KLineChart 引擎未加载，读图挑战不受影响。</p>'; return; }
      const d = CD[curSym]; if(!d) return;
      const bars = upto? d.bars.slice(0, upto) : d.bars;
      try{
        kc = klinecharts.init(host, { styles: {
          grid:{ vertLines:{ color:"rgba(201,162,39,.07)" }, horzLines:{ color:"rgba(201,162,39,.07)" } },
          candle:{ bar:{ upColor:"#C0392B", downColor:"#1E8449", noChangeColor:"#8C8470" } },
          xAxis:{ axisLine:{ color:"rgba(201,162,39,.25)" }, tickText:{ color:"#C9B57A", textSize:10 } },
          yAxis:{ axisLine:{ color:"rgba(201,162,39,.25)" }, tickText:{ color:"#C9B57A", textSize:10 } },
          separator:{ color:"rgba(201,162,39,.12)" },
          crosshair:{ horizontal:{ line:{ color:"rgba(229,206,138,.4)" } }, vertical:{ line:{ color:"rgba(229,206,138,.4)" } } }
        }});
        kc.setSymbol({ ticker: d.sym, pricePrecision: 3, volumePrecision: 0 });
        kc.setPeriod({ span: 1, type: "day" });
        kc.setDataLoader({ getBars: ({ callback }) => { callback(bars); } });
        if(ind.MA) try{ kc.createIndicator({ name:"MA", paneId:"candle_pane" }, true); }catch(e){}
        if(ind.BOLL) try{ kc.createIndicator({ name:"BOLL", paneId:"candle_pane" }, true); }catch(e){}
        if(ind.MACD) try{ kc.createIndicator("MACD"); }catch(e){}
        if(ind.RSI) try{ kc.createIndicator("RSI"); }catch(e){}
      }catch(err){ host.innerHTML = '<p class="muted small" style="padding:20px">图表初始化失败（'+(err && err.message || "未知")+'），读图挑战不受影响。</p>'; }
      const rz = () => { if(kc) try{ kc.resize(); }catch(e){} };
      window.removeEventListener("resize", window._mkRz || (()=>{}));
      window._mkRz = rz; window.addEventListener("resize", rz);
    }

    function syncChips(){
      $$("#mkSyms .btn", body).forEach(b => { b.style.borderColor = b.dataset.s===curSym? "#C9A227" : ""; b.style.color = b.dataset.s===curSym? "#C9A227" : ""; });
      $$("#mkInds .btn", body).forEach(b => { const on = !!ind[b.dataset.i]; b.style.borderColor = on? "#C9A227" : ""; b.style.color = on? "#C9A227" : ""; });
    }

    function startQuiz(){
      const d = CD[curSym]; const bars = d.bars;
      const lo = 200, hi = Math.min(bars.length-70, 560);
      cutIdx = lo + Math.floor(Math.random()*(hi-lo));
      drawChart(cutIdx+1);
      quiz = makeQuiz(bars, cutIdx);
      qi = 0; qScore = 0;
      qMeta = { date: fmtD(bars[cutIdx].timestamp), close: bars[cutIdx].close };
      $("#mkDesc", body).innerHTML = '<span class="tagline">出题日</span> '+qMeta.date+'（收盘 '+qMeta.close.toFixed(3)+'）。'+fmtD(bars[cutIdx].timestamp)+' 之后的走势已藏起——请基于眼前的信息作答，别用「后来我知道」的上帝视角。';
      nextQ();
    }

    function nextQ(){
      if(qi >= quiz.length){
        const d = CD[curSym]; const bars = d.bars;
        const after = bars.slice(cutIdx+1, cutIdx+61);
        let peak = -1e9, mdd = 0;
        const base = bars[cutIdx].close, last = after.length? after[after.length-1].close : base;
        after.forEach(k => { peak = Math.max(peak, k.high); mdd = Math.max(mdd, (peak-k.low)/peak*100); });
        const chg = after.length? (last/base-1)*100 : 0;
        drawChart(0);
        try{ if(kc) kc.scrollToDataIndex(cutIdx); }catch(e){}
        $("#mkDesc", body).innerHTML = '<span class="tagline">事后复盘</span> 出题日 '+qMeta.date+'（收盘 '+qMeta.close.toFixed(3)+'），之后 60 个交易日：区间涨跌 '+(chg>=0?"+":"")+chg.toFixed(1)+'%，期间最大回撤 '+mdd.toFixed(1)+'%。现在图已恢复全程——看看你当时看到的和后来发生的，差了多少是运气，差了多少是认知。';
        $("#mkQ", body).innerHTML = '<div class="glass glass-pad" style="text-align:center;padding:20px"><div class="kicker" style="justify-content:center">本轮读图成绩</div><h2 style="font-family:var(--serif);font-size:24px;margin:8px 0">'+qScore+' / '+quiz.length+'</h2><p class="muted small">对错不重要——重要的是答完回头看行情时，你有没有更冷静一点。</p></div>';
        $("#mkGo", body).innerHTML = '<button class="btn btn-gold" id="mkAgain">'+icon("refresh")+' 再来一题</button>';
        $("#mkAgain", body).addEventListener("click", ()=>{ startQuiz(); });
        return;
      }
      $("#mkQ", body).innerHTML = '<div id="mkMount"></div><div class="between" style="margin-top:10px"><span class="tiny">第 '+(qi+1)+' 题 / 共 '+quiz.length+' 题</span><button class="btn btn-gold btn-sm" id="mkNext" style="visibility:hidden">下一题 '+icon("chevR")+'</button></div>';
      renderAnswer($("#mkMount", body), quiz[qi], ok => { if(ok) qScore++; $("#mkNext", body).style.visibility = ""; }, qi);
      $("#mkNext", body).addEventListener("click", ()=>{ qi++; nextQ(); });
    }

    body.innerHTML = `
    <div class="glass q-card">
      <div class="card-title">${icon("trend")} 实盘复盘 · 真实行情读图</div>
      <p class="muted small" style="margin:6px 0 10px">真实历史日 K（新浪财经，未复权，仅供复盘学习）。先切标的看盘，再点「出题」——系统随机藏起出题日之后的走势，用你学过的指标读图作答。</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px" id="mkSyms">
        ${KEYS.map(k=>`<button class="btn btn-ghost btn-sm" data-s="${k}">${CD[k].name}</button>`).join("")}
      </div>
      <div class="chart-card" style="padding:6px"><div id="mkChart" style="width:100%;height:360px"></div></div>
      <p class="tiny muted" style="margin:10px 0 0" id="mkDesc">红涨绿跌 · MA 已叠加 · 可缩放平移。点下方指标名开合。</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0" id="mkInds">
        ${["MA","BOLL","MACD","RSI"].map(x=>`<button class="btn btn-ghost btn-sm" data-i="${x}">${x}</button>`).join("")}
      </div>
      <div style="margin-top:8px" id="mkQ"></div>
      <div class="between" style="margin-top:10px" id="mkGo"><button class="btn btn-gold" id="mkStart">${icon("target")} 出题 · 藏起未来考考你</button></div>
    </div>`;
    drawChart(0); syncChips();
    $$("#mkSyms .btn", body).forEach(b => b.addEventListener("click", () => { curSym = b.dataset.s; drawChart(0); syncChips(); }));
    $$("#mkInds .btn", body).forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.i;
      if(k === "MA"){ ind.MA = true; ind.BOLL = false; }
      else if(k === "BOLL"){ ind.BOLL = true; ind.MA = false; }
      else ind[k] = !ind[k];
      drawChart(cutIdx >= 0 && quiz && qi < quiz.length ? cutIdx+1 : 0); syncChips();
    }));
    $("#mkStart", body).addEventListener("click", startQuiz);
  }

  if(mode === "terminal"){
    function rng(seed){
      return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    }
    function makeCandles(anchors, seed){
      const rand = rng(seed);
      const N = anchors[anchors.length-1][0];
      const closes = new Array(N+1);
      for(let i=0;i<anchors.length-1;i++){
        const i0=anchors[i][0], p0=anchors[i][1], i1=anchors[i+1][0], p1=anchors[i+1][1];
        for(let j=i0;j<=i1;j++){
          const t=(j-i0)/(i1-i0);
          const e=t*t*(3-2*t);
          const edge=(j===i0||j===i1)?0.2:1;
          closes[j]=p0+(p1-p0)*e+(rand()-0.5)*p0*0.03*edge;
        }
      }
      const out=[]; const d0=new Date(2019,0,2); let prev=closes[0];
      for(let i=0;i<=N;i++){
        const c=closes[i], o=prev;
        const hi=Math.max(o,c)*(1+rand()*0.018), lo=Math.min(o,c)*(1-rand()*0.018);
        const day=new Date(d0.getTime()+i*864e5);
        out.push({ time:day.toISOString().slice(0,10), open:+o.toFixed(2), high:+hi.toFixed(2), low:+lo.toFixed(2), close:+c.toFixed(2) });
        prev=c;
      }
      return out;
    }
    /* 从蜡烛数组派生确定性答案 */
    function stats(cs){
      const first=cs[0].close, last=cs[cs.length-1].close;
      let peak=-1e9, mdd=0;
      cs.forEach(k=>{
        peak=Math.max(peak,k.high);
        mdd=Math.max(mdd,(peak-k.low)/peak*100);
      });
      return { chg:(last/first-1)*100, mdd };
    }
    const SCRIPTS=[
      { name:"酱香白马 · 慢牛与筑顶", seed:42, anchors:[[0,100],[30,118],[60,142],[85,205],[100,238],[112,215],[124,176],[130,182]],
        shape:"高位宽幅震荡筑顶（双头结构），随后破位下行", task:"最后 20 根 K 线里，盘面给出的最重要的信号是什么？",
        opts:["高位双头 + 破位，趋势反转信号","缩量回调，健康洗盘","三角形整理，即将向上突破","底部吸筹形态"], a:0,
        why:"价格两次冲击 240 一线无力创新高（双头），随后跌破颈线——顶部结构的教科书特征。此时纪律动作是执行离场规则，而不是幻想「洗盘」。" },
      { name:"杠杆疯牛 · 冲顶与崩塌", seed:7, anchors:[[0,100],[28,104],[48,128],[62,188],[74,226],[84,138],[94,104],[100,112]],
        shape:"末端垂直加速赶顶后崩盘（杠杆牛熊）", task:"行情末段（最后 25 根）的加速上涨随后急跌，最合理的定性是？",
        opts:["垂直加速 = 情绪赶顶，随后的下跌是杠杆出清","正常的中途换手","价值回归的缓慢修正","洗盘结束，即将新高"], a:0,
        why:"斜率突然变陡的赶顶段是典型的情绪定价：融资盘接力推高，一但增速放缓便互相踩踏。事后看每一轮疯牛的最后一程都长这样。" },
      { name:"财务暴雷 · 断崖闪崩", seed:99, anchors:[[0,100],[40,132],[55,140],[60,92],[70,71],[80,78],[88,74]],
        shape:"高位横盘后向下跳空断崖（利空暴露）", task:"第 55~62 根之间连续大阴线的断崖，最可能对应的事件是？",
        opts:["突发重大利空（业绩造假/债务违约被坐实）","大盘正常波动","技术性回调后将继续原趋势","庄家洗盘吸筹"], a:0,
        why:"缓涨两年、几天跌没——价格对「确定性坏消息」的定价是一步到位的。它教的纪律是：不下注于你无法验证的报表；分散持仓，让任何一根断崖都砍不死你。" },
    ];
    let cur = 0, chart = null, series = null, tasks = [], ti = 0, score = 0;

    function draw(cs){
      const host = $("#tcChart", body);
      host.innerHTML = "";
      if(!window.LightweightCharts){ host.innerHTML = `<p class="muted small" style="padding:20px">图表引擎加载失败。</p>`; return; }
      try{
      chart = LightweightCharts.createChart(host, {
        width: host.clientWidth, height: 340,
        layout:{ background:{ type:"solid", color:"#151310" }, textColor:"#C9B57A", fontSize:11 },
        grid:{ vertLines:{ color:"rgba(201,162,39,.08)" }, horzLines:{ color:"rgba(201,162,39,.08)" } },
        rightPriceScale:{ borderColor:"rgba(201,162,39,.2)" },
        timeScale:{ borderColor:"rgba(201,162,39,.2)", timeVisible:false },
        crosshair:{ mode:0, vertLine:{ color:"rgba(229,206,138,.4)", labelBackgroundColor:"#8C6D2F" }, horzLine:{ color:"rgba(229,206,138,.4)", labelBackgroundColor:"#8C6D2F" } }
      });
      series = chart.addCandlestickSeries({
        upColor:"#C0392B", downColor:"#1E8449", borderVisible:false,
        wickUpColor:"#C0392B", wickDownColor:"#1E8449"
      });
      series.setData(cs);
      chart.timeScale().fitContent();
      const onRz = () => { if(chart) chart.applyOptions({ width:host.clientWidth }); };
      window.removeEventListener("resize", window._tcRz || (()=>{}));
      window._tcRz = onRz; window.addEventListener("resize", onRz);
      }catch(err){ host.innerHTML = `<p class="muted small" style="padding:20px">图表初始化失败（${err && err.message || "未知"}），其他训练不受影响。</p>`; }
    }
    function renderTasks(cs){
      const st = stats(cs);
      const sc = SCRIPTS[cur];
      tasks = [
        { t:"num", q:"这段行情首尾的区间涨跌幅约为多少？（按百分数填，如 45 代表 +45%，容差 ±3）", ans:+st.chg.toFixed(1), tol:3,
          why:"首根收盘 " + cs[0].close + " → 末根收盘 " + cs[cs.length-1].close + "。先看全局再谈细节：区间涨幅是一切故事的骨架。" },
        { t:"num", q:"这段行情的最大回撤约为多少？（从区间最高点跌到其后最低点的最大幅度，填正数百分数，容差 ±3）", ans:+st.mdd.toFixed(1), tol:3,
          why:"最大回撤 = 峰值到其后谷底的最大跌幅。它是复利曲线的杀手（第〇阶段讲过），也是仓位管理的标尺。" },
        { t:"mc", q:sc.task, opts:sc.opts, a:sc.a, why:sc.why }
      ].sort(() => Math.random()-.5);
      ti = 0; score = 0;
      const rt = () => {
        if(ti >= tasks.length){
          $("#tAns", body).innerHTML = `<div class="glass glass-pad" style="text-align:center;padding:22px">
            <div class="kicker" style="justify-content:center">本段复盘成绩</div>
            <h2 style="font-family:var(--serif);font-size:24px;margin:8px 0">${score} / ${tasks.length}</h2>
            <p class="muted small">换一段行情，再走一遍。盘面万变，纪律不变。</p></div>`;
          return;
        }
        $("#tAns", body).innerHTML = `<div id="tMount"></div><div class="between" style="margin-top:12px">
          <span class="tiny">任务 ${ti+1}/${tasks.length}</span>
          <button class="btn btn-gold btn-sm" id="tNext" style="visibility:hidden">${ti===tasks.length-1?"看成绩":"下一个任务"} ${icon("chevR")}</button></div>`;
        renderAnswer($("#tMount", body), tasks[ti], ok => {
          if(ok) score++;
          $("#tNext", body).style.visibility = "";
        }, ti);
        $("#tNext", body).addEventListener("click", () => { ti++; rt(); });
      };
      rt();
    }
    function openScript(i){
      cur = i;
      const sc = SCRIPTS[i];
      const cs = makeCandles(sc.anchors, sc.seed);
      $$("#tSel option", body).forEach((o,j) => o.selected = j===i);
      draw(cs);
      renderTasks(cs);
    }
    body.innerHTML = `
    <div class="glass q-card">
      <div class="between" style="margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:0">
          <div class="card-title">${icon("target")} 行情终端 · 真实形态复盘</div>
          <p class="muted small" style="margin-top:4px">可以缩放、平移的盘面——先用眼睛看清一段行情，再回答问题。滚动缩放，按住拖动平移。</p>
        </div>
        <select class="inp" id="tSel" style="max-width:230px;margin-left:12px">
          ${SCRIPTS.map((s,i)=>`<option value="${i}">${s.name}</option>`).join("")}
        </select>
      </div>
      <div class="chart-card" style="padding:6px"><div id="tcChart" style="width:100%"></div></div>
      <div style="margin-top:16px" id="tAns"></div>
    </div>`;
    $("#tSel", body).addEventListener("change", e => openScript(+e.target.value));
    /* 元素入 DOM 后再建图表：lightweight-charts 依赖容器宽度，未渲染时 clientWidth=0 会导致盘面空白 */
    requestAnimationFrame(() => openScript(0));
  }

  return el;
};
