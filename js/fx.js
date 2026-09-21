/* ============================================================
   fx.js — 动效模块：大标题滚动折叠 / 答对抛物线飞星
   纯 requestAnimationFrame + transform/opacity 合成属性实现，
   不引入任何第三方库；滚动折叠由同一进度 p 在同一帧驱动四条
   动效（缩放 / 上移 / 透明度 / 导航底色），保证完全同步无跳动
   ============================================================ */
"use strict";
const FX = (() => {
  const FOLD_RANGE = 120;      /* 折叠完成所需滚动距离(px) */
  const FOLD_MAX_HEAD = 150;   /* h1 距导航底缘超过该值视为页面头不在顶部，不强加 */
  const FOLD_ROUTES = ["practice","glossary","dojo","review","wrong","stats","lesson"];
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  let target = null;           /* 当前折叠目标 { h1, shift, mini } */
  let miniEl = null;           /* 导航栏迷你标题 */
  let ticking = false;

  /* ---------- 工具 ---------- */
  const navEl = () => $(".topnav");
  const navBottom = () => { const n = navEl(); return n ? n.offsetHeight : 64; };

  /* 布局位置量测：走 offsetTop 链，不受入场 riseIn 等 transform 动画干扰 */
  function docTop(el){
    let y = 0;
    while(el){ y += el.offsetTop; el = el.offsetParent; }
    return y;
  }

  /* ---------- 需求1：大标题滚动折叠 ---------- */
  function ensureMini(){
    const nav = navEl(); if(!nav) return null;
    if(!miniEl || !miniEl.isConnected){
      miniEl = document.createElement("span");
      miniEl.className = "nav-mini-title";
      nav.appendChild(miniEl);   /* topnav 内、inner 之外，绝对定位于导航中央 */
    }
    return miniEl;
  }

  function scan(){
    const nav = navEl();
    target = null;
    if(nav){ nav.classList.remove("fx-drive"); nav.style.removeProperty("--fx-k"); }
    if(reduceMotion) return;
    const [name] = (location.hash || "#/home").replace(/^#\/?/, "").split("/");
    if(!FOLD_ROUTES.includes(name)) return;
    const view = $("#app .view"); if(!view) return;
    const h1 = $("h1", view); if(!h1) return;
    const head = docTop(h1) - navBottom();
    if(head < 0 || head > FOLD_MAX_HEAD) return;   /* h1 不在页面头位置则不启用 */
    h1.classList.add("fx-foldable");
    const mini = ensureMini();
    if(mini) mini.textContent = h1.textContent.trim();
    target = { h1, shift: head + 10, mini };       /* +10：p=1 时标题顶缘没入导航底缘 */
    apply();
  }

  function onScroll(){
    if(ticking || !target) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  function apply(){
    ticking = false;
    const nav = navEl();
    if(!target || !nav) return;
    if(!target.h1.isConnected){ scan(); return; }  /* 视图已重建则重扫 */
    const p = Math.max(0, Math.min(1, window.scrollY / FOLD_RANGE));
    const e = 1 - Math.pow(1 - p, 3);              /* cubic ease-out，缩放/位移/底色共用 */
    /* 同一 p、同一帧写入：标题缩放 + 上移 + 淡出 */
    target.h1.style.transform = `translateY(${(-target.shift * e).toFixed(1)}px) scale(${(1 - .5 * e).toFixed(3)})`;
    target.h1.style.opacity = (1 - Math.max(0, (p - .38) / .62)).toFixed(3);
    /* 迷你标题反相浮现（仅窄屏显示，见 animations.css） */
    if(target.mini){
      const mp = Math.max(0, (p - .5) / .5);
      target.mini.style.opacity = mp.toFixed(3);
      target.mini.style.transform = `translateY(${(6 * (1 - mp)).toFixed(1)}px)`;
    }
    /* 导航底色加浓：与标题同帧写入，严格同步 */
    nav.classList.add("fx-drive");
    nav.style.setProperty("--fx-k", e.toFixed(3));
    if(p === 0){ nav.classList.remove("fx-drive"); nav.style.removeProperty("--fx-k"); }
  }

  /* ---------- 需求2：答对抛物线飞星 ---------- */
  const FLY_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="url(#gold-grad-def)" stroke="#8C6D2F" stroke-width="1.2"/><path d="m7.4 12.6 3 3 6.2-6.8" fill="none" stroke="#FFF9E6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const FLY_MS = 720;
  let flying = null;

  /* 落点：优先导航右上角「连续天数」徽章，取不到则回落视口右上角 */
  function flyTarget(){
    const chip = $(".streak-chip");
    if(chip){
      const r = chip.getBoundingClientRect();
      if(r.width > 0 && r.height > 0) return { x: r.left + r.width/2, y: r.top + r.height/2, el: chip };
    }
    return { x: innerWidth - 34, y: 42, el: null };
  }

  function fly(fromEl){
    if(reduceMotion) return;
    const r = fromEl && fromEl.isConnected ? fromEl.getBoundingClientRect() : null;
    const x0 = r ? r.left + r.width/2 : innerWidth/2;
    const y0 = r ? r.top + r.height/2 : innerHeight/2;
    const t = flyTarget();
    if(flying){ flying.node.remove(); clearTimeout(flying.timer); flying = null; }  /* 防重复/堆积 */

    const node = document.createElement("span");
    node.className = "fx-fly";
    node.style.left = x0 + "px"; node.style.top = y0 + "px";
    node.innerHTML = `<span class="fx-fly-y">${FLY_SVG}</span>`;
    document.body.appendChild(node);

    const dx = t.x - x0, dy = t.y - y0;
    /* 双层分离：外层横向 linear 匀速，内层纵向 ease-out —— 合成自然抛物弧线 */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      node.style.transition = `transform ${FLY_MS}ms linear`;
      node.style.transform = `translateX(${dx.toFixed(1)}px)`;
      const yy = node.firstElementChild;
      yy.style.transition = `transform ${FLY_MS}ms cubic-bezier(.16,.84,.32,1)`;
      yy.style.transform = `translateY(${dy.toFixed(1)}px)`;
    }));
    const timer = setTimeout(() => {
      node.remove();
      if(flying && flying.timer === timer) flying = null;
      if(t.el){   /* 落点轻微缩放脉冲一次 */
        t.el.classList.remove("fx-pulse");
        void t.el.offsetWidth;
        t.el.classList.add("fx-pulse");
        setTimeout(() => t.el.classList.remove("fx-pulse"), 420);
      }
    }, FLY_MS + 30);
    flying = { node, timer };
  }

  /* ---------- 装配：路由后重扫 + 滚动监听 ---------- */
  const _route = App.route.bind(App);
  App.route = function(){ _route(); requestAnimationFrame(scan); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scan);

  return { fly, scan };
})();
window.FX = FX;   /* 挂到 window：视图接线用 window.FX 判断，fx.js 缺失时不影响判分主流程 */
