/* ============================================================
   views/lesson.js — 课程阅读页
   ============================================================ */
"use strict";
VIEWS.lesson = function(lid){
  if(!lid || !LESSON[lid]){ go("#/map"); return document.createElement("div"); }
  const l = LESSON[lid], st = STAGE[l.stage];
  const ls = LState(lid);
  const ids = st.lessons.map(x=>x.id);
  const prev = ids[st.lessons.indexOf(l)-1], next = ids[st.lessons.indexOf(l)+1];
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="wrap">
    <div class="lesson-layout">
      <div class="glass lesson-main">
        <div class="crumb"><a href="#/map">地图</a>${icon("chevR")}<a href="#/stage/${l.stage}">${st.title}</a>${icon("chevR")}第 ${l.order+1} 课</div>
        <h1>${l.title}</h1>
        <p class="hook">◈ ${l.hook}</p>
        <div class="row" style="gap:8px;margin:10px 0 4px">
          <span class="tag">${l.mins} 分钟</span>
          ${ls.done?`<span class="tag done">${icon("check")} 已通过 ${ls.best}%</span>`:`<span class="tag gray">未完成</span>`}
          <span class="tag gray">掌握度 ${Math.round(ls.mastery)}%</span>
        </div>
        <hr class="divider" style="margin:14px 0 4px">
        ${l.sections.map((s,i)=>`
        <div class="sec">
          <div class="sec-head"><span class="no">${String(i+1).padStart(2,"0")}</span><h3>${s.h}</h3></div>
          ${s.p?`<p>${s.p}</p>`:""}
          ${s.fig&&window.FIGS&&FIGS[s.fig]?`<div class="fig-wrap">${FIGS[s.fig]}</div>`:""}
          ${s.steps?`<div class="steps-box"><span class="stag">分 步</span><ol>${s.steps.map(x=>`<li><b>${x[0]}</b>${x.slice(1)}</li>`).join("")}</ol></div>`:""}
          ${s.list?`<ul>${s.list.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}
          ${s.case?`<div class="case-box"><span class="ctag">案 例</span><p>${s.case}</p></div>`:""}
          ${s.plain?`<div class="plain-box"><span class="ptag">俗 讲</span><p>${s.plain}</p></div>`:""}
        </div>`).join("")}
        <div class="trap-box">
          <b>⚠ 常见误区 · 逆向学习</b>
          ${l.traps.map(t=>`<p><b>「${t.w}」</b><br>${t.c}</p>`).join("")}
        </div>
        <div class="lesson-cta">
          <button class="btn btn-gold" id="toQuiz">${icon("target")} 开始本课测验（≥60% 通过）</button>
          <button class="btn btn-ghost" data-go="#/stage/${l.stage}">返回阶段</button>
        </div>
        <div class="pn-nav">
          <a href="#/lesson/${prev||lid}" style="${prev?"":"visibility:hidden"}">${icon("chevL")} 上一课</a>
          <a href="#/lesson/${next||lid}" style="${next?"":"visibility:hidden"}">下一课 ${icon("chevR")}</a>
        </div>
      </div>
      <aside class="lesson-aside">
        <div class="glass glass-pad">
          <div class="card-title">${icon("star")} 本课要点 <span class="tiny" style="margin-left:auto">复习卡片来源</span></div>
          <div class="pt-list">${l.points.map(p=>`<div class="pt"><b>${p.t}</b><span>${p.d}</span></div>`).join("")}</div>
        </div>
        <div class="glass glass-pad">
          <div class="card-title">${icon("brain")} 记忆提示</div>
          <p class="small muted">完成本课测验后，这些要点与误区将自动进入你的<span style="color:var(--gold);font-weight:600">间隔复习循环</span>——系统会在你即将遗忘时提醒你复习。</p>
        </div>
      </aside>
    </div>
  </div>`;
  $("#toQuiz", el).addEventListener("click",()=>go(`#/quiz/${lid}`));
  $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));

  return el;
};
