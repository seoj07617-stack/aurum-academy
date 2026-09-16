/* ============================================================
   core.js — 全局状态 / 课程索引 / 经验与打卡 / 路由
   ============================================================ */
"use strict";
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const dayKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const addDays = (k, n) => dayKey(new Date(new Date(k+"T00:00:00").getTime() + n*864e5));
const daysBetween = (a,b) => Math.round((new Date(b+"T00:00:00") - new Date(a+"T00:00:00"))/864e5);
function mulberry32(seed){ return function(){ let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- 持久化 ---------- */
const Store = {
  KEY: "aurum_academy_v1",
  def(){ return {
    v:1, day:null, xpToday:0, xp:0,
    lessons:{},            // id -> {done,best,att,mastery,last,stab}
    exams:{},              // stageId -> {best,pass,att}
    srs:{},                // cardId -> {ease,ivl,due,reps,lapses}
    wrong:{},              // `${lesson}:${qi}` -> {lesson,qi,item,miss,add}
    journal:[], plans:[], checklist:{date:null,items:{}},
    streak:{n:0,best:0,last:null}, days:{},   // days: dateKey -> xp
    grad:false, free:false
  };},
  load(){ try{ const raw = localStorage.getItem(this.KEY);
    if(raw){ return Object.assign(this.def(), JSON.parse(raw)); } }catch(e){}
    return this.def(); },
  save(){ try{ localStorage.setItem(this.KEY, JSON.stringify(S)); }catch(e){} }
};
let S = Store.load();
const save = () => Store.save();

/* ---------- 课程索引 ---------- */
const STAGE = Object.create(null);
const LESSON = Object.create(null);
const ORDER = [];
(CURRICULUM||[]).forEach(st => { st.num2 = (st.lessons||[]).length; STAGE[st.id]=st;
  (st.lessons||[]).forEach((l,i) => { l.stage = st.id; l.order = i; LESSON[l.id]=l; ORDER.push(l.id); }); });

function LState(id){ return S.lessons[id] || (S.lessons[id] = {done:false,best:0,att:0,mastery:0,last:0,stab:1}); }
function stageUnlocked(sid){
  if(S.free || sid==="s0") return true;
  const i = CURRICULUM.findIndex(s => s.id===sid);
  if(i <= 0) return true;
  const prev = CURRICULUM[i-1];
  const allDone = prev.lessons.every(l => LState(l.id).done);
  const ex = S.exams[prev.id];
  return Boolean(allDone && ex && ex.pass);
}
function stageInfo(sid){
  const st = STAGE[sid];
  const ls = st.lessons.map(l => LState(l.id));
  const done = ls.filter(x => x.done).length;
  const mastery = Math.round(ls.reduce((a,x)=>a+(x.done?x.mastery:0),0) / Math.max(1,st.num2));
  return { done, total: st.num2, mastery, pct: Math.round(done/st.num2*100) };
}
function nextLessonId(){ return ORDER.find(id => !LState(id).done && stageUnlocked(LESSON[id].stage)) || null; }
function totalPct(){ const d = ORDER.filter(id=>LState(id).done).length; return Math.round(d/ORDER.length*100); }

/* ---------- 经验 / 等级 / 打卡 ---------- */
const LEVELS = [[0,"见习研究员"],[200,"初级分析师"],[500,"行业分析师"],[1000,"投资经理"],
                [2000,"基金经理"],[4000,"投资总监"],[8000,"首席投资官"]];
function levelInfo(){
  let i=0; LEVELS.forEach((l,j)=>{ if(S.xp>=l[0]) i=j; });
  const cur=LEVELS[i], nxt=LEVELS[i+1];
  return { name:cur[1], idx:i, nextAt:nxt?nxt[0]:null,
    pct: nxt ? Math.min(1,(S.xp-cur[0])/(nxt[0]-cur[0])) : 1 };
}
function checkin(){
  const t = dayKey();
  if(S.streak.last === t) return;
  const y = addDays(t,-1);
  S.streak.n = (S.streak.last === y) ? S.streak.n+1 : 1;
  S.streak.best = Math.max(S.streak.best, S.streak.n);
  S.streak.last = t;
}
function award(n, reason){
  const first = S.xpToday < 30;
  S.xp += n; S.xpToday += n;
  const t = dayKey(); S.days[t] = (S.days[t]||0) + n;
  if(S.xpToday >= 30) checkin();
  save();
  if(typeof UI!=="undefined" && UI.toast) UI.toast(`+${n} 经验 · ${reason}`, "gold");
  App.navChips();
}

/* ---------- 每日初始化 + 记忆衰减 ---------- */
function decayAll(){
  const t = dayKey();
  Object.keys(S.lessons).forEach(id => {
    const st = S.lessons[id];
    if(st.mastery > 0 && st.last){
      const dd = Math.max(0, daysBetween(fmtDay(st.last), t));
      if(dd > 0){ const hl = 12 + st.stab*16; st.mastery = Math.max(5, st.mastery*Math.pow(.5, dd/hl)); }
    }
  });
}
function fmtDay(x){ return typeof x==="string" ? x : dayKey(new Date(x)); }
function ensureDay(){
  const t = dayKey();
  if(S.day !== t){ S.day = t; S.xpToday = 0; decayAll(); save(); }
  if(!S.checklist.date || S.checklist.date !== t){ S.checklist = {date:t, items:{}}; }
}

/* ---------- 路由 ---------- */
const VIEWS = {};
/* ---------- 主题（夜读模式） ---------- */
function applyTheme(){ document.documentElement.dataset.theme = (S.theme === "dark") ? "dark" : ""; }
function cycleTheme(){
  S.theme = (S.theme === "dark") ? "light" : "dark";
  save(); applyTheme(); App.navChips();
  UI.toast(S.theme === "dark" ? "夜读模式 · 黑金" : "日间模式 · 淡金", "");
}

const App = {
  boot(){
    ensureDay(); SRS.buildCards(); applyTheme();
    window.addEventListener("hashchange", () => App.route());
    App.route();
    App.navChips();
  },
  route(){
    const h = (location.hash || "#/home").replace(/^#\/?/, "");
    const [name, arg, arg2] = h.split("/");
    const view = VIEWS[name] || VIEWS.home;
    /* 标签页标题随页面同步 */
    const T = { home:"首页", map:"知识地图", review:"记忆复习", wrong:"错题本", dojo:"纪律工坊", stats:"数据统计", glossary:"词汇表", stage:"阶段", lesson:"课程" };
    let t = T[name] || "知行金融学院";
    if(name==="stage" && STAGE[arg]) t = STAGE[arg].title;
    if(name==="lesson" && LESSON[arg]) t = LESSON[arg].title;
    if(name==="quiz") t = "测验中";
    document.title = t + " · 知行金融学院";
    const app = $("#app");
    app.innerHTML = "";
    const el = view(arg, arg2) || document.createElement("div");
    el.classList.add("view");
    app.appendChild(el);
    window.scrollTo({top:0, behavior:"instant"});
    $$(".navlinks a, .botnav a").forEach(a=>{
      const key = a.dataset.nav;
      a.classList.toggle("on", key===name || (name==="stage"&&key==="map") || (name==="lesson"&&key==="map") || (name==="quiz"&&key==="map"));
    });
  },
  go(path){ location.hash = path; },
  navChips(){
    const lv = levelInfo();
    const lc = $("#lvChip"); if(lc) lc.textContent = lv.name;
    const sc = $("#streakN"); if(sc) sc.textContent = S.streak.n;
    const rc = $("#navDue"); if(rc){ const n = SRS.dueCount();
      rc.style.display = n>0 ? "" : "none"; rc.textContent = n; }
    const cf = $("#cfStreak"); if(cf){ cf.textContent = S.streak.n;
      cf.style.display = S.streak.n > 0 ? "" : "none"; }
    const tb = $("#themeBtn"); if(tb) tb.innerHTML = icon(S.theme === "dark" ? "sun" : "moon");
    const mt = $("#mThemeBtn"); if(mt) mt.innerHTML = icon(S.theme === "dark" ? "sun" : "moon");
  }
};
const go = p => App.go(p);
