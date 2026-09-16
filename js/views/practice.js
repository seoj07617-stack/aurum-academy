/* ============================================================
   views/practice.js — 实操训练：形态速认 / 财报诊室 / 计算特训
   ============================================================ */
"use strict";
function pracXP(ok){
  const t = dayKey();
  if(!S.prac || S.prac.d !== t) S.prac = { d: t, n: 0 };
  if(!ok || S.prac.n >= 40) return;
  S.prac.n += 2; award(2, "实操训练");
}

VIEWS.practice = function(mode){
  mode = ["pattern","report","drill"].includes(mode) ? mode : "pattern";
  const el = document.createElement("div");
  const TABS = [["pattern","形态速认"],["report","财报诊室"],["drill","计算特训"]];

  el.innerHTML = `
  <div class="wrap st">
    <div class="page-head">
      <div class="kicker">PRACTICE LAB · 实操</div>
      <h1 style="font-size:27px;margin-top:8px">实操训练</h1>
      <p class="muted small" style="margin-top:4px">图要亲眼看，账要亲手算——把第四、三阶段的「知识」磨成「手艺」。</p>
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
    let deck = [], idx = 0, score = 0, answered = false;
    const newDeck = () => {
      deck = [];
      PATTERNS.forEach(p => {
        deck.push({ chart:p.cs, q:"识别图中 K 线形态", opts:p.opts, a:p.opts.indexOf(p.name), why:p.why });
        if(p.q2) deck.push({ chart:p.cs, q:p.q2.q, opts:p.q2.opts, a:p.q2.a, why:p.q2.why });
      });
      deck.sort(() => Math.random() - .5); idx = 0; score = 0;
    };
    function render(){
      if(idx >= deck.length){
        body.innerHTML = `
        <div class="glass glass-pad" style="padding:40px 30px;text-align:center">
          <div class="kicker" style="justify-content:center">本组成绩</div>
          <h2 style="font-family:var(--serif);font-size:26px;margin:12px 0">${score} / ${deck.length}</h2>
          <p class="muted small">${score === deck.length ? "全对——眼力已经练出来了。" : "错过的形态会再出现在下一组里。"}</p>
          <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
            <button class="btn btn-gold" id="pAgain">${icon("refresh")} 再来一组</button>
            <button class="btn btn-ghost" data-go="#/lesson/s4l1">${icon("book")} 回看课程</button>
          </div>
        </div>`;
        $("#pAgain", body).addEventListener("click", () => { newDeck(); render(); });
        $$("[data-go]", body).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
        return;
      }
      const it = deck[idx];
      body.innerHTML = `
      <div class="glass q-card">
        <div class="between" style="margin-bottom:10px">
          <span class="tiny">第 ${idx+1}/${deck.length} 题 · 答对 ${score}</span>
          <span class="tag">看图识形态</span>
        </div>
        ${klineSVG(it.chart)}
        <h2 style="font-size:19px;margin:16px 0 14px">${it.q}</h2>
        ${it.opts.map((o,i)=>`<div class="opt" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></div>`).join("")}
        <div id="pWhy"></div>
      </div>`;
      let done = false;
      $$(".opt", body).forEach(o => o.addEventListener("click", () => {
        if(done) return; done = true; answered = true;
        const i = +o.dataset.i, ok = i === it.a;
        if(ok){ score++; o.classList.add("right"); pracXP(true); }
        else { o.classList.add("wrong"); $$(".opt", body)[it.a].classList.add("right"); }
        $$(".opt", body).forEach(x => { if(x !== o && +x.dataset.i !== it.a) x.classList.add("dim"); });
        $("#pWhy", body).innerHTML = `<div class="q-why ${ok?"good":"bad"}"><b>${ok?"✓ 识别正确":"✕ 识别错误"}</b><br>${it.why}</div>`;
        $("#pNext", body).style.visibility = "";
      }));
      const whyDiv = document.createElement("div");
      whyDiv.innerHTML = `<div class="between" style="margin-top:16px">
        <span class="tiny">识形态 · 更要记纪律</span>
        <button class="btn btn-gold btn-sm" id="pNext" style="visibility:hidden">${idx===deck.length-1?"看成绩":"下一题"} ${icon("chevR")}</button>
      </div><div id="pNext-holder"></div>`;
      body.querySelector("#pWhy").after(whyDiv);
      $("#pNext", body).addEventListener("click", () => { idx++; render(); });
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
      const picks = c.qs.map(() => -1);
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
          <div style="margin-top:8px">${q.opts.map((o,oi)=>`
            <div class="opt" data-q="${qi}" data-o="${oi}"><span class="key">${"ABCD"[oi]}</span><span>${o}</span></div>`).join("")}
          </div>
          <div id="caseWhy${qi}"></div>
        </div>`).join("")}
        <div class="between" style="margin-top:16px">
          <button class="btn btn-ghost btn-sm" id="caseBack2">返回病例列表</button>
          <button class="btn btn-gold" id="caseSubmit">提交诊断</button>
        </div>
      </div>`;
      $$(".opt", body).forEach(o => o.addEventListener("click", () => {
        const qi = +o.dataset.q; picks[qi] = +o.dataset.o;
        $$(`.opt[data-q="${qi}"]`, body).forEach(x => x.classList.remove("right"));
        o.classList.add("right");
      }));
      $("#caseBack", body).addEventListener("click", renderList);
      $("#caseBack2", body).addEventListener("click", renderList);
      $("#caseSubmit", body).addEventListener("click", () => {
        if(picks.some(p => p < 0)){ toast("还有问题未作答"); return; }
        let ok = 0;
        c.qs.forEach((q, qi) => {
          const good = picks[qi] === q.a; if(good){ ok++; pracXP(true); }
          $$(`.opt[data-q="${qi}"]`, body).forEach(x => {
            const oi = +x.dataset.o;
            if(oi === q.a) x.classList.add("right");
            else if(oi === picks[qi]) x.classList.add("wrong");
          });
          $("#caseWhy"+qi, body).innerHTML = `<div class="q-why ${good?"good":"bad"}"><b>${good?"✓ 诊断正确":"✕ 参考诊断"}</b><br>${q.why}</div>`;
        });
        if(ok === c.qs.length) confetti(24);
        $("#caseSubmit", body).disabled = true;
        $("#caseSubmit", body).textContent = `诊断完成 ${ok}/${c.qs.length}`;
      });
    }
    renderList();
  }

  /* ---------- 计算特训 ---------- */
  if(mode === "drill"){
    let round = [], ri = 0, streak = 0, best = 0, answered = false;
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
          <span class="tag">计算特训</span>
        </div>
        <h2 style="font-size:19px;margin:6px 0 14px">${it.q}</h2>
        ${it.opts.map((o,i)=>`<div class="opt" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></div>`).join("")}
        <div id="dWhy"></div>
        <div class="between" style="margin-top:16px">
          <span class="tiny">答对 +2 XP</span>
          <button class="btn btn-gold btn-sm" id="dNext" style="visibility:hidden">${ri===9?"看成绩":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>`;
      let done = false;
      $$(".opt", body).forEach(o => o.addEventListener("click", () => {
        if(done) return; done = true;
        const i = +o.dataset.i, ok = i === it.a;
        if(ok){ streak++; best = Math.max(best, streak); o.classList.add("right"); pracXP(true); }
        else { streak = 0; o.classList.add("wrong"); $$(".opt", body)[it.a].classList.add("right"); }
        $$(".opt", body).forEach(x => { if(x !== o && +x.dataset.i !== it.a) x.classList.add("dim"); });
        $("#dWhy", body).innerHTML = `<div class="q-why ${ok?"good":"bad"}"><b>${ok?"✓ 计算正确":"✕ 正确答案：" + it.opts[it.a]}</b><br>${it.why}</div>`;
        $("#dNext", body).style.visibility = "";
      }));
      $("#dNext", body).addEventListener("click", () => { ri++; render(); });
    }
    newRound(); render();
  }

  return el;
};
