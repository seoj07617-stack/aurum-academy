/* ============================================================
   terms.js — 专业术语自动解读
   课程正文里出现的术语自动加虚线标注，点按/悬停弹出白话解读。
   解读来源：手写核心术语（TERMS）+ 全站课程要点卡（points）兜底。
   规则：同一术语每页只标注首次出现；长词优先，防止子串误标。
   ============================================================ */
"use strict";

/* 手写核心术语：缩写与易混词的精准白话解读 */
const TERMS = {
  "GDP":"国内生产总值：一个国家一段时间内生产的所有商品与服务的总价值，经济的总成绩单。",
  "PMI":"采购经理指数：问几百个工厂老板「这个月生意比上个月好吗」，50 以上=扩张，以下=收缩。经济最快的前瞻温度计。",
  "CPI":"消费者物价指数：老百姓日常购物篮子的价格涨幅，通胀的官方刻度。",
  "PPI":"生产者物价指数：工厂出厂价的变化。CPI 是零售价，PPI 是批发价——上游感冒，下游过一会儿才打喷嚏。",
  "LPR":"贷款市场报价利率：银行贷款利率的定价基准。你的房贷利率 = LPR + 若干基点，LPR 降=月供降。",
  "MLF":"中期借贷便利：央行借钱给商业银行的中期渠道，曾是政策利率的风向标（2024 年起角色让位于 7 天逆回购）。",
  "OMO":"公开市场操作：央行在市场上买卖债券/借出资金来调节钱多钱少的日常手段。",
  "逆回购":"央行向银行短期借出资金（收债券做抵押）——投放流动性的动作。逆回购利率就是重要的政策利率。",
  "DR007":"银行间隔夜资金的价格之一：金融机构之间借 7 天钱的利率，最能反映市场「手头紧不紧」。",
  "SHIBOR":"上海银行间同业拆放利率：银行之间互相借钱的报价基准，中国版的「资金成本温度计」。",
  "M2":"广义货币供应量：社会上所有的钱（现金+存款等）总量。M2 增速快=水放得多。",
  "社融":"社会融资规模：实体经济从整个金融体系拿到了多少钱（贷款+债券+股票等）。看信用松紧的第一指标。",
  "IPO":"首次公开募股：公司第一次把股票卖给公众投资者、在交易所挂牌——从一级市场出厂的瞬间。",
  "T+1":"今天买的证券明天才能卖。A 股股票执行 T+1——买入瞬间你就交出了当天的退出权。",
  "集合竞价":"开盘前 9:15-9:25 大家集中报价、撮合出一个开盘价；其中 9:20-9:25 不可撤单。",
  "PE":"市盈率：股价 ÷ 每股盈利，约等于「按现在的盈利，几年回本」。盈利稳定的公司用它最顺手。",
  "PB":"市净率：股价 ÷ 每股净资产。利润波动大的行业（银行、钢铁）用净资产当锚更稳，破净=价格低于账面家底。",
  "PS":"市销率：股价 ÷ 每股营收。还没盈利的成长公司（早期科技股）用它，先看生意规模再看利润。",
  "PEG":"市盈率相对盈利增长比率：PE ÷ 盈利增速。约等于 1 视为合理——把「贵不贵」和「长得快不快」放在一起算。",
  "ROE":"净资产收益率：净利润 ÷ 净资产，衡量股东的钱一年赚回多少。巴菲特最看重的一个数字。",
  "ROA":"总资产收益率：净利润 ÷ 总资产，衡量全部资产（不只股东的）的赚钱效率。",
  "ATR":"平均真实波幅：一段时间内价格每天平均晃多大幅度。海龟法则用它定止损宽度和仓位大小。",
  "MACD":"指数平滑异同均线：用快慢两条线的距离衡量趋势动能，红绿柱缩放=油门深浅。",
  "RSI":"相对强弱指数：0-100 的情绪温度计，70 以上偏热、30 以下偏冷——但趋势市里会长期钝化。",
  "布林带":"以均线为中轨、上下各画一条波动率通道：带口收窄=行情憋大招，张开=波动释放。",
  "均线":"MA，过去 N 天收盘价的平均连线，近似市场平均持仓成本，是趋势的「可视化骨架」。",
  "ETF":"交易所交易基金：像股票一样盘中买卖的基金，透明、便宜、风格不漂移——配置的首选工具。",
  "QDII":"合格境内机构投资者：用人民币投资海外市场的合规通道（QDII 基金可投美股、全球债券等）。",
  "FOF":"基金中的基金：一只基金里面装的是其他基金，多一层分散也多一层费用。",
  "REITs":"不动产投资信托：把写字楼、高速路等不动产切成小份额上市，租金按份分红——几百块当包租公。",
  "久期":"债券对利率的敏感度：久期 8 的债，利率升 1% 价格约跌 8%。也是「平均多久收回本息」的时间概念。",
  "收益率曲线":"同一国家不同期限国债利率连成的线：正常=远高近（增长预期）；倒挂=短高长低（衰退警报）。",
  "信用利差":"低信用债比国债多付的利息：利差走阔=市场在担心违约，风险偏好在收缩。",
  "保证金":"期货/融资交易中的押金：10% 保证金 = 10 倍杠杆，盈亏都被同步放大 10 倍。",
  "强平":"强制平仓：亏损逼近保证金底线时，券商不等你说「再等等」，直接替你卖出锁死亏损。",
  "权利金":"买期权付的「保费」：最大亏损锁定为它，换来的是上不封顶的潜在收益——但多数期权到期归零。",
  "行权价":"期权约定的买卖价格：只有标的价格越过它，期权才开始有实质价值。",
  "商誉":"并购时多付的溢价。业绩不达标就计提减值直接砸利润——占净资产超 30% 等于头顶悬雷。",
  "应收账款":"别人欠公司的货款：利润表好看但应收暴增，说明赚的是「白条」不是钱。",
  "自由现金流":"经营现金流 − 维持生意的必要开支：每年能从公司拿走而不伤元气的真钱。",
  "资产负债率":"总负债 ÷ 总资产：家底里有多少是借来的。80% 的房企与 30% 的白酒厂，模式天差地别。",
  "质押":"大股东拿股票做抵押借钱：股价跌到平仓线会被强制卖出，引发「下跌→平仓→更跌」的螺旋。",
  "流动性":"市场上「钱的充裕程度」：水位高时资产普涨，退潮时才知道谁在裸泳。",
  "宽货币":"央行把水放进银行体系（利率降、投放多）——金融市场先解渴。",
  "宽信用":"企业与居民真的开始借钱花（社融回升）——实体经济喝到水。宽货币不一定带来宽信用。",
  "逆周期":"经济冷时政策加热、经济热时政策降温——对抗周期的政策取向。",
  "凯利公式":"f*=(bp−q)/b：按胜率与赔率算出的理论最优仓位。实务取一半（半凯利）以对冲参数估计误差。",
  "夏普比率":"每承受一份波动换来多少超额收益：收益÷颠簸。比较基金好坏时比单纯收益率诚实。",
  "最大回撤":"从净值最高点到其后最低点的最大跌幅。它衡量的是「你最难受的时刻」有多难受。",
  "盈亏比":"平均每笔盈利与每笔亏损的比值。2:1 的盈亏比下，胜率只需 34% 就能长期正期望。",
  "胜率":"盈利交易占全部交易的比例。高胜率≠赚钱——盈亏比才是另一半。",
  "Alpha":"超额收益：超出市场平均的部分，是主动能力的成绩单。",
  "Beta":"市场收益：随大盘涨跌的水位部分，用指数基金低成本就能拿到。",
  "相关性":"两个资产同涨同跌的程度（+1 到 −1）：低相关才有真分散，高相关的「十只股」是一只股。",
  "风险平价":"按「风险贡献相等」而非资金相等来分配资产——每种天气里都有压舱石的配置思想。",
  "再平衡":"定期把偏离的配置比例拉回目标：机械地卖涨买跌，赚波动的钱。",
  "定投":"固定日期固定金额买入：跌时买更多份额、自动摊低成本——用纪律替代择时。",
  "微笑曲线":"先跌后涨的走势里，定投成本停在腰部——回到起点即盈利的 V 形结构。",
  "安全边际":"只在估出的价值打七折以下才买：为「自己会算错」预留的缓冲垫。",
  "护城河":"让对手抢不走客户的持久优势：品牌、网络效应、成本、转换成本。宽窄决定利润的寿命。",
  "能力圈":"知道自己真正看得懂什么、更知道看不懂什么——看不懂的不投，比看懂多少更重要。",
  "价值陷阱":"便宜但不值得买的股票：低估值是行业衰落的果，不是捡漏的因。",
  "均值回归":"价格/估值偏离平均水平后倾向于回来：涨多必调、跌多必涨——但「何时」无法预测。",
  "黑天鹅":"极难预测、一旦发生冲击巨大的事件（2020 年疫情）。用仓位管理应对，而不是预测。",
  "灰犀牛":"看得见却总被忽视的大风险（高杠杆、泡沫估值）：不是黑天鹅，是不肯转头。",
  "处置效应":"赚了急着卖、亏了死扛不卖——散户最普遍的行为偏差，翻交易记录即可自诊。",
  "损失厌恶":"亏损的痛苦约是同额盈利快乐的两倍：它让人不敢止损、又拿不住盈利。",
  "锚定效应":"被不相关的数字绑架决策（最典型：成本价）。解法：问「今天空仓我还会买吗」。",
  "确认偏误":"只看得见支持自己观点的证据：重仓后满屏利好——强制写三条反方理由是对策。",
  "FOMO":"错失恐惧（Fear of Missing Out）：看别人赚钱忍不住追高——追在山顶的主要动力。",
  "复利":"利息再生利息的滚雪球：前期平缓后期陡峭，最好的朋友是时间，最大的敌人是中断。",
  "72法则":"72 ÷ 年化收益率 ≈ 资金翻倍年数：7% 约 10 年翻倍的心算神器。",
  "无风险利率":"借钱给国家（国债）的收益率：一切资产定价的基准分，也是「保本」承诺的照妖镜。",
  "风险溢价":"承担风险多赚的那部分收益 = 期望收益 − 无风险利率：市场付给你的「风险工资」。",
  "折现":"把未来的钱换算成今天的价值：明年的 105 元按 5% 折现 = 今天的 100 元。一切定价的底层运算。",
  "美林时钟":"按「增长×通胀」两轴把经济分四象限，每象限有一类资产占优：复苏股票、过热商品、滞胀现金、衰退债券。",
  "宽基指数":"覆盖全市场/大范围的指数（沪深300、中证500）：不含行业偏押，是配置的核心料。",
  "净值":"基金每份的价格：每天收盘后按持仓市值计算。净值涨跌=你持仓市值涨跌。",
  "申购/赎回":"买入/卖出场外基金的动作。注意赎回费：持有不满 7 天有 1.5% 的惩罚性费率。"
};

/* 术语索引：手写 TERMS 优先，课程要点卡（points）兜底；长词优先匹配 */
let _tidx = null;
function termIndex(){
  if(_tidx) return _tidx;
  const map = {};
  try{
    CURRICULUM.forEach(st => st.lessons.forEach(l => (l.points||[]).forEach(p => {
      if(p.t && p.d && p.t.length >= 2 && p.t.length <= 12 && !map[p.t]){
        map[p.t] = p.d.length > 76 ? p.d.slice(0, 75) + "…" : p.d;
      }
    })));
  }catch(e){}
  Object.keys(TERMS).forEach(k => { map[k] = TERMS[k]; });
  _tidx = Object.keys(map).sort((a,b) => b.length - a.length).map(t => ({ term:t, tip:map[t] }));
  return _tidx;
}

/* 在课程正文的文本节点里标注术语（每术语全页仅首次；不碰已有标签） */
function annotateTerms(root){
  const idx = termIndex();
  const hits = {};
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n){
      if(!n.nodeValue || n.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if(!p || p.closest(".term,.term-pop,script,style,.no,.stag,.ctag,.ptag,.ltag,.cap")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const txt = node.nodeValue;
    const taken = new Array(txt.length).fill(false);
    const ranges = [];
    idx.forEach(it => {
      if(hits[it.term]) return;
      let start = 0;
      while((start = txt.indexOf(it.term, start)) >= 0){
        const end = start + it.term.length;
        let free = true;
        for(let k = start; k < end; k++){ if(taken[k]){ free = false; break; } }
        if(free){
          for(let k = start; k < end; k++) taken[k] = true;
          ranges.push({ start, end, term: it.term, tip: it.tip });
          hits[it.term] = true;
          break;
        }
        start++;
      }
    });
    if(!ranges.length) return;
    ranges.sort((a,b) => a.start - b.start);
    const frag = document.createDocumentFragment();
    let pos = 0;
    ranges.forEach(r => {
      if(r.start > pos) frag.appendChild(document.createTextNode(txt.slice(pos, r.start)));
      const sp = document.createElement("span");
      sp.className = "term"; sp.textContent = r.term; sp.dataset.tip = r.tip;
      frag.appendChild(sp);
      pos = r.end;
    });
    if(pos < txt.length) frag.appendChild(document.createTextNode(txt.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  });
}

/* 术语气泡：点按/悬停显示，点别处或 ESC 关闭 */
let _pop = null;
function closeTermPop(){ if(_pop){ _pop.remove(); _pop = null; } }
function showTermPop(span){
  closeTermPop();
  const r = span.getBoundingClientRect();
  _pop = document.createElement("div");
  _pop.className = "term-pop";
  _pop.innerHTML = `<b>${span.textContent}</b><p>${span.dataset.tip}</p>
    <a class="tp-link" href="#/glossary/${encodeURIComponent(span.textContent)}">词汇表展开 →</a>`;
  document.body.appendChild(_pop);
  const pw = Math.min(320, window.innerWidth - 24);
  let x = r.left + r.width/2 - pw/2;
  x = Math.max(12, Math.min(x, window.innerWidth - pw - 12));
  _pop.style.left = x + "px";
  _pop.style.width = pw + "px";
  const ph = _pop.offsetHeight;
  let y = r.bottom + 8;
  if(y + ph > window.innerHeight - 10) y = Math.max(10, r.top - ph - 8);
  _pop.style.top = y + "px";
}
function bindTermEvents(container){
  container.addEventListener("click", e => {
    const t = e.target.closest(".term");
    if(t){ e.stopPropagation(); showTermPop(t); return; }
    closeTermPop();
  });
  container.addEventListener("mouseover", e => {
    const t = e.target.closest(".term");
    if(t && window.matchMedia("(hover:hover)").matches) showTermPop(t);
  });
  document.addEventListener("keydown", termEsc);
}
function termEsc(e){ if(e.key === "Escape") closeTermPop(); }
