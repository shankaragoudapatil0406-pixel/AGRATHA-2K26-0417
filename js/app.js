/**
 * VAIBHAV 2K26 - Shared Utilities
 * Navigation, toast, auth guards, and common helpers
 */

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== AUTH HELPERS =====
async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    return profile || { id: session.user.id, email: session.user.email, role: 'participant', full_name: session.user.email.split('@')[0] };
  } catch { return null; }
}

async function requireAuth(role) {
  const user = await getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  if (role && user.role !== role) {
    showToast('Access denied. You need ' + role + ' privileges.', 'error');
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    return null;
  }
  return user;
}

async function handleLogout() {
  localStorage.removeItem('localAdmin');
  try { await supabase.auth.signOut(); } catch (e) {}
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'index.html', 500);
}

// ===== NAVBAR RENDERER =====
function renderNavbar(activePage) {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  getCurrentUser().then(user => {
    const links = user ? `
      <a href="events.html" class="${activePage === 'events' ? 'active' : ''}">Events</a>
      <a href="leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">Leaderboard</a>
      <a href="announcements.html" class="${activePage === 'announcements' ? 'active' : ''}">Announcements</a>
      <a href="${user.role === 'admin' ? 'admin.html' : 'dashboard.html'}" class="btn btn-primary btn-sm">Dashboard</a>
    ` : `
      <a href="events.html" class="${activePage === 'events' ? 'active' : ''}">Events</a>
      <a href="leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">Leaderboard</a>
      <a href="login.html" class="${activePage === 'login' ? 'active' : ''}">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
    nav.innerHTML = `
      <a href="index.html" class="navbar-brand">VAIBHAV 2K26</a>
      <div class="navbar-links">${links}</div>
      <button class="mobile-menu-btn" onclick="this.nextElementSibling.classList.toggle('show')" aria-label="Menu">
        <i data-lucide="menu" style="width:24px;height:24px"></i>
      </button>
      <div class="mobile-nav" style="display:none">${links}</div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

// ===== SIDEBAR RENDERER =====
function renderSidebar(role, activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const participantLinks = [
    { href: 'dashboard.html', icon: 'layout-dashboard', label: 'Overview', id: 'overview' },
    { href: 'events.html', icon: 'calendar', label: 'Browse Events', id: 'events' },
    { href: 'teams.html', icon: 'users', label: 'My Teams', id: 'teams' },
    { href: 'tickets.html', icon: 'ticket', label: 'My Tickets', id: 'tickets' },
    { href: 'leaderboard.html', icon: 'trophy', label: 'Leaderboard', id: 'leaderboard' },
    { href: 'announcements.html', icon: 'megaphone', label: 'Announcements', id: 'announcements' },
    { href: 'profile.html', icon: 'user', label: 'Profile', id: 'profile' },
  ];

  const adminLinks = [
    { href: 'admin.html', icon: 'layout-dashboard', label: 'Dashboard', id: 'dashboard' },
    { href: 'admin-events.html', icon: 'calendar-plus', label: 'Manage Events', id: 'manage-events' },
    { href: 'admin-registrations.html', icon: 'clipboard-list', label: 'Registrations', id: 'manage-regs' },
    { href: 'admin-users.html', icon: 'users', label: 'Manage Users', id: 'manage-users' },
    { href: 'announcements.html', icon: 'megaphone', label: 'Announcements', id: 'announcements' },
    { href: 'leaderboard.html', icon: 'trophy', label: 'Leaderboard', id: 'leaderboard' },
    { href: 'profile.html', icon: 'user', label: 'Profile', id: 'profile' },
  ];

  const links = role === 'admin' ? adminLinks : participantLinks;
  sidebar.innerHTML = `
    <div class="sidebar-section">
      <h4>${role === 'admin' ? 'Admin Panel' : 'Navigation'}</h4>
      ${links.map(l => `
        <a href="${l.href}" class="sidebar-link ${activePage === l.id ? 'active' : ''}">
          <i data-lucide="${l.icon}"></i> ${l.label}
        </a>
      `).join('')}
    </div>
    <div class="sidebar-section">
      <h4>Account</h4>
      <a href="#" class="sidebar-link" onclick="handleLogout(); return false;">
        <i data-lucide="log-out"></i> Logout
      </a>
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===== FOOTER RENDERER =====
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <p>&copy; 2026 <a href="index.html">VAIBHAV 2K26</a> — College Fest Management Portal. All rights reserved.</p>
  `;
}

// ===== COUNTDOWN TIMER =====
function startCountdown(targetDate, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  function update() {
    const now = new Date().getTime();
    const distance = new Date(targetDate).getTime() - now;
    if (distance < 0) { el.innerHTML = '<span class="stat-value">LIVE NOW!</span>'; return; }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    el.innerHTML = `
      <div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap">
        <div class="stat-card" style="min-width:80px"><div class="stat-value">${days}</div><div class="stat-label">Days</div></div>
        <div class="stat-card" style="min-width:80px"><div class="stat-value">${hours}</div><div class="stat-label">Hours</div></div>
        <div class="stat-card" style="min-width:80px"><div class="stat-value">${minutes}</div><div class="stat-label">Minutes</div></div>
        <div class="stat-card" style="min-width:80px"><div class="stat-value">${seconds}</div><div class="stat-label">Seconds</div></div>
      </div>
    `;
  }
  update();
  setInterval(update, 1000);
}

// ===== FORMAT HELPERS =====
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getCategoryBadge(category) {
  const map = { technical: 'badge-cyan', cultural: 'badge-purple', sports: 'badge-green', workshop: 'badge-orange', gaming: 'badge-pink' };
  return `<span class="badge ${map[category] || 'badge-cyan'}">${category || 'general'}</span>`;
}

function getStatusBadge(status) {
  const map = { upcoming: 'badge-cyan', ongoing: 'badge-green', completed: 'badge-purple', cancelled: 'badge-red' };
  return `<span class="badge ${map[status] || 'badge-cyan'}">${status || 'upcoming'}</span>`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getCategoryIcon(category) {
  const icons = {
    technical: '💻',
    cultural: '🎭',
    sports: '⚽',
    workshop: '🔧',
    gaming: '🎮'
  };
  return icons[category] || '🎯';
}

function getCategoryClass(category) {
  const map = { technical: 'tech', cultural: 'cultural', sports: 'sports', workshop: 'workshop', gaming: 'tech' };
  return map[category] || 'tech';
}

// ===== REALTIME NOTIFICATIONS =====
function initRealtimeNotifications() {
  if (!window.supabase) return;
  supabase
    .channel('public:announcements')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
      const announcement = payload.new;
      let toastType = 'info';
      if (announcement.priority === 'urgent') toastType = 'error';
      else if (announcement.priority === 'important') toastType = 'warning';
      
      showToast(`📣 ${announcement.title}`, toastType);
    })
    .subscribe();
}

// Initialize realtime notifications on page load
document.addEventListener('DOMContentLoaded', () => {
  initRealtimeNotifications();
});

