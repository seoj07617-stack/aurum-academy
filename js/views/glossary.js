/* ============================================================
   views/glossary.js — 金融词汇表：全部要点卡按阶段浏览/搜索
   ============================================================ */
"use strict";
VIEWS.glossary = function(){
  const el = document.createElement("div");
  let kw = "";

  function render(){
    const k = kw.trim().toLowerCase();
    const groups = CURRICULUM.map(st => ({
      st, terms: st.lessons.flatMap(l => l.points.map(p => ({ t:p.t, d:p.d, lesson:l.title })))
        .filter(p => !k || p.t.toLowerCase().includes(k) || p.d.toLowerCase().includes(k))
    })).filter(g => g.terms.length);
    const total = groups.reduce((a,g)=>a+g.terms.length,0);

    el.innerHTML = `
    <div class="wrap st">
      <div class="page-head">
        <div class="kicker">GLOSSARY · 词汇</div>
        <h1 style="font-size:27px;margin-top:8px">金融词汇表 <span class="gold-text num" style="font-size:19px">${total}</span></h1>
        <p class="muted small" style="margin-top:4px">全部课程要点卡的总集——复习循环之外，随手查阅。</p>
        <div class="row" style="margin-top:14px;max-width:420px">
          <span class="ic" style="color:var(--ink3)">${ICONS.search}</span>
          <input class="inp" id="gloSearch" placeholder="搜索术语或释义，如：久期、安全边际、再平衡…" value="${esc(kw)}">
        </div>
      </div>
      ${groups.map(g => `
      <div style="margin-bottom:22px">
        <div class="row" style="gap:10px;margin-bottom:10px">
          <span class="dot" style="width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-family:var(--serif);font-size:12px;font-weight:700;color:#fff;background:${g.st.hue}">${g.st.cn}</span>
          <b style="font-family:var(--serif);font-size:16px">${g.st.title}</b>
          <span class="tag gray num">${g.terms.length}</span>
        </div>
        <div class="glo-grid">
          ${g.terms.map(p=>`
          <div class="term-card">
            <div class="between" style="align-items:baseline">
              <b>${esc(p.t)}</b>
              <span class="tiny" style="flex:none">${esc(p.lesson)}</span>
            </div>
            <p class="small muted" style="margin-top:3px;line-height:1.7">${esc(p.d)}</p>
          </div>`).join("")}
        </div>
      </div>`).join("") || `
      <div class="glass glass-pad empty">${icon("search")}<p>没有匹配「${esc(kw)}」的术语。<br>试试别的关键词，或去学新课解锁更多词条。</p></div>`}
    </div>`;
    const inp = $("#gloSearch", el);
    inp.addEventListener("input", e=>{
      const v = e.target.value;
      const pos = e.target.selectionStart;
      kw = v; render();
      const n = $("#gloSearch", el);
      n.focus(); n.setSelectionRange(pos, pos);
    });
  }
  render();
  return el;
};
