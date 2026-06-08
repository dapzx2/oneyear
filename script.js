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
  e.preventDefault();
  openPinModal('intro'); // require password before opening
}

introBtn.addEventListener('click', handleIntroOpen);
introBtn.addEventListener('touchend', handleIntroOpen);

/* ═══════════════════════════════
   LETTER PIN MODAL
═══════════════════════════════ */
let pinContext = 'intro'; // 'intro' | 'letter'
let letterUnlocked = false; // skip PIN after first correct entry
const LETTER_PASSWORD = '0906';

const openLetterBtn    = document.getElementById('open-letter-btn');
const pinModal         = document.getElementById('pin-modal');
const pinModalBackdrop = document.getElementById('pin-modal-backdrop');
const pinModalClose    = document.getElementById('pin-modal-close');
const pinInput         = document.getElementById('pin-input');
const pinErr           = document.getElementById('pin-err');
const pinHint          = document.getElementById('pin-hint');
const pinSubmit        = document.getElementById('pin-submit');
const videoModal       = document.getElementById('video-modal');
const storyVideo       = document.getElementById('story-video');
const videoNextBtn     = document.getElementById('video-next-btn');
const letterLockArea   = document.getElementById('letter-lock-area');
const letterContent    = document.getElementById('letter-content');
const letterPopup      = document.getElementById('letter-popup');
const letterPopupClose = document.getElementById('letter-popup-close');

function openPinModal(context) {
  pinContext = context || 'letter';
  const title = pinModal.querySelector('.pin-modal-title');
  if (title) title.innerHTML = context === 'intro'
    ? '<em>masukkan password</em>'
    : '<em>Masukkan PIN</em>';
  // Set hint text per context
  if (pinHint) pinHint.textContent = context === 'intro' ? 'mushroom' : 'pin hp kamu';
  pinModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => pinInput.focus(), 150);
}

function closePinModal() {
  pinModal.hidden = true;
  document.body.style.overflow = '';
  pinInput.value = '';
  pinErr.classList.remove('show');
  pinHint.classList.remove('show');
}

function checkPin() {
  const val = pinInput.value.trim();
  const isIntro = pinContext === 'intro';
  const valid = isIntro
    ? val.toLowerCase() === 'moya'
    : (val === LETTER_PASSWORD || val.toLowerCase() === 'moya');

  if (valid) {
    closePinModal();
    if (isIntro) {
      introBtnActivated = true;
      openMain();
    } else {
      letterUnlocked = true;
      videoModal.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => storyVideo.play().catch(() => {}), 300);
    }
  } else {
    pinErr.classList.add('show');
    pinInput.value = '';
    pinInput.classList.add('shake');
    setTimeout(() => pinHint.classList.add('show'), 600);
    setTimeout(() => {
      pinInput.classList.remove('shake');
      pinErr.classList.remove('show');
    }, 1400);
  }
}

function showLetter() {
  storyVideo.pause();
  videoModal.hidden = true;
  // Don't hide lock area — keep button visible so user can reopen
  if (letterPopup) {
    letterPopup.hidden = false;
    document.body.style.overflow = 'hidden';
  }
}

function closeLetterPopup() {
  if (letterPopup) letterPopup.hidden = true;
  document.body.style.overflow = '';
  // Restore lock area so button is still clickable
  if (letterLockArea) letterLockArea.style.display = '';
}

if (openLetterBtn)    openLetterBtn.addEventListener('click', () => {
  if (letterUnlocked) {
    // Already unlocked — go straight to letter popup
    if (letterPopup) {
      letterPopup.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  } else {
    openPinModal('letter');
  }
});
if (pinModalBackdrop) pinModalBackdrop.addEventListener('click', closePinModal);
if (pinModalClose)    pinModalClose.addEventListener('click', closePinModal);
if (pinSubmit)        pinSubmit.addEventListener('click', checkPin);
if (pinInput)         pinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPin(); });
if (videoNextBtn)     videoNextBtn.addEventListener('click', showLetter);
if (letterPopupClose) letterPopupClose.addEventListener('click', closeLetterPopup);

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
