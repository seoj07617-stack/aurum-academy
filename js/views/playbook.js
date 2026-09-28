/* ============================================================
   views/playbook.js — 实战路由：遇事查这里
   按「你遇到的场景」反向索引知识——每条是一条可执行的思考链。
   ============================================================ */
"use strict";
VIEWS.playbook = function(){
  const el = document.createElement("div");
  let kw = "";
  let open = null;

  function render(){
    const k = kw.trim().toLowerCase();
    const list = (window.PLAYBOOK || []).filter(p =>
      !k || p.scene.toLowerCase().includes(k) || p.brief.toLowerCase().includes(k) ||
      p.steps.some(s => (s.t + s.d).toLowerCase().includes(k)) || (p.tag||"").includes(k)
    );
    el.innerHTML = `
    <div class="wrap st">
      <div class="page-head">
        <div class="kicker">PLAYBOOK · 实战路由</div>
        <h1 style="font-size:27px;margin-top:8px">遇事查这里</h1>
        <p class="muted small" style="margin-top:4px">课程教你「学问」，这里给你「做事」的路由——按你此刻遇到的场景，反查该用的知识与动作顺序。</p>
        <div class="row" style="margin-top:14px;max-width:420px">
          <span class="ic" style="color:var(--ink3)">${icon("search")}</span>
          <input class="inp" id="pbSearch" placeholder="搜场景或关键词，如：亏了、止损、降息…" value="${esc(kw)}">
        </div>
      </div>
      ${list.map((p, i) => {
        const idx = (window.PLAYBOOK || []).indexOf(p);
        const openIt = open === idx;
        return `
        <div class="glass pb-card" style="margin-bottom:12px">
          <button class="pb-head" data-pb="${idx}">
            <div style="flex:1;min-width:0;text-align:left">
              <b>${esc(p.scene)}</b>
              <div class="tiny muted" style="margin-top:3px">${esc(p.brief)}</div>
            </div>
            <span class="tag" style="flex:none">${esc(p.tag)}</span>
          </button>
          ${openIt ? `
          <div class="pb-steps">
            ${p.steps.map((s, j) => `
            <div class="pb-step">
              <div class="pb-no">${j+1}</div>
              <div class="pb-txt">
                <b>${esc(s.t)}</b>
                <p>${esc(s.d)}</p>
                ${s.go ? `<a class="pb-go" href="${s.go}">${icon("book")} 回看课程</a>` : ""}
              </div>
            </div>`).join("")}
          </div>` : ""}
        </div>`;
      }).join("") || `
      <div class="glass glass-pad empty">${icon("search")}<p>没有匹配「${esc(kw)}」的场景。<br>换个关键词试试。</p></div>`}
      <div class="glass glass-pad" style="text-align:center;padding:20px">
        <p class="tiny muted">没找到你的场景？把遇到的问题告诉学院，它会变成新的一条路由。</p>
      </div>
    </div>`;
    const inp = $("#pbSearch", el);
    if(inp){
      inp.addEventListener("input", e => {
        kw = e.target.value;
        const pos = e.target.selectionStart;
        render();
        const n = $("#pbSearch", el);
        n.focus(); n.setSelectionRange(pos, pos);
      });
    }
    $$(".pb-head", el).forEach(b => b.addEventListener("click", () => {
      const idx = +b.dataset.pb;
      open = (open === idx) ? null : idx;
      render();
    }));
  }
  render();
  return el;
};
