/* ============================================================
   views/mission.js — 阶段实战大作业：综合场景应用
   入口：阶段页（阶段测验通过后解锁）#/mission/<sid>
   题型复用 practice.js 的 renderAnswer；首次完成 +40 XP
   ============================================================ */
"use strict";
VIEWS.mission = function(sid){
  const M = window.STAGE_MISSIONS && STAGE_MISSIONS[sid];
  if(!M || !STAGE[sid]){ go("#/stage/s1"); return document.createElement("div"); }
  const st = STAGE[sid];
  S.missions = S.missions || {};
  const rec = S.missions[sid];
  const examPassed = S.exams[sid] && S.exams[sid].pass;
  const el = document.createElement("div");

  if(!examPassed){
    el.innerHTML = `
    <div class="wrap st">
      <div class="glass glass-pad" style="padding:44px 30px;text-align:center">
        <div class="kicker" style="justify-content:center">MISSION LOCKED</div>
        <h2 style="font-family:var(--serif);font-size:23px;margin:12px 0">实战大作业尚未解锁</h2>
        <p class="muted small">先通过${st.num}的阶段测验（≥75%），再来接受综合应用的考验。</p>
        <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
          <button class="btn btn-gold" data-go="#/stage/${sid}">前往阶段测验</button>
        </div>
      </div>
    </div>`;
    $$("[data-go]", el).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
    return el;
  }

  let si = 0, score = 0, finished = false;
  el.innerHTML = `
  <div class="wrap st">
    <div class="page-head">
      <div class="crumb"><a href="#/stage/${sid}">${st.num}</a> ${icon("chevR")} 实战大作业</div>
      <h1 style="font-size:26px;margin-top:8px">${M.title}</h1>
      <div class="glass case-box" style="margin:14px 0 6px">
        <span class="ctag">场 景</span>
        <p>${M.scene}</p>
      </div>
    </div>
    <div id="misBody"></div>
  </div>`;
  const body = $("#misBody", el);

  function finish(){
    finished = true;
    const total = M.steps.length;
    const pass = score >= Math.ceil(total * 0.75);
    const first = !rec;
    S.missions[sid] = { done: true, best: Math.max(rec ? rec.best || 0 : 0, score), total, date: dayKey() };
    save();
    if(first && pass) award(40, "实战大作业 · " + st.title);
    else if(first) award(10, "实战初体验");
    body.innerHTML = `
    <div class="glass glass-pad" style="padding:38px 28px;text-align:center">
      <div class="kicker" style="justify-content:center">${pass ? "任务完成" : "尚需打磨"}</div>
      <h2 style="font-family:var(--serif);font-size:26px;margin:12px 0">${score} / ${total}</h2>
      <p class="muted small">${pass
        ? "知识已经落到手上——这就是「会」的样子。错过的步骤记得回看讲评。"
        : "差一点点：回看每步讲评，把思路对齐后重新来过。"}</p>
      <div class="row" style="justify-content:center;gap:12px;margin-top:18px">
        <button class="btn btn-gold" id="misAgain">${icon("refresh")} 重新演练</button>
        <button class="btn btn-ghost" data-go="#/stage/${sid}">返回${st.num}</button>
      </div>
    </div>`;
    $("#misAgain", body).addEventListener("click", () => { si = 0; score = 0; renderStep(); });
    $$("[data-go]", body).forEach(n => n.addEventListener("click", () => go(n.dataset.go)));
    if(pass && window.FX) FX.confetti && FX.confetti();
  }

  function renderStep(){
    if(si >= M.steps.length){ finish(); return; }
    const q = M.steps[si];
    body.innerHTML = `
    <div class="glass q-card">
      <div class="between" style="margin-bottom:10px">
        <span class="tiny">任务 ${si+1}/${M.steps.length} · 答对 ${score}</span>
        <span class="tag">综合应用</span>
      </div>
      <div id="misAns"></div>
      <div class="between" style="margin-top:16px">
        <span class="tiny">用学过的知识，解决场景里的问题</span>
        <button class="btn btn-gold btn-sm" id="misNext" style="visibility:hidden">${si === M.steps.length-1 ? "看结果" : "下一步"} ${icon("chevR")}</button>
      </div>
    </div>`;
    renderAnswer($("#misAns", body), q, ok => {
      if(ok) score++;
      $("#misNext", body).style.visibility = "";
    }, si);
    $("#misNext", body).addEventListener("click", () => { si++; renderStep(); });
  }
  renderStep();
  return el;
};
