/* ============================================================
   views/stats.js — 数据统计：进度 / 记忆 / 打卡 / 数据管理
   ============================================================ */
"use strict";
VIEWS.stats = function(){
  const el = document.createElement("div");
  const lv = levelInfo();
  const doneLessons = ORDER.filter(id=>LState(id).done).length;
  const cardsTotal = Object.keys(S.srs).filter(id=>SRS.CARDS[id]).length;
  const fc = SRS.forecast();
  const maxF = Math.max(1, ...fc);
  /* 打卡热力图：最近 12 周 */
  const today = new Date();
  const cells = [];
  for(let i=83;i>=0;i--){
    const d = new Date(today.getTime() - i*864e5);
    const k = dayKey(d);
    const xp = S.days[k]||0;
    const cls = xp===0?"":xp<15?"h1":xp<30?"h2":xp<70?"h3":"h4";
    cells.push(`<i class="${cls}" title="${k} · ${xp} XP"></i>`);
  }
  el.innerHTML = `
  <div class="wrap st">
    <div style="margin-bottom:20px">
      <div class="kicker">ANALYTICS · 数据</div>
      <h1 style="font-size:27px;margin-top:8px">学习数据与记忆曲线</h1>
      <p class="muted small" style="margin-top:4px">掌握度会随时间自然衰减，复习让它回升——这是系统的设计，不是你的退步。</p>
    </div>

    <div class="stat-grid">
      <div class="glass stat-cell"><b class="gold-text">${S.xp}</b><span>总经验 XP</span></div>
      <div class="glass stat-cell"><b class="gold-text">${doneLessons}<span style="font-size:15px;color:var(--ink3)">/${ORDER.length}</span></b><span>完成课程</span></div>
      <div class="glass stat-cell"><b class="gold-text">${S.streak.n}<span style="font-size:15px;color:var(--ink3)"> · 最佳 ${S.streak.best}</span></b><span>连续打卡（天）</span></div>
      <div class="glass stat-cell"><b class="gold-text">${cardsTotal}</b><span>记忆卡总数</span></div>
      <div class="glass stat-cell"><b class="gold-text">${SRS.dueCount()}</b><span>今日待复习</span></div>
      <div class="glass stat-cell"><b class="gold-text">${SRS.health()}</b><span>记忆健康度</span></div>
    </div>

    <div class="grid g2">
      <div class="glass glass-pad">
        <div class="card-title">${icon("trend")} 未来 7 天复习压力预报</div>
        <p class="tiny" style="margin-bottom:4px">柱高 = 当日到期卡片数。持续复习，柱子会越来越矮、间隔越来越长。</p>
        <div class="forecast">
          ${fc.map((n,i)=>`<div class="fcol">
            <span class="fn">${n||""}</span>
            <div class="fbar" style="height:${Math.max(4, n/maxF*100)}%;animation-delay:${i*0.07}s"></div>
            <span class="fd">${i===0?"今天":addDays(dayKey(),i).slice(5)}</span>
          </div>`).join("")}
        </div>
      </div>
      <div class="glass glass-pad">
        <div class="card-title">${icon("flame")} 学习日历（近 12 周）</div>
        <p class="tiny" style="margin-bottom:4px">每天获得 30 XP 即完成打卡（点亮一格）。</p>
        <div class="heat">${cells.join("")}</div>
        <div class="row" style="gap:6px;margin-top:12px">
          <span class="tiny">少</span>
          <i style="width:11px;height:11px;border-radius:4px;background:rgba(34,31,26,.07);display:inline-block"></i>
          <i style="width:11px;height:11px;border-radius:4px;background:rgba(201,162,39,.28);display:inline-block"></i>
          <i style="width:11px;height:11px;border-radius:4px;background:rgba(201,162,39,.52);display:inline-block"></i>
          <i style="width:11px;height:11px;border-radius:4px;background:rgba(201,162,39,.78);display:inline-block"></i>
          <i style="width:11px;height:11px;border-radius:4px;background:#A8842C;display:inline-block"></i>
          <span class="tiny">多</span>
        </div>
      </div>
    </div>

    <div class="glass glass-pad" style="margin-top:18px">
      <div class="card-title">${icon("layers")} 各阶段掌握度</div>
      <div class="stack" style="gap:12px;margin-top:8px">
        ${CURRICULUM.map(st=>{ const info = stageInfo(st.id);
          return `<div>
            <div class="between" style="margin-bottom:5px">
              <span style="font-size:13.5px">${st.cn} · ${st.title}
                ${stageUnlocked(st.id)?"":`<span class="tag gray" style="margin-left:6px">${icon("lock")}</span>`}</span>
              <span class="tiny num">课程 ${info.done}/${info.total} · 掌握 ${info.mastery}%</span>
            </div>
            <div class="bar thin"><i data-w="${info.pct}" style="opacity:.45"></i></div>
            <div class="bar thin" style="margin-top:3px;height:3px"><i data-w="${info.mastery}"></i></div>
          </div>`;
        }).join("")}
      </div>
      <p class="tiny" style="margin-top:10px">浅色条 = 课程完成度，金色细条 = 记忆掌握度（会衰减，靠复习维持）。</p>
    </div>

    <div class="glass glass-pad" style="margin-top:18px">
      <div class="card-title">${icon("edit")} 数据管理</div>
      <div class="row" style="flex-wrap:wrap;gap:10px;margin-top:6px">
        <button class="btn btn-ghost btn-sm" id="exportBtn">导出学习数据</button>
        <button class="btn btn-ghost btn-sm" id="freeBtn">${S.free?"✓ 自由模式已开启（全部解锁）":"开启自由模式（解锁全部阶段）"}</button>
        <button class="btn btn-ghost btn-sm" id="resetBtn" style="color:var(--rose)">重置全部数据</button>
      </div>
      <p class="tiny" style="margin-top:10px">数据仅保存在本机浏览器（localStorage）。导出后可在其他设备导入；重置不可恢复。</p>
    </div>
  </div>`;
  $("#exportBtn", el).addEventListener("click",()=>{
    const blob = new Blob([JSON.stringify(S,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aurum-backup-${dayKey()}.json`;
    a.click(); toast("已导出学习数据","gold");
  });
  $("#freeBtn", el).addEventListener("click",()=>{
    S.free = !S.free; save(); App.route(); toast(S.free?"自由模式已开启":"已恢复循序解锁模式","");
  });
  $("#resetBtn", el).addEventListener("click",()=>{
    const m = modal(`<h3>重置全部数据？</h3><p>所有进度、记忆卡片、错题、日志都将清空且无法恢复。</p>
      <div class="row" style="justify-content:flex-end;margin-top:18px">
      <button class="btn btn-ghost btn-sm" id="mCancel">取消</button>
      <button class="btn btn-sm" id="mOk" style="background:var(--rose);color:#fff">确认重置</button></div>`);
    $("#mOk", m).addEventListener("click",()=>{ localStorage.removeItem(Store.KEY); location.reload(); });
  });
  mountAnimations(el);
  return el;
};
function modal(html){
  const mask = document.createElement("div");
  mask.className = "modal-mask";
  mask.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(mask);
  mask.addEventListener("click",e=>{ if(e.target===mask) mask.remove(); });
  const c = $("#mCancel", mask); if(c) c.addEventListener("click",()=>mask.remove());
  return mask;
}
