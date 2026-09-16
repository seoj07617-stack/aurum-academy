/* ============================================================
   views/review.js — 记忆复习：3D 翻卡 + 间隔重复评分
   ============================================================ */
"use strict";
VIEWS.review = function(){
  const el = document.createElement("div");
  let queue = SRS.dueList();
  let mode = queue.length ? "due" : "none";
  if(!queue.length){
    const all = Object.keys(S.srs).filter(id=>SRS.CARDS[id]);
    if(all.length){ queue = sampleItems(all, Math.min(10, all.length), Date.now()%100000); mode = "free"; }
  }
  let idx = 0, graded = {0:0,3:0,5:0};

  function renderEmpty(){
    el.innerHTML = `
    <div class="wrap rev-wrap st">
      <div class="glass glass-pad" style="padding:46px 30px">
        ${icon("brain","empty")}
        <h2 style="margin:6px 0">今日记忆已巩固</h2>
        <p class="muted small">还没有到期的记忆卡片。完成新的课程测验后，要点卡会自动进入复习循环；
        <br>复习间隔会随着你「记得」的次数越拉越长——这正是遗忘曲线被你驯服的形状。</p>
        <div class="row" style="justify-content:center;margin-top:18px">
          <button class="btn btn-gold" data-go="#/map">${icon("map")} 去学新课</button>
          <button class="btn btn-ghost" data-go="#/home">返回首页</button>
        </div>
      </div>
    </div>`;
    $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
    App.navChips();
  }

  function renderCard(){
    if(idx >= queue.length){ return renderSummary(); }
    const id = queue[idx];
    const c = SRS.CARDS[id];
    const st = S.srs[id];
    const kindTag = c.kind==="point"?"要点卡":c.kind==="trap"?"辨析卡":"错题卡";
    el.innerHTML = `
    <div class="wrap rev-wrap">
      <div class="rev-meta">
        <span class="tag">${icon("zap")} ${mode==="due"?"到期复习":"自主加练"}</span>
        <span class="tag gray">${kindTag}</span>
        <span class="tag gray">${idx+1}/${queue.length}</span>
        ${st&&st.ivl?`<span class="tag gray num">间隔 ${st.ivl} 天</span>`:""}
      </div>
      <div class="flip-scene">
        <div class="flip-card" id="fc">
          <div class="face front glass glass-pad glass-face" style="background:var(--glass2)">
            <span class="fk">回想一下 · 点击卡片查看答案</span>
            <div class="fq">${c.front}</div>
            <span class="tiny">尽量先在心里作答，再翻面核对</span>
          </div>
          <div class="face back glass glass-pad" style="background:var(--glass2)">
            <span class="fk" style="color:var(--down)">答案</span>
            <div class="fa">${c.back}</div>
          </div>
        </div>
      </div>
      <div class="grade-row" id="grades">
        <button class="gbtn g-forgot" data-g="0">忘了</button>
        <button class="gbtn g-fuzzy" data-g="3">模糊</button>
        <button class="gbtn g-know" data-g="5">记得</button>
      </div>
      <p class="tiny" style="margin-top:14px">评分决定这张卡下次出现的时间：记得 → 间隔拉长，忘了 → 明天再见<br>快捷键：空格翻面 · 1 忘了 / 2 模糊 / 3 记得</p>
    </div>`;
    const fc = $("#fc", el);
    fc.addEventListener("click",()=>{
      fc.classList.toggle("flipped");
      $("#grades", el).classList.add("show");
    });
    $$(".gbtn", el).forEach(b=>b.addEventListener("click",()=>{
      const g = +b.dataset.g;
      SRS.grade(id, g); graded[g]++;
      idx++; renderCard(); App.navChips();
    }));
    /* 键盘快捷键：空格/回车翻面，1/2/3 评分 */
    if(window.__revKey) document.removeEventListener("keydown", window.__revKey);
    window.__revKey = e => {
      if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const card = document.getElementById("fc");
      if(!card) return;
      const grades = document.getElementById("grades");
      if(e.code === "Space" || e.key === "Enter"){
        e.preventDefault();
        if(!card.classList.contains("flipped")){ card.classList.add("flipped"); grades.classList.add("show"); }
      } else if(["1","2","3"].includes(e.key) && grades && grades.classList.contains("show")){
        grades.querySelectorAll(".gbtn")[["1","2","3"].indexOf(e.key)].click();
      }
    };
    document.addEventListener("keydown", window.__revKey);
  }

  function renderSummary(){
    const tot = graded[0]+graded[3]+graded[5];
    if(tot) award(10, "复习完成");
    el.innerHTML = `
    <div class="wrap rev-wrap st">
      <div class="glass glass-pad" style="padding:40px 30px">
        <div class="kicker" style="justify-content:center">复习小结</div>
        <h2 style="margin:10px 0 16px">${tot} 张卡片完成记忆巩固</h2>
        <div class="row" style="justify-content:center;gap:12px;flex-wrap:wrap">
          <span class="tag done">${icon("check")} 记得 ${graded[5]}</span>
          <span class="tag">${icon("clock")} 模糊 ${graded[3]}</span>
          <span class="tag rose">${icon("refresh")} 忘了 ${graded[0]}</span>
        </div>
        <p class="muted small" style="margin-top:14px">「忘了」的卡片明天会优先出现——遗忘不是失败，是记忆生长的起点。</p>
        <div class="row" style="justify-content:center;margin-top:16px;gap:12px">
          <button class="btn btn-gold" data-go="#/home">返回首页</button>
          <button class="btn btn-ghost" data-go="#/stats">查看记忆曲线</button>
        </div>
      </div>
    </div>`;
    $$("[data-go]",el).forEach(n=>n.addEventListener("click",()=>go(n.dataset.go)));
    App.navChips();
  }

  if(!queue.length) renderEmpty(); else renderCard();
  return el;
};
