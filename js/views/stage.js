/* ============================================================
   views/stage.js — 阶段详情：课程列表 + 阶段测验关卡
   ============================================================ */
"use strict";
VIEWS.stage = function(sid){
  if(!sid || !STAGE[sid]){ go("#/map"); return document.createElement("div"); }
  const st = STAGE[sid];
  const info = stageInfo(sid);
  const ex = S.exams[sid];
  const allDone = info.done === info.total;
  const isLast = st.id === "s9";
  const gradReady = CURRICULUM.filter(s=>s.id!=="s9").every(s=>S.exams[s.id]&&S.exams[s.id].pass)
                    && STAGE.s9.lessons.every(l=>LState(l.id).done);
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="wrap st">
    <div class="glass stage-hero" style="--stg:${st.hue}">
      <span class="halo"></span>
      <div class="between" style="align-items:flex-start">
        <div>
          <div class="crumb"><a href="#/map">知识地图</a> ${icon("chevR")} ${st.num}</div>
          <h1 style="font-size:27px;margin-top:8px">${st.cn} · ${st.title}</h1>
          <p class="muted" style="max-width:66ch;margin-top:6px">${st.intro}</p>
        </div>
        <div style="text-align:center;flex:none">
          ${ring(info.pct, 96, "课程进度", info.mastery>0?`掌握 ${info.mastery}%`:"")}
        </div>
      </div>
    </div>

    <div style="margin:8px 0 18px">
      ${st.lessons.map((l,i)=>{
        const ls = LState(l.id);
        return `
        <div class="lesson-row ${ls.done?"done":""}" data-lesson="${l.id}">
          <div class="idx">${String(i+1).padStart(2,"0")}</div>
          <div class="inf"><b>${l.title}</b><span>${l.hook}</span></div>
          ${ls.done
            ? `<span class="tag done">${icon("check")} ${ls.best}%</span>`
            : `<span class="tag">${l.mins} 分钟</span>`}
        </div>`;
      }).join("")}
    </div>

    ${isLast ? `
      <div class="glass glass-pad" style="border-color:var(--gbrd2)">
        <div class="between">
          <div class="card-title" style="margin:0">${icon("award")} 毕业考 · 知行合一</div>
          ${S.grad ? `<span class="tag done">${icon("star")} 已毕业</span>` : `<span class="tag">${gradReady?"可以应考":"未达成条件"}</span>`}
        </div>
        <p class="muted small" style="margin:8px 0 12px">${st.gradIntro||""}</p>
        <button class="btn btn-gold" id="gradBtn" ${gradReady&&!S.grad?"":"disabled"}>进入毕业考</button>
        ${!gradReady?`<p class="tiny" style="margin-top:10px">条件：前八个阶段全部测验通过，且本阶段两课完成。</p>`:""}
      </div>` : `
      <div class="glass glass-pad" style="border-color:${allDone?"var(--gbrd2)":"transparent"}">
        <div class="between">
          <div class="card-title" style="margin:0">${icon("target")} 阶段测验 · 通往下一关</div>
          ${ex&&ex.pass?`<span class="tag done">${icon("check")} 已通过 ${ex.best}%</span>`
            :`<span class="tag ${allDone?"":"gray"}">${allDone?"已解锁":"需完成全部课程"}</span>`}
        </div>
        <p class="muted small" style="margin:8px 0 12px">从本阶段课程题库随机抽取 8 题，答对 75% 以上（≥6 题）即通过并解锁下一阶段。</p>
        <button class="btn ${ex&&ex.pass?"btn-ghost":"btn-gold"}" id="examBtn" ${allDone?"":"disabled"}>
          ${ex&&ex.pass?"再测一次":"开始阶段测验"}</button>
      </div>`}
  </div>`;
  $$(".lesson-row", el).forEach(n=>n.addEventListener("click",()=>go(`#/lesson/${n.dataset.lesson}`)));
  const examBtn = $("#examBtn", el);
  if(examBtn) examBtn.addEventListener("click",()=>go(`#/quiz/exam-${sid}`));
  const gradBtn = $("#gradBtn", el);
  if(gradBtn) gradBtn.addEventListener("click",()=>go("#/quiz/grad"));
  mountAnimations(el);
  return el;
};
