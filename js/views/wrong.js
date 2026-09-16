/* ============================================================
   views/wrong.js — 错题本
   ============================================================ */
"use strict";
VIEWS.wrong = function(){
  const el = document.createElement("div");
  const keys = Object.keys(S.wrong);
  /* 按阶段分组，薄弱阶段一目了然 */
  const groups = CURRICULUM.map(st => ({
    st,
    items: keys.filter(k => { const w = S.wrong[k];
      return w && LESSON[w.lesson] && LESSON[w.lesson].stage === st.id; })
  })).filter(g => g.items.length);
  const weak = CURRICULUM.map(st => ({ st, w: stageWeakness(st.id) })).filter(x => x.w.danger);

  el.innerHTML = `
  <div class="wrap st">
    <div class="between" style="margin-bottom:18px;flex-wrap:wrap">
      <div>
        <div class="kicker">WRONG BOOK · 錯題本</div>
        <h1 style="font-size:26px;margin-top:8px">错题本 <span class="gold-text num" style="font-size:20px">${keys.length}</span></h1>
        <p class="muted small" style="margin-top:4px">答错的题自动进入本子与记忆循环——重练答对即消灭，答错则明天再见。</p>
      </div>
      ${keys.length?`<button class="btn btn-gold" id="practice">${icon("refresh")} 重练全部错题</button>`:""}
    </div>
    ${weak.length ? `
    <div class="glass glass-pad" style="margin-bottom:18px;border-color:rgba(180,91,82,.35)">
      <div class="card-title">${icon("target")} 薄弱诊断</div>
      <p class="small muted" style="margin:4px 0 10px">错题最多的阶段：<b>${weak.map(x => x.st.title).join("、")}</b>——它们在知识地图上已标注「待加固」。</p>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        ${weak.map(x=>`<button class="btn btn-ghost btn-sm" data-gow="wrong-${x.st.id}">${icon("refresh")} 重练「${x.st.title}」错题 ${x.w.wrong} 题</button>`).join("")}
      </div>
    </div>` : ""}
    ${groups.length ? groups.map(g=>`
    <div style="margin-bottom:22px">
      <div class="between" style="margin-bottom:10px">
        <div class="row" style="gap:10px">
          <span style="width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-family:var(--serif);font-size:12px;font-weight:700;color:#fff;background:${g.st.hue}">${g.st.cn}</span>
          <b style="font-family:var(--serif);font-size:16px">${g.st.title}</b>
          <span class="tag gray num">${g.items.length} 题</span>
        </div>
        <button class="btn btn-ghost btn-sm" data-gow="wrong-${g.st.id}">${icon("refresh")} 重练本组</button>
      </div>
      ${g.items.map(k=>{
        const w = S.wrong[k]; const q = LESSON[w.lesson].quiz[w.qi];
        return `<div class="wrong-item">
          <div class="between">
            <span class="tiny">${LESSON[w.lesson].title}</span>
            <a class="tiny" style="color:var(--gold)" href="#/lesson/${w.lesson}">回到课程 ${icon("chevR")}</a>
          </div>
          <div class="wq">${q.q}</div>
          <div class="wa">✓ ${q.opts[q.a]}</div>
        </div>`;
      }).join("")}
    </div>`).join("") : `
      <div class="glass glass-pad empty">
        ${icon("check")}
        <p>错题本干净如新。<br>做错的题目会自动收录到这里——错一次，恰恰是记忆最深的时机。</p>
        <button class="btn btn-gold btn-sm" data-go="#/map" style="margin-top:14px">去做题</button>
      </div>`}
  </div>`;
  const p = $("#practice", el);
  if(p) p.addEventListener("click",()=>go("#/quiz/wrong"));
  $$("[data-gow]",el).forEach(n=>n.addEventListener("click",()=>go("#/quiz/"+n.dataset.gow)));
  $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
  App.navChips();
  return el;
};
