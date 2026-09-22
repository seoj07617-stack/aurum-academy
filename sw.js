/* 知行金融学院 · Service Worker：离线缓存 + network-first 版本管理 */
"use strict";
const VER = "aurum-v21";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./css/base.css", "./css/components.css", "./css/views.css", "./css/ai.css", "./css/animations.css",
  "./js/vendor/lightweight-charts.js", "./js/vendor/rough-notation.js", "./js/vendor/financejs.js", "./js/glossary_extra1.js", "./js/glossary_extra2.js", "./js/figs.js", "./js/figs_extra.js", "./js/deep_macro.js", "./js/deep_markets.js", "./js/deep_foundations.js", "./js/deep_technical.js", "./js/deep_funds.js", "./js/deep_company.js", "./js/deep_discipline.js", "./js/deep_portfolio.js", "./js/deep_models.js", "./js/deep_capstone.js", "./js/core.js", "./js/quizbank.js", "./js/srs.js", "./js/sync.js", "./js/ai.js", "./js/ui.js", "./js/charts.js",
  "./js/data/foundations.js", "./js/data/macro.js", "./js/data/markets.js", "./js/data/company.js",
  "./js/data/technical.js", "./js/data/funds.js", "./js/data/models.js", "./js/data/discipline.js",
  "./js/data/portfolio.js", "./js/data/capstone.js", "./js/data/practice.js",
  "./js/views/home.js", "./js/views/map.js", "./js/views/stage.js", "./js/views/lesson.js",
  "./js/views/quiz.js", "./js/views/review.js", "./js/views/wrong.js", "./js/views/stats.js",
  "./js/views/dojo.js", "./js/views/glossary.js", "./js/views/practice.js", "./js/views/daily.js", "./js/fx.js"
];
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).catch(()=>{}));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  const req = e.request;
  /* 页面导航：网络优先（保证能发现新版本），失败回缓存 */
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(res => {
        if(res && res.ok){
          const cp = res.clone();
          caches.open(VER).then(c => c.put(req, cp)).catch(()=>{});
        }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))
      )
    );
    return;
  }
  /* 静态资源：缓存优先秒开，后台静默拉新版本更新缓存（国内网络波动下不再白屏） */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if(res && res.ok){
          const cp = res.clone();
          caches.open(VER).then(c => c.put(req, cp)).catch(()=>{});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
