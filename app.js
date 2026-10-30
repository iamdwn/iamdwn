(() => {
  'use strict';

  const frame = document.getElementById('botpress-frame');
  const loading = document.getElementById('chat-loading');
  const help = document.getElementById('connection-help');
  const status = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');
  const reload = document.getElementById('reload-chat');
  const focus = document.getElementById('focus-toggle');
  const motion = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const sculpture = document.getElementById('sculpture');
  const parallax = document.getElementById('sculpture-parallax');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let timeout;
  let motionPreference = null;
  let motionPaused = reducedMotion.matches;

  document.getElementById('year').textContent = new Date().getFullYear();
  [reload, focus, motion].forEach(button => { button.hidden = false; });

  function setStatus(state, message) {
    status.dataset.state = state;
    statusText.textContent = message;
  }

  function beginLoading() {
    window.clearTimeout(timeout);
    loading.hidden = false;
    help.hidden = true;
    reload.disabled = true;
    setStatus('loading', 'ĐANG TẢI KHUNG TRÒ CHUYỆN');
    timeout = window.setTimeout(() => {
      loading.hidden = true;
      help.hidden = false;
      reload.disabled = false;
      setStatus('slow', 'KẾT NỐI ĐANG CHẬM');
    }, 18000);
  }

  function finishLoading() {
    window.clearTimeout(timeout);
    loading.hidden = true;
    help.hidden = true;
    reload.disabled = false;
    setStatus('loaded', 'KHUNG TRÒ CHUYỆN ĐÃ TẢI');
  }
  frame.addEventListener('load', finishLoading);

  function retryChat() {
    beginLoading();
    frame.src = frame.src;
  }
  reload.addEventListener('click', retryChat);
  document.getElementById('retry-chat').addEventListener('click', retryChat);

  function setFocusMode(enabled) {
    document.body.classList.toggle('focus-mode', enabled);
    focus.setAttribute('aria-pressed', String(enabled));
    focus.setAttribute('aria-label', enabled ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung');
    focus.title = enabled ? 'Thoát chế độ tập trung' : 'Chế độ tập trung';
  }
  focus.addEventListener('click', () => {
    const enabled = !document.body.classList.contains('focus-mode');
    setFocusMode(enabled);
    if (enabled) document.getElementById('conversation').scrollIntoView({ block: 'start' });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('focus-mode')) {
      setFocusMode(false);
      focus.focus();
    }
  });

  function resetParallax() {
    parallax.style.removeProperty('--tilt-x');
    parallax.style.removeProperty('--tilt-y');
  }
  function updateMotion() {
    motionPaused = reducedMotion.matches || motionPreference === 'paused';
    document.body.classList.toggle('motion-paused', motionPaused);
    motion.setAttribute('aria-pressed', String(motionPaused));
    motion.setAttribute('aria-label', motionPaused ? 'Bật hiệu ứng chuyển động' : 'Tắt hiệu ứng chuyển động');
    motionLabel.textContent = motionPaused ? 'Hiệu ứng: tắt' : 'Hiệu ứng: bật';
    motion.disabled = reducedMotion.matches;
    motion.title = reducedMotion.matches ? 'Đã giảm chuyển động theo cài đặt thiết bị' : motion.getAttribute('aria-label');
    if (motionPaused) resetParallax();
  }
  try { motionPreference = window.localStorage.getItem('dozun-motion'); } catch {}
  updateMotion();
  reducedMotion.addEventListener('change', updateMotion);
  motion.addEventListener('click', () => {
    motionPreference = motionPaused ? 'playing' : 'paused';
    try { window.localStorage.setItem('dozun-motion', motionPreference); } catch {}
    updateMotion();
  });
  sculpture.addEventListener('pointermove', event => {
    if (motionPaused || !finePointer.matches) return;
    const bounds = sculpture.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    parallax.style.setProperty('--tilt-x', `${(-y * 10).toFixed(2)}deg`);
    parallax.style.setProperty('--tilt-y', `${(x * 12).toFixed(2)}deg`);
  }, { passive: true });
  sculpture.addEventListener('pointerleave', resetParallax);
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-paused', document.hidden || motionPaused);
  });

  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    beginLoading();
    window.addEventListener('load', finishLoading, { once: true });
  }
})();
