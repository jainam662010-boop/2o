const Admin = {
  data: {},
  activeSection: 'subjects',
  config: {
    subjects: {
      label: 'Subjects', icon: '📚',
      fields: [
        { name: 'id', label: 'ID', type: 'text', required: true },
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'icon', label: 'Icon', type: 'text' },
      ],
      columns: ['name', 'id', 'icon']
    },
    teachers: {
      label: 'Teachers', icon: '👨‍🏫',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'channel', label: 'Channel', type: 'text' },
      ],
      columns: ['name', 'channel']
    },
  },

  async init() {
    await this.loadData();
    this.renderNav();
    this.renderPanels();
    this.switchSection(this.activeSection);
  },

  renderNav() {
    const navEl = document.getElementById('adminNavLinks');
    navEl.innerHTML = Object.keys(this.config).map(id => `
      <a href="#" class="nav-link" id="al-${id}" onclick="Admin.switchSection('${id}')">
        ${this.config[id].icon} ${this.config[id].label}
      </a>
    `).join('');
  },

  renderPanels() {
    const panelsEl = document.getElementById('adminPanels');
    panelsEl.innerHTML = Object.keys(this.config).map(id => `<div class="a-panel" id="ap-${id}" style="display:none"></div>`).join('');
  },

  switchSection(sectionId) {
    this.activeSection = sectionId;
    document.querySelectorAll('#adminNavLinks .nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`al-${sectionId}`).classList.add('active');

    document.querySelectorAll('.a-panel').forEach(el => el.style.display = 'none');
    const panel = document.getElementById(`ap-${sectionId}`);
    panel.style.display = 'block';

    this.renderGenericPanel(panel, sectionId, this.config[sectionId]);
  },

  renderGenericPanel(panel, sectionId, section) {
    panel.innerHTML = `
      <div class="content-card" style="margin-bottom:24px">
        <h3>Add New ${section.label}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:20px">
          ${section.fields.map(f => `
            <div class="form-group">
              <label class="form-label">${f.label}</label>
              <input type="${f.type || 'text'}" class="form-input" id="new-${sectionId}-${f.name}">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:20px" onclick="Admin.addItem('${sectionId}')">Add Item</button>
      </div>

      <div class="content-card">
        <table style="width:100%">
          <thead>
            <tr>
              ${section.columns.map(c => `<th style="text-align:left;padding:12px">${c}</th>`).join('')}
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${(this.data[sectionId] || []).map((item, index) => `
              <tr style="border-top:1px solid var(--border)">
                ${section.columns.map(c => `<td style="padding:12px">${item[c] || ''}</td>`).join('')}
                <td style="text-align:right"><button class="btn" onclick="Admin.deleteItem('${sectionId}', ${index})">Delete</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  addItem(sectionId) {
    const section = this.config[sectionId];
    const newItem = {};
    section.fields.forEach(f => {
      const input = document.getElementById(`new-${sectionId}-${f.name}`);
      if (input) newItem[f.name] = input.value;
    });
    if (!this.data[sectionId]) this.data[sectionId] = [];
    this.data[sectionId].push(newItem);
    this.saveData();
    this.switchSection(sectionId);
  },

  deleteItem(sectionId, index) {
    if (confirm('Are you sure?')) {
      this.data[sectionId].splice(index, 1);
      this.saveData();
      this.switchSection(sectionId);
    }
  },

  async loadData() {
    this.data = JSON.parse(localStorage.getItem('vm_admin_data') || '{}');
  },

  saveData() {
    localStorage.setItem('vm_admin_data', JSON.stringify(this.data));
  },
};
