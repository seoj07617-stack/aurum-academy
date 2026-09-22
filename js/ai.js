/* ============================================================
   ai.js — 沈知远：知行金融学院老师（AI 顾问）
   点击铜钱站标唤起；黑金抽屉；流式输出；持久对话记忆 + 研究员备忘
   密钥只存本机 localStorage（aurum_ai），聊天记忆存 aurum_ai_hist
   ============================================================ */
"use strict";
const tnow = () => new Date().toTimeString().slice(0, 5);

/* 人名金印头像：深墨圆底 + 金双环 + 宋体姓氏单字 */
const sealNameSVG = (ch) => `<svg viewBox="0 0 64 64" aria-hidden="true">
<circle cx="32" cy="32" r="30" fill="#26221A" stroke="#C9A227" stroke-width="2.6"/>
<circle cx="32" cy="32" r="26" fill="none" stroke="#E5CE8A" stroke-opacity=".4" stroke-width="1"/>
<text x="32" y="44.5" text-anchor="middle" font-family="'Noto Serif SC','Source Han Serif SC','Songti SC',STSong,SimSun,serif" font-size="31" font-weight="700" fill="#E5CE8A">${ch}</text>
</svg>`;

/* AI 消息头像：沈老师的金印 */
const AVA_SVG = sealNameSVG("沈");

const Ai = {
  NAME: "沈知远",
  EN: "ZHIYUAN SHEN",
  PRESETS: [
    { name: "智谱 GLM（glm-4-flash 免费）", url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", model: "glm-4-flash", hint: "bigmodel.cn 注册即送密钥" },
    { name: "DeepSeek", url: "https://api.deepseek.com/chat/completions", model: "deepseek-chat", hint: "platform.deepseek.com" },
    { name: "硅基流动", url: "https://api.siliconflow.cn/v1/chat/completions", model: "Qwen/Qwen2.5-7B-Instruct", hint: "siliconflow.cn 有免费模型" },
    { name: "自定义（OpenAI 兼容）", url: "", model: "", hint: "填完整 /chat/completions 地址" }
  ],
  cfg(){ try { return JSON.parse(localStorage.getItem("aurum_ai") || "{}"); } catch(e){ return {}; } },
  saveCfg(c){ localStorage.setItem("aurum_ai", JSON.stringify(c)); },
  histLoad(){ try { const a = JSON.parse(localStorage.getItem("aurum_ai_hist") || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } },
  histSave(a){ try { localStorage.setItem("aurum_ai_hist", JSON.stringify(a.slice(-60))); } catch(e){} },
  hist: [],
  ctrl: null,
  _lmap: null,

  /* ---------- 学生档案：实时注入每次对话 ---------- */
  profile(){
    const L = [];
    const done = ORDER.filter(id => LState(id).done).length;
    L.push("【学生档案·实时】");
    L.push("身份:" + levelInfo().name + "｜XP:" + S.xp + "｜连续打卡 " + S.streak.n + " 天（最佳 " + S.streak.best + "）");
    L.push("课程进度:已完成 " + done + "/" + ORDER.length + " 课，平均掌握度 " + totalPct() + "%");
    CURRICULUM.forEach(st => {
      const i = stageInfo(st.id), w = stageWeakness(st.id);
      const lock = (st.id !== "s0" && !stageUnlocked(st.id)) ? "[未解锁]" : "";
      const weak = w.danger ? " ←薄弱(错题" + w.wrong + ")" : "";
      L.push("·" + st.num + st.title + lock + "：" + i.done + "/" + i.total + " 课，掌握 " + i.mastery + "%" + weak);
    });
    const wrongs = Object.keys(S.wrong).map(k => S.wrong[k]).slice(0, 8);
    if(wrongs.length){
      L.push("【近期错题】" + wrongs.map(w => {
        const q = quizOf(w.lesson, w.qi);
        return q ? q.q.slice(0, 26) : "";
      }).filter(Boolean).join("；"));
    }
    const cards = Object.keys(S.srs).filter(id => SRS.CARDS[id]).length;
    L.push("【记忆】卡片 " + cards + " 张，今日到期 " + SRS.dueCount() + "，记忆健康度 " + SRS.health() + "/100");
    L.push("【每日一卷】" + (S.dailyMix && S.dailyMix.date === dayKey()
      ? "今日已完成 " + S.dailyMix.score + "/" + S.dailyMix.total
      : "今日尚未完成"));
    const last7 = [];
    for(let i = 6; i >= 0; i--){ const k = addDays(dayKey(), -i); last7.push((S.days[k] || 0)); }
    L.push("【近7日学习强度 XP】" + last7.join(","));
    if(S.journal.length) L.push("【最近手记】" + esc(S.journal[0].text).slice(0, 40));
    /* 本周功课：AI 方案落地闭环 */
    if(S.aiPlan && S.aiPlan.lessons && S.aiPlan.lessons.length){
      const p = S.aiPlan;
      const dd = daysBetween(p.date, dayKey());
      const prog = p.lessons.map(id => LESSON[id] ? (LESSON[id].title + (LState(id).done ? "（已完成）" : "（未完成）")) : "").filter(Boolean).join("、");
      if(prog) L.push("【本周功课·" + dd + " 天前布置】" + prog + (dd >= 5 ? "（请先点评完成情况，再谈下一步）" : ""));
    }
    /* 长期记忆 */
    const mem = Ai.memLoad();
    if(mem.length) L.push("【研究员备忘·关于学生的长期记忆】" + mem.join("；"));
    /* 课程概念索引 */
    const concepts = [];
    CURRICULUM.forEach(st => st.lessons.forEach(l => (l.points || []).forEach(p => concepts.push(p.t))));
    L.push("【学院讲授过的概念】" + concepts.join("、"));
    return L.join("\n");
  },

  memLoad(){ try { const a = JSON.parse(localStorage.getItem("aurum_ai_mem") || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } },
  memSave(a){ try { localStorage.setItem("aurum_ai_mem", JSON.stringify(a.slice(-24))); } catch(e){} },
  memClear(){ localStorage.removeItem("aurum_ai_mem"); },
  /* 对话后自动提炼长期记忆（有密钥时静默执行） */
  async remember(q, a){
    const c = Ai.cfg(); if(!c.key) return;
    const known = Ai.memLoad();
    try {
      const res = await fetch(c.url, { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + c.key },
        body: JSON.stringify({ model: c.model, stream: false, messages: [
          { role: "system", content: "你是记忆提炼器。从对话中提取关于学生的长期有用信息（学习目标、薄弱概念、偏好、约束、承诺、疑问）。输出 JSON 数组（字符串数组，最多 2 条，每条不超过 24 字，第三人称）。没有新信息则输出 []。只输出 JSON，不要其他文字。已有记忆（勿重复）：[" + Ai.memLoad().join("；") + "]" },
          { role: "user", content: "学生问：" + q.slice(0, 200) + "\n沈老师答：" + a.slice(0, 400) }
        ] }) });
      if(!res.ok) return;
      const j = await res.json();
      let txt = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "[]";
      txt = txt.replace(/^[^[]*/, "").replace(/[^\\\]]*$/, "").trim();
      let arr;
      try { arr = JSON.parse(txt); } catch(e){ return; }
      if(!Array.isArray(arr)) return;
      const mem = Ai.memLoad();
      arr.filter(x => typeof x === "string" && x.trim()).slice(0, 2).forEach(x => {
        if(!mem.some(m => m.includes(x.slice(0, 10)))) mem.push(x.trim().slice(0, 30));
      });
      Ai.memSave(mem);
    } catch(e){}
  },

  SYS(){
    return `你是「沈知远」，知行金融学院的老师，学生的私人投资学习顾问。
你的风格：现代、专业、直接、结论先行，像一对一的私人教练，不像客服。学生称你「沈老师」。

回答规则：
1. 学生输入的多是金融术语或概念，按三层作答：一句准确定义 → 一个现代生活的类比 → 一句投资实操提醒。
2. 中文，总长不超过 250 字；给方案时用清单并标注优先级。
3. 一切基于下方学生档案：先给结论，再给依据，具体到课程名和天数。
4. 红线：不荐股、不给具体标的买卖建议、不预测短期涨跌；始终强调纪律、仓位与长期主义。
5. 提到学院课程时，必须用《课程名》书名号格式（课程名须与「学院讲授过的概念」所在课程标题一致，便于直达）。
6. 若问题超出金融学习范畴，简短回应并引导回学习。

` + Ai.profile();
  },

  open(prefill){
    if(document.getElementById("aiMask")) return;
    Ai.hist = Ai.histLoad();
    document.body.classList.add("lock");
    const mask = document.createElement("div");
    mask.id = "aiMask"; mask.className = "ai-mask";
    mask.innerHTML = `
    <aside class="ai-drawer" role="dialog" aria-label="AI 助教沈知远">
      <header class="ai-head">
        <span class="ai-seal">${AVA_SVG}</span>
        <div class="ai-title"><b>沈知远</b>
          <button class="mem-pill" id="aiMemChip" title="研究员备忘">备忘 <i id="aiMemChipN">0</i></button>
        </div>
        <button class="ai-gear" id="aiNew" title="新对话">${icon("edit")}</button>
        <button class="ai-gear" id="aiGear" title="设置">${icon("refresh")}</button>
        <button class="ai-x" id="aiClose">${icon("x")}</button>
      </header>
      <div class="ai-msgs" id="aiMsgs">
        <div class="ai-day"><span>本 次 对 话</span></div>
      </div>
      <div class="ai-chips" id="aiChips">
        <button data-q="看看我的功课，我哪里薄弱？该怎么补？">诊断薄弱点</button>
        <button data-q="生成本周学习计划">生成本周计划</button>
        <button data-q="我总是拿不住盈利的单子，怎么改？">拿不住盈利单怎么改</button>
      </div>
      <div class="ai-inputrow">
        <textarea id="aiIn" rows="1" placeholder="问我任何金融问题，或让我看你的功课"></textarea>
        <button class="btn btn-gold ai-send" id="aiSend">${icon("chevR")}</button>
      </div>
      <div class="ai-set" id="aiSet" hidden>
        <label class="fld">服务商</label>
        <select class="inp" id="aiProv">${Ai.PRESETS.map((p,i)=>`<option value="${i}">${p.name}</option>`).join("")}<option value="-1">自定义</option></select>
        <label class="fld">接口地址（/chat/completions）</label>
        <input class="inp" id="aiUrl" placeholder="https://…/chat/completions">
        <label class="fld">模型</label>
        <input class="inp" id="aiModel" placeholder="glm-4-flash">
        <label class="fld">API 密钥（仅存本机浏览器）</label>
        <input class="inp" id="aiKey" type="password" placeholder="粘贴密钥">
        <div class="row" style="gap:8px;margin-top:10px">
          <button class="btn btn-gold btn-sm" id="aiSave">保存设置</button>
          <span class="tiny" id="aiHint"></span>
        </div>
        <p class="tiny" style="margin-top:8px">没有密钥？推荐智谱 bigmodel.cn 注册即送，glm-4-flash 模型免费。密钥与记忆只存本机。</p>
        <hr style="border:none;border-top:1px solid rgba(201,162,39,.2);margin:12px 0 8px">
        <div class="row" style="gap:8px">
          <span class="fld" style="margin:0">研究员备忘（<span id="aiMemN">0</span> 条）</span>
          <button class="btn btn-ghost btn-sm" id="aiMemClear" style="margin-left:auto">清除记忆</button>
        </div>
        <div id="aiMemList" class="ai-mem-list" style="margin-top:6px"></div>
      </div>
    </aside>`;
    document.body.appendChild(mask);
    mask.addEventListener("click", e => {
      const lk = e.target.closest(".qlink");
      if(lk && lk.dataset.go){ go(lk.dataset.go); Ai.close(); return; }
      if(e.target === mask) Ai.close();
    });
    /* 手机端手势：抽屉内横向左划拖出即关闭（自动识别主方向，不干扰消息区滚动） */
    const dr = mask.querySelector(".ai-drawer");
    let sx = 0, sy = 0, axis = 0;
    dr.addEventListener("touchstart", e => {
      if(e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; axis = 0;
      dr.style.transition = "none";
    }, { passive: true });
    dr.addEventListener("touchmove", e => {
      if(axis === 2) return;
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if(!axis){
        if(Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 1 : 2;
      }
      if(axis === 1){
        e.preventDefault();
        const off = Math.max(0, dx);
        dr.style.transform = "translateX(" + off + "px)";
        dr.style.opacity = String(Math.max(.35, 1 - off / 500));
      }
    }, { passive: false });
    dr.addEventListener("touchend", e => {
      if(axis !== 1) return;
      const dx = e.changedTouches[0].clientX - sx;
      dr.style.transition = "transform .3s var(--ease),opacity .3s";
      if(dx > 90){
        dr.style.transform = "translateX(100%)"; dr.style.opacity = "0";
        setTimeout(() => Ai.close(), 200);
      } else {
        dr.style.transform = ""; dr.style.opacity = "";
      }
    });
    $("#aiClose", mask).addEventListener("click", () => Ai.close());
    $("#aiNew", mask).addEventListener("click", () => {
      Ai.hist = []; Ai.histSave(Ai.hist);
      $("#aiMsgs", mask).innerHTML = "";
      Ai.welcome();
      toast("新对话已开启", "gold");
    });
    $("#aiGear", mask).addEventListener("click", () => {
      const s = $("#aiSet", mask); s.hidden = !s.hidden; Ai.fillSet();
    });
    $("#aiProv", mask).addEventListener("change", e => {
      const p = Ai.PRESETS[+e.target.value];
      if(p){ $("#aiUrl", mask).value = p.url; $("#aiModel", mask).value = p.model; }
    });
    $("#aiSave", mask).addEventListener("click", () => {
      Ai.saveCfg({ url: $("#aiUrl", mask).value.trim(), model: $("#aiModel", mask).value.trim(), key: $("#aiKey", mask).value.trim() });
      toast("设置已存（仅本机）", "gold");
      $("#aiSet", mask).hidden = true;
    });
    $("#aiMemClear", mask).addEventListener("click", () => {
      Ai.memClear(); Ai.paintMem(); toast("研究员备忘已清空");
    });
    $("#aiMemChip", mask).addEventListener("click", () => {
      const s = $("#aiSet", mask); s.hidden = false; Ai.fillSet();
      const list = $("#aiMemList", mask);
      if(list) setTimeout(() => list.scrollIntoView({ block: "nearest", behavior: "smooth" }), 60);
    });
    $$(".ai-chips button", mask).forEach(b => b.addEventListener("click", () => Ai.send(b.dataset.q)));
    $("#aiSend", mask).addEventListener("click", () => Ai.send());
    $("#aiIn", mask).addEventListener("keydown", e => {
      if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); Ai.send(); }
    });
    document.addEventListener("keydown", Ai.escClose);
    Ai.fillSet();
    const msgs0 = $("#aiMsgs", mask);
    msgs0.insertAdjacentHTML("beforeend", '<div class="ai-day"><span>本 次 对 话</span></div>');
    if(Ai.hist.length){
      Ai.hist.slice(-10).forEach(m => Ai.paint(m.role === "user" ? "me" : "ai", m.content));
    } else {
      Ai.welcome();
    }
    if(prefill){ $("#aiIn", mask).value = prefill; setTimeout(() => Ai.send(), 150); }
    setTimeout(() => $("#aiIn", mask).focus(), 300);
  },
  paintMem(){
    const mask = $("#aiMask"); if(!mask) return;
    const list = $("#aiMemList", mask), n = $("#aiMemN", mask), hn = $("#aiMemChipN", mask);
    const mem = Ai.memLoad();
    if(n) n.textContent = mem.length;
    if(hn) hn.textContent = mem.length;
    if(!list) return;
    list.innerHTML = mem.length ? mem.map((m,i) => (i+1) + ". " + esc(m)).join("<br>") : "（暂无备忘——随着对话，沈老师会自动记下关于你的关键信息）";
  },
  fillSet(){
    const mask = $("#aiMask"); if(!mask) return;
    const c = Ai.cfg();
    if(c.url){
      const pi = Ai.PRESETS.findIndex(p => p.url === c.url);
      $("#aiProv", mask).value = String(pi >= 0 ? pi : -1);
      $("#aiUrl", mask).value = c.url; $("#aiModel", mask).value = c.model || "";
      $("#aiKey", mask).value = c.key || "";
      $("#aiHint", mask).textContent = "已存配置" + (c.key ? "（密钥就绪）" : "（无密钥 = 演示讲学）");
    }
    Ai.paintMem();
  },
  escClose(e){ if(e.key === "Escape") Ai.close(); },
  close(){
    if(Ai.ctrl) Ai.ctrl.abort();
    const m = document.getElementById("aiMask"); if(m) m.remove();
    document.removeEventListener("keydown", Ai.escClose);
    document.body.classList.remove("lock");
  },
  welcome(){
    var weak = CURRICULUM.map(st => stageWeakness(st.id).danger ? st.title : "").filter(Boolean)[0] || "暂不明显";
    Ai.paint("ai", "功课看完了：进度 " + totalPct() + "%，最薄弱是「" + weak + "」。\n术语、方案、错题复盘——直接问。");
  },
  /* ---------- 课程名直达链接 + 平滑滚动 ---------- */
  _lm(){
    if(!Ai._lmap){ Ai._lmap = {}; Object.keys(LESSON).forEach(id => { Ai._lmap[LESSON[id].title] = id; }); }
    return Ai._lmap;
  },
  linkify(escTxt){
    return escTxt.replace(/《([^《》]{1,24})》/g, (m, name) => {
      const id = Ai._lm()[name];
      return id ? `《<a class="qlink" data-go="#/lesson/${id}">${esc(name)}</a>》` : m;
    });
  },
  planIds(txt){
    const ids = [], seen = {};
    (txt.match(/《([^《》]{1,24})》/g) || []).forEach(m => {
      const name = m.slice(1, -1), id = Ai._lm()[name];
      if(id && !seen[id]){ seen[id] = 1; ids.push(id); }
    });
    return ids;
  },
  glide(el){
    if(!el) return;
    if(el._gt) cancelAnimationFrame(el._gt);
    const step = () => {
      const d = el.scrollHeight - el.scrollTop;
      if(d < 2){ el._gt = null; return; }
      el.scrollTop += d * .25;
      el._gt = requestAnimationFrame(step);
    };
    el._gt = requestAnimationFrame(step);
  },

  paint(who, txt){
    const msgsEl = $("#aiMsgs", document.getElementById("aiMask"));
    if(!msgsEl) return;
    const me = who === "me";
    const body = me ? esc(txt).replace(/\n/g, "<br>") : Ai.linkify(esc(txt)).replace(/\n/g, "<br>");
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-msg ${me?"me":"ai"}">
         <div class="ava">${me ? "我" : AVA_SVG}</div>
         <div class="ai-bubble ${me?"me":"ai"}"><div class="ai-txt">${body}<span class="tstamp">${tnow()}</span></div></div>
       </div>`);
    Ai.glide(msgsEl);
  },

  async send(text){
    const mask = $("#aiMask"); if(!mask) return;
    const input = $("#aiIn", mask);
    const c = Ai.cfg();
    const q = (text !== undefined ? text : input.value).trim();
    if(!q) return;
    if(text === undefined) input.value = "";
    const msgsEl = $("#aiMsgs", mask);
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-msg me"><div class="ava">我</div><div class="ai-bubble me"><div class="ai-txt">${esc(q)}<span class="tstamp">${tnow()}</span></div></div></div>`);
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-msg ai" id="aiThink"><div class="ava">${AVA_SVG}</div><div class="ai-bubble ai think"><span class="dots"><i></i><i></i><i></i></span></div></div>`);
    Ai.glide(msgsEl);
    $("#aiSend", mask).disabled = true; input.disabled = true;
    let acc = "", streamUp = false;
    const mount = () => {
      $("#aiThink", mask)?.remove();
      if(streamUp) return;
      streamUp = true;
      msgsEl.insertAdjacentHTML("beforeend",
        `<div class="ai-msg ai"><div class="ava">${AVA_SVG}</div><div class="ai-bubble ai"><div class="ai-txt"><span id="aiStream"></span><span class="cur">▍</span></div></div></div>`);
      Ai.glide(msgsEl);
    };
    const onDelta = d => {
      mount(); acc += d;
      const el = $("#aiStream", mask); if(el) el.textContent = acc;
      Ai.glide(msgsEl);
    };
    const finish = () => {
      $("#aiThink", mask)?.remove();
      $("#aiSend", mask).disabled = false; input.disabled = false; input.focus();
      if(acc){
        /* 流式结束后升级：课程名变直达链接 */
        const seg = $("#aiStream", mask);
        if(seg){
          const box = seg.closest(".ai-txt");
          if(box){
            const cur = box.querySelector(".cur"); if(cur) cur.remove();
            box.innerHTML = Ai.linkify(esc(acc)).replace(/\n/g, "<br>") + `<span class="tstamp">${tnow()}</span>`;
          }
        }
        Ai.glide(msgsEl);
        Ai.hist.push({ role: "user", content: q }, { role: "assistant", content: acc }); Ai.histSave(Ai.hist);
        /* 学习方案 → 一键记为本周功课（≥2 门课才成其为方案） */
        const ids = Ai.planIds(acc);
        if(/方案|计划|功课/.test(acc) && ids.length >= 2){
          const lastAi = Array.from(msgsEl.querySelectorAll(".ai-msg.ai")).pop();
          if(lastAi && !lastAi.querySelector(".plan-row")){
            lastAi.insertAdjacentHTML("beforeend",
              `<div class="plan-row"><button class="plan-btn">${icon("check")}记为本周功课 · +20 XP</button></div>`);
            lastAi.querySelector(".plan-btn").addEventListener("click", function(){
              this.disabled = true;
              S.aiPlan = { date: dayKey(), lessons: ids };
              save();
              award(20, "记为本周功课");
              this.textContent = "已记入 · 下周汇报对比";
            });
          }
        }
      }
      if(c.key && acc){ Ai.remember(q, acc).catch(()=>{}); }
    };
    try {
      if(!c.key){
        const ans = Ai.demo(q);
        let i = 0;
        const timer = setInterval(() => {
          if(i >= ans.length){ clearInterval(timer); finish(); return; }
          onDelta(ans.slice(i, i + 2)); i += 2;
        }, 22);
        return;
      }
      Ai.ctrl = new AbortController();
      const histCtx = Ai.hist.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const messages = [{ role: "system", content: Ai.SYS() }, ...histCtx, { role: "user", content: q }];
      await Ai.stream(messages, onDelta);
      if(!acc) onDelta("（沈老师未作答——请检查模型名与密钥）");
      finish();
    } catch(err){
      if(err.name === "AbortError"){ finish(); return; }
      $("#aiThink", mask)?.remove();
      msgsEl.insertAdjacentHTML("beforeend",
        `<div class="ai-err">⚠ ${esc(err.message)}<br><span class="tiny">若为网络/跨域错误：换服务商（推荐智谱）或检查网络；401 为密钥无效。</span></div>`);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      $("#aiSend", mask).disabled = false; input.disabled = false;
    }
  },

  async stream(messages, onDelta){
    const c = Ai.cfg();
    const res = await fetch(c.url, {
      method: "POST", signal: Ai.ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + c.key },
      body: JSON.stringify({ model: c.model, messages, stream: true })
    });
    if(!res.ok){ const t = await res.text().catch(() => "");
      throw new Error("API " + res.status + (res.status === 401 ? " 密钥无效" : "") + " " + t.slice(0, 100)); }
    const reader = res.body.getReader(); const dec = new TextDecoder();
    let buf = "";
    while(true){
      const { done, value } = await reader.read(); if(done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop();
      for(const line of lines){
        const s = line.trim(); if(!s.startsWith("data:")) continue;
        const data = s.slice(5).trim();
        if(data === "[DONE]") return;
        try { const j = JSON.parse(data);
          const d = j.choices && j.choices[0] && j.choices[0].delta ? (j.choices[0].delta.content || "") : "";
          if(d) onDelta(d);
        } catch(e){}
      }
    }
  },

  demo(q){
    const weak = CURRICULUM.map(st => stageWeakness(st.id).danger ? st.title : "").filter(Boolean).join("、") || "尚无薄弱处——功课做得齐整";
    if(/方案|计划|周/.test(q)) return "本周方案，四条，按优先级——\n一、先补薄弱：" + weak + "，重学对应课程，每日一课，课毕即测；\n二、每日一卷五题不辍，错题入本，三日一回头；\n三、记忆卡到期即清，不清不睡；\n四、周末半天复盘一周错因，归三类：概念不明→重学，纪律违规→记入日志，粗心→抄一遍检查清单。\n七日后再对一次数据，看执行说话。";
    if(/薄弱|功课|错/.test(q)) return "我看了你的卷面：薄弱处在「" + weak + "」。错题不是污点，是路标——每一道都指着一个你还未真正理解的概念。\n处方：先回课程重学对应小节，再做课后测验至 80% 以上；错题本三日后重练，全对方可销号。切记：理解了才做，做了才算理解。";
    if(/久期/.test(q)) return "久期：衡量债券对利率的敏感度。类比：债券像一块晒化的糖，利率是日头——日头越烈化得越快，久期就是「化速」的刻度。实操：久期越长对利率越敏感，降息周期持长债占优，加息周期长债承压。";
    if(/拿不住|盈利/.test(q)) return "拿不住盈利，病根通常有二：一是没有移动止盈规则，全凭情绪；二是盯盘太勤，被日内波幅牵着走。\n处方：下单前先写好移动止盈线（如浮盈回撤 8% 即离场）；盘中不看盘，每日收盘后看一次。规则立了，心态自然稳。";
    return "（演示模式）这是离线示例回答。接入真 AI：点右上齿轮粘贴密钥——推荐智谱 bigmodel.cn，glm-4-flash 免费。";
  }
};
