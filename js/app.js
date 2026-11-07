/* =============================================
   LIFE DASHBOARD — app.js
   Vanilla JavaScript, tanpa framework/backend
   Data disimpan di Browser Local Storage
   ============================================= */

/* =============================================
   1. REFERENSI ELEMEN HTML
   ============================================= */
// Header
const elGreeting      = document.getElementById('greeting');
const elDisplayName   = document.getElementById('display-name');
const elBtnEditName   = document.getElementById('btn-edit-name');
const elNameForm      = document.getElementById('name-form');
const elInputName     = document.getElementById('input-name');
const elBtnSaveName   = document.getElementById('btn-save-name');
const elBtnCancelName = document.getElementById('btn-cancel-name');
const elClock         = document.getElementById('clock');
const elDateDisplay   = document.getElementById('date-display');
const elBtnTheme      = document.getElementById('btn-theme');

// Focus Timer
const elTimerDisplay  = document.getElementById('timer-display');
const elBtnStart      = document.getElementById('btn-start');
const elBtnPause      = document.getElementById('btn-pause');
const elBtnReset      = document.getElementById('btn-reset');

// To-Do List
const elInputTodo     = document.getElementById('input-todo');
const elBtnAddTodo    = document.getElementById('btn-add-todo');
const elTodoError     = document.getElementById('todo-error');
const elTodoList      = document.getElementById('todo-list');
const elTodoCount     = document.getElementById('todo-count');
const elFilterBtns    = document.querySelectorAll('.filter-btn');

// Quick Links
const elInputLinkName = document.getElementById('input-link-name');
const elInputLinkUrl  = document.getElementById('input-link-url');
const elBtnAddLink    = document.getElementById('btn-add-link');
const elLinkError     = document.getElementById('link-error');
const elLinksGrid     = document.getElementById('links-grid');

/* =============================================
   2. STATE APLIKASI
   ============================================= */
let timerInterval  = null;   // ID dari setInterval timer
let timerSeconds   = 25 * 60; // 25 menit dalam detik
let timerRunning   = false;

let currentFilter  = 'all';  // Filter to-do: 'all' | 'active' | 'done'

/* =============================================
   3. LOCAL STORAGE — helper
   ============================================= */

// Ambil data dari Local Storage, kembalikan default jika kosong
function lsGet(key, defaultValue) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

// Simpan data ke Local Storage
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =============================================
   4. GREETING BERDASARKAN WAKTU
   ============================================= */
function updateGreeting() {
  const hour = new Date().getHours();
  let salam;

  if (hour >= 5 && hour < 11) {
    salam = 'Selamat Pagi';
  } else if (hour >= 11 && hour < 15) {
    salam = 'Selamat Siang';
  } else if (hour >= 15 && hour < 19) {
    salam = 'Selamat Sore';
  } else {
    salam = 'Selamat Malam';
  }

  const name = lsGet('userName', 'Pengguna');
  elGreeting.textContent = `${salam}, ${name}! 👋`;
}

/* =============================================
   5. JAM & TANGGAL REAL-TIME
   ============================================= */
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

function updateClock() {
  const now  = new Date();

  // Format jam: HH:MM:SS
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  elClock.textContent = `${hh}:${mm}:${ss}`;

  // Format tanggal: Jumat, 6 November 2026
  const hari    = HARI[now.getDay()];
  const tanggal = now.getDate();
  const bulan   = BULAN[now.getMonth()];
  const tahun   = now.getFullYear();
  elDateDisplay.textContent = `${hari}, ${tanggal} ${bulan} ${tahun}`;

  // Greeting diperbarui setiap detik (otomatis update saat jam berubah)
  updateGreeting();
}

/* =============================================
   6. CUSTOM NAME IN GREETING
   ============================================= */
function initName() {
  const name = lsGet('userName', '');
  // Tampilkan nama yang tersimpan, atau placeholder
  elDisplayName.textContent = name || 'Pengguna';
}

// Tombol ✏️ — tampilkan form ubah nama
elBtnEditName.addEventListener('click', () => {
  elNameForm.classList.remove('hidden');
  elInputName.value = lsGet('userName', '');
  elInputName.focus();
});

// Tombol Simpan
elBtnSaveName.addEventListener('click', saveName);

// Tekan Enter di input nama
elInputName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveName();
  if (e.key === 'Escape') cancelNameEdit();
});

function saveName() {
  const newName = elInputName.value.trim();
  if (!newName) return; // Jangan simpan nama kosong
  lsSet('userName', newName);
  elDisplayName.textContent = newName;
  elNameForm.classList.add('hidden');
  updateGreeting(); // Langsung perbarui greeting
}

// Tombol Batal
elBtnCancelName.addEventListener('click', cancelNameEdit);

function cancelNameEdit() {
  elNameForm.classList.add('hidden');
}

/* =============================================
   7. LIGHT / DARK MODE
   ============================================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Ganti ikon tombol sesuai tema aktif
  elBtnTheme.textContent = theme === 'dark' ? '☀️' : '🌙';
  elBtnTheme.title       = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
}

function initTheme() {
  const savedTheme = lsGet('theme', 'light');
  applyTheme(savedTheme);
}

elBtnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  lsSet('theme', next);
  applyTheme(next);
});

/* =============================================
   8. FOCUS TIMER
   ============================================= */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTimer() {
  elTimerDisplay.textContent = formatTime(timerSeconds);

  // Warna merah saat sisa waktu ≤ 5 menit
  if (timerSeconds <= 5 * 60 && timerRunning) {
    elTimerDisplay.classList.add('warning');
  } else {
    elTimerDisplay.classList.remove('warning');
  }
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;

  elBtnStart.disabled = true;
  elBtnPause.disabled = false;

  timerInterval = setInterval(() => {
    timerSeconds--;
    renderTimer();

    if (timerSeconds <= 0) {
      // Timer habis
      clearInterval(timerInterval);
      timerRunning       = false;
      elBtnStart.disabled = false;
      elBtnPause.disabled = true;
      elTimerDisplay.classList.remove('warning');
      alert('⏰ Waktu fokus selesai! Saatnya istirahat sejenak.');
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning        = false;
  elBtnStart.disabled = false;
  elBtnPause.disabled = true;
  elTimerDisplay.classList.remove('warning');
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning        = false;
  timerSeconds        = 25 * 60;
  elBtnStart.disabled = false;
  elBtnPause.disabled = true;
  elTimerDisplay.classList.remove('warning');
  renderTimer();
}

elBtnStart.addEventListener('click', startTimer);
elBtnPause.addEventListener('click', pauseTimer);
elBtnReset.addEventListener('click', resetTimer);

/* =============================================
   9. TO-DO LIST
   ============================================= */

// --- Helper ---
function getTodos() {
  return lsGet('todos', []);
}

function saveTodos(todos) {
  lsSet('todos', todos);
}

// Cek duplikat (case-insensitive)
function isDuplicate(text, todos, excludeId = null) {
  return todos.some(
    (t) => t.text.toLowerCase() === text.toLowerCase() && t.id !== excludeId
  );
}

// Tambah tugas baru
function addTodo() {
  const text = elInputTodo.value.trim();

  if (!text) {
    showTodoError('Tugas tidak boleh kosong.');
    return;
  }

  const todos = getTodos();

  // Challenge: Prevent Duplicate Tasks
  if (isDuplicate(text, todos)) {
    showTodoError(`Tugas "${text}" sudah ada dalam daftar.`);
    return;
  }

  hideTodoError();

  const newTodo = {
    id:   Date.now(),       // ID unik berbasis timestamp
    text: text,
    done: false
  };

  todos.push(newTodo);
  saveTodos(todos);
  elInputTodo.value = '';
  renderTodos();
}

// Tandai selesai / aktif
function toggleTodo(id) {
  const todos = getTodos();
  const idx   = todos.findIndex((t) => t.id === id);
  if (idx === -1) return;
  todos[idx].done = !todos[idx].done;
  saveTodos(todos);
  renderTodos();
}

// Hapus tugas
function deleteTodo(id) {
  let todos = getTodos();
  todos     = todos.filter((t) => t.id !== id);
  saveTodos(todos);
  renderTodos();
}

// Simpan hasil edit
function saveEdit(id, newText) {
  newText = newText.trim();

  if (!newText) {
    showTodoError('Tugas tidak boleh kosong.');
    return false;
  }

  const todos = getTodos();

  // Challenge: Prevent Duplicate (kecuali item itu sendiri)
  if (isDuplicate(newText, todos, id)) {
    showTodoError(`Tugas "${newText}" sudah ada dalam daftar.`);
    return false;
  }

  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  todos[idx].text = newText;
  saveTodos(todos);
  hideTodoError();
  renderTodos();
  return true;
}

// Tampil & sembunyikan pesan error
function showTodoError(msg) {
  elTodoError.textContent = msg;
  elTodoError.classList.remove('hidden');
}

function hideTodoError() {
  elTodoError.textContent = '';
  elTodoError.classList.add('hidden');
}

// Render daftar tugas ke DOM
function renderTodos() {
  const todos = getTodos();

  // Filter sesuai tab aktif
  let filtered;
  if (currentFilter === 'active') {
    filtered = todos.filter((t) => !t.done);
  } else if (currentFilter === 'done') {
    filtered = todos.filter((t) => t.done);
  } else {
    filtered = todos;
  }

  elTodoList.innerHTML = '';

  if (filtered.length === 0) {
    elTodoList.innerHTML = `<li class="todo-empty" style="color:var(--text-muted);font-size:0.88rem;padding:10px 0;">Tidak ada tugas di sini.</li>`;
  } else {
    filtered.forEach((todo) => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.done ? 'checked' : ''}
          aria-label="Tandai selesai"
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-actions">
          <button class="btn-edit-todo" title="Edit tugas">✏️</button>
          <button class="btn-delete-todo" title="Hapus tugas">🗑️</button>
        </div>
      `;

      // Tombol centang
      li.querySelector('.todo-checkbox').addEventListener('change', () => {
        toggleTodo(todo.id);
      });

      // Tombol edit — masuk mode edit inline
      li.querySelector('.btn-edit-todo').addEventListener('click', () => {
        enterEditMode(li, todo);
      });

      // Tombol hapus
      li.querySelector('.btn-delete-todo').addEventListener('click', () => {
        deleteTodo(todo.id);
      });

      elTodoList.appendChild(li);
    });
  }

  // Perbarui counter tugas aktif
  const activeCount  = todos.filter((t) => !t.done).length;
  elTodoCount.textContent = `${activeCount} tugas tersisa`;
}

// Mode edit inline pada item to-do
function enterEditMode(li, todo) {
  // Ganti span teks dengan input
  const textSpan   = li.querySelector('.todo-text');
  const actionsDiv = li.querySelector('.todo-actions');

  const input = document.createElement('input');
  input.type      = 'text';
  input.className = 'todo-edit-input';
  input.value     = todo.text;
  input.maxLength = 100;

  const btnSave = document.createElement('button');
  btnSave.className   = 'btn-save-edit';
  btnSave.textContent = '✔';
  btnSave.title       = 'Simpan perubahan';

  // Simpan saat tombol ✔ diklik
  btnSave.addEventListener('click', () => {
    saveEdit(todo.id, input.value);
  });

  // Simpan saat Enter, batalkan saat Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  saveEdit(todo.id, input.value);
    if (e.key === 'Escape') renderTodos(); // Batalkan edit
  });

  // Ganti konten
  textSpan.replaceWith(input);
  actionsDiv.innerHTML = '';
  actionsDiv.appendChild(btnSave);
  input.focus();
  input.select();
}

// Mencegah XSS: ubah karakter khusus HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Tombol Tambah & Enter di input
elBtnAddTodo.addEventListener('click', addTodo);
elInputTodo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// Filter tombol (Semua / Aktif / Selesai)
elFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    elFilterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

/* =============================================
   10. QUICK LINKS
   ============================================= */

function getLinks() {
  return lsGet('links', []);
}

function saveLinks(links) {
  lsSet('links', links);
}

function addLink() {
  const name = elInputLinkName.value.trim();
  const url  = elInputLinkUrl.value.trim();

  if (!name || !url) {
    showLinkError('Nama dan URL tidak boleh kosong.');
    return;
  }

  // Validasi format URL sederhana
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showLinkError('URL harus diawali dengan https:// atau http://');
    return;
  }

  hideLinkError();

  const links   = getLinks();
  const newLink = {
    id:   Date.now(),
    name: name,
    url:  url
  };

  links.push(newLink);
  saveLinks(links);
  elInputLinkName.value = '';
  elInputLinkUrl.value  = '';
  renderLinks();
}

function deleteLink(id) {
  let links = getLinks();
  links     = links.filter((l) => l.id !== id);
  saveLinks(links);
  renderLinks();
}

function showLinkError(msg) {
  elLinkError.textContent = msg;
  elLinkError.classList.remove('hidden');
}

function hideLinkError() {
  elLinkError.textContent = '';
  elLinkError.classList.add('hidden');
}

function renderLinks() {
  const links = getLinks();
  elLinksGrid.innerHTML = '';

  if (links.length === 0) {
    elLinksGrid.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;">Belum ada link tersimpan.</p>`;
    return;
  }

  links.forEach((link) => {
    const card = document.createElement('div');
    card.className = 'link-card';

    card.innerHTML = `
      <a
        href="${escapeHtml(link.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="link-name"
        title="${escapeHtml(link.url)}"
      >${escapeHtml(link.name)}</a>
      <button class="btn-delete-link" title="Hapus link">✕</button>
    `;

    card.querySelector('.btn-delete-link').addEventListener('click', () => {
      deleteLink(link.id);
    });

    elLinksGrid.appendChild(card);
  });
}

// Tombol Tambah link & Enter
elBtnAddLink.addEventListener('click', addLink);
elInputLinkUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});

/* =============================================
   11. INISIALISASI — Jalankan semua saat halaman dimuat
   ============================================= */
function init() {
  // Tema
  initTheme();

  // Nama pengguna
  initName();

  // Jam & tanggal (langsung + interval 1 detik)
  updateClock();
  setInterval(updateClock, 1000);

  // Timer (tampilkan nilai awal)
  renderTimer();

  // To-Do
  renderTodos();

  // Quick Links
  renderLinks();
}

// Mulai aplikasi
init();
