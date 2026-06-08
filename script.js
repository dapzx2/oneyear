/* ═══════════════════════════════════════════════════════════
   ONE-YEAR ANNIVERSARY — script.js
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── CONFIG ─── */
const ANNIVERSARY_DATE = new Date('2025-06-09T00:00:00+08:00');

/* ─── ELEMENTS ─── */
const intro = document.getElementById('intro');
const introBtn = document.getElementById('intro-btn');
const mainEl = document.getElementById('main');
const musicBtn = document.getElementById('music-btn');
const bgAudio = document.getElementById('bg-audio');
const lightbox = document.getElementById('lightbox');
const lbBackdrop = document.getElementById('lightbox-backdrop');
const lbImg = document.getElementById('lightbox-img');
const lbClose = document.getElementById('lightbox-close');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
const lbCounter = document.getElementById('lightbox-counter');

/* ═══════════════════════════════
   1. INTRO → MAIN TRANSITION
═══════════════════════════════ */
function openMain() {
  // Immediately kill pointer-events via JS — don't wait for CSS animation
  intro.style.pointerEvents = 'none';
  intro.classList.add('intro-out');

  // Hide intro: use animationend with timeout fallback
  let hidden = false;
  const hideIntro = () => {
    if (hidden) return;
    hidden = true;
    intro.style.display = 'none';
  };
  intro.addEventListener('animationend', hideIntro, { once: true });
  setTimeout(hideIntro, 1100);

  window.scrollTo(0, 0); // reset scroll to top before revealing main
  document.body.classList.add('main-open');
  tryPlayAudio();
  observeReveal();
}

// Support click + touchend for mobile reliability
let introBtnActivated = false;
function handleIntroOpen(e) {
  if (introBtnActivated) return;
  introBtnActivated = true;
  e.preventDefault();
  openMain();
}

introBtn.addEventListener('click', handleIntroOpen);
introBtn.addEventListener('touchend', handleIntroOpen);

/* ═══════════════════════════════
   LETTER PASSWORD GATE
═══════════════════════════════ */
const LETTER_PASSWORD = '0906';

const letterGate = document.getElementById('letter-gate');
const letterContent = document.getElementById('letter-content');
const gateInput = document.getElementById('letter-gate-input');
const gateBtn = document.getElementById('letter-gate-btn');
const gateErr = document.getElementById('letter-gate-err');
const gateHint = document.getElementById('letter-gate-hint');
const letterVideo = document.getElementById('letter-video');
const letterVideoPlayer = document.getElementById('letter-video-player');
const letterVideoNext = document.getElementById('letter-video-next');

function unlockLetter() {
  const val = gateInput.value.trim();
  if (val === LETTER_PASSWORD) {
    // 1. Hide gate
    letterGate.classList.add('locked-out');
    setTimeout(() => { letterGate.style.display = 'none'; }, 700);

    // 2. Show video player
    letterVideo.hidden = false;
    letterVideo.classList.add('unlocked');
    setTimeout(() => {
      letterVideoPlayer.play().catch(() => {}); // autoplay best-effort
    }, 400);
  } else {
    // Wrong — show error + reveal hint after short delay
    gateErr.classList.add('show');
    gateInput.value = '';
    gateInput.classList.add('shake');
    setTimeout(() => {
      gateHint.classList.add('show');
    }, 600);
    setTimeout(() => {
      gateInput.classList.remove('shake');
      gateErr.classList.remove('show');
    }, 1400);
  }
}

gateBtn.addEventListener('click', unlockLetter);
gateBtn.addEventListener('touchend', (e) => { e.preventDefault(); unlockLetter(); });
gateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlockLetter(); });

// Video → Letter transition
function showLetter() {
  letterVideoPlayer.pause();
  letterVideo.classList.add('fading-out');
  setTimeout(() => {
    letterVideo.hidden = true;
    letterContent.removeAttribute('aria-hidden');
    letterContent.classList.add('unlocked');
    const reveals = letterContent.querySelectorAll('.reveal');
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 100);
    });
  }, 500);
}

if (letterVideoNext) {
  letterVideoNext.addEventListener('click', showLetter);
  letterVideoNext.addEventListener('touchend', (e) => { e.preventDefault(); showLetter(); });
}

/* ═══════════════════════════════
   2. MUSIC PLAYER
═══════════════════════════════ */
let isPlaying = false;

function tryPlayAudio() {
  if (!bgAudio) return;
  bgAudio.volume = 0;
  bgAudio.play().then(() => {
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('paused');
    fadeAudioIn();
  }).catch(() => {
    // Autoplay blocked — wait for manual trigger
    isPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('paused');
  });
}

function fadeAudioIn() {
  let vol = 0;
  const target = 0.38;
  const step = 0.01;
  const timer = setInterval(() => {
    vol = Math.min(vol + step, target);
    bgAudio.volume = vol;
    if (vol >= target) clearInterval(timer);
  }, 80);
}

function fadeAudioOut(cb) {
  let vol = bgAudio.volume;
  const timer = setInterval(() => {
    vol = Math.max(vol - 0.02, 0);
    bgAudio.volume = vol;
    if (vol <= 0) {
      clearInterval(timer);
      bgAudio.pause();
      if (cb) cb();
    }
  }, 60);
}

function toggleMusic() {
  if (!isPlaying) {
    bgAudio.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('paused');
      fadeAudioIn();
    });
  } else {
    isPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('paused');
    fadeAudioOut();
  }
}

musicBtn.addEventListener('click', toggleMusic);
musicBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMusic(); }
});

/* ═══════════════════════════════
   3. LIVE COUNTER
═══════════════════════════════ */
const cntDays = document.getElementById('cnt-days');
const cntHours = document.getElementById('cnt-hours');
const cntMins = document.getElementById('cnt-mins');
const cntSecs = document.getElementById('cnt-secs');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCounter() {
  const now = new Date();
  const diff = now - ANNIVERSARY_DATE;  // ms since anniversary

  if (diff < 0) {
    // Countdown TO anniversary
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    const secs = Math.floor((abs % 60000) / 1000);
    cntDays.textContent = days;
    cntHours.textContent = pad(hours);
    cntMins.textContent = pad(mins);
    cntSecs.textContent = pad(secs);
  } else {
    // Count UP since anniversary
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    cntDays.textContent = days;
    cntHours.textContent = pad(hours);
    cntMins.textContent = pad(mins);
    cntSecs.textContent = pad(secs);
  }
}

// Run immediately and every second
updateCounter();
setInterval(updateCounter, 1000);

/* ═══════════════════════════════
   4. SCROLL REVEAL
═══════════════════════════════ */
function observeReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => io.observe(el));
}

/* ═══════════════════════════════
   5. GALLERY LIGHTBOX
═══════════════════════════════ */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
let currentLbIndex = 0;

// Collect image sources and alts
const galleryImages = galleryItems.map(item => ({
  src: item.querySelector('img').src,
  alt: item.querySelector('img').alt,
}));

function openLightbox(index) {
  currentLbIndex = index;
  lbImg.src = galleryImages[index].src;
  lbImg.alt = galleryImages[index].alt;
  lbCounter.textContent = `${index + 1} / ${galleryImages.length}`;
  lightbox.hidden = false;
  lbBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lbBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  // Return focus to the gallery item that was opened
  galleryItems[currentLbIndex]?.focus();
}

function prevPhoto() {
  currentLbIndex = (currentLbIndex - 1 + galleryImages.length) % galleryImages.length;
  lbImg.src = galleryImages[currentLbIndex].src;
  lbImg.alt = galleryImages[currentLbIndex].alt;
  lbCounter.textContent = `${currentLbIndex + 1} / ${galleryImages.length}`;
}

function nextPhoto() {
  currentLbIndex = (currentLbIndex + 1) % galleryImages.length;
  lbImg.src = galleryImages[currentLbIndex].src;
  lbImg.alt = galleryImages[currentLbIndex].alt;
  lbCounter.textContent = `${currentLbIndex + 1} / ${galleryImages.length}`;
}

// Click handlers for gallery items
galleryItems.forEach((item, index) => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Buka foto ${index + 1}`);

  item.addEventListener('click', () => openLightbox(index));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
});

lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevPhoto);
lbNext.addEventListener('click', nextPhoto);

// Keyboard navigation inside lightbox
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  switch (e.key) {
    case 'Escape': closeLightbox(); break;
    case 'ArrowLeft': prevPhoto(); break;
    case 'ArrowRight': nextPhoto(); break;
  }
});

// Touch/swipe support for lightbox
let touchStartX = null;

lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) {
    delta < 0 ? nextPhoto() : prevPhoto();
  }
  touchStartX = null;
});
