/* ============================================================
   views/dojo.js — 纪律工坊：盘前清单 / 交易计划 / 交易日志
   ============================================================ */
"use strict";
const CHECKLIST = [
  "今天有没有必须执行的书面交易计划？（没有计划 = 今天不交易）",
  "这笔交易的核心理由是什么？能否一句话写清？",
  "止损位设好了吗？这笔的最大亏损是否 ≤ 总资金 2%？",
  "盈亏比算过了吗？是否 ≥ 2:1？",
  "当前总仓位与单标的仓位是否超出纪律上限？",
  "我现在的情绪：愤怒 / 兴奋 / 报复心 / FOMO？（任一为是 → 暂停）",
  "这是计划内的入场位，还是盘中的追涨冲动？",
  "最坏结果我能承受吗？会影响睡眠吗？",
  "标的是否在我的能力圈内？逻辑破坏的条件写下了吗？",
  "今天收盘后留出 15 分钟写交易日志了吗？"
];
VIEWS.dojo = function(tab){
  tab = ["check","plan","journal"].includes(tab) ? tab : "check";
  const el = document.createElement("div");
  const doneCnt = CHECKLIST.filter((_,i)=>S.checklist.items[i]).length;

  el.innerHTML = `
  <div class="wrap st">
    <div class="between" style="margin-bottom:6px;flex-wrap:wrap">
      <div>
        <div class="kicker">DISCIPLINE DOJO · 纪律工坊</div>
        <h1 style="font-size:27px;margin-top:8px">知行合一的操练场</h1>
        <p class="muted small" style="margin-top:4px">知识只有在执行中才算完成——用工具对抗人性，比用意志力对抗人性便宜得多。</p>
      </div>
      <div class="seg">
        <button data-t="check" class="${tab==="check"?"on":""}">盘前清单</button>
        <button data-t="plan" class="${tab==="plan"?"on":""}">交易计划</button>
        <button data-t="journal" class="${tab==="journal"?"on":""}">交易日志</button>
      </div>
    </div>
    <div id="dojoBody"></div>
  </div>`;
  const body = $("#dojoBody", el);
  $$(".seg button", el).forEach(b=>b.addEventListener("click",()=>go(`#/dojo/${b.dataset.t}`)));

  /* ---- 盘前清单 ---- */
  if(tab === "check"){
    body.innerHTML = `
    <div class="glass glass-pad">
      <div class="between" style="margin-bottom:14px">
        <div class="card-title" style="margin:0">${icon("shield")} 盘前十问 · ${dayKey()}</div>
        <span class="tag ${doneCnt===10?"done":""}">${doneCnt}/10 ${doneCnt===10?"· 纪律满分":doneCnt>=7?"· 可以交易":"· 未达开仓条件"}</span>
      </div>
      ${doneCnt===10?`<div class="q-why good" style="margin:0 0 14px"><b>✓ 清单完成</b><br>你已通过今日纪律检查。记住：清单的目的是让违规必须先亲手划掉一条。</div>`:""}
      ${CHECKLIST.map((c,i)=>`
      <div class="chk ${S.checklist.items[i]?"on":""}" data-i="${i}">
        <span class="box">${icon("check")}</span>
        <span class="txt">${c}</span>
      </div>`).join("")}
    </div>`;
    $$(".chk", body).forEach(n=>n.addEventListener("click",()=>{
      const i = +n.dataset.i;
      S.checklist.items[i] = !S.checklist.items[i];
      const cnt = CHECKLIST.filter((_,j)=>S.checklist.items[j]).length;
      save();
      if(cnt === 10) award(10, "盘前清单完成");
      location.hash = "#/dojo/x"; setTimeout(()=>location.hash="#/dojo/check",0);
    }));
  }

  /* ---- 交易计划 ---- */
  if(tab === "plan"){
    body.innerHTML = `
    <div class="dojo-grid">
      <div class="glass glass-pad">
        <div class="card-title">${icon("edit")} 新建交易计划（七要素）</div>
        <div class="stack" style="gap:12px;margin-top:8px">
          <div class="g2" style="gap:12px;display:grid">
            <div><label class="fld">标的 / 代码</label><input class="inp" id="pSym" placeholder="如：沪深300ETF"></div>
            <div><label class="fld">方向</label><select class="inp" id="pDir"><option>做多</option><option>观望</option></select></div>
          </div>
          <div><label class="fld">核心逻辑（赚的是什么钱？）</label><textarea class="inp" id="pLogic" placeholder="一句话说清买入理由与逻辑破坏条件，例：估值处于历史低位分位，若跌破前低则逻辑破坏"></textarea></div>
          <div class="g2" style="gap:12px;display:grid">
            <div class="g2" style="gap:12px;display:grid">
              <div><label class="fld">入场价</label><input class="inp num" id="pIn" type="number" step="any"></div>
              <div><label class="fld">止损价</label><input class="inp num" id="pSl" type="number" step="any"></div>
            </div>
            <div class="g2" style="gap:12px;display:grid">
              <div><label class="fld">目标价</label><input class="inp num" id="pTp" type="number" step="any"></div>
              <div><label class="fld">仓位 %</label><input class="inp num" id="pPos" type="number" step="any" placeholder="如 20，勿超单标的上限"></div>
            </div>
          </div>
          <div class="q-why" id="rrBox"><b>盈亏比自动计算</b><br>填入入场 / 止损 / 目标价后自动计算。盈亏比 ≥ 2:1 才出手。</div>
          <button class="btn btn-gold" id="addPlan">${icon("check")} 生成计划</button>
        </div>
      </div>
      <div class="glass glass-pad">
        <div class="card-title">${icon("book")} 计划清单 <span class="tag gray" style="margin-left:auto">${S.plans.length} 份</span></div>
        <div id="planList" style="margin-top:8px">${S.plans.length?"":`<div class="empty">${icon("book")}<p>还没有计划。<br>记住第一条纪律：无计划，不开仓。</p></div>`}</div>
      </div>
    </div>`;
    const calcRR = ()=>{
      const i=+$("#pIn",body).value, s=+$("#pSl",body).value, t=+$("#pTp",body).value;
      const box = $("#rrBox", body);
      if(i&&s&&t&&i!==s){
        const risk = Math.abs(i-s), rew = Math.abs(t-i);
        const rr = rew/risk;
        const ok = rr >= 2;
        box.innerHTML = `<b style="${ok?"":"color:var(--rose)"}">盈亏比 ${rr.toFixed(2)} : 1 ${ok?"· 达标 ✓":"· 未达 2:1，慎重 ✕"}</b><br>每承担 1 单位风险，预期回报 ${rew.toFixed(2)} 单位（风险 ${risk.toFixed(2)} 单位）。`;
      }
    };
    ["pIn","pSl","pTp"].forEach(id=>$("#"+id, body).addEventListener("input",calcRR));
    $("#addPlan", body).addEventListener("click",()=>{
      const sym = $("#pSym",body).value.trim();
      const logic = $("#pLogic",body).value.trim();
      if(!sym || !logic){ toast("标的与核心逻辑为必填项",""); return; }
      const i=+$("#pIn",body).value, s=+$("#pSl",body).value, t=+$("#pTp",body).value;
      S.plans.unshift({ id:Date.now(), sym, dir:$("#pDir",body).value, logic,
        in:i||null, sl:s||null, tp:t||null, pos:+$("#pPos",body).value||null,
        date:dayKey(), open:true, result:null, review:"" });
      save(); award(15, "制定交易计划"); confetti(14);
      go("#/dojo/x"); setTimeout(()=>go("#/dojo/plan"),0);
    });
    renderPlanList(body);
  }

  /* ---- 交易日志 ---- */
  if(tab === "journal"){
    body.innerHTML = `
    <div class="dojo-grid">
      <div class="glass glass-pad">
        <div class="card-title">${icon("edit")} 今日一记</div>
        <div class="stack" style="gap:12px;margin-top:8px">
          <div><label class="fld">今天最重要的交易行为 / 决策</label><textarea class="inp" id="jText" placeholder="执行了什么？违反了什么？观察到什么？"></textarea></div>
          <div class="g2" style="gap:12px;display:grid">
            <div><label class="fld">情绪状态</label><select class="inp" id="jMood">
              <option>平静 · 按计划执行</option><option>兴奋 · 想加仓</option><option>恐惧 · 想割肉</option>
              <option>懊悔 · 踏空或卖飞</option><option>愤怒 · 想扳回</option><option>观望 · 未交易</option></select></div>
            <div><label class="fld">今日合规自评</label><select class="inp" id="jScore">
              <option value="100">满分 · 完全遵守系统</option><option value="70">良好 · 小偏差</option>
              <option value="40">及格 · 有违规</option><option value="10">失控 · 严重违规</option></select></div>
          </div>
          <button class="btn btn-gold" id="addJ">${icon("check")} 写入日志（+10 XP）</button>
        </div>
      </div>
      <div class="glass glass-pad">
        <div class="card-title">${icon("book")} 日志时间线 <span class="tag gray" style="margin-left:auto">${S.journal.length} 条</span></div>
        <div id="jList" style="margin-top:8px">${S.journal.length?"":`<div class="empty">${icon("book")}<p>日志为空。<br>复盘过程而非结果：正确的亏损要重复，错误的盈利要警惕。</p></div>`}</div>
      </div>
    </div>`;
    $("#addJ", body).addEventListener("click",()=>{
      const t = $("#jText",body).value.trim();
      if(!t){ toast("写点什么再保存吧",""); return; }
      S.journal.unshift({ date:dayKey(), text:t, mood:$("#jMood",body).value, score:+$("#jScore",body).value });
      save(); award(10, "交易日志");
      go("#/dojo/x"); setTimeout(()=>go("#/dojo/journal"),0);
    });
    $("#jList", body).innerHTML = S.journal.slice(0,30).map(j=>`
      <div class="jr-item">
        <div class="between"><span class="d">${j.date} · ${j.mood}</span>
        <span class="tag ${j.score>=70?"done":"rose"}">合规 ${j.score}</span></div>
        <div style="margin-top:4px">${esc(j.text)}</div>
      </div>`).join("");
  }
  return el;
};

function renderPlanList(body){
  const list = $("#planList", body); if(!list) return;
  if(!S.plans.length) return;
  list.innerHTML = S.plans.map(p=>{
    const rr = (p.in&&p.sl&&p.tp&&p.in!==p.sl) ? Math.abs(p.tp-p.in)/Math.abs(p.in-p.sl) : null;
    return `<div class="plan-card" style="${p.open?"":"opacity:.62"}">
      <div class="ph">
        <b>${esc(p.sym)}</b><span class="tag">${p.dir}</span>
        ${rr?`<span class="tag ${rr>=2?"done":"rose"} num">盈亏比 ${rr.toFixed(1)}:1</span>`:""}
        ${p.open?`<span class="tag gray">进行中</span>`:`<span class="tag done">已结算</span>`}
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" data-del="${p.id}">${icon("trash")}</button>
      </div>
      <div class="logic">逻辑：${esc(p.logic)}</div>
      <div class="nums">
        ${p.in?`<span>入场 ${p.in}</span>`:""}${p.sl?`<span>止损 ${p.sl}</span>`:""}
        ${p.tp?`<span>目标 ${p.tp}</span>`:""}${p.pos?`<span>仓位 ${p.pos}%</span>`:""}
        <span>${p.date}</span>
      </div>
      ${p.open?`
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn btn-sm btn-ghost" data-close="${p.id}" data-r="win">结算 · 按计划盈利</button>
        <button class="btn btn-sm btn-ghost" data-close="${p.id}" data-r="loss">结算 · 按计划止损</button>
        <button class="btn btn-sm btn-ghost" data-close="${p.id}" data-r="violate">结算 · 违规操作</button>
      </div>`:`
      <div class="q-why ${p.result==="win"?"good":"bad"}" style="margin:8px 0 0"><b>${p.result==="win"?"✓ 正确的执行":p.result==="loss"?"✓ 正确的亏损（系统的正常成本）":"✕ 违规——错误的盈利也要警惕"}</b>${p.review?`<br>${esc(p.review)}`:""}</div>`}
    </div>`;
  }).join("");
  $$("[data-close]", list).forEach(b=>b.addEventListener("click",()=>{
    const p = S.plans.find(x=>x.id===+b.dataset.close);
    if(!p) return;
    p.open = false; p.result = b.dataset.r; p.review = b.dataset.r==="violate" ? "记入复盘：违规原因待周末分析" : "";
    save(); award(8, "计划结算");
    go("#/dojo/x"); setTimeout(()=>go("#/dojo/plan"),0);
  }));
  $$("[data-del]", list).forEach(b=>b.addEventListener("click",()=>{
    S.plans = S.plans.filter(x=>x.id!==+b.dataset.del); save();
    go("#/dojo/x"); setTimeout(()=>go("#/dojo/plan"),0);
  }));
}
