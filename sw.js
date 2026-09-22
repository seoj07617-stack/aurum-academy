/* 知行金融学院 · Service Worker：离线缓存 + network-first 版本管理 */
"use strict";
const VER = "aurum-v12";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./css/base.css", "./css/components.css", "./css/views.css", "./css/ai.css", "./css/animations.css",
  "./js/vendor/lightweight-charts.js", "./js/vendor/rough-notation.js", "./js/vendor/financejs.js", "./js/figs.js", "./js/core.js", "./js/quizbank.js", "./js/srs.js", "./js/sync.js", "./js/ai.js", "./js/ui.js", "./js/charts.js",
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
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.ok){
        const cp = res.clone();
        caches.open(VER).then(c => c.put(e.request, cp)).catch(()=>{});
      }
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))
    )
  );
});
