/* ============================================================
   views/daily.js — 每日一卷：从已学课程随机抽 5 题（当日同卷）
   ============================================================ */
"use strict";
VIEWS.daily = function(){
  const el = document.createElement("div");
  const t = dayKey();
  const doneIds = ORDER.filter(id => LState(id).done);
  const pool = [];
  doneIds.forEach(id => LESSON[id].quiz.forEach((q, qi) => pool.push({ ...q, t:"mc", lesson:id, qi })));

  if(!pool.length){
    el.innerHTML = `
    <div class="wrap quiz-wrap st">
      <div class="glass glass-pad" style="padding:44px 30px;text-align:center">
        ${icon("target","empty")}
        <h2 style="font-family:var(--serif);margin:6px 0">每日一卷等你解锁</h2>
        <p class="muted small">混测题目来自你已经学过的课程——先去完成第一课，明天的混测就会开张。</p>
        <button class="btn btn-gold" data-go="#/lesson/s0l1" style="margin-top:16px">去学第一课 ${icon("chevR")}</button>
      </div>
    </div>`;
    $$("[data-go]", el).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
    return el;
  }

  const seed = parseInt(t.replace(/-/g, ""), 10);
  const items = sampleItems(pool, 5, seed);
  let idx = 0, correct = 0;
  const first = !(S.dailyMix && S.dailyMix.date === t);

  function renderResult(){
    const pct = Math.round(correct / items.length * 100);
    el.innerHTML = `
    <div class="wrap quiz-wrap st">
      <div class="glass q-result">
        <div class="kicker" style="justify-content:center">每日一卷 · ${t}</div>
        ${ring(pct, 150, correct >= 3 ? "通过" : "再接", correct + "/" + items.length)}
        <h2 style="font-family:var(--serif);font-size:24px;margin:14px 0 6px">${correct >= 5 ? "满分收官！" : correct >= 3 ? "混测完成" : "今日欠火候"}</h2>
        <p class="muted small">${correct >= 3
          ? "此卷专为对抗遗忘：答错之题，已在错题本中等。"
          : "错一次恰恰是记忆最深的时机——错题本见。"}</p>
        <div class="row" style="justify-content:center;gap:12px;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="dReview">${icon("book")} 看错题本</button>
          <button class="btn btn-ghost" data-go="#/review">${icon("zap")} 去复习卡片</button>
          <button class="btn btn-gold" data-go="#/home">返回首页</button>
        </div>
      </div>
    </div>`;
    $("#dReview", el).addEventListener("click", () => go("#/wrong"));
    $$("[data-go]", el).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
    mountAnimations(el); App.navChips();
  }

  function renderQ(){
    if(idx >= items.length){ renderResult(); return; }
    const it = items[idx];
    el.innerHTML = `
    <div class="wrap quiz-wrap st">
      <div class="q-top">
        <div>
          <div class="kicker" style="margin-bottom:4px">每日一卷 · 今日五题</div>
          <span class="tiny">题自已学课程 · 当日同卷 · 第 ${idx+1}/${items.length} 题</span>
        </div>
        <button class="btn btn-ghost btn-sm" id="mixExit">退出</button>
      </div>
      <div class="q-dots">${items.map((_,i)=>`<span class="q-dot ${i===idx?"cur":i<idx?(items[i]._ok?"ok":"bad"):""}"></span>`).join("")}</div>
      <div class="glass q-card">
        <div id="dAns"></div>
        <div class="between" style="margin-top:16px">
          <span class="tiny">已答对 ${correct} 题 · 答对 +3 XP</span>
          <button class="btn btn-gold btn-sm" id="dNext" style="visibility:hidden">${idx===items.length-1?"交 卷":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>
    </div>`;
    renderAnswer($("#dAns", el), it, ok => {
      items[idx]._ok = ok;
      if(ok) correct++;
      $("#dNext", el).style.visibility = "";
    }, idx);
    $("#dNext", el).addEventListener("click", () => { idx++; renderQ(); });
    $("#mixExit", el).addEventListener("click", () => {
      modal(`<h3>退出今日一卷？</h3><p>本卷进度将丢弃（已答错的题仍会收录进错题本与复习循环），明日更换新卷。</p>
        <div class="row" style="justify-content:flex-end;margin-top:16px">
        <button class="btn btn-ghost btn-sm" id="mxNo">继续作答</button>
        <button class="btn btn-gold btn-sm" id="mxYes">确认退出</button></div>`);
      $("#mxNo", mask).addEventListener("click", () => mask.remove());
      $("#mxYes", mask).addEventListener("click", () => go("#/home"));
    });
  }

  /* 完成记账：当日最好成绩 + XP + 错题收录 */
  const _origRenderResult = renderResult;
  renderResult = function(){
    const prev = S.dailyMix && S.dailyMix.date === t ? S.dailyMix : null;
    if(!prev || correct > prev.score){
      S.dailyMix = { date: t, score: correct, total: items.length };
    }
    award(first ? correct * 3 + 10 : correct * 3, "每日一卷");
    items.forEach(it => { if(it._ok === false){
      SRS.addWrongCard(it.lesson, it.qi);
      S.wrong[`${it.lesson}:${it.qi}`] = { lesson: it.lesson, qi: it.qi };
    }});
    save();
    _origRenderResult();
  };
  renderQ();
  return el;
};
