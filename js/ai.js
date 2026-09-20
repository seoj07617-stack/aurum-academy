/* ============================================================
   ai.js — 山长：知行金融学院掌院先生（AI 讲学）
   点击铜钱站标唤起；黑金抽屉；流式输出；持久记忆；全站档案注入
   密钥只存本机 localStorage（aurum_ai），聊天记忆存 aurum_ai_hist
   ============================================================ */
"use strict";
const Ai = {
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

  /* ---------- 学生档案：读取全站进度与内容（注入每次对话） ---------- */
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
    /* 课程概念索引：让山长知道学院教过什么 */
    const concepts = [];
    CURRICULUM.forEach(st => st.lessons.forEach(l => (l.points || []).forEach(p => concepts.push(p.t))));
    L.push("【学院讲授过的概念】" + concepts.join("、"));
    return L.join("\n");
  },

  SYS(){
    return `你是「知行金融学院」的山长——古代书院掌院先生的身份，执掌这座金融学堂。学生称你「山长」或「先生」。
你说话：半文半白、从容简练、偶有一句点睛的古语，但不掉书袋；对学生因材施教，先看功课再开方子。
学院的课程体系（第〇至九阶段）：金融第一性原理→宏观经济→金融市场地图→行业与公司透视→技术分析→基金投资→交易模式图鉴→纪律与风控工程→组合与资产配置→知行合一（十条铁律、俗讲类比）。
每课皆有三层：专业定义、俗讲类比、投资提醒。学生档案与学院概念索引附于下方，请务必据此个性化回答。

《山长教规》：
1. 谈术语：先一句专业定义，再一个生活类比，再一句投资提醒。
2. 谈方案：基于学生档案给具体到「哪一课、哪几天、每天多少分钟」的计划；先治薄弱，再图新进。
3. 谈错题：点出错因归类（概念不清/纪律违规/粗心），开对应药方。
4. 永不荐股、不预测涨跌、不谈具体标的买卖；强调纪律、仓位、长期主义。
5. 中文作答；讲术语不超 250 字；给方案用清单，清单要有优先级。

` + Ai.profile();
  },

  open(prefill){
    if(document.getElementById("aiMask")) return;
    Ai.hist = Ai.histLoad();
    const mask = document.createElement("div");
    mask.id = "aiMask"; mask.className = "ai-mask";
    mask.innerHTML = `
    <aside class="ai-drawer" role="dialog" aria-label="山长讲学">
      <header class="ai-head">
        <span class="ai-seal">山</span>
        <div class="ai-title"><b>山长</b><span id="aiMode">掌院讲学 · 因材施教</span></div>
        <button class="ai-gear" id="aiNew" title="另起一讲">${icon("edit")}</button>
        <button class="ai-gear" id="aiGear" title="设置">${icon("refresh")}</button>
        <button class="ai-x" id="aiClose">${icon("x")}</button>
      </header>
      <div class="ai-msgs" id="aiMsgs"></div>
      <div class="ai-chips" id="aiChips">
        <button data-q="请先生看看我的功课，哪里薄弱？该怎么补？">看功课 · 开方子</button>
        <button data-q="请先生赐我一份本周学习方案。">赐本周方案</button>
        <button data-q="解释：久期">讲：久期</button>
        <button data-q="我总拿不住盈利的单子，如何修？">拿不住盈利怎么办</button>
      </div>
      <div class="ai-inputrow">
        <textarea id="aiIn" rows="1" placeholder="学生，有何困惑？"></textarea>
        <button class="btn btn-gold btn-sm" id="aiSend">${icon("chevR")}</button>
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
      </div>
    </aside>`;
    document.body.appendChild(mask);
    mask.addEventListener("click", e => { if(e.target === mask) Ai.close(); });
    $("#aiClose", mask).addEventListener("click", () => Ai.close());
    $("#aiNew", mask).addEventListener("click", () => {
      Ai.hist = []; Ai.histSave(Ai.hist);
      $("#aiMsgs", mask).innerHTML = "";
      Ai.welcome();
      toast("已另起一讲", "gold");
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
    $$(".ai-chips button", mask).forEach(b => b.addEventListener("click", () => Ai.send(b.dataset.q)));
    $("#aiSend", mask).addEventListener("click", () => Ai.send());
    $("#aiIn", mask).addEventListener("keydown", e => {
      if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); Ai.send(); }
    });
    document.addEventListener("keydown", Ai.escClose);
    Ai.fillSet();
    /* 恢复往讲 */
    if(Ai.hist.length){
      Ai.hist.slice(-10).forEach(m => Ai.paint(m.role === "user" ? "me" : "ai", m.content, m.role === "user" ? "学生" : "山长"));
    } else {
      Ai.welcome();
    }
    if(prefill){ $("#aiIn", mask).value = prefill; setTimeout(() => Ai.send(), 150); }
    setTimeout(() => $("#aiIn", mask).focus(), 300);
  },
  welcome(){
    Ai.paint("ai", "学生，坐。\n院中四十二课、百廿记忆卡，皆为尔所备。老夫方才翻过你的功课——进度与错处俱在眼中。\n有惑即问；要方案，老夫按你的根基开方子。");
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
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-bubble ${who}"><span class="who">${who === "me" ? "学生" : "山长"}</span><div class="ai-txt">${esc(txt).replace(/\n/g, "<br>")}</div></div>`);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  },

  async send(text){
    const mask = $("#aiMask"); if(!mask) return;
    const input = $("#aiIn", mask);
    const q = (text !== undefined ? text : input.value).trim();
    if(!q) return;
    if(text === undefined) input.value = "";
    Ai.paint("me", q);
    msgsScroll();
    const msgsEl = $("#aiMsgs", mask);
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-bubble ai streaming" id="aiCur"><span class="who">山长</span><div class="ai-txt"><span id="aiStream"></span><span class="cur">▍</span></div></div>`);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    $("#aiSend", mask).disabled = true; input.disabled = true;
    const streamEl = $("#aiStream", mask);
    let acc = "";
    const onDelta = d => { acc += d; streamEl.textContent = acc; msgsEl.scrollTop = msgsEl.scrollHeight; };
    const finish = () => {
      const cur = $("#aiCur", mask); if(cur) cur.classList.remove("streaming");
      $("#aiSend", mask).disabled = false; input.disabled = false; input.focus();
      if(acc){ Ai.hist.push({ role: "user", content: q }, { role: "assistant", content: acc }); Ai.histSave(Ai.hist); }
    };
    try {
      const c = Ai.cfg();
      if(!c.key){
        $("#aiMode", mask).textContent = "演示讲学 · 设密钥后接真山长";
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
      if(!acc) onDelta("（先生今日无言——请检查模型名与密钥）");
      finish();
    } catch(err){
      if(err.name === "AbortError"){ finish(); return; }
      onDelta("");
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
    if(/方案|计划|周/.test(q)) return "方案如下，写下便是——\n一、先补薄弱：" + weak + "，重学其错课，每日一课，课毕即测；\n二、每日一卷五题不辍，错者入错题本，三日一回头；\n三、记忆卡到期即清，不清不睡；\n四、周末半日，复盘一周错因，归类三等：概念不明者重学，纪律违规者罚俸（减一次实盘），粗心者抄铁律一遍。\n七日后再来见老夫，看进度说话。";
    if(/薄弱|功课|错/.test(q)) return "老夫看了你的卷面：薄弱处在「" + weak + "」。错题不是耻辱，是路标——每一道都指着你还未真懂的概念。\n方子：先回课，再看俗讲，重做课后测验至八成；错题本三日后重练，全对方可销号。切记：懂了才做，做了才算懂。";
    if(/久期/.test(q)) return "久期者，债券对利率之敏感度也。俗讲：债券如糖，利率是日头——日头越烈化得越快，久期便是量那『化速』的尺。投资含义：久期越长越怕加息，久期越短越扛跌；降息周期持长债者赢，加息周期持长债者伤。";
    if(/拿不住|盈利/.test(q)) return "拿不住盈利，病根有二：一曰无纪律——没写移动止盈的规矩，全凭心跳；二曰眼浅——盯盘太勤，被波幅牵着走。\n方子：下单前先写好移动止盈线，浮盈回撤八个百分点即走；盘中不看盘，收盘后看一次。规矩立了，心就定了。";
    return "（演示讲学）此乃离线演示。真正的山长需一枚密钥：点右上齿轮，选智谱 bigmodel.cn，glm-4-flash 免费即用。届时老夫会翻遍你的功课——四十二课、错题簿、记忆卡，一一过目，再给你开方子。";
  }
};
function msgsScroll(){ const m = document.getElementById("aiMask"); if(m){ const e = m.querySelector(".ai-msgs"); if(e) e.scrollTop = e.scrollHeight; } }
