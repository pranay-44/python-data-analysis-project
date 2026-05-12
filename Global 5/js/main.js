/* ========================================================
   Global 5 Hospital — Main JavaScript
   ======================================================== */

// ── Detect image path prefix based on page location ──────
const imgBase = window.location.pathname.includes('/pages/') ? '../images/' : 'images/';

// ── Navbar scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── Mobile Nav ────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const navOverlay = document.getElementById('navOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');

function openMobileNav() {
  hamburger && hamburger.classList.add('active');
  mobileNav && mobileNav.classList.add('open');
  navOverlay && navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  hamburger && hamburger.classList.remove('active');
  mobileNav && mobileNav.classList.remove('open');
  navOverlay && navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger && hamburger.addEventListener('click', openMobileNav);
mobileNavClose && mobileNavClose.addEventListener('click', closeMobileNav);
navOverlay && navOverlay.addEventListener('click', closeMobileNav);

// ── Modal ─────────────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');

function openModal() {
  modalOverlay && modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay && modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  const formWrap = document.getElementById('modalFormWrap');
  const success = document.getElementById('modalSuccess');
  if (formWrap) formWrap.style.display = 'block';
  if (success) success.style.display = 'none';
}
function closeModalOnOverlay(e) {
  if (e.target === modalOverlay) closeModal();
}
function handleModalForm(e) {
  e.preventDefault();
  document.getElementById('modalFormWrap').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'block';
}
function handleHeroForm(e) {
  e.preventDefault();
  openModal();
}

// Set min date to today for date inputs
document.querySelectorAll('input[type="date"]').forEach(el => {
  const today = new Date().toISOString().split('T')[0];
  el.setAttribute('min', today);
});

// ── Scroll Reveal ─────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ── Counter Animation ─────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    const display = target >= 1000 ? (current / 1000).toFixed(0) + 'K+' : current + '+';
    el.textContent = display;
  }, 30);
}

// Hero counters
const heroCounters = [
  { id: 'countDoctors', target: 350 },
  { id: 'countPatients', target: 100 },
  { id: 'countYears', target: 25 },
  { id: 'countSpecialties', target: 40 }
];
let heroCountersStarted = false;
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !heroCountersStarted) {
      heroCountersStarted = true;
      heroCounters.forEach(c => {
        const el = document.getElementById(c.id);
        if (el) animateCounter(el, c.target);
      });
    }
  });
}, { threshold: 0.5 });
const heroSection = document.querySelector('.hero');
if (heroSection) heroObserver.observe(heroSection);

// Stats banner counters
const statNums = document.querySelectorAll('.stat-num[data-target]');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target);
      animateCounter(entry.target, target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statsObserver.observe(el));

// ── Doctor Card Data ───────────────────────────────────────
const doctorsData = [
  {
    name: 'Dr. Arvind Mehta',
    specialty: 'cardiology',
    specialtyLabel: 'Cardiology & Interventional',
    exp: '22 Years Experience',
    get img() { return imgBase + 'doctor-1.png'; },
    badge: 'Sr. Consultant',
    available: true
  },
  {
    name: 'Dr. Priya Sharma',
    specialty: 'neurology',
    specialtyLabel: 'Neurology & Neurosurgery',
    exp: '18 Years Experience',
    get img() { return imgBase + 'doctor-2.png'; },
    badge: 'HOD',
    available: true
  },
  {
    name: 'Dr. Rajesh Nair',
    specialty: 'orthopedics',
    specialtyLabel: 'Orthopedics & Sports Medicine',
    exp: '20 Years Experience',
    get img() { return imgBase + 'doctor-3.png'; },
    badge: 'Sr. Consultant',
    available: true
  },
  {
    name: 'Dr. Sunita Krishnan',
    specialty: 'oncology',
    specialtyLabel: 'Medical Oncology',
    exp: '16 Years Experience',
    get img() { return imgBase + 'doctor-1.png'; },
    badge: 'Consultant',
    available: false
  },
  {
    name: 'Dr. Akash Patel',
    specialty: 'pediatrics',
    specialtyLabel: 'Pediatrics & Neonatology',
    exp: '14 Years Experience',
    get img() { return imgBase + 'doctor-3.png'; },
    badge: 'Consultant',
    available: true
  },
  {
    name: 'Dr. Meera Desai',
    specialty: 'cardiology',
    specialtyLabel: 'Cardiac Surgery',
    exp: '19 Years Experience',
    get img() { return imgBase + 'doctor-2.png'; },
    badge: 'Sr. Surgeon',
    available: true
  },
  {
    name: 'Dr. Vikram Roy',
    specialty: 'neurology',
    specialtyLabel: 'Neurology & Epileptology',
    exp: '12 Years Experience',
    get img() { return imgBase + 'doctor-1.png'; },
    badge: 'Consultant',
    available: true
  },
  {
    name: 'Dr. Lakshmi Rao',
    specialty: 'orthopedics',
    specialtyLabel: 'Spine Surgery',
    exp: '17 Years Experience',
    get img() { return imgBase + 'doctor-2.png'; },
    badge: 'Sr. Consultant',
    available: false
  }
];

function renderDoctors(filter = 'all') {
  const grid = document.getElementById('doctorGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? doctorsData : doctorsData.filter(d => d.specialty === filter);
  grid.innerHTML = filtered.map((d, i) => `
    <div class="doctor-card reveal ${i % 4 > 0 ? 'reveal-delay-' + (i % 4) : ''}">
      <div class="doctor-img-wrap">
        <img src="${d.img}" alt="${d.name}" onerror="this.src='${imgBase}doctors-team.png'" />
        <span class="doctor-badge">${d.badge}</span>
        <div class="doctor-overlay">
          <a href="#" class="doctor-social"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="#" class="doctor-social"><i class="fa-solid fa-envelope"></i></a>
          <a href="pages/doctors.html" class="doctor-social"><i class="fa-solid fa-user"></i></a>
        </div>
      </div>
      <div class="doctor-info">
        <h4>${d.name}</h4>
        <div class="doctor-specialty">${d.specialtyLabel}</div>
        <div class="doctor-exp"><i class="fa-solid fa-award" style="color:var(--primary)"></i> ${d.exp}</div>
        <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
          <span style="width:8px;height:8px;border-radius:50%;background:${d.available ? 'var(--secondary)' : 'var(--gray-400)'};display:inline-block"></span>
          <span style="font-size:0.78rem;color:var(--gray-500)">${d.available ? 'Available Today' : 'Next Available: Tomorrow'}</span>
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;justify-content:center" onclick="openModal()">
          <i class="fa-solid fa-calendar"></i> Book Appointment
        </button>
      </div>
    </div>
  `).join('');
  // Re-observe new elements
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Doctor filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDoctors(btn.dataset.filter);
  });
});
renderDoctors();

// ── Chatbot ───────────────────────────────────────────────
const chatbot = document.getElementById('chatbot');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');

function toggleChat() {
  chatbot && chatbot.classList.toggle('open');
}

const botReplies = {
  'book an appointment': 'Great! Please click <strong>Book Appointment</strong> above or call us at <strong>+91-22-4121-5555</strong>.',
  'find a doctor': 'You can browse our doctors at <a href="pages/doctors.html" style="color:var(--primary)">Doctors Page</a> or tell me which specialty you need!',
  'emergency': '🚨 For medical emergencies, please call <strong>1800-229-HELP</strong> immediately or visit our Emergency Department — open 24/7.',
  'default': "Thanks for reaching out! For immediate help, call us at +91-22-4121-5555. Our team is available 24/7."
};

function addChatMsg(text, type = 'bot') {
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<div class="chat-bubble ${type}">${text}</div>`;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function chatQuick(text) {
  addChatMsg(text, 'user');
  setTimeout(() => {
    const key = text.toLowerCase();
    const reply = botReplies[key] || botReplies['default'];
    addChatMsg(reply, 'bot');
  }, 600);
}

function sendChat() {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMsg(text, 'user');
  chatInput.value = '';
  setTimeout(() => {
    const lower = text.toLowerCase();
    let reply = botReplies['default'];
    if (lower.includes('appointment') || lower.includes('book')) reply = botReplies['book an appointment'];
    else if (lower.includes('doctor') || lower.includes('specialist')) reply = botReplies['find a doctor'];
    else if (lower.includes('emergency') || lower.includes('urgent')) reply = botReplies['emergency'];
    addChatMsg(reply, 'bot');
  }, 700);
}

// ── Contact Form Validation ───────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    const name = this.querySelector('#cName');
    const email = this.querySelector('#cEmail');
    const phone = this.querySelector('#cPhone');
    const message = this.querySelector('#cMessage');
    // Simple validation
    [name, email, phone, message].forEach(el => {
      if (!el) return;
      if (!el.value.trim()) {
        el.style.borderColor = 'var(--danger)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = 'var(--danger)';
      valid = false;
    }
    if (valid) {
      const successDiv = document.getElementById('contactSuccess');
      if (successDiv) {
        contactForm.style.display = 'none';
        successDiv.style.display = 'block';
      }
    }
  });
}

// ── Doctor page filter/search ─────────────────────────────
const doctorSearchInput = document.getElementById('doctorSearch');
if (doctorSearchInput) {
  doctorSearchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.doctor-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });
  });
}
