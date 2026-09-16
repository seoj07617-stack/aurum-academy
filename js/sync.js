/* ============================================================
   sync.js — 云端备份：GitHub 私有仓库 aurum-sync
   Token 仅存本机 localStorage，不进入备份内容、不上传
   ============================================================ */
"use strict";
const Sync = {
  REPO: "aurum-sync",
  token(){ return localStorage.getItem("aurum_gh_token") || ""; },
  setToken(t){ t = (t||"").trim();
    t ? localStorage.setItem("aurum_gh_token", t) : localStorage.removeItem("aurum_gh_token"); },
  async req(path, opts = {}){
    const t = this.token(); if(!t) throw new Error("未设置 Token");
    const headers = { Authorization: "token " + t, Accept: "application/vnd.github+json", "User-Agent": "aurum-sync" };
    if(opts.body) headers["Content-Type"] = "application/json";
    const r = await fetch("https://api.github.com" + path, { ...opts, headers });
    if(r.status === 401) throw new Error("Token 无效或已过期");
    if(r.status === 404) throw new Error("NOT_FOUND");
    if(!r.ok){ const txt = await r.text().catch(() => ""); throw new Error("GitHub " + r.status + " " + txt.slice(0, 100)); }
    return r.status === 204 ? null : r.json();
  },
  async login(){ if(this._login) return this._login;
    const u = await this.req("/user"); this._login = u.login; return this._login; },
  async ensureRepo(){
    const owner = await this.login();
    try { await this.req(`/repos/${owner}/${this.REPO}`); }
    catch(e){
      if(e.message !== "NOT_FOUND") throw e;
      await this.req("/user/repos", { method: "POST",
        body: JSON.stringify({ name: this.REPO, private: true, description: "Aurum Academy 学习进度私有备份（自动创建）" }) });
      await new Promise(res => setTimeout(res, 1500));
    }
    return owner;
  },
  async push(){
    const owner = await this.ensureRepo();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    const api = `/repos/${owner}/${this.REPO}/contents/progress.json`;
    let sha = null;
    try { const cur = await this.req(api + "?ref=main"); sha = cur.sha; } catch(e){}
    await this.req(api, { method: "PUT",
      body: JSON.stringify({ message: "backup " + dayKey() + " " + new Date().toTimeString().slice(0,5),
        content, branch: "main", ...(sha ? { sha } : {}) }) });
    return this.login();
  },
  async pull(){
    const owner = await this.login();
    const cur = await this.req(`/repos/${owner}/${this.REPO}/contents/progress.json?ref=main`);
    const data = JSON.parse(decodeURIComponent(escape(atob(cur.content))));
    if(!data || typeof data !== "object" || !("lessons" in data)) throw new Error("云端数据格式不正确");
    localStorage.setItem(Store.KEY, JSON.stringify(data));
    return data;
  }
};
