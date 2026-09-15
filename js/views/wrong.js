/* ============================================================
   views/wrong.js — 错题本
   ============================================================ */
"use strict";
VIEWS.wrong = function(){
  const el = document.createElement("div");
  const keys = Object.keys(S.wrong);
  el.innerHTML = `
  <div class="wrap st">
    <div class="between" style="margin-bottom:18px;flex-wrap:wrap">
      <div>
        <div class="kicker">WRONG BOOK · 錯題本</div>
        <h1 style="font-size:26px;margin-top:8px">错题本 <span class="gold-text num" style="font-size:20px">${keys.length}</span></h1>
        <p class="muted small" style="margin-top:4px">每道错题自动进入本子与记忆循环——重练答对即消灭，答错则明天再见。</p>
      </div>
      ${keys.length?`<button class="btn btn-gold" id="practice">${icon("refresh")} 重练全部错题</button>`:""}
    </div>
    ${keys.length ? keys.map(k=>{
      const w = S.wrong[k]; const q = LESSON[w.lesson].quiz[w.qi];
      const st = STAGE[LESSON[w.lesson].stage];
      return `<div class="wrong-item">
        <div class="between">
          <span class="tiny">${st.title} · ${LESSON[w.lesson].title}</span>
          <a class="tiny" style="color:var(--gold)" href="#/lesson/${w.lesson}">回到课程 ${icon("chevR")}</a>
        </div>
        <div class="wq">${q.q}</div>
        <div class="wa">✓ ${q.opts[q.a]}</div>
      </div>`;
    }).join("") : `
      <div class="glass glass-pad empty">
        ${icon("check")}
        <p>错题本干净如新。<br>做错的题目会自动收录到这里——错一次，恰恰是记忆最深的时机。</p>
        <button class="btn btn-gold btn-sm" data-go="#/map" style="margin-top:14px">去做题</button>
      </div>`}
  </div>`;
  const p = $("#practice", el);
  if(p) p.addEventListener("click",()=>go("#/quiz/wrong"));
  $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
  App.navChips();
  return el;
};
