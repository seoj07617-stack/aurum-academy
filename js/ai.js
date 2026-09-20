/* ============================================================
   ai.js — AI 助教：点击铜钱站标唤起，OpenAI 兼容接口流式输出
   密钥只存本机 localStorage（aurum_ai），不进学习备份
   ============================================================ */
"use strict";
const Ai = {
  PRESETS: [
    { name: "智谱 GLM（glm-4-flash 免费）", url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", model: "glm-4-flash", hint: "bigmodel.cn 注册即送密钥" },
    { name: "DeepSeek", url: "https://api.deepseek.com/chat/completions", model: "deepseek-chat", hint: "platform.deepseek.com" },
    { name: "硅基流动", url: "https://api.siliconflow.cn/v1/chat/completions", model: "Qwen/Qwen2.5-7B-Instruct", hint: "siliconflow.cn 有免费模型" },
    { name: "自定义（OpenAI 兼容）", url: "", model: "", hint: "填完整 /chat/completions 地址" }
  ],
  SYS: `你是「知行金融学院」的 AI 助教。学院课程体系：第〇阶段金融第一性原理、一宏观经济、二金融市场地图、三行业与公司估值、四技术分析、五基金投资、六交易模式、七纪律与风控、八资产配置、九知行合一。
回答规则：
1. 学生输入的多是金融术语或概念，按三层作答：一句专业定义（通俗准确）→ 一个生活化类比（像课程中的「俗讲」）→ 一句投资含义或常见误区提醒。
2. 中文，总长不超过 250 字，短句行文，不用 markdown 标题与列表符号。
3. 与课程观点保持一致：强调纪律、仓位、长期主义；不荐股、不给具体买卖建议、不预测涨跌。
4. 若问题超出金融学习范畴，礼貌引导回学习。`,
  cfg(){ try { return JSON.parse(localStorage.getItem("aurum_ai") || "{}"); } catch(e){ return {}; } },
  saveCfg(c){ localStorage.setItem("aurum_ai", JSON.stringify(c)); },
  ctrl: null,

  open(prefill){
    if(document.getElementById("aiMask")) return;
    const mask = document.createElement("div");
    mask.id = "aiMask"; mask.className = "ai-mask";
    mask.innerHTML = `
    <aside class="ai-drawer" role="dialog" aria-label="AI 助教">
      <header class="ai-head">
        <span class="ai-seal">AI</span>
        <div class="ai-title"><b>AI 助教</b><span id="aiMode">随问随讲 · 课程口径</span></div>
        <button class="ai-gear" id="aiGear" title="设置">${icon("refresh")}</button>
        <button class="ai-x" id="aiClose">${icon("x")}</button>
      </header>
      <div class="ai-msgs" id="aiMsgs">
        <div class="ai-bubble ai"><span class="who">助教</span><div class="ai-txt">我是学院 AI 助教。输入术语或问题，我按课程的三层法讲：定义 → 类比 → 提醒。<br>点下方快捷 chips 或直接输入。</div></div>
      </div>
      <div class="ai-chips" id="aiChips">
        <button data-q="解释：久期">解释：久期</button>
        <button data-q="PE 和 PB 的区别？">PE 和 PB 的区别</button>
        <button data-q="怎么理解安全边际？">安全边际</button>
        <button data-q="定投为什么有效？">定投为什么有效</button>
      </div>
      <div class="ai-inputrow">
        <textarea id="aiIn" rows="1" placeholder="输入术语或问题…"></textarea>
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
        <p class="tiny" style="margin-top:8px">没有密钥？推荐智谱 bigmodel.cn 注册即送，glm-4-flash 模型免费。密钥只保存在本机，不上传不备份。</p>
      </div>
    </aside>`;
    document.body.appendChild(mask);
    mask.addEventListener("click", e => { if(e.target === mask) Ai.close(); });
    $("#aiClose", mask).addEventListener("click", () => Ai.close());
    $("#aiGear", mask).addEventListener("click", () => {
      const s = $("#aiSet", mask); s.hidden = !s.hidden; Ai.fillSet();
    });
    $("#aiProv", mask).addEventListener("change", e => {
      const p = Ai.PRESETS[+e.target.value];
      if(p){ $("#aiUrl", mask).value = p.url; $("#aiModel", mask).value = p.model; }
    });
    $("#aiSave", mask).addEventListener("click", () => {
      Ai.saveCfg({ url: $("#aiUrl", mask).value.trim(), model: $("#aiModel", mask).value.trim(), key: $("#aiKey", mask).value.trim() });
      toast("AI 设置已保存（仅本机）", "gold");
      $("#aiSet", mask).hidden = true;
    });
    $$(".ai-chips button", mask).forEach(b => b.addEventListener("click", () => Ai.send(b.dataset.q)));
    $("#aiSend", mask).addEventListener("click", () => Ai.send());
    $("#aiIn", mask).addEventListener("keydown", e => {
      if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); Ai.send(); }
    });
    document.addEventListener("keydown", Ai.escClose);
    Ai.fillSet();
    if(prefill){ $("#aiIn", mask).value = prefill; setTimeout(() => Ai.send(), 150); }
    setTimeout(() => $("#aiIn", mask).focus(), 300);
  },
  fillSet(){
    const mask = $("#aiMask"); if(!mask) return;
    const c = Ai.cfg();
    if(c.url){
      const pi = Ai.PRESETS.findIndex(p => p.url === c.url);
      $("#aiProv", mask).value = String(pi >= 0 ? pi : -1);
      $("#aiUrl", mask).value = c.url; $("#aiModel", mask).value = c.model || "";
      $("#aiKey", mask).value = c.key || "";
      $("#aiHint", mask).textContent = "已保存配置" + (c.key ? "（密钥就绪）" : "（未设密钥 = 演示模式）");
    }
  },
  escClose(e){ if(e.key === "Escape") Ai.close(); },
  close(){
    if(Ai.ctrl) Ai.ctrl.abort();
    const m = document.getElementById("aiMask"); if(m) m.remove();
    document.removeEventListener("keydown", Ai.escClose);
  },

  async send(text){
    const mask = $("#aiMask"); if(!mask) return;
    const input = $("#aiIn", mask);
    const q = (text !== undefined ? text : input.value).trim();
    if(!q) return;
    if(text === undefined) input.value = "";
    const msgsEl = $("#aiMsgs", mask);
    const c = Ai.cfg();
    const demo = !c.key;
    /* 用户气泡 */
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-bubble me"><span class="who">我</span><div class="ai-txt">${esc(q)}</div></div>`);
    /* AI 气泡（流式） */
    msgsEl.insertAdjacentHTML("beforeend",
      `<div class="ai-bubble ai streaming" id="aiCur"><span class="who">助教</span><div class="ai-txt"><span id="aiStream"></span><span class="cur">▍</span></div></div>`);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    $("#aiSend", mask).disabled = true; input.disabled = true;
    const streamEl = $("#aiStream", mask);
    let acc = "";
    const onDelta = d => { acc += d; streamEl.textContent = acc; msgsEl.scrollTop = msgsEl.scrollHeight; };
    const finish = () => {
      const cur = $("#aiCur", mask); if(cur) cur.classList.remove("streaming");
      const cs = $("#aiStream", mask); if(cs && !acc) cs.textContent = "（无返回内容）";
      $("#aiSend", mask).disabled = false; input.disabled = false; input.focus();
    };
    try {
      if(demo){
        $("#aiMode", mask).textContent = "演示模式 · 设置密钥后连接真实 AI";
        const ans = Ai.demo(q);
        let i = 0;
        const timer = setInterval(() => {
          if(i >= ans.length){ clearInterval(timer); finish(); return; }
          onDelta(ans.slice(i, i + 2)); i += 2;
        }, 24);
      } else {
        Ai.ctrl = new AbortController();
        const history = Ai.hist.slice(-6);
        const messages = [{ role: "system", content: Ai.SYS }, ...history, { role: "user", content: q }];
        let got = false;
        await Ai.stream(messages, d => { if(!got){ got = true; } onDelta(d); },
          () => {});
        if(!acc) onDelta("（模型未返回内容，请检查模型名或密钥）");
        Ai.hist.push({ role: "user", content: q }, { role: "assistant", content: acc });
        finish();
      }
    } catch(err){
      if(err.name === "AbortError"){ finish(); return; }
      onDelta("");
      const h = ensureErr(err);
      function ensureErr(e){
        msgsEl.insertAdjacentHTML("beforeend",
          `<div class="ai-err">⚠ ${esc(e.message)}<br><span class="tiny">若为网络/跨域错误：换服务商（推荐智谱）或检查网络；密钥错误会提示 401。</span></div>`);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return e;
      }
      $("#aiSend", mask).disabled = false; input.disabled = false;
    }
  },

  hist: [],
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
    if(/久期/.test(q)) return "久期：债券利率敏感度的度量。俗讲：债券像一块晒化的糖——利率一变，长短债化得不一样快，久期就是『化得多快』的刻度。投资含义：久期越长，对利率越敏感；降息周期买长债赚得多，加息周期长债跌得狠。";
    if(/PE|PB|市盈|市净/.test(q)) return "PE 市盈率：为一块年利润付几倍价钱，适合盈利稳定的公司。PB 市净率：为一块净资产付几倍价钱，适合银行这类资产负债驱动的行业。俗讲：PE 是按『赚钱能力』出价，PB 是按『家底』出价。提醒：两把尺都只在同行业内比较才有意义，跨行业比是拿身高比体重。";
    if(/安全边际/.test(q)) return "安全边际：以显著低于内在价值的价格买入，为判断失误留缓冲。俗讲：搬家时给沙发和门框之间留的那几厘米——量得再准，也要留出转身的余地。投资含义：它是价值投资的第一纪律，买得便宜本身就是风控。";
    if(/定投/.test(q)) return "定投：固定金额定期买入，自动在低价时多买份额。俗讲：不管菜价高低每周买同样块钱的菜——贵时少买几斤，便宜时多囤几斤，平均成本自然下来。提醒：定投只解决『怎么买』，标的必须长期向上（宽基指数），且要设计止盈纪律。";
    return "（演示模式）这是离线演示回答。接入真实 AI：点右上角齿轮，选择服务商并粘贴密钥——推荐智谱 bigmodel.cn，glm-4-flash 模型免费。设置好后，我就能按学院课程的三层法回答任何金融术语：定义 → 俗讲类比 → 投资提醒。";
  }
};
