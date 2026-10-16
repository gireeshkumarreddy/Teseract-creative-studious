/* Client project videos. Dormant: does nothing until a page contains [data-video] (scripts/lib.py video(),
   fed by scripts/media-manifest.json - see MEDIA-GUIDE.md). Markup:
     <video class="media-video" muted playsinline loop preload="none" poster="..." data-video
            data-srcs='[{"w":640,"src":"..."},{"w":1280,"src":"..."}]'></video>
   - Picks the smallest variant at least as wide as the element x devicePixelRatio (DPR capped at 2), else the
     largest, and sets src only when the video comes within ~300px of the viewport. Hero gallery tiles
     ([data-ticker]) wait until they are 25% visible: the tiles that only drift through the strip of gallery under
     the hero copy never start a download. Their DPR counts up to 2.75: a 3x phone at 430 px or in landscape takes
     the 640 rung, one at 390 px keeps the 480 (drawn at most ~1.09x, 3 / 2.75).
   - data-poster (lib.video lazy posters, JSON like data-srcs: the hero tiles, whose columns are display:none at
     some widths): the poster for the element's width x DPR is set only once the element is rendered (on register,
     after a ticker rebuild, on resize), as browsers fetch a poster attribute even for a hidden element.
   - Plays while at least 25% visible; pauses off-screen and whenever the tab is hidden.
   - Held (never plays) inside [inert] (inactive Idea slides) or [data-video-hold] (motion paused).
   - Reduced motion or Save-Data: never loads or autoplays - the poster stays.
   - Pause control (WCAG 2.2.2): every looping clip outside a section with its own control (the hero gallery's
     tickers, the Idea laptop, a [data-motion-scope]) gets a pause / play toggle in the top-right corner of its
     frame (.video-ctl, 06-video.css; right after the link when the frame sits in one - a Work card - as a button
     may not be inside a link). The choice holds for the tab (sessionStorage 'ts-video-hold'): a visitor who
     paused a clip finds the next pages' clips paused too. Hidden under reduced motion (nothing plays).
   - Autoplay refused (iOS Low Power Mode, a browser's no-autoplay setting) or Save-Data: the frame gets
     .is-blocked and its control turns into a "Play" pill; the tap starts the clip (a gesture may). A clip in a
     section with its own control fires 'ts:videoblocked' (bubbles) for that control instead.
   - On resize a sharper variant is loaded only when the needed width grows by more than 1.5x (a hero gallery
     tile: as soon as it needs the next rung, e.g. a phone turned to landscape).
   API: TS.observeVideos(root) registers videos in inserted content (e.g. ticker clones);
        TS.syncVideos(root) re-applies play/pause after a hold changed (slideshow, pause buttons);
        TS.preloadVideo(v) sets the src of a held video ahead of time (the next slideshow clip), never plays it;
        TS.playVideo(v) plays v from a tap (call it inside the click: it clears a refused autoplay and is allowed
        under Save-Data); returns a promise of true once it plays, false if it was refused again. */
(() => {
  'use strict';
  const TS = window.TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const state = new WeakMap();
  const live = new Set();
  const ctl = new WeakMap(), ctlVideo = new WeakMap();      // video <-> its pause / play control
  const OWN_CONTROL = '[data-ticker],[data-idea-screen],[data-motion-scope]';   // sections that pause their clips themselves
  const HOLD_KEY = 'ts-video-hold';
  let near = null, seen = null, booted = false;

  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const quiet = () => reducedMQ.matches || saveData();
  const tile = v => !!v.closest('[data-ticker]');          // a hero gallery tile (480 / 640 rungs)
  const dpr = v => Math.min(tile(v) ? 2.75 : 2, window.devicePixelRatio || 1);
  const held = v => !!v.closest('[inert],[data-video-hold]');
  const need = v => (v.clientWidth || (v.parentElement && v.parentElement.clientWidth) || +v.getAttribute('width') || 0) * dpr(v);
  const pick = (srcs, px) => srcs.find(s => s.w >= px) || srcs[srcs.length - 1];
  const list = json => { try { return JSON.parse(json || '[]').filter(s => s && s.src && s.w > 0).sort((a, b) => a.w - b.w); } catch (e) { return []; } };
  const stored = () => { try { return sessionStorage.getItem(HOLD_KEY) === '1'; } catch (e) { return false; } };
  const store = on => { try { if (on) sessionStorage.setItem(HOLD_KEY, '1'); else sessionStorage.removeItem(HOLD_KEY); } catch (e) { /* storage blocked */ } };

  function drop(v) {
    live.delete(v);
    if (near) near.unobserve(v);
    if (seen) seen.unobserve(v);
  }

  function load(v, st) {
    if (st.cur || st.failed || !st.srcs.length) return;
    const px = need(v);
    const s = pick(st.srcs, px);
    st.cur = s.w;
    st.need = px;
    v.dataset.videoW = s.w;
    v.preload = 'metadata';
    v.src = s.src;
    if (near) near.unobserve(v);
  }

  function poster(v) {
    if (v.getAttribute('poster') || !v.dataset.poster || !v.getClientRects().length) return;
    const ps = list(v.dataset.poster);
    if (ps.length) v.poster = pick(ps, need(v)).src;
  }

  // A refused play() (not an AbortError: a pause() or a new src interrupted it) keeps the poster; the control
  // offers "Play", a section with its own control hears about it.
  function block(v, st, err) {
    if (err && err.name === 'AbortError') return;
    st.blocked = true;
    paint(v);
    v.dispatchEvent(new CustomEvent('ts:videoblocked', { bubbles: true }));
  }

  function apply(v) {
    const st = state.get(v);
    if (!st) return;
    const go = st.visible && v.isConnected && !document.hidden && !st.blocked && !st.failed && !held(v)
      && !reducedMQ.matches && (!saveData() || st.user);
    if (go) {
      load(v, st);
      if (v.paused && st.cur) {
        v.muted = true;                                    // autoplay is only allowed muted
        const p = v.play();
        if (p && p.catch) p.catch(err => block(v, st, err));
      }
    } else if (!v.paused) v.pause();
  }

  /* ---------- pause / play control */
  function paint(v) {
    const b = ctl.get(v), st = state.get(v);
    const frame = v.closest('figure') || v.parentElement;
    if (frame && st) frame.classList.toggle('is-blocked', !!st.blocked && !st.failed);
    if (!b || !st) return;
    const blocked = st.blocked && !st.failed;
    const paused = v.hasAttribute('data-video-hold');
    b.hidden = reducedMQ.matches || st.failed;             // nothing plays under reduced motion; a missing file keeps its poster
    b.classList.toggle('is-blocked', blocked);
    b.classList.toggle('is-paused', paused && !blocked);
    if (blocked) b.removeAttribute('aria-pressed'); else b.setAttribute('aria-pressed', String(paused));
    b.lastChild.textContent = (blocked ? 'Play the video' : 'Pause the video') + (st.name ? ' — ' + st.name : '');
  }

  function addControl(v, st) {
    if (ctl.has(v) || !v.loop || v.closest(OWN_CONTROL)) return;
    const frame = v.closest('figure') || v.parentElement;
    let out = null;                                        // the outermost link / hidden duplicate around the frame
    for (let n = frame; n && n !== document.body; n = n.parentElement) if (n.matches('a[href],[aria-hidden="true"]')) out = n;
    const host = out ? out.parentElement : frame;
    if (!host) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'video-ctl';
    b.innerHTML = '<span class="video-ctl__ic" aria-hidden="true"><i></i><i></i></span>'
      + '<span class="video-ctl__txt" aria-hidden="true">Play</span><span class="sr-only"></span>';
    st.name = v.dataset.videoName || '';
    if (stored()) v.setAttribute('data-video-hold', '');   // paused on an earlier page of this tab
    host.classList.add('has-video-ctl');
    if (out) out.after(b);
    else host.insertBefore(b, host.querySelector(':scope > figcaption'));   // a figcaption stays the figure's last child
    ctl.set(v, b);
    ctlVideo.set(b, v);
    paint(v);
  }

  function onControl(e) {
    const b = e.target.closest && e.target.closest('.video-ctl');
    const v = b && ctlVideo.get(b);
    const st = v && state.get(v);
    if (!st) return;
    if (st.blocked || v.hasAttribute('data-video-hold')) {     // play, inside the tap
      v.removeAttribute('data-video-hold');
      store(false);
      TS.playVideo(v);
    } else {
      v.setAttribute('data-video-hold', '');
      store(true);
      apply(v);
    }
    paint(v);
  }

  function sharpen() {
    live.forEach(v => {
      if (!v.isConnected) { drop(v); return; }
      poster(v);                                           // a column shown at the new width gets its posters
      const st = state.get(v);
      if (!st || !st.cur || st.failed) return;
      const px = need(v);
      if (px <= st.need * (tile(v) ? 1 : 1.5)) return;    // a tile's rungs are small: take the next one as soon as it is needed
      st.need = px;
      const s = pick(st.srcs, px);
      if (s.w <= st.cur) return;
      const t = v.currentTime;
      st.cur = s.w;
      v.dataset.videoW = s.w;
      v.src = s.src;                                       // resets to paused; apply() resumes it where it was
      if (t) v.addEventListener('loadedmetadata', () => { try { v.currentTime = v.duration ? t % v.duration : t; } catch (e) { /* ignore */ } }, { once: true });
      apply(v);
    });
  }

  function boot() {
    if (booted) return true;
    if (!('IntersectionObserver' in window)) return false;          // very old browsers: poster only
    booted = true;
    near = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target, st = state.get(v);
      if (!v.isConnected) { drop(v); return; }
      if (st && en.isIntersecting && !quiet() && !held(v)) load(v, st);
    }), { rootMargin: '300px 0px' });
    seen = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target, st = state.get(v);
      if (!st) return;
      if (!v.isConnected) { drop(v); return; }
      if (en.isIntersecting) poster(v);
      st.visible = en.isIntersecting && en.intersectionRatio >= 0.249;
      apply(v);
    }), { threshold: [0, 0.25] });
    document.addEventListener('visibilitychange', () => live.forEach(apply));
    document.addEventListener('click', onControl);
    const onReduced = () => live.forEach(v => { apply(v); paint(v); });
    if (reducedMQ.addEventListener) reducedMQ.addEventListener('change', onReduced); else if (reducedMQ.addListener) reducedMQ.addListener(onReduced);
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sharpen, 250); }, { passive: true });
    return true;
  }

  function register(v) {
    if (state.has(v)) return;
    const srcs = list(v.dataset.srcs);                     // bad data: poster only
    const st = { srcs, cur: +v.dataset.videoW || 0, need: 0, visible: false, blocked: false, failed: false, user: false, name: '' };
    st.need = st.cur;                                      // a ticker clone of an already loaded video keeps its variant
    state.set(v, st);
    live.add(v);
    v.muted = true;
    v.addEventListener('error', () => { st.failed = true; paint(v); }, { once: true });   // missing/unsupported file: poster stays
    v.addEventListener('playing', () => { if (st.blocked) { st.blocked = false; paint(v); } });
    poster(v);
    if (!st.cur && !tile(v)) near.observe(v);
    seen.observe(v);
    if (v.hasAttribute('data-video-eager') && !quiet()) load(v, st);
    addControl(v, st);
    if (saveData() && !reducedMQ.matches) block(v, st);    // Save-Data: nothing loads until the visitor asks for it
  }

  TS.observeVideos = root => {
    const scope = root || document;
    const found = [...(scope.matches && scope.matches('[data-video]') ? [scope] : []), ...scope.querySelectorAll('[data-video]')];
    if (!found.length) return;
    if (!boot()) { found.forEach(poster); return; }        // very old browsers: the posters only
    found.forEach(register);
    live.forEach(poster);                                  // a ticker rebuilt at a new width: its originals are rendered now
  };

  TS.preloadVideo = v => {
    const st = v && state.get(v);
    if (st && !quiet()) load(v, st);
  };

  TS.syncVideos = root => {
    if (!booted) return;
    live.forEach(v => { if (!root || root === v || (root.contains && root.contains(v))) apply(v); });
  };

  TS.playVideo = v => {
    const st = v && state.get(v);
    if (!st || st.failed || held(v)) return Promise.resolve(false);
    st.blocked = false;
    st.user = true;                                        // the visitor asked: Save-Data no longer holds this clip
    load(v, st);
    v.muted = true;
    const p = v.play();
    paint(v);
    return Promise.resolve(p).then(() => true, err => { block(v, st, err); return false; });
  };

  ready(() => { if (document.querySelector('[data-video]')) TS.observeVideos(document); });
})();
