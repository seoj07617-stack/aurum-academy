/* ============================================================
   ai.js — Auron · 奥伦：知行金融学院研究院首席研究员（AI 顾问）
   点击铜钱站标唤起；黑金抽屉；流式输出；持久对话记忆 + 研究员备忘
   密钥只存本机 localStorage（aurum_ai），聊天记忆存 aurum_ai_hist
   ============================================================ */
"use strict";
const tnow = () => new Date().toTimeString().slice(0, 5);

/* 金印名章：深墨圆底 + 金双环 + 首字母 */
const sealSVG = (letter) => `<svg viewBox="0 0 64 64" aria-hidden="true">
<circle cx="32" cy="32" r="30" fill="#26221A" stroke="#C9A227" stroke-width="2.6"/>
<circle cx="32" cy="32" r="25.5" fill="none" stroke="#E5CE8A" stroke-opacity=".4" stroke-width="1"/>
<text x="32" y="44" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="36" font-weight="700" fill="#E5CE8A">${letter}</text>
</svg>`;

/* AI 消息头像：漆金K线圆章 */
const AVA_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true">
<circle cx="32" cy="32" r="30" fill="#26221A" stroke="#C9A227" stroke-width="2.6"/>
<circle cx="32" cy="32" r="26.5" fill="none" stroke="#E5CE8A" stroke-opacity=".35" stroke-width="1"/>
<g stroke="#E5CE8A" stroke-width="1.5" stroke-linecap="round">
<path d="M18 34V26"/><path d="M27 30V18"/><path d="M36 32V22"/><path d="M45 26V16"/>
</g>
<g fill="#E5CE8A">
<rect x="15" y="28" width="6" height="8" rx="1"/>
<rect x="24" y="22" width="6" height="9" rx="1"/>
<rect x="33" y="25" width="6" height="8" rx="1"/>
<rect x="42" y="18" width="6" height="9" rx="1"/>
</g>
<circle cx="46" cy="15" r="1.6" fill="#F0E4BC"/>
</svg>`;

function msgsScroll(smooth){ const m = document.getElementById("aiMask"); if(m){ const e = m.querySelector(".ai-msgs"); if(e) e.scrollTo({ top: e.scrollHeight, behavior: smooth ? "smooth" : "auto" }); } }

const Ai = {
  NAME: "奥伦",
  EN: "Auron",
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
        const q = LESSON[w.lesson] && LESSON[w.lesson].quiz[w.qi];
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
          { role: "user", content: "学生问：" + q.slice(0, 200) + "\n首席答：" + a.slice(0, 400) }
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
    return `你是「Auron · 奥伦」，知行金融学院研究院的首席研究员，学生的私人投资学习顾问。你的名字源自 Aurum（拉丁语「金」）。
你的风格：专业、直接、结论先行，像私人银行的研究总监做一对一辅导。学生称你「奥伦」或「首席」。

回答规则：
1. 学生输入的多是金融术语或概念，按三层作答：一句准确定义 → 一个现代生活的类比 → 一句投资实操提醒。
2. 中文，总长不超过 250 字；给方案时用清单并标注优先级。
3. 一切基于下方学生档案：先给结论，再给依据，具体到课程名和天数。
4. 红线：不荐股、不给具体标的买卖建议、不预测短期涨跌；始终强调纪律、仓位与长期主义。
5. 提到学院课程时，用《课程名》书名号格式。
6. 若问题超出金融学习范畴，简短回应并引导回学习。

` + Ai.profile();
  },

  open(prefill){
    if(document.getElementById("aiMask")) return;
    Ai.hist = Ai.histLoad();
    const mask = document.createElement("div");
    mask.id = "aiMask"; mask.className = "ai-mask";
    mask.innerHTML = `
    <aside class="ai-drawer" role="dialog" aria-label="Auron · 奥伦">
      <header class="ai-head">
        <span class="ai-seal">${sealSVG("A")}</span>
        <div class="ai-title"><b>Auron · 奥伦</b><span id="aiMode"><i class="live"></i>知行研究院 · 只对你的功课负责</span></div>
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
        <button data-q="解释：久期">解释：久期</button>
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
    const list = $("#aiMemList", mask), n = $("#aiMemN", mask);
    if(!list || !n) return;
    const mem = Ai.memLoad();
    n.textContent = mem.length;
    list.innerHTML = mem.length ? mem.map((m,i) => (i+1) + ". " + esc(m)).join("<br>") : "（暂无记忆——随着对话，奥伦会自动记下关于你的关键信息）";
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
  },
  paint(who, txt){
    const msgsEl = $("#aiMsgs", document.getElementById("aiMask"));
    if(!msgsEl) return;
    const me = who === "me";
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-msg ${me?"me":"ai"}">
         <div class="ava">${me ? "我" : AVA_SVG}</div>
         <div class="ai-bubble ${me?"me":"ai"}"><div class="ai-txt">${esc(txt).replace(/\n/g, "<br>")}<span class="tstamp">${tnow()}</span></div></div>
       </div>`);
    msgsEl.scrollTop = msgsEl.scrollHeight;
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
    msgsEl.scrollTop = msgsEl.scrollHeight;
    $("#aiSend", mask).disabled = true; input.disabled = true;
    let acc = "", streamUp = false;
    const mount = () => {
      $("#aiThink", mask)?.remove();
      if(streamUp) return;
      streamUp = true;
      msgsEl.insertAdjacentHTML("beforeend",
        `<div class="ai-msg ai"><div class="ava">${AVA_SVG}</div><div class="ai-bubble ai"><div class="ai-txt"><span id="aiStream"></span><span class="cur">▍</span></div></div></div>`);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    };
    const onDelta = d => {
      mount(); acc += d;
      const el = $("#aiStream", mask); if(el) el.textContent = acc;
      msgsEl.scrollTop = msgsEl.scrollHeight;
    };
    const finish = () => {
      $("#aiThink", mask)?.remove();
      $("#aiSend", mask).disabled = false; input.disabled = false; input.focus();
      if(acc){ Ai.hist.push({ role: "user", content: q }, { role: "assistant", content: acc }); Ai.histSave(Ai.hist); }
      if(c.key && acc){ Ai.remember(q, acc).catch(()=>{}); }
    };
    try {
      if(!c.key){
        $("#aiMode", mask).textContent = "演示讲学 · 设密钥后接真首席";
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
      if(!acc) onDelta("（首席未作答——请检查模型名与密钥）");
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
    return "（演示模式）这是离线演示回答。接入真实 AI：点右上齿轮，选择服务商并粘贴密钥——推荐智谱 bigmodel.cn，glm-4-flash 模型免费。届时我会读取你的全部功课——42 课进度、错题簿、记忆卡——逐一分析后给你方案。";
  }
};
function msgsScroll(){ const m = document.getElementById("aiMask"); if(m){ const e = m.querySelector(".ai-msgs"); if(e) e.scrollTop = e.scrollHeight; } }
