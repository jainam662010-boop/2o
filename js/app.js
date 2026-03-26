'use strict';

const App = {
  _data: null,

  // --- DATA MANAGEMENT ---
  async loadData() {
    if (this._data) return this._data;
    try {
      const response = await fetch('data/subjects.json');
      this._data = await response.json();
      this._mergeAdminData();
      return this._data;
    } catch (e) {
      console.error("Data load failed:", e);
      return { subjects: [] };
    }
  },

  _mergeAdminData() {
    const adminData = this._parseLS('vm_admin_data', {});
    if (adminData.subjects) {
      this._data.subjects = [...this._data.subjects, ...adminData.subjects];
    }
  },

  // --- HELPERS ---
  _parseLS: (key, def) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; }
  },
  _saveLS: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  getParam: (key) => new URLSearchParams(location.search).get(key),

  // --- UI & NAVIGATION ---
  initPage(active) {
    const role = localStorage.getItem('vm_user_role');
    if (!role && !window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
      return;
    }

    document.documentElement.setAttribute('data-mode', localStorage.getItem('vm_mode') || 'dark');
    
    const sidebar = document.getElementById('sb');
    if (sidebar) sidebar.innerHTML = this.sidebarHTML(active, role);
  },

  sidebarHTML(active, role) {
    const links = {
      student: [
        { id: 'dashboard', name: 'Dashboard', icon: '🏠', href: 'dashboard.html' },
        { id: 'todo', name: 'My Tasks', icon: '✅', href: 'todo.html' },
      ],
      teacher: [
        { id: 'dashboard', name: 'Dashboard', icon: '🏠', href: 'dashboard.html' },
        { id: 'question-papers', name: 'Exam Gen', icon: '✍️', href: 'question-papers.html' },
        { id: 'admin', name: 'Admin', icon: '⚙️', href: 'admin.html' },
      ]
    };

    const navLinks = (links[role] || links.student).map(l => 
      `<a href="${l.href}" class="nav-link ${active === l.id ? 'active' : ''}">
        <span style="font-size:1.2rem">${l.icon}</span> ${l.name}
      </a>`
    ).join('');

    return `
      <div class="brand-logo">
        <div class="logo-gem">V</div>
        <span class="logo-text">Class 10</span>
      </div>
      <nav class="nav-group">${navLinks}</nav>
      <div style="margin-top:auto">
        <a href="#" onclick="App.logout()" class="nav-link">↩️ Sign Out</a>
      </div>
    `;
  },

  logout() {
    localStorage.removeItem('vm_user_role');
    window.location.href = 'login.html';
  },

  // --- PROGRESS & DATA ---
  getProgress: () => App._parseLS('vm_prog', {}),
  getSubjPct: (sid, subj) => {
    const p = App.getProgress()[sid] || {};
    return subj.chapters.length ? Math.round(((p.done || []).length / subj.chapters.length) * 100) : 0;
  },
};
