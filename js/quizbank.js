/* ============================================================
   quizbank.js — 举一反三题库引擎
   基于每课 points（要点）与 traps（误区）程序化生成变式题，
   三个角度：
     T1 概念辨析：「X」指的是？（定义 ↔ 干扰定义）
     T2 定义反推：这句话说的是哪个概念？（反向再认）
     T3 误区纠正：对误区说法，选出正确判断（逆向学习）
   设计约束：
     · 固定种子（课程 id 哈希）→ 每课题目与选项顺序确定，
       错题本以 qi = 100+序号 引用本池，跨会话稳定。
     · 干扰项取自其他课程的真实概念/误区 → 跨课对比，防背选项。
     · qi < 100 保留为课程原题；本池题号从 100 起。
   全局：bankOf(lid) 取该课生成题；quizOf(lid, qi) 统一取题。
   ============================================================ */
"use strict";
const bankOf = (function(){
  let built = null;
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const hash = s => { let x = 0; for(let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return x >>> 0; };
  function pick(arr, n, rnd){
    const a = arr.slice();
    for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.slice(0, n);
  }
  /* 把正确项放到确定位置（0-3），返回 {opts, a} */
  function place(correct, distractors, pos){
    const opts = distractors.slice();
    const at = Math.min(pos, opts.length);
    opts.splice(at, 0, correct);
    return { opts, a: at };
  }
  function build(){
    const defPool = [], trapPool = [];
    CURRICULUM.forEach(st => st.lessons.forEach(l => {
      (l.points || []).forEach(p => { if(p.t && p.d) defPool.push({ t:p.t, d:p.d, lid:l.id }); });
      (l.traps || []).forEach(tr => { if(tr.w && tr.c) trapPool.push({ w:tr.w, c:tr.c, lid:l.id }); });
    }));
    const out = {};
    CURRICULUM.forEach(st => st.lessons.forEach(l => {
      const rnd = mulberry32(hash(l.id));
      const qs = [];
      const oDef = defPool.filter(p => p.lid !== l.id);
      const oTrap = trapPool.filter(p => p.lid !== l.id);
      const pts = l.points || [], trs = l.traps || [];
      pts.forEach((p, pi) => {
        /* T1 概念 → 定义 */
        const d = pick(oDef, 3, rnd);
        if(d.length === 3){
          const { opts, a } = place(cut(p.d, 52), d.map(o => cut(o.d, 52)), (pi * 7 + 3) % 4);
          qs.push({ q: "「" + p.t + "」指的是？", opts, a, why: p.t + "：" + p.d, bank: true });
        }
        /* T2 定义 → 概念（反向再认，仅对部分要点生成避免重复感） */
        if(pi % 2 === 0){
          const t = pick(oDef, 3, rnd);
          if(t.length === 3){
            const { opts, a } = place(p.t, t.map(o => o.t), (pi * 5 + 1) % 4);
            qs.push({ q: "「" + cut(p.d, 46) + "」这句话，说的是哪个概念？", opts, a, why: "这段话是「" + p.t + "」的定义。" + p.d, bank: true });
          }
        }
      });
      trs.forEach((tr, ti) => {
        /* T3 误区 → 正确判断 */
        const c = pick(oTrap, 3, rnd);
        if(c.length === 3){
          const { opts, a } = place(cut(tr.c, 58), c.map(o => cut(o.c, 58)), (ti * 3 + 2) % 4);
          qs.push({ q: "有人说：「" + cut(tr.w, 40) + "」。对此正确的判断是？", opts, a, why: tr.c, bank: true });
        }
      });
      out[l.id] = qs;
    }));
    return out;
  }
  return function(lid){
    if(!built) built = build();
    return built[lid] || [];
  };
})();
/* 统一取题：qi < 100 为课程原题，≥100 为生成题 */
function quizOf(lid, qi){
  const l = LESSON[lid];
  if(!l) return null;
  if(qi >= 100) return bankOf(lid)[qi - 100] || null;
  return l.quiz[qi] || null;
}
