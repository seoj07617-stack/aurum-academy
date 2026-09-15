/* ============================================================
   srs.js — 记忆引擎：间隔重复（SM-2 改良）+ 掌握度循环
   卡片来源：课程要点卡 / 辨析卡 / 错题卡
   ============================================================ */
"use strict";
const SRS = {
  CARDS: Object.create(null),

  buildCards(){
    CURRICULUM.forEach(st => (st.lessons||[]).forEach(l => {
      (l.points||[]).forEach((p,i) => { this.CARDS[`${l.id}.p${i}`] =
        { id:`${l.id}.p${i}`, lesson:l.id, kind:"point", front:p.t, back:p.d }; });
      (l.traps||[]).forEach((t,i) => { this.CARDS[`${l.id}.t${i}`] =
        { id:`${l.id}.t${i}`, lesson:l.id, kind:"trap", front:`辨析：${t.w}`, back:t.c }; });
    }));
  },

  /* 卡片状态（惰性创建） */
  card(id){ return S.srs[id] || (S.srs[id] = { ease:2.5, ivl:0, due:dayKey(), reps:0, lapses:0 }); },

  /* 课程测验通过后，把该课要点卡纳入记忆循环（次日到期） */
  seedLesson(lessonId){
    const l = LESSON[lessonId];
    (l.points||[]).forEach((_,i)=>{ const id=`${lessonId}.p${i}`;
      if(!S.srs[id]){ const c=this.card(id); c.due = addDays(dayKey(),1); } });
    (l.traps||[]).forEach((_,i)=>{ const id=`${lessonId}.t${i}`;
      if(!S.srs[id]){ const c=this.card(id); c.due = addDays(dayKey(),2); } });
    save();
  },

  /* 错题卡：答错的题目即时生成（明天到期，优先复习） */
  addWrongCard(lessonId, qi){
    const l = LESSON[lessonId]; if(!l) return;
    const q = l.quiz[qi]; if(!q) return;
    const id = `${lessonId}.q${qi}`;
    this.CARDS[id] = { id, lesson:lessonId, kind:"quiz",
      front:q.q, back:`正确答案：${q.opts[q.a]}。${q.why}` };
    const c = this.card(id); c.lapses = (c.lapses||0)+1; c.due = addDays(dayKey(),1);
    save();
  },
  removeWrongCard(lessonId, qi){
    const id = `${lessonId}.q${qi}`;
    if(S.srs[id] && S.srs[id].reps > 0) delete S.srs[id]; else if(S.srs[id]) S.srs[id].due = addDays(dayKey(),7);
    save();
  },

  /* 评分调度：0 忘了 / 3 模糊 / 5 记得 */
  grade(id, g){
    const c = this.card(id);
    if(g === 0){ c.lapses++; c.ease = Math.max(1.3, c.ease - .2); c.ivl = 1; }
    else {
      if(g === 5) c.ease = Math.min(3.2, c.ease + .08);
      c.ivl = c.ivl === 0 ? (g===5 ? 2 : 1) : Math.max(1, Math.round(c.ivl * c.ease * (g===5 ? 1.25 : .9)));
      c.ivl = Math.min(c.ivl, 240);
    }
    c.reps++;
    c.due = addDays(dayKey(), c.ivl);
    /* 掌握度联动：让「学过」随复习循环生长或回落 */
    const card = this.CARDS[id];
    if(card && card.lesson && card.kind !== "quiz"){
      const st = LState(card.lesson);
      st.mastery = Math.max(4, Math.min(100, st.mastery + (g===0 ? -12 : g===3 ? 4 : 9)));
      st.stab = Math.max(1, st.stab * (g===0 ? .85 : 1.06));
      st.last = dayKey();
    }
    save();
  },

  dueList(){ const t = dayKey();
    return Object.keys(S.srs).filter(id => S.srs[id].due <= t && this.CARDS[id]); },

  dueCount(){ return this.dueList().length; },

  /* 未来 7 天到期量（用于记忆压力预报） */
  forecast(){
    const out = []; const t = dayKey();
    for(let i=0;i<7;i++){ const d = addDays(t,i);
      out.push(Object.keys(S.srs).filter(id => S.srs[id].due === d && this.CARDS[id]).length); }
    return out;
  },

  /* 记忆健康度：到期积压越少越健康 */
  health(){
    const total = Object.keys(S.srs).filter(id=>this.CARDS[id]).length;
    if(!total) return 0;
    const due = this.dueCount();
    return Math.max(0, Math.min(100, Math.round(100 * (1 - due/Math.max(6,total*0.5)))));
  }
};
