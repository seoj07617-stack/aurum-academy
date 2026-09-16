/* ============================================================
   views/map.js — 知识地图：循序渐进的学习旅程
   ============================================================ */
"use strict";
VIEWS.map = function(){
  const el = document.createElement("div");
  el.innerHTML = `
  <div class="wrap st">
    <div class="page-head">
      <div class="kicker">CURRICULUM · 九阶旅程</div>
      <h1 style="font-size:29px;margin-top:10px">知识地图：从宏观到知行合一</h1>
      <p class="muted" style="margin-top:6px;max-width:72ch">课程按依赖关系递进解锁：完成当前阶段全部课程并通过阶段测验，即开启下一阶段。
      每个阶段的金色圆点亮度，代表你对它的记忆掌握度——不复习，光会随时间衰减。</p>
    </div>
    <div class="journey">
      <div class="j-line"></div>
      ${CURRICULUM.map((st,i)=>{
        const info = stageInfo(st.id);
        const unlocked = stageUnlocked(st.id);
        const ex = S.exams[st.id];
        return `
        <div class="stage-node ${unlocked?"":"locked"}" data-stage="${st.id}" style="cursor:${unlocked?"pointer":"default"}">
          <div class="stage-num" ${info.mastery>0?`style="box-shadow:0 0 ${10+info.mastery/4}px rgba(201,162,39,${.25+info.mastery/200})"`:""}>
            ${st.cn}${unlocked?"":`<span class="lockov">${icon("lock")}</span>`}
          </div>
          <div class="glass glass-pad stage-body" style="--stg:${st.hue}">
            <span class="halo" style="background:radial-gradient(circle,${st.hue},transparent 70%)"></span>
            <h3>${st.num} · ${st.title}
              ${ex&&ex.pass?`<span class="tag done">${icon("check")} 测验 ${ex.best}%</span>`:""}
              ${!unlocked?`<span class="tag gray">${icon("lock")} 未解锁</span>`:""}
            </h3>
            <p class="desc">${st.tagline} · ${st.intro}</p>
            <div class="stage-meta">
              <span class="num">${info.done}/${info.total} 课</span>
              <div class="bar"><i data-w="${info.pct}"></i></div>
              ${info.mastery>0?`<span class="mastery-orb"><i></i>掌握度 <b class="num">${info.mastery}%</b></span>`:""}
              <span class="faint">${icon("chevR")}</span>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
  $$(".stage-node", el).forEach(n=>n.addEventListener("click",()=>{
    const sid = n.dataset.stage;
    if(!stageUnlocked(sid)){ toast("完成上一阶段的全部课程并通过阶段测验后解锁",""); return; }
    go(`#/stage/${sid}`);
  }));
  mountAnimations(el);
  return el;
};
