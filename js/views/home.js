/* ============================================================
   views/home.js — 首页仪表盘：今日学习闭环
   ============================================================ */
"use strict";
VIEWS.home = function(){
  const el = document.createElement("div");
  const nl = nextLessonId();
  const due = SRS.dueCount();
  const wrongN = Object.keys(S.wrong).length;
  const lv = levelInfo();
  const [qt, qa] = quoteOfToday();
  const doneLessons = ORDER.filter(id => LState(id).done).length;
  const masteryAvg = Math.round(ORDER.reduce((a,id)=>a+LState(id).mastery,0)/ORDER.length);

  const tasks = [
    { ic:"book", t:"学习新课", s: nl ? `《${LESSON[nl].title}》 · ${LESSON[nl].mins} 分钟` : "全部课程已完成，进入复习循环",
      done: !nl, go: nl ? `#/lesson/${nl}` : "#/map" },
    { ic:"target", t:"每日一卷", s: (S.dailyMix && S.dailyMix.date === dayKey())
        ? `已完成 · 今日最好 ${S.dailyMix.score}/${S.dailyMix.total}` : "5 题 · 来自已学课程",
      done: !!(S.dailyMix && S.dailyMix.date === dayKey()), go:"#/daily" },
    { ic:"zap", t:"记忆复习", s: due>0 ? `${due} 张记忆卡片到期` : "今日记忆已巩固",
      done: due===0, go:"#/review" },
    { ic:"refresh", t:"错题重练", s: wrongN>0 ? `${wrongN} 道错题待消灭` : "错题本干净",
      done: wrongN===0, go:"#/wrong" },
  ];
  const loopDone = tasks.filter(t=>t.done).length;

  el.innerHTML = `
  <div class="wrap st">
    <div class="hero">
      <div class="glass hero-main">
        <div class="v-motto" aria-hidden="true">知行合一<span class="seal">知行</span></div>
        <div class="kicker">知行金融学院 · AURUM ACADEMY</div>
        <h1>${greet()}，<span class="gold-text">${lv.name}</span></h1>
        <p class="hero-sub">宏观 → 微观 → 交易 → 纪律：已修 ${doneLessons}/${ORDER.length} 课，
        平均掌握度 ${masteryAvg}%。${S.grad ? "恭喜，你已获得「知行合一」毕业徽章。" : "每天完成学习闭环，让知识长在复利曲线上。"}</p>
        <div class="quote-card">
          <span class="qm">“</span>
          <div><p>${qt}</p><cite>—— ${qa}</cite></div>
        </div>
      </div>
      <div class="hero-side">
        <div class="glass today-ring">
          ${ring(loopDone===tasks.length ? 100 : Math.round(loopDone/tasks.length*100), 128, "今日闭环", `${loopDone}/${tasks.length} 项`)}
          <div class="row" style="gap:8px;margin-top:4px">
            <span class="tag">${icon("flame")} 连续 ${S.streak.n} 天</span>
            <span class="tag gray num">今日 ${S.xpToday}/30 XP</span>
          </div>
        </div>
      </div>
    </div>

    <div class="glass loop-card">
      <div class="loop-head">
        <div class="card-title">${icon("refresh")} 今日学习闭环</div>
        <span class="tiny">学 → 练 → 错 → 忆：完成三项即打卡</span>
      </div>
      ${tasks.map(t=>`
      <div class="task-row ${t.done?"done":""}" data-go="${t.go}">
        <div class="task-ic">${icon(t.done?"check":t.ic)}</div>
        <div class="t"><b>${t.t}</b><span>${t.s}</span></div>
        <span class="go">${t.done?"已完成":icon("chevR")}</span>
      </div>`).join("")}
    </div>

    <div class="home-grid" style="margin-top:20px">
      <div class="glass glass-pad">
        <div class="card-title">${icon("map")} 学习旅程</div>
        <div class="mini-stages">${CURRICULUM.map(stageBadge).join("")}</div>
      </div>
      <div class="glass glass-pad stack">
        <div class="card-title">${icon("chart")} 学习总览</div>
        <div class="stat-grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="stat-cell" style="padding:12px"><b class="num">${S.xp}</b><span>总经验</span></div>
          <div class="stat-cell" style="padding:12px"><b class="num">${doneLessons}<span style="font-size:15px;color:var(--ink3)">/${ORDER.length}</span></b><span>已完成课程</span></div>
          <div class="stat-cell" style="padding:12px"><b class="num">${masteryAvg}%</b><span>平均掌握度</span></div>
          <div class="stat-cell" style="padding:12px"><b class="num">${SRS.health()}<span style="font-size:15px;color:var(--ink3)">/100</span></b><span>记忆健康度</span></div>
        </div>
        <div>
          <div class="between" style="margin-bottom:6px"><span class="tiny">等级：${lv.name}</span>
          <span class="tiny num">${lv.nextAt?`${S.xp}/${lv.nextAt} XP`:"已满级"}</span></div>
          <div class="bar"><i data-w="${Math.round(lv.pct*100)}"></i></div>
        </div>
        <div class="row" style="flex-wrap:wrap;gap:10px">
          <button class="btn btn-gold btn-sm" data-go="#/map">${icon("map")} 继续旅程</button>
          <button class="btn btn-ghost btn-sm" data-go="#/practice/pattern">${icon("trend")} 实操训练</button>
          <button class="btn btn-ghost btn-sm" data-go="#/dojo">${icon("shield")} 纪律工坊</button>
          <button class="btn btn-ghost btn-sm" data-go="#/stats">${icon("chart")} 数据统计</button>
        </div>
      </div>
    </div>
  </div>`;
  $$(".task-row,.mini-stage,[data-go]", el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
  mountAnimations(el);
  return el;
};
