/* ============================================================
   views/quiz.js — 测验引擎
   模式：#/quiz/<lessonId> 课程测验 | #/quiz/exam-<sid> 阶段测验
         #/quiz/grad 毕业考    | #/quiz/wrong 错题重练
   ============================================================ */
"use strict";
/* 题号章：与实操训练（practice.js）统一的卷面视觉 */
const QNUM = ["壹","贰","叁","肆","伍","陆","柒","捌","玖","拾"];
function sampleItems(pool, n, seed){
  const rnd = mulberry32(seed);
  const arr = pool.slice();
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr.slice(0, Math.min(n, arr.length));
}
function poolOfStage(sid){
  const out = [];
  STAGE[sid].lessons.forEach(l => l.quiz.forEach((q,qi)=>out.push({...q, lesson:l.id, qi})));
  return out;
}
VIEWS.quiz = function(arg){
  let cfg = null;
  if(arg === "grad"){
    const pool = CURRICULUM.flatMap(s=>poolOfStage(s.id));
    cfg = { title:"综合毕业考 · 知行合一", items:sampleItems(pool, 20, 20260914), pass:0.85,
      back:"#/stage/s9", desc:"20 题 · 通过线 85%" };
  } else if(arg === "wrong" || (arg && arg.startsWith("wrong-"))){
    const sid = arg.startsWith("wrong-") ? arg.slice(6) : null;
    let keys = Object.keys(S.wrong);
    if(sid) keys = keys.filter(k => { const w = S.wrong[k];
      return w && LESSON[w.lesson] && LESSON[w.lesson].stage === sid; });
    if(!keys.length){ setTimeout(()=>go("#/wrong"),0); return document.createElement("div"); }
    cfg = { title: sid ? `${STAGE[sid].title} · 阶段错题重练` : "错题重练",
      items: keys.map(k=>{ const w = S.wrong[k];
        const q = LESSON[w.lesson].quiz[w.qi]; return { ...q, lesson: w.lesson, qi: w.qi }; }),
      pass:1.0, back:"#/wrong", desc:`${keys.length} 道错题 · 全对消灭`, wrongMode:true };
  } else if(arg && arg.startsWith("exam-")){
    const sid = arg.slice(5);
    const st = STAGE[sid];
    if(!st){ setTimeout(()=>go("#/map"),0); return document.createElement("div"); }
    const att = (S.exams[sid]? S.exams[sid].att : 0) + 1;
    cfg = { title:`${st.num} · ${st.title} —— 阶段测验`, items:sampleItems(poolOfStage(sid), 8, sid.length*1000 + att*77 + new Date().getDate()),
      pass:0.75, back:`#/stage/${sid}`, exam:sid, desc:"8 题 · 通过线 75%" };
  } else if(arg && LESSON[arg]){
    const l = LESSON[arg];
    cfg = { title:`${l.title} —— 课后测验`, items:l.quiz.map((q,qi)=>({...q, lesson:l.id, qi})),
      pass:0.6, back:`#/lesson/${l.id}`, lesson:l.id, desc:`${l.quiz.length} 题 · 通过线 60%` };
  }
  if(!cfg){ setTimeout(()=>go("#/home"),0); return document.createElement("div"); }

  const el = document.createElement("div");
  let idx = 0, correct = 0;
  const wrongList = [];

  function renderQ(){
    const it = cfg.items[idx];
    el.innerHTML = `
    <div class="wrap quiz-wrap">
      <div class="q-top">
        <div>
          <div class="kicker" style="margin-bottom:4px">${cfg.title}</div>
          <span class="tiny">${cfg.desc} · 第 ${idx+1}/${cfg.items.length} 题</span>
        </div>
        <button class="btn btn-ghost btn-sm" id="qExit">退出</button>
      </div>
      <div class="q-dots">${cfg.items.map((_,i)=>
        `<span class="q-dot ${i===idx?"cur":i<idx?(cfg.items[i]._ok?"ok":"bad"):""}"></span>`).join("")}</div>
      <div class="glass q-card" style="position:relative">
        <div class="q-stem"><span class="no">${QNUM[idx % 10]}</span><div class="txt">${it.q}</div></div>
        ${it.opts.map((o,i)=>`<div class="opt" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></div>`).join("")}
        <div id="why"></div>
        <div class="between" style="margin-top:18px">
          <span class="tiny">已对 ${correct} 题</span>
          <button class="btn btn-gold" id="nextBtn" style="visibility:hidden">${idx===cfg.items.length-1?"交 卷":"下一题"} ${icon("chevR")}</button>
        </div>
      </div>
    </div>`;
    let answered = false;
    $$(".opt", el).forEach(o=>o.addEventListener("click",()=>{
      if(answered) return; answered = true;
      const i = +o.dataset.i, ok = i===it.a;
      cfg.items[idx]._ok = ok;
      if(ok){ correct++; o.classList.add("right"); }
      else { o.classList.add("wrong"); wrongList.push(it);
        $$(".opt", el)[it.a].classList.add("right");
        if(cfg.lesson || cfg.exam) SRS.addWrongCard(it.lesson, it.qi);
        if(cfg.lesson) S.wrong[`${it.lesson}:${it.qi}`] = {lesson:it.lesson, qi:it.qi};
      }
      $$(".opt", el).forEach(x=>{ if(x!==o && +x.dataset.i!==it.a) x.classList.add("dim"); });
      $("#why", el).insertAdjacentHTML("beforeend",
        `<span class="stamp ${ok?"ok":"no"}">${ok?"正确":"再想"}</span>
         <div class="anno"><span class="tagline">讲 评</span><p>${ok?"":"已加入错题本与复习循环。"}${it.why}</p></div>`);
      $("#nextBtn", el).style.visibility = "";
      save();
    }));
    $("#nextBtn", el).addEventListener("click",()=>{ idx++;
      if(idx < cfg.items.length) renderQ(); else renderResult(); });
    $("#qExit", el).addEventListener("click",()=>{
      modal(`<h3>中途退卷？</h3><p>退卷则此卷进度作废；已答错之题，仍录入错题本与记忆循环。</p>
        <div class="row" style="justify-content:flex-end;margin-top:16px">
        <button class="btn btn-ghost btn-sm" id="qxNo">回卷续答</button>
        <button class="btn btn-gold btn-sm" id="qxYes">退 卷</button></div>`);
      $("#qxNo", mask).addEventListener("click",()=>mask.remove());
      $("#qxYes", mask).addEventListener("click",()=>go(cfg.back));
    });
  }

  function renderResult(){
    const pct = Math.round(correct/cfg.items.length*100);
    const passed = pct >= cfg.pass*100;
    /* 记账与奖励 */
    if(cfg.lesson){
      const st = LState(cfg.lesson);
      st.att++; st.best = Math.max(st.best, pct);
      if(passed && !st.done){ st.done = true; st.mastery = Math.max(st.mastery, 50 + pct*0.5); st.last = dayKey(); }
      if(passed) SRS.seedLesson(cfg.lesson);
      award(correct*2 + (passed?20:0), passed?"测验通过":"练习完成");
    }
    if(cfg.exam){
      const e = S.exams[cfg.exam] || (S.exams[cfg.exam]={best:0,pass:false,att:0});
      e.att++; e.best = Math.max(e.best, pct);
      const firstPass = passed && !e.pass;
      if(passed) e.pass = true;
      award(correct*3 + (firstPass?60:0), firstPass?"阶段测验通过":passed?"测验完成":"练习完成");
    }
    if(cfg.wrongMode){
      cfg.items.forEach(it=>{ if(it._ok){ delete S.wrong[`${it.lesson}:${it.qi}`]; SRS.removeWrongCard(it.lesson, it.qi);} });
      award(correct*3, "错题重练");
    }
    if(arg==="grad" && passed && !S.grad){ S.grad = true; award(200, "毕业 · 知行合一"); }
    save();
    if(passed) confetti(arg==="grad"?46:28);

    let nextBtn = "";
    if(cfg.lesson && passed){
      const l = LESSON[cfg.lesson]; const ids = ORDER;
      const ni = ids[ids.indexOf(cfg.lesson)+1];
      nextBtn = ni ? `<button class="btn btn-gold" data-go="#/lesson/${ni}">进入下一课 ${icon("chevR")}</button>`
                   : `<button class="btn btn-gold" data-go="#/map">返回知识地图</button>`;
    }
    el.innerHTML = `
    <div class="wrap quiz-wrap">
      <div class="glass q-result">
        <div class="kicker" style="justify-content:center">${cfg.title}</div>
        ${ring(pct, 150, passed?"通过":"未通过", `${correct}/${cfg.items.length}`)}
        <h2>${passed ? (arg==="grad"?"恭喜毕业 · 知行合一":"测验通过") : "差一点，再来一次"}</h2>
        <p class="muted small">${passed
          ? (cfg.lesson? "本课要点已进入你的间隔复习循环，明天开始记忆巩固。" :
             cfg.exam? "下一阶段已为你解锁。" : "错题已在重练中全部消灭。")
          : "错题已加入错题本与复习循环——错一次，恰恰是记忆最深的时机。"}</p>
        <div class="row" style="justify-content:center;gap:12px;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="againBtn">${icon("refresh")} 再练一次</button>
          ${nextBtn || `<button class="btn btn-gold" data-go="${cfg.back}">返回</button>`}
        </div>
      </div>
      ${wrongList.length?`<div class="glass glass-pad" style="margin-top:18px">
        <div class="card-title">${icon("book")} 本轮错题回顾</div>
        <div class="q-recap">${wrongList.map(it=>`<div class="rc bad">
          <b>${it.q}</b><br><span class="down">✓ ${it.opts[it.a]}</span> —— ${it.why}</div>`).join("")}</div>
      </div>`:""}
    </div>`;
    $("#againBtn", el).addEventListener("click",()=>{
      go(cfg.back); setTimeout(()=>go(`#/quiz/${arg}`),0);
    });
    $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
    App.navChips(); mountAnimations(el);
  }
  renderQ();
  return el;
};
