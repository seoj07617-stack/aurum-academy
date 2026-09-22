/* ============================================================
   views/glossary.js — 金融词汇表：全部要点卡按阶段浏览/搜索
   2026-09-22 拾壹：搜索改为局部重渲染（修手机端丢焦点/IME打断）
   2026-09-22 拾壹 v15：接入详解库 glossary_extra1/2.js——
   每个词条点开有「定义/例子/误区」三层详解；搜索同时命中
   术语名、释义与详解正文；展开状态在重新搜索后保留。
   ============================================================ */
"use strict";
VIEWS.glossary = function(){
  const el = document.createElement("div");
  const EXTRA = Object.assign({}, window.GX1 || {}, window.GX2 || {});
  let kw = "", timer = null;
  const openSet = new Set();

  function extraOf(t){ return EXTRA[t]; }
  function extraHit(t, k){
    const x = EXTRA[t];
    return !!(x && (x.f.includes(k) || x.e.includes(k) || x.m.includes(k)));
  }
  function termMoreHTML(t){
    const x = EXTRA[t];
    if(!x) return "";
    return `<div class="term-more">
      <div class="seg"><b>定义</b><p>${esc(x.f)}</p></div>
      <div class="seg"><b>例子</b><p>${esc(x.e)}</p></div>
      <div class="seg"><b>误区</b><p>${esc(x.m)}</p></div>
    </div>`;
  }
  function resultsHTML(){
    const k = kw.trim().toLowerCase();
    const groups = CURRICULUM.map(st => ({
      st, terms: st.lessons.flatMap(l => l.points.map(p => ({ t:p.t, d:p.d, lesson:l.title })))
        .filter(p => !k || p.t.toLowerCase().includes(k) || p.d.toLowerCase().includes(k) || extraHit(p.t, k))
    })).filter(g => g.terms.length);
    if(!groups.length){
      return `<div class="glass glass-pad empty">${icon("search")}<p>没有匹配「${esc(kw)}」的术语。<br>试试别的关键词，或去学新课解锁更多词条。</p></div>`;
    }
    return groups.map(g => `
      <div style="margin-bottom:22px">
        <div class="row" style="gap:10px;margin-bottom:10px">
          <span class="dot" style="width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-family:var(--serif);font-size:12px;font-weight:700;color:#fff;background:${g.st.hue}">${g.st.cn}</span>
          <b style="font-family:var(--serif);font-size:16px">${g.st.title}</b>
          <span class="tag gray num">${g.terms.length}</span>
        </div>
        <div class="glo-grid">
          ${g.terms.map(p=>`
          <div class="term-card${openSet.has(p.t)?" open":""}" data-t="${esc(p.t)}"${EXTRA[p.t]?' data-x="1"':""}>
            <div class="between" style="align-items:baseline">
              <b>${esc(p.t)}</b>
              <span class="tiny" style="flex:none">${EXTRA[p.t]?'<span class="tmore-btn">详解</span>':""}${esc(p.lesson)}</span>
            </div>
            <p class="small muted" style="margin-top:3px;line-height:1.7">${esc(p.d)}</p>
            ${termMoreHTML(p.t)}
          </div>`).join("")}
        </div>
      </div>`).join("");
  }
  function countOf(){
    const k = kw.trim().toLowerCase();
    return CURRICULUM.reduce((a,st)=>a+st.lessons.reduce((b,l)=>b+l.points.filter(p=>!k||p.t.toLowerCase().includes(k)||p.d.toLowerCase().includes(k)||extraHit(p.t,k)).length,0),0);
  }
  function refresh(){
    const box = $("#gloResults", el), cnt = $("#gloCount", el), clr = $("#gloClear", el);
    if(box) box.innerHTML = resultsHTML();
    if(cnt) cnt.textContent = countOf();
    if(clr) clr.style.visibility = kw ? "visible" : "hidden";
  }

  el.innerHTML = `
    <div class="wrap st">
      <div class="page-head">
        <div class="kicker">GLOSSARY · 词汇</div>
        <h1 style="font-size:27px;margin-top:8px">金融词汇表 <span class="gold-text num" style="font-size:19px" id="gloCount"></span></h1>
        <p class="muted small" style="margin-top:4px">全部课程要点卡的总集——点词条看三层详解：定义、例子、误区。</p>
        <div class="row" style="margin-top:14px;max-width:420px;position:relative">
          <span class="ic" style="color:var(--ink3)">${ICONS.search}</span>
          <input class="inp" id="gloSearch" placeholder="搜索术语、释义或详解，如：久期、安全边际…" autocomplete="off" value="${esc(kw)}">
          <button class="icon-btn" id="gloClear" title="清空" style="position:absolute;right:8px;width:26px;height:26px;visibility:hidden">${icon("x")}</button>
        </div>
      </div>
      <div id="gloResults"></div>
    </div>`;
  const inp = $("#gloSearch", el);
  inp.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { kw = inp.value; refresh(); }, 120);
  });
  inp.addEventListener("keydown", e => { if(e.key === "Enter"){ clearTimeout(timer); kw = inp.value; refresh(); } });
  $("#gloClear", el).addEventListener("click", () => { kw = ""; inp.value = ""; refresh(); inp.focus(); });
  $("#gloResults", el).addEventListener("click", e => {
    const card = e.target.closest(".term-card");
    if(!card || !card.dataset.x){ return; }
    const t = card.dataset.t;
    if(openSet.has(t)) openSet.delete(t); else openSet.add(t);
    card.classList.toggle("open");
  });
  refresh();
  return el;
};
