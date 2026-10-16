/* TESERACT — generated from src/js. Edit the partials, not this file. */

/* ---- 00-vendor-lenis.js ---- */
/*! lenis 1.1.20 | MIT License | https://github.com/darkroomengineering/lenis — vendored, wrapped to avoid leaking globals other than Lenis */
(function(){
function t(t,i,e){return Math.max(t,Math.min(i,e))}var i=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(i){if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=i;const s=t(0,this.currentTime/this.duration,1);e=s>=1;const o=e?1:this.easing(s);this.value=this.from+(this.to-this.from)*o}else this.lerp?(this.value=function(t,i,e,s){return function(t,i,e){return(1-e)*t+e*i}(t,i,1-Math.exp(-e*s))}(this.value,this.to,60*this.lerp,i),Math.round(this.value)===this.to&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),this.onUpdate?.(this.value,e)}stop(){this.isRunning=!1}fromTo(t,i,{lerp:e,duration:s,easing:o,onStart:n,onUpdate:r}){this.from=this.value=t,this.to=i,this.lerp=e,this.duration=s,this.easing=o,this.currentTime=0,this.isRunning=!0,n?.(),this.onUpdate=r}};var e=class{constructor(t,i,{autoResize:e=!0,debounce:s=250}={}){this.wrapper=t,this.content=i,e&&(this.debouncedResize=function(t,i){let e;return function(...s){let o=this;clearTimeout(e),e=setTimeout((()=>{e=void 0,t.apply(o,s)}),i)}}(this.resize,s),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize,!1):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize,!1)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},s=class{events={};emit(t,...i){let e=this.events[t]||[];for(let t=0,s=e.length;t<s;t++)e[t]?.(...i)}on(t,i){return this.events[t]?.push(i)||(this.events[t]=[i]),()=>{this.events[t]=this.events[t]?.filter((t=>i!==t))}}off(t,i){this.events[t]=this.events[t]?.filter((t=>i!==t))}destroy(){this.events={}}},o=100/6,n={passive:!1},r=class{constructor(t,i={wheelMultiplier:1,touchMultiplier:1}){this.element=t,this.options=i,window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,n),this.element.addEventListener("touchstart",this.onTouchStart,n),this.element.addEventListener("touchmove",this.onTouchMove,n),this.element.addEventListener("touchend",this.onTouchEnd,n)}touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new s;on(t,i){return this.emitter.on(t,i)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize,!1),this.element.removeEventListener("wheel",this.onWheel,n),this.element.removeEventListener("touchstart",this.onTouchStart,n),this.element.removeEventListener("touchmove",this.onTouchMove,n),this.element.removeEventListener("touchend",this.onTouchEnd,n)}onTouchStart=t=>{const{clientX:i,clientY:e}=t.targetTouches?t.targetTouches[0]:t;this.touchStart.x=i,this.touchStart.y=e,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:t})};onTouchMove=t=>{const{clientX:i,clientY:e}=t.targetTouches?t.targetTouches[0]:t,s=-(i-this.touchStart.x)*this.options.touchMultiplier,o=-(e-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=i,this.touchStart.y=e,this.lastDelta={x:s,y:o},this.emitter.emit("scroll",{deltaX:s,deltaY:o,event:t})};onTouchEnd=t=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:t})};onWheel=t=>{let{deltaX:i,deltaY:e,deltaMode:s}=t;i*=1===s?o:2===s?this.window.width:1,e*=1===s?o:2===s?this.window.height:1,i*=this.options.wheelMultiplier,e*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:i,deltaY:e,event:t})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},Lenis=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;__rafID=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new i;emitter=new s;dimensions;virtualScroll;constructor({wrapper:t=window,content:i=document.documentElement,eventsTarget:s=t,smoothWheel:o=!0,syncTouch:n=!1,syncTouchLerp:l=.075,touchInertiaMultiplier:h=35,duration:a,easing:c=t=>Math.min(1,1.001-Math.pow(2,-10*t)),lerp:p=.1,infinite:d=!1,orientation:u="vertical",gestureOrientation:m="vertical",touchMultiplier:v=1,wheelMultiplier:S=1,autoResize:w=!0,prevent:g,virtualScroll:f,overscroll:y=!0,autoRaf:E=!1,anchors:T=!1,__experimental__naiveDimensions:z=!1}={}){window.lenisVersion="1.1.20",t&&t!==document.documentElement||(t=window),this.options={wrapper:t,content:i,eventsTarget:s,smoothWheel:o,syncTouch:n,syncTouchLerp:l,touchInertiaMultiplier:h,duration:a,easing:c,lerp:p,infinite:d,gestureOrientation:m,orientation:u,touchMultiplier:v,wheelMultiplier:S,autoResize:w,prevent:g,virtualScroll:f,overscroll:y,autoRaf:E,anchors:T,__experimental__naiveDimensions:z},this.dimensions=new e(t,i,{autoResize:w}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.addEventListener("click",this.onClick,!1),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown,!1),this.virtualScroll=new r(s,{touchMultiplier:v,wheelMultiplier:S}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown,!1),this.options.anchors&&this.options.wrapper===window&&this.options.wrapper.removeEventListener("click",this.onClick,!1),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this.__rafID&&cancelAnimationFrame(this.__rafID)}on(t,i){return this.emitter.on(t,i)}off(t,i){return this.emitter.off(t,i)}onScrollEnd=t=>{t instanceof CustomEvent||"smooth"!==this.isScrolling&&!1!==this.isScrolling||t.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};setScroll(t){this.isHorizontal?this.options.wrapper.scrollTo({left:t,behavior:"instant"}):this.options.wrapper.scrollTo({top:t,behavior:"instant"})}onClick=t=>{const i=t.composedPath().find((t=>t instanceof HTMLAnchorElement&&t.getAttribute("href")?.startsWith("#")));if(i){const t=i.getAttribute("href");if(t){const i="object"==typeof this.options.anchors&&this.options.anchors?this.options.anchors:void 0;this.scrollTo(t,i)}}};onPointerDown=t=>{1===t.button&&this.reset()};onVirtualScroll=t=>{if("function"==typeof this.options.virtualScroll&&!1===this.options.virtualScroll(t))return;const{deltaX:i,deltaY:e,event:s}=t;if(this.emitter.emit("virtual-scroll",{deltaX:i,deltaY:e,event:s}),s.ctrlKey)return;if(s.lenisStopPropagation)return;const o=s.type.includes("touch"),n=s.type.includes("wheel");this.isTouching="touchstart"===s.type||"touchmove"===s.type;const r=0===i&&0===e;if(this.options.syncTouch&&o&&"touchstart"===s.type&&r&&!this.isStopped&&!this.isLocked)return void this.reset();const l="vertical"===this.options.gestureOrientation&&0===e||"horizontal"===this.options.gestureOrientation&&0===i;if(r||l)return;let h=s.composedPath();h=h.slice(0,h.indexOf(this.rootElement));const a=this.options.prevent;if(h.find((t=>t instanceof HTMLElement&&("function"==typeof a&&a?.(t)||t.hasAttribute?.("data-lenis-prevent")||o&&t.hasAttribute?.("data-lenis-prevent-touch")||n&&t.hasAttribute?.("data-lenis-prevent-wheel")))))return;if(this.isStopped||this.isLocked)return void s.preventDefault();if(!(this.options.syncTouch&&o||this.options.smoothWheel&&n))return this.isScrolling="native",this.animate.stop(),void(s.lenisStopPropagation=!0);let c=e;"both"===this.options.gestureOrientation?c=Math.abs(e)>Math.abs(i)?e:i:"horizontal"===this.options.gestureOrientation&&(c=i),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&(this.animatedScroll>0&&this.animatedScroll<this.limit||0===this.animatedScroll&&e>0||this.animatedScroll===this.limit&&e<0))&&(s.lenisStopPropagation=!0),s.preventDefault();const p=o&&this.options.syncTouch,d=o&&"touchend"===s.type&&Math.abs(c)>5;d&&(c=this.velocity*this.options.touchInertiaMultiplier),this.scrollTo(this.targetScroll+c,{programmatic:!1,...p?{lerp:d?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(null!==this._resetVelocityTimeout&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent)this._preventNextNativeScrollEvent=!1;else if(!1===this.isScrolling||"native"===this.isScrolling){const t=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-t,this.direction=Math.sign(this.animatedScroll-t),this.isStopped||(this.isScrolling="native"),this.emit(),0!==this.velocity&&(this._resetVelocityTimeout=setTimeout((()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()}),400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){this.isStopped&&(this.reset(),this.isStopped=!1)}stop(){this.isStopped||(this.reset(),this.isStopped=!0)}raf=t=>{const i=t-(this.time||t);this.time=t,this.animate.advance(.001*i),this.options.autoRaf&&(this.__rafID=requestAnimationFrame(this.raf))};scrollTo(i,{offset:e=0,immediate:s=!1,lock:o=!1,duration:n=this.options.duration,easing:r=this.options.easing,lerp:l=this.options.lerp,onStart:h,onComplete:a,force:c=!1,programmatic:p=!0,userData:d}={}){if(!this.isStopped&&!this.isLocked||c){if("string"==typeof i&&["top","left","start"].includes(i))i=0;else if("string"==typeof i&&["bottom","right","end"].includes(i))i=this.limit;else{let t;if("string"==typeof i?t=document.querySelector(i):i instanceof HTMLElement&&i?.nodeType&&(t=i),t){if(this.options.wrapper!==window){const t=this.rootElement.getBoundingClientRect();e-=this.isHorizontal?t.left:t.top}const s=t.getBoundingClientRect();i=(this.isHorizontal?s.left:s.top)+this.animatedScroll}}if("number"==typeof i){if(i+=e,i=Math.round(i),this.options.infinite?p&&(this.targetScroll=this.animatedScroll=this.scroll):i=t(0,i,this.limit),i===this.targetScroll)return h?.(this),void a?.(this);if(this.userData=d??{},s)return this.animatedScroll=this.targetScroll=i,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),a?.(this),this.userData={},void requestAnimationFrame((()=>{this.dispatchScrollendEvent()}));p||(this.targetScroll=i),this.animate.fromTo(this.animatedScroll,i,{duration:n,easing:r,lerp:l,onStart:()=>{o&&(this.isLocked=!0),this.isScrolling="smooth",h?.(this)},onUpdate:(t,i)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=t-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=t,this.setScroll(this.scroll),p&&(this.targetScroll=t),i||this.emit(),i&&(this.reset(),this.emit(),a?.(this),this.userData={},requestAnimationFrame((()=>{this.dispatchScrollendEvent()})),this.preventNextNativeScrollEvent())}})}}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame((()=>{this._preventNextNativeScrollEvent=!1}))}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.__experimental__naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return"horizontal"===this.options.orientation}get actualScroll(){const t=this.options.wrapper;return this.isHorizontal?t.scrollX??t.scrollLeft:t.scrollY??t.scrollTop}get scroll(){return this.options.infinite?(t=this.animatedScroll,i=this.limit,(t%i+i)%i):this.animatedScroll;var t,i}get progress(){return 0===this.limit?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(t){this._isScrolling!==t&&(this._isScrolling=t,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(t){this._isStopped!==t&&(this._isStopped=t,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(t){this._isLocked!==t&&(this._isLocked=t,this.updateClassName())}get isSmooth(){return"smooth"===this.isScrolling}get className(){let t="lenis";return this.isStopped&&(t+=" lenis-stopped"),this.isLocked&&(t+=" lenis-locked"),this.isScrolling&&(t+=" lenis-scrolling"),"smooth"===this.isScrolling&&(t+=" lenis-smooth"),t}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}};globalThis.Lenis=Lenis,globalThis.Lenis.prototype=Lenis.prototype;
})();

/* ---- 01-intro.js ---- */
/* Intro logo animation: beat 4 (the lockup's FLIP flight into the live header logo, the stage lift, the handover),
   the pointer light and the skip (owner, 14 Oct). Beats 1-3 are pure CSS (04-intro.css); markup: scripts/chrome_intro.py.
   Runs only when the inline <head> script (chrome.py) added html.ts-intro: once per tab session, never on internal
   navigations, never under reduced motion / Save-Data / forced colours. ?intro=1 replays it, ?intro=0 suppresses it.
   - Skip: click/tap, any key, wheel, touch-move or a scroll fast-forwards to the header landing in <= 350 ms.
   - Scroll is held only while it plays, by intercepting wheel / touch / scroll keys (never overflow:hidden,
     TS.lockScroll or lenis.stop(): those drop the Windows scrollbar and shift the header the lockup flies into).
   - Hand-off: TS.afterIntro(fn) runs fn as the stage lifts (immediately when there is no intro); 'ts:intro-done'
     fires then, 'ts:intro-end' once the overlay is gone. Section scripts hold their entrances with it.
   Loaded before 02-core.js, so its input listeners run before Lenis and the section scripts see the events. */
(() => {
  'use strict';
  const root = document.documentElement, body = document.body;
  const TS = window.TS = window.TS || {};
  const ov = document.querySelector('[data-intro]');
  const CUE = 2260;                 // end of the CSS beats (the .tsi__cue animation): beat 4 starts here
  /* Owner-tunable feel. CSS: echo trail .26, lock glint .5, light pool alpha .10 (04-intro.css). */
  const TILT_Y = 10, TILT_X = 7, TORCH_TILT = 0.8, SHADE = 0.32, LERP_LIGHT = 0.12, LERP_TORCH = 0.3, LERP_TILT = 0.1;

  let state = 'off', flushed = false, skipped = false, raf = 0, armed = false, locked = true;
  const queue = [], timers = [], offs = [], anims = [];
  const fire = n => document.dispatchEvent(new CustomEvent(n, { detail: { skipped } }));
  function flush(lift) {
    if (flushed) return;
    flushed = true;
    if (lift) root.classList.add('tsi-lift');
    body.removeAttribute('data-video-hold');
    queue.splice(0).forEach(fn => { try { fn(); } catch (e) { setTimeout(() => { throw e; }); } });
    if (TS.syncVideos) TS.syncVideos(body);
    fire('ts:intro-done');
  }
  TS.afterIntro = fn => { if (state === 'off' || flushed) fn(); else queue.push(fn); };
  let skipFn = () => {};
  TS.intro = { active: () => state !== 'off' && state !== 'done', held: () => state !== 'off' && !flushed, skip: () => skipFn() };
  // the <head> script's pre-JS skip listener (and the one that drops it once the CSS failsafe exit begins, so input
  // after that exit never re-arms .tsi-skip and blinks the header logo / restarts the H1 rise when app.js is missing)
  const headK = window.__tsiK, headF = window.__tsiF;
  const dropHead = () => {
    if (headK) ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(t => removeEventListener(t, headK, true));
    if (headF) removeEventListener('animationstart', headF, true);
  };
  const CLASSES = ['ts-intro', 'tsi-go', 'tsi-js', 'tsi-wait', 'tsi-skip', 'tsi-lift', 'tsi-landed'];
  if (!ov || !root.classList.contains('ts-intro')) { if (ov) ov.remove(); root.classList.remove(...CLASSES); dropHead(); return; }
  // app.js is one file: an exception here must never stop the partials after it, nor leave the stage up
  try { boot(); } catch (err) {
    state = 'done';
    try { flush(true); } finally {
      timers.forEach(clearTimeout); cancelAnimationFrame(raf); offs.forEach(f => f()); dropHead();
      root.classList.remove(...CLASSES); ov.remove();
    }
    setTimeout(() => { throw err; });
  }

  function boot() {
    const $ = s => ov.querySelector(s);
    const cue = $('.tsi__cue');
    const cueAnim = cue && cue.getAnimations && cue.getAnimations().find(a => a.animationName === 'tsi-cue');
    state = 'play';
    body.setAttribute('data-video-hold', '');           // 06-video.js: no clip loads or plays under the stage
    if (!cueAnim) { end(false); return; }
    const clock = () => (cueAnim.currentTime == null ? 0 : +cueAnim.currentTime);
    const t0 = clock(), pre = root.classList.contains('tsi-skip'), since = pre ? performance.now() - (window.__tsiT || 0) : 0;
    if (t0 >= 4300 || since >= 550) {                   // very late script: the CSS exit already owns the overlay
      state = 'css'; dropHead();
      const at = since >= 550 ? Math.max(0, 600 - since) : Math.max(0, 4400 - t0);
      timers.push(setTimeout(() => flush(false), at));
      timers.push(setTimeout(() => { state = 'done'; ov.remove(); fire('ts:intro-end'); }, at + 560));
      return;                                           // html classes stay, so the hero H1 animation never restarts
    }
    root.classList.add('tsi-js');
    dropHead();

    const veil = $('.tsi__veil'), tail = $('.tsi__tail'), light = $('.tsi__light'), lock = $('.tsi__lock'), tilt = $('.tsi__tilt');
    const fxM = $('.tsi__fx--mark'), fxW = $('.tsi__fx--word');
    const fyM = fxM && fxM.querySelector('.tsi__fy'), fyW = fxW && fxW.querySelector('.tsi__fy');
    const brand = document.querySelector('.hdr-brand');
    const hMark = brand && brand.querySelector('.hdr-brand__mark'), hWord = brand && brand.querySelector('.hdr-brand__word');
    if (!veil || !tail || !light || !lock || !tilt || !fyM || !fyW) { end(false); return; }
    const cs = getComputedStyle(root);
    const tok = (name, fallback) => (cs.getPropertyValue(name) || '').trim() || fallback;
    const EASE = tok('--ease', 'cubic-bezier(.22,1,.36,1)'), EX = tok('--ease-fly-x', 'cubic-bezier(.62,0,.18,1)'),
      EY = tok('--ease-fly-y', 'cubic-bezier(.4,0,.1,1)'), ELIFT = tok('--ease-lift', 'cubic-bezier(.7,0,.2,1)');
    const fineMQ = matchMedia('(hover: hover) and (pointer: fine)'), phoneMQ = matchMedia('(max-width: 799.98px)'),
      reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
    const facets = [...ov.querySelectorAll('.tsi__ring .tsi__sh')].map(sh => ({ el: sh.querySelector('.tsi__shade'), n: (sh.dataset.n || '0,0').split(',').map(Number), v: 0 }))
      .filter(f => f.el);
    // The one layout read of the loop: the lockup is centred, and so is the solo mark (its dock offset puts it there).
    const L0 = lock.getBoundingClientRect(), OX = ov.clientWidth / 2, OY = ov.clientHeight / 2;
    const ka = parseFloat(getComputedStyle(ov).getPropertyValue('--ka')) || 1.5;
    const CX = L0.left + L0.width / 2, CY = L0.top + L0.height / 2, R = 0.75 * fxM.offsetWidth * ka;
    const w0 = innerWidth, y0 = scrollY;
    let px = CX, py = CY, lx = CX, ly = CY, rx = 0, ry = 0, hasPointer = false, torch = null, last = 0;
    let L1 = null, from = null, to = null;            // flight: lock rect, source rects, header rects at take-off

    /* ---------- curves: smoothstep envelope, frame-rate independent lerp, a JS mirror of the tsi-spin keyframes */
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const envAt = t => smooth(250, 600, t) * (1 - smooth(1850, 2200, t));
    const lerpK = (x, dt) => 1 - Math.pow(1 - x, dt / 16.7);
    const clamp1 = v => Math.max(-1, Math.min(1, v));
    const bezier = (x1, y1, x2, y2) => x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, u = x;
      for (let i = 0; i < 24; i++) {
        u = (lo + hi) / 2;
        if (3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u < x) lo = u; else hi = u;
      }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
    const spinA = bezier(0.65, 0, 0.35, 1), spinB = bezier(0.22, 1, 0.36, 1);
    const spinAt = t => {                               // tsi-spin: 920 ms + 700 ms, 120deg -> -3deg (84%) -> 0
      const p = (t - 920) / 700;
      if (p <= 0) return 120;
      if (p >= 1) return 0;
      return p < 0.84 ? 120 - 123 * spinA(p / 0.84) : -3 + 3 * spinB((p - 0.84) / 0.16);
    };
    // Beat 3 complete (the 3D is flat again, every letter is in): swap in the plain single-SVG copies, which fly.
    const flatten = () => ov.classList.add('is-flat');
    const setRate = (a, r) => { try { if (a.updatePlaybackRate) a.updatePlaybackRate(r); else a.playbackRate = r; } catch (e) { /* ignore */ } };

    /* ---------- input: listeners on window, capture phase (before Lenis and the section scripts) */
    const on = (type, fn, opts, target = window) => { target.addEventListener(type, fn, opts); offs.push(() => target.removeEventListener(type, fn, opts)); };
    const CAP = { capture: true, passive: true }, CAPX = { capture: true, passive: false };
    on('pointermove', e => {
      if (e.pointerType === 'touch') {                  // a held finger is a torch; dragging it launches the intro
        if (!torch || e.pointerId !== torch.id) return;
        px = e.clientX; py = e.clientY;
        if (Math.hypot(px - torch.x, py - torch.y) > 8) skip();
        return;
      }
      px = e.clientX; py = e.clientY;
      if (e.pointerType === 'pen' || fineMQ.matches) hasPointer = true;
      kick();
    }, CAP);
    on('pointerdown', e => {
      if (e.pointerType === 'touch' && state === 'play' && armed) {
        torch = { id: e.pointerId, x: e.clientX, y: e.clientY };
        px = e.clientX; py = e.clientY;
        kick();
        return;
      }
      skip();
    }, CAP);
    const release = e => { if (e.pointerType === 'touch') { torch = null; skip(); } };
    on('pointerup', release, CAP);
    on('pointercancel', release, CAP);
    on('touchmove', e => { if (locked && e.cancelable) e.preventDefault(); }, CAPX);
    on('wheel', e => {
      if (locked && !e.ctrlKey) { e.preventDefault(); e.stopImmediatePropagation(); }   // never blocks ctrl-zoom
      skip();
    }, CAPX);
    on('keydown', e => {
      if (/^(Shift|Control|Alt|Meta|CapsLock|Fn|OS)$/.test(e.key)) return;
      // Tab is never prevented: it skips and focus lands on "Skip to content"
      if (locked && /^( |Spacebar|PageUp|PageDown|Home|End|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(e.key)) e.preventDefault();
      skip();
    }, true);
    on('scroll', () => { if (Math.abs(scrollY - y0) > 2) skip(); }, { passive: true });   // scrollbar drag, programmatic scroll
    on('resize', () => { if (innerWidth !== w0) end(true); });
    on('pageshow', e => { if (e.persisted) end(false); });
    on('visibilitychange', () => {
      if (document.visibilityState === 'visible') arm();
      else if (armed) end(false);
    }, false, document);
    const onReduce = () => { if (reducedMQ.matches) end(true); };
    if (reducedMQ.addEventListener) on('change', onReduce, false, reducedMQ);

    /* ---------- timeline */
    function arm() {
      if (armed || state !== 'play' || document.visibilityState !== 'visible') return;
      armed = true;
      timers.push(setTimeout(() => end(true), 5500));                                     // watchdog
      cueAnim.finished.then(() => { flatten(); fly(false); }, () => {});
      const backup = () => { if (state !== 'play') return; if (clock() >= CUE) fly(false); else timers.push(setTimeout(backup, 120)); };
      timers.push(setTimeout(backup, Math.max(0, CUE - clock()) + 150));
    }

    // Fast-forward: the CSS beats finish within 160 ms (shards snap in, a quick twist, the letters flick in) while the
    // lockup already flies; the dock (the one big move inside the lockup) starts at once and glides for >= 140 ms
    // instead of being squeezed into a few frames. During the flight, whatever is left lands within 180 ms.
    function skip() {
      if (state === 'play') {
        if (!armed) return;
        skipped = true; locked = false; torch = null;
        const rate = Math.min(30, Math.max(1, (CUE - clock()) / 160));
        ov.getAnimations({ subtree: true }).forEach(a => {
          const name = a.animationName || '';
          if (name === 'tsi-failsafe') return;
          if (name.startsWith('tsi-dock')) {
            const tm = a.effect.getComputedTiming(), start = tm.delay || 0, end = tm.endTime;
            if (a.currentTime != null && a.currentTime < end) {
              if (a.currentTime < start) a.currentTime = start;        // still in its delay: the from-state, no visual jump
              setRate(a, Math.min(rate, Math.max(1, (end - a.currentTime) / 140)));
            }
            return;
          }
          setRate(a, rate);
        });
        fly(true);
      } else if (state === 'fly') {
        anims.forEach(a => {
          const end = a.effect && a.effect.getComputedTiming().endTime, cur = a.currentTime;
          if (a.playState === 'finished' || end == null || cur == null) return;
          setRate(a, Math.max(a.playbackRate, (end - cur) / 180));
        });
      }
    }

    // FLIP targets of the two pieces (.tsi__fx: X on the X curve; .tsi__fy, origin top-left: Y + scale on the Y curve).
    // The name keeps its place in the lockup while both shrink: the part of its X move that comes from the shrinking,
    // (s - 1) x its offset from the mark, rides on the scale curve, so mid-flight the lockup never comes apart.
    // d = how far the lockup itself moved since take-off (landing correction).
    const fit = (S, H, d) => ({ s: H.width / S.width, dx: H.left - (S.left + d.x), dy: H.top - (S.top + d.y) });
    const plan = (sm, sw, hm, hw, d = { x: 0, y: 0 }) => {
      const m = fit(sm, hm, d), w = fit(sw, hw, d), ax = (w.s - 1) * (sw.left - sm.left);
      return { m: { x: m.dx, ax: 0, y: m.dy, s: m.s }, w: { x: w.dx - ax, ax, y: w.dy, s: w.s } };
    };
    const fxKf = g => ({ transform: `translate3d(${g.x}px,0,0)` });
    const fyKf = g => ({ transform: `translate3d(${g.ax}px,${g.y}px,0) scale(${g.s})` });
    const ZERO = { x: 0, ax: 0, y: 0, s: 1 };
    const move = (fx, fy, a, b, duration, delay, ex, ey) => [
      fx.animate([fxKf(a), fxKf(b)], { duration, delay, easing: ex, fill: 'both' }),
      fy.animate([fyKf(a), fyKf(b)], { duration, delay, easing: ey, fill: 'both' })
    ];

    // Beat 4. FLIP from the live header logo: Y and the scale lead, X lags, so the path arcs (rises first, then glides
    // left) and lands at zero velocity; the name trails the mark by 40 ms. All reads first, then the writes.
    function fly(fast) {
      if (state !== 'play') return;
      state = 'fly'; locked = false; torch = null;
      if (!fast) flatten();
      else timers.push(setTimeout(flatten, 220));          // normally the fast-forwarded cue flattens it at ~160 ms
      const hm = hMark && hMark.getBoundingClientRect(), hw = hWord && hWord.getBoundingClientRect();
      const sm = fxM.getBoundingClientRect(), sw = fxW.getBoundingClientRect();
      L1 = lock.getBoundingClientRect();
      const vh = veil.offsetHeight, th = tail.offsetHeight;
      const header = document.querySelector('.site-header');
      const okFly = !!(hm && hw) && [hm, hw].every(r => r.width > 0 && r.bottom > 0 && r.top < innerHeight) &&
        !(header && getComputedStyle(header).visibility === 'hidden');
      if (okFly) {
        from = { m: sm, w: sw }; to = { m: hm, w: hw };
        const g = plan(sm, sw, hm, hw);
        const dur = fast ? 280 : Math.round(Math.min(580, Math.max(480, 320 + 0.5 * Math.hypot(g.m.x, g.m.y))));
        anims.push(...move(fxM, fyM, ZERO, g.m, dur, 0, EX, EY), ...move(fxW, fyW, ZERO, g.w, dur, fast ? 20 : 40, EX, EY));
      } else {                                          // no header logo on screen (e.g. a future hide-on-scroll header)
        anims.push(lock.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.92)', opacity: 0 }],
          { duration: fast ? 180 : 300, easing: EASE, fill: 'forwards' }));
      }
      anims.push(light.animate({ opacity: 0 }, { duration: fast ? 160 : 300, easing: EASE, fill: 'forwards' }));
      // the stage lifts upward; its feathered tail clears the header just before the logo lands in it
      anims.push(veil.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(0,${-(vh + th)}px,0)` }],
        { duration: fast ? 260 : (phoneMQ.matches ? 480 : 520), delay: 20, easing: ELIFT, fill: 'forwards' }));
      const marker = cue.animate({ opacity: [0, 0] }, { duration: fast ? 30 : 20, fill: 'forwards' });
      anims.push(marker);
      marker.finished.then(() => flush(true), () => {});                // the page's own entrances start as it lifts
      Promise.all(anims.map(a => a.finished)).then(() => land(okFly), () => {});
      kick();
    }

    // Landing: re-measure; if the header or the stage moved under the flight (a scrollbar appeared, a resize), one
    // 120 ms correction. Then the real header logo shows at once under the identical copy and the overlay dissolves.
    function land(okFly) {
      if (state !== 'fly') return;
      state = 'land';
      const handover = () => {
        root.classList.add('tsi-landed');
        ov.animate({ opacity: [1, 0] }, { duration: 120, easing: 'linear', fill: 'forwards' }).finished.then(() => end(false), () => end(false));
        timers.push(setTimeout(() => end(false), 400));
      };
      if (!okFly || !from) { handover(); return; }
      const hm = hMark.getBoundingClientRect(), hw = hWord.getBoundingClientRect(), L2 = lock.getBoundingClientRect();
      const moved = (a, b) => Math.abs(a.left - b.left) > 0.5 || Math.abs(a.top - b.top) > 0.5 || Math.abs(a.width - b.width) > 0.5;
      if (!moved(hm, to.m) && !moved(hw, to.w) && !moved(L2, L1)) { handover(); return; }
      const a = plan(from.m, from.w, to.m, to.w), b = plan(from.m, from.w, hm, hw, { x: L2.left - L1.left, y: L2.top - L1.top });
      const fix = [...move(fxM, fyM, a.m, b.m, 120, 0, EASE, EASE), ...move(fxW, fyW, a.w, b.w, 120, 0, EASE, EASE)];
      Promise.all(fix.map(x => x.finished)).then(handover, handover);
    }

    function end(fade) {
      if (state === 'done' || state === 'off' || state === 'css') return;
      const fin = () => {
        if (state === 'done') return;
        state = 'done';
        try { flush(true); } finally {
          timers.forEach(clearTimeout); cancelAnimationFrame(raf); raf = 0; offs.forEach(f => f());
          // one call: the hero H1's animation name must change only once (it restarted at the lift)
          root.classList.remove(...CLASSES);
          ov.remove();
          fire('ts:intro-end');
        }
      };
      if (fade && state !== 'land' && document.visibilityState === 'visible') {
        state = 'land'; locked = false;
        flush(true); root.classList.add('tsi-landed');
        ov.animate({ opacity: 0 }, { duration: 180, fill: 'forwards' }).finished.then(fin, fin);
        timers.push(setTimeout(fin, 400));
      } else fin();
    }

    /* ---------- the visitor holds the light: the pool follows the pointer (or a held finger, or an ambient sweep over
       the top of the mark), the mark tilts toward it, and each sliver darkens as a facet turned away from it.
       Style writes only; it stops once everything has settled after the take-off. */
    function frame(now) {
      raf = 0;
      if (state === 'done' || state === 'off') return;
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      const t = clock(), playing = state === 'play' && !skipped, env = playing ? envAt(t) : 0;
      const lit = playing && (torch || hasPointer);
      let tx = px, ty = py;
      if (!lit) { const a = (-30 - 120 * smooth(400, 2000, t)) * Math.PI / 180; tx = CX + R * Math.cos(a); ty = CY + R * Math.sin(a); }
      if (state === 'play') {
        const k = lerpK(torch ? LERP_TORCH : LERP_LIGHT, dt);
        lx += (tx - lx) * k; ly += (ty - ly) * k;
        light.style.transform = `translate3d(${(lx - OX).toFixed(1)}px,${(ly - OY).toFixed(1)}px,0) scale(2)`;
      }
      let tY = 0, tX = 0;
      if (playing) {
        if (lit) {
          const m = torch ? TORCH_TILT : 1;
          tY = clamp1((px - CX) / CX) * TILT_Y * m; tX = -clamp1((py - CY) / CY) * TILT_X * m;
        } else { tY = 3 * Math.sin(t / 650); tX = 2 * Math.sin(t / 830 + 1); }
        tY *= env; tX *= env;
      }
      // fast once the envelope falls (1850-2200 ms), so the tilt and facet shading are flat by take-off, where the
      // plain copies swap in (an unsettled shade would brighten two slivers in one frame)
      const kt = lerpK(skipped || t > 1850 ? 0.35 : LERP_TILT, dt);
      ry += (tY - ry) * kt; rx += (tX - rx) * kt;
      tilt.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      const th = spinAt(t) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
      const Lx = lx - CX, Ly = ly - CY, Ll = Math.hypot(Lx, Ly) || 1, reach = Math.min(1, Ll / R);
      let sum = 0;
      facets.forEach(f => {
        const d = ((c * f.n[0] - s * f.n[1]) * Lx + (s * f.n[0] + c * f.n[1]) * Ly) / Ll;
        f.v += ((playing ? SHADE * env * (1 - d * reach) / 2 : 0) - f.v) * kt;
        f.el.style.opacity = f.v.toFixed(3);
        sum += f.v;
      });
      if (state === 'play' || Math.abs(rx) + Math.abs(ry) + sum > 0.01) raf = requestAnimationFrame(frame);
      else { tilt.style.transform = ''; facets.forEach(f => { f.v = 0; f.el.style.opacity = ''; }); }
    }
    function kick() { if (!raf && state !== 'done' && state !== 'off' && state !== 'css') raf = requestAnimationFrame(frame); }

    skipFn = skip;
    arm();
    raf = requestAnimationFrame(frame);
    if (pre || scrollY > 2) skip();                    // input before the script ran, or the page was already scrolled
  }
})();

/* ---- 02-core.js ---- */
/* Core runtime: smooth scroll, reveals, split headings, letter rolls, tickers, page transitions.
   Exposes window.TS for section scripts. No framework; Lenis is the only vendored library. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const TS = window.TS = window.TS || {};
  TS.reduced = () => reducedMQ.matches;
  TS.motion = () => root.classList.contains('motion') && !reducedMQ.matches;
  TS.phone = () => phoneMQ.matches;
  TS.ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn());
  // Intro logo animation (01-intro.js): entrances wait for the stage to lift; without an intro they run at once.
  TS.afterIntro = TS.afterIntro || (fn => fn());
  TS.intro = TS.intro || { active: () => false, held: () => false, skip() {} };

  /* ---------- Smooth scroll (reference: Lenis, duration 1s, desktop + tablet only) */
  function smoothScroll() {
    if (!window.Lenis || TS.reduced() || phoneMQ.matches || matchMedia('(pointer: coarse)').matches) return;
    const lenis = new window.Lenis({ duration: 1.0, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    TS.lenis = lenis;
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  TS.scrollTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el && typeof target !== 'number') return;
    if (el && el.matches && el.matches('[data-reveal]:not(.is-in)')) {
      // an unrevealed target is still offset by its --y translate: reveal it instantly before measuring
      el.style.transition = 'none'; el.classList.add('is-in'); void el.offsetHeight; el.style.transition = '';
    }
    const offset = opts.offset != null ? opts.offset : -(parseFloat(getComputedStyle(root).scrollPaddingTop) || 96);
    if (TS.lenis) TS.lenis.scrollTo(el || target, { offset, duration: opts.duration || 1.2 });
    else {
      const y = typeof target === 'number' ? target : el.getBoundingClientRect().top + scrollY + offset;
      scrollTo({ top: y, behavior: TS.reduced() ? 'auto' : 'smooth' });
    }
  };

  TS.lockScroll = on => {
    root.classList.toggle('is-locked', on);
    if (TS.lenis) on ? TS.lenis.stop() : TS.lenis.start();
  };

  /* In-page anchors use the smooth scroller and keep focus management sane. */
  function anchors() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      TS.scrollTo(el);
      history.pushState(null, '', url.hash);
      if (el.id === 'main') el.focus({ preventScroll: true });
    });
  }

  /* ---------- Split headings into words (keeps inline markup such as <em>, <s>, <br>). */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.className = 'w__i'; inner.style.setProperty('--i', i++);
            inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.matches('svg,img')) walk(child);
      });
    };
    walk(el);
  }

  /* ---------- Reveal on scroll ([data-reveal], [data-split], .reveal-image, [data-clip]) */
  function reveals() {
    document.querySelectorAll('[data-stagger]').forEach(group => {
      const step = parseFloat(group.dataset.stagger) || 80;
      const base = parseFloat(group.dataset.staggerBase) || 0;
      group.querySelectorAll('[data-reveal]').forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${base + i * step}ms`); });
    });
    const els = [...document.querySelectorAll('[data-reveal], [data-split], .reveal-image, [data-clip]')];
    if (TS.motion()) document.querySelectorAll('[data-split]').forEach(split);
    if (!TS.motion() || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const img = el.matches('.reveal-image') && el.querySelector('img');
      let done = false;
      const go = () => { if (!done) { done = true; el.classList.add('is-in'); } };
      if (img && !img.complete && img.decode) { img.decode().then(go, go); setTimeout(go, 1200); } else go();  // never wait forever on a slow image
      io.unobserve(el);
      pending.delete(el);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    const pending = new Set(els);
    // Images reveal under the intro stage (they paint at first paint: LCP unchanged); copy, headings and frames wait
    // for the stage to lift so their entrances are seen (01-intro.js; immediate without an intro).
    const isImage = el => el.matches('.reveal-image');
    els.filter(isImage).forEach(el => io.observe(el));
    const held = els.filter(el => !isImage(el));
    TS.afterIntro(() => held.forEach(el => { if (pending.has(el)) io.observe(el); }));
    TS.observeReveal = el => { pending.add(el); if (isImage(el)) io.observe(el); else TS.afterIntro(() => io.observe(el)); };
    // Keyboard users can tab into a section before it has scrolled into reveal range: reveal the
    // focused element's [data-reveal]/[data-split]/.reveal-image ancestors at once so focus rings never sit on faded controls.
    document.addEventListener('focusin', e => {
      let n = e.target;
      while (n && n !== document.body) {
        if (n.matches && n.matches('[data-reveal]:not(.is-in), [data-split]:not(.is-in), .reveal-image:not(.is-in)')) {
          n.style.setProperty('--d', '0ms'); n.classList.add('is-in'); io.unobserve(n); pending.delete(n);
        }
        n = n.parentElement;
      }
    });
    // Elements in the last few % of the page can never cross the shrunken root margin: once the page
    // is scrolled to (or cannot scroll past) its end, reveal whatever is on screen.
    let ticking = false;
    const atEnd = () => {
      ticking = false;
      if (TS.intro.held()) return;
      if (scrollY + innerHeight < document.documentElement.scrollHeight - 4) return;
      pending.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); pending.delete(el); }
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(atEnd); } }, { passive: true });
    addEventListener('load', atEnd);
    setTimeout(atEnd, 300);
    TS.afterIntro(atEnd);
  }

  /* ---------- Letter rolls on nav links and buttons (ZIP: 520ms per char, 12ms stagger) */
  function letterRolls() {
    if (!TS.motion()) return;
    document.querySelectorAll('.btn .roll, .nav-link .roll, [data-letter-roll] .roll').forEach(roll => {
      if (roll.classList.contains('has-chars')) return;
      roll.classList.add('has-chars');
      [...roll.children].forEach(line => {
        const text = line.textContent;
        line.replaceChildren(...[...text].map((ch, i) => {
          const s = document.createElement('span'); s.className = 'char'; s.style.setProperty('--i', i);
          s.textContent = ch === ' ' ? ' ' : ch; return s;
        }));
      });
    });
  }

  /* ---------- Tickers (reference Framer Ticker: WAAPI translate loop, pause off-screen, hover slow-down)
     <div data-ticker data-direction="left|right|up|down" data-speed="25" data-hover="0.8">
       <ul data-ticker-list> <li>…</li> … </ul></div> */
  function tickers() {
    document.querySelectorAll('[data-ticker]').forEach(t => {
      const list = t.querySelector('[data-ticker-list]');
      if (!list) return;
      const dir = t.dataset.direction || 'left';
      const vertical = dir === 'up' || dir === 'down';
      const forward = dir === 'down' || dir === 'right';
      const speed = parseFloat(t.dataset.speed) || 25;
      const hover = parseFloat(t.dataset.hover) || 1;
      const items = [...list.children];
      let anim = null, visible = false, hovering = false, lastSize = 0;
      const build = () => {
        list.querySelectorAll('[data-clone]').forEach(c => c.remove());
        if (!t.offsetParent || !(vertical ? t.clientHeight : t.clientWidth)) { if (anim) { anim.cancel(); anim = null; } return; } // hidden (e.g. a column off at this breakpoint): no clones, no downloads
        const gap = parseFloat(getComputedStyle(list)[vertical ? 'rowGap' : 'columnGap']) || 0;
        const first = items[0], last = items[items.length - 1];
        const start = vertical ? first.offsetTop : first.offsetLeft;
        const end = vertical ? last.offsetTop + last.offsetHeight : last.offsetLeft + last.offsetWidth;
        const setLen = end - start + gap;
        const size = vertical ? t.clientHeight : t.clientWidth;
        if (setLen <= gap) return;
        const copies = Math.max(1, Math.ceil(size / setLen) + 1);
        for (let c = 0; c < copies; c++) items.forEach(it => {
          const cl = it.cloneNode(true);
          cl.setAttribute('aria-hidden', 'true'); cl.setAttribute('data-clone', '');
          cl.querySelectorAll('a,button,[tabindex]').forEach(x => x.setAttribute('tabindex', '-1'));
          cl.querySelectorAll('img').forEach(im => im.setAttribute('loading', 'eager'));
          list.appendChild(cl);
          if (TS.observeVideos && cl.querySelector('[data-video]')) TS.observeVideos(cl);   // client video tiles (06-video.js)
          // clones are created after reveals() ran: hand their reveal targets to the observer
          [cl, ...cl.querySelectorAll('.reveal-image, [data-reveal]')].forEach(el => {
            if (!el.matches || !el.matches('.reveal-image, [data-reveal]') || el.classList.contains('is-in')) return;
            if (TS.observeReveal) TS.observeReveal(el); else el.classList.add('is-in');
          });
        });
        if (anim) anim.cancel();
        if (TS.reduced()) return;
        const prop = vertical ? 'translateY' : 'translateX';
        const from = forward ? -setLen : 0, to = forward ? 0 : -setLen;
        anim = list.animate([{ transform: `${prop}(${from}px)` }, { transform: `${prop}(${to}px)` }],
          { duration: setLen / speed * 1000, iterations: Infinity, easing: 'linear' });
        anim.playbackRate = hovering ? hover : 1;
        if (!visible) anim.pause();
      };
      const rebuild = () => {
        const s = vertical ? t.clientHeight + list.scrollWidth : t.clientWidth + list.scrollHeight;
        if (Math.abs(s - lastSize) < 2 && anim) return;
        lastSize = s; build();
      };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (anim) visible ? anim.play() : anim.pause(); }).observe(t);
      if (hover !== 1) {
        t.addEventListener('pointerenter', () => { hovering = true; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(hover) : (anim.playbackRate = hover); });
        t.addEventListener('pointerleave', () => { hovering = false; if (anim) anim.updatePlaybackRate ? anim.updatePlaybackRate(1) : (anim.playbackRate = 1); });
      }
      let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(rebuild, 120); }).observe(t);
      items.forEach(it => it.querySelectorAll('img').forEach(im => { if (!im.complete) im.addEventListener('load', () => { clearTimeout(rt); rt = setTimeout(rebuild, 120); }, { once: true }); }));
      build();
      TS.tickers = (TS.tickers || []).concat({ el: t, get anim() { return anim; } });
    });
  }

  /* ---------- Motion control (WCAG 2.2.2): one shared pause / play toggle per [data-motion-scope]
     <section data-motion-scope> … <button class="motion-toggle" data-motion-toggle hidden>…</button> …
     (markup: chrome.motion_toggle(), look: .motion-toggle in 02-components.css). Shown only while motion is on.
     "Still" pauses the scope's tickers and other script animations (re-applied when the ticker runtime resumes one
     on viewport re-entry or rebuilds it), every CSS animation inside it (.is-still, 02-components.css) and its
     client videos ([data-video-hold], 06-video.js); a 'ts:motion' event (detail.still) lets section scripts stop
     their own timers, and TS.motionStill(el) tells whether el sits in a paused scope. Play resumes only what is on
     screen (the ticker runtime starts the rest as it comes into view). */
  TS.motionStill = el => !!(el && el.closest && el.closest('[data-motion-scope].is-still'));
  TS.motionToggle = btn => {
    const scope = btn && btn.closest('[data-motion-scope]');
    if (!scope || btn.dataset.motionReady) return;
    btn.dataset.motionReady = '1';
    if (!TS.motion()) return;                       // reduced motion / no motion: nothing moves, the control stays hidden
    const label = btn.querySelector('[data-motion-label]');
    const words = { pause: label ? label.textContent : 'Pause motion', play: btn.dataset.playLabel || 'Play motion' };
    const held = new Set();                        // script animations this control paused (resumed on Play)
    const scopeTickers = () => (TS.tickers || []).filter(t => scope.contains(t.el));
    const scripted = () => (scope.getAnimations ? scope.getAnimations({ subtree: true }) : [])
      .filter(a => a.constructor === Animation);  // WAAPI only: CSS animations follow animation-play-state (.is-still)
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
    let still = false;
    const hold = () => {
      if (!still) return;
      scripted().forEach(a => { if (a.playState === 'running') { a.pause(); held.add(a); } });
    };
    const set = on => {
      still = on;
      scope.classList.toggle('is-still', on);
      btn.classList.toggle('is-still', on);
      if (label) label.textContent = on ? words.play : words.pause;
      if (scope.querySelector('[data-video]')) {    // client video tiles pause with the rest of the scope
        scope.toggleAttribute('data-video-hold', on);
        if (TS.syncVideos) TS.syncVideos(scope);
      }
      if (on) hold();
      else {
        const tickers = scopeTickers();
        tickers.forEach(t => { if (t.anim && !t.el.contains(document.activeElement) && onScreen(t.el)) t.anim.play(); });
        held.forEach(a => { if (!tickers.some(t => t.anim === a) && a.playState === 'paused') a.play(); });
        held.clear();
      }
      scope.dispatchEvent(new CustomEvent('ts:motion', { detail: { still: on } }));
    };
    btn.hidden = false;
    btn.addEventListener('click', () => set(!still));
    // the ticker runtime resumes an animation when it re-enters the viewport (its observer may run after this one,
    // so wait a frame) and replaces it when it rebuilds the clones: pause it again while still
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(() => { hold(); requestAnimationFrame(hold); });
      scopeTickers().forEach(t => io.observe(t.el));
    }
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => requestAnimationFrame(hold));
      scope.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    }
  };

  /* ---------- Page transitions (ZIP leave-shade 220ms + enter fade) */
  function pageTransitions() {
    try {
      if (sessionStorage.getItem('ts-nav') === '1' && TS.motion()) {
        root.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-entering')));
      }
      sessionStorage.removeItem('ts-nav');
    } catch (e) { /* storage blocked */ }
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || link.hasAttribute('download') || link.getAttribute('aria-disabled') === 'true') return;
      const next = new URL(link.href, location.href);
      if (!['http:', 'https:', 'file:'].includes(next.protocol) || next.origin !== location.origin || (next.pathname === location.pathname && next.hash) || next.pathname === location.pathname || !TS.motion()) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      try { sessionStorage.setItem('ts-nav', '1'); } catch (err) { /* ignore */ }
      setTimeout(() => location.assign(next.href), 240);
    });
    window.addEventListener('pageshow', ev => { if (ev.persisted) document.body.classList.remove('is-leaving'); });
  }

  /* ---------- Disabled placeholder links (unconfigured socials) */
  function disabledLinks() {
    document.addEventListener('click', e => { const a = e.target.closest('a[aria-disabled="true"]'); if (a) e.preventDefault(); });
  }

  /* ---------- Header: dark variant while a [data-nav-dark] section sits under it (reference footer behaviour) */
  function headerTone() {
    const header = document.querySelector('[data-header]');
    if (header) {
      // frosted bar behind the logo/menu button once the page has scrolled
      let raf = 0;
      const sync = () => { raf = 0; header.classList.toggle('is-scrolled', scrollY > 8); };
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
      sync();
    }
    const darks = document.querySelectorAll('[data-nav-dark]');
    if (!header || !darks.length) return;
    const state = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => state.set(en.target, en.isIntersecting));
      header.classList.toggle('is-dark', [...state.values()].some(Boolean));
    }, { rootMargin: '0px 0px -92% 0px', threshold: 0 });
    darks.forEach(d => io.observe(d));
  }

  TS.ready(() => {
    smoothScroll(); anchors(); reveals(); letterRolls(); tickers(); pageTransitions(); disabledLinks(); headerTone();
    document.querySelectorAll('[data-motion-toggle]').forEach(TS.motionToggle);   // after tickers(): TS.tickers is filled
    root.classList.add('is-ready');
  });
})();

/* ---- 05-cursor.js ---- */
/* "View Project" cursor pill. Any element with data-cursor="Label" shows a pill that trails the
   pointer (hover-capable fine pointers only). Keyboard users get the same label via the link's
   accessible name, so this is purely decorative. data-cursor-icon="drag" swaps the arrow for a
   left-right arrow (the Client Stories deck: "Drag"); a data-cursor-off element inside a
   data-cursor area hides the pill (a button that names itself); the pill shrinks while pressed. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  TS.ready && TS.ready(() => {
    if (!fine.matches) return;
    const pill = document.createElement('div');
    pill.className = 'cursor-pill';
    pill.setAttribute('aria-hidden', 'true');
    pill.innerHTML = '<span class="cursor-pill__label"></span><span class="cursor-pill__icon cursor-pill__icon--ne"><svg viewBox="0 0 16 16"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      + '<span class="cursor-pill__icon cursor-pill__icon--drag"><svg viewBox="0 0 16 16"><path d="M2.5 8h11M5 5.5 2.5 8 5 10.5M11 5.5 13.5 8 11 10.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    document.body.appendChild(pill);
    const label = pill.querySelector('.cursor-pill__label');
    let x = -200, y = -200, cx = x, cy = y, active = null, raf = 0;
    const smooth = !(TS.reduced && TS.reduced());
    const tick = () => {
      cx += (x - cx) * (smooth ? 0.2 : 1);
      cy += (y - cy) * (smooth ? 0.2 : 1);
      pill.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const move = e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    const target = el => { const t = el && el.closest && el.closest('[data-cursor],[data-cursor-off]'); return t && t.hasAttribute('data-cursor') ? t : null; };
    document.addEventListener('pointermove', e => {
      move(e);
      const t = target(e.target);
      if (t !== active) {
        active = t;
        if (t) { label.textContent = t.dataset.cursor || 'View Project'; pill.classList.toggle('is-external', t.dataset.cursorExternal === 'true'); }
        pill.classList.toggle('is-drag', !!t && t.dataset.cursorIcon === 'drag');
        pill.classList.toggle('is-on', !!t);
        document.documentElement.classList.toggle('has-cursor-pill', !!t);
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { active = null; pill.classList.remove('is-on'); }, { passive: true });
    document.addEventListener('pointerdown', () => { if (active) pill.classList.add('is-pressed'); }, { passive: true });
    ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => pill.classList.remove('is-pressed'), { passive: true }));
    window.addEventListener('scroll', () => {
      if (!active) return;
      const t = document.elementFromPoint(x, y);
      if (!target(t)) { active = null; pill.classList.remove('is-on'); }
    }, { passive: true });
  });
})();

/* ---- 06-video.js ---- */
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

/* ---- 10-menu.js ---- */
/* Menu overlay (image 3). Markup: scripts/chrome_menu.py · styles + choreography: src/css/11-menu.css.
   - Opens from any [data-menu-open]; closes via the X, Escape, or a link (page transitions in
     02-core.js take over navigation; a link to the current page just closes the menu).
   - While open: role=dialog/aria-modal, focus trapped, page siblings inert, scroll locked through
     TS.lockScroll, trigger aria-expanded + label updated. Focus returns to the trigger on close.
   - Choreography is CSS (state classes .is-open / .is-closing on .menu), so it is interruptible:
     re-opening mid-close simply reverses the running transitions.
   - Art tie-in: the "01 —" marker rolls to the hovered / focused item's index.
   - Header hand-off: the header is logo + three-line toggle. Opened from that toggle, the overlay's bar
     is anchored to it (.is-anchored + --tgl-x/--tgl-y, see 11-menu.css): the circle grows from the
     toggle, the X lands exactly where the hamburger was (the header morphs it to an X underneath via
     aria-expanded), and the circle closes back into it while focus returns to it. */
(() => {
  'use strict';
  const TS = window.TS = window.TS || {};
  const root = document.documentElement;
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !reducedMQ.matches);

  ready(() => {
    const menu = document.getElementById('site-menu');
    if (!menu || !menu.querySelector('.menu__inner')) return;
    const closeBtn = menu.querySelector('[data-menu-close]');
    const art = menu.querySelector('.menu__art');
    const num = menu.querySelector('[data-menu-num]');
    const list = menu.querySelector('.menu__list');
    const links = [...menu.querySelectorAll('.menu__link')];
    const homeIndex = Math.max(0, links.findIndex(a => a.hasAttribute('aria-current')));
    let state = 'closed';          // closed | open | closing
    let opener = null, timer = 0, inerted = [], after = null, shown = homeIndex, origin = null, anchorEl = null, openedAt = 0;

    /* ---------- helpers */
    const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');

    const strokeScale = () => {           // keep 1px hairlines at any panel scale (see CSS --k)
      if (!art) return;
      const w = art.getBoundingClientRect().width;
      if (w > 0) art.style.setProperty('--k', (900 / w).toFixed(4));
    };
    if (art && 'ResizeObserver' in window) new ResizeObserver(strokeScale).observe(art);

    const setOrigin = trigger => {        // circle reveal grows from the trigger's centre
      const vw = innerWidth, vh = innerHeight;
      if (trigger) {
        const r = trigger.getBoundingClientRect();
        origin = r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null;
      }
      const [x, y] = origin || [vw * 0.922, vh * 0.07];
      const radius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) + 8;
      menu.style.setProperty('--ox', `${x.toFixed(1)}px`);
      menu.style.setProperty('--oy', `${y.toFixed(1)}px`);
      menu.style.setProperty('--or', `${Math.ceil(radius)}px`);
    };

    /* Bar anchoring: only for a trigger in the header band (top-right), e.g. the header's three-line
       toggle. Measured after the page scroll lock, against the overlay's own client width, so the X
       sits on the toggle with or without a (compensated) scrollbar. */
    const anchor = trigger => {
      const r = trigger && trigger.getClientRects().length ? trigger.getBoundingClientRect() : null;
      const w = menu.clientWidth || innerWidth;
      if (!r || r.top > 140 || r.bottom < 0 || r.left < w * 0.5) {
        menu.classList.remove('is-anchored');
        return;
      }
      menu.style.setProperty('--tgl-x', `${(w - (r.left + r.width / 2)).toFixed(1)}px`);
      menu.style.setProperty('--tgl-y', `${(r.top + r.height / 2).toFixed(1)}px`);
      menu.classList.add('is-anchored');
    };
    const headerToggle = () => document.querySelector('.site-header [data-menu-open]') || document.querySelector('[data-menu-open]');

    const setInert = on => {
      if (on) {
        inerted = [...document.body.children].filter(el => el !== menu && !el.inert && !/^(SCRIPT|TEMPLATE|STYLE|LINK)$/.test(el.tagName));
        inerted.forEach(el => { el.inert = true; });
      } else {
        inerted.forEach(el => { el.inert = false; });
        inerted = [];
      }
    };

    const syncTriggers = open => {
      document.querySelectorAll('[data-menu-open]').forEach(t => {
        if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', String(open));
        const label = t.querySelector('.sr-only');
        if (label && /menu/i.test(label.textContent)) label.textContent = open ? 'Close menu' : 'Open menu';
        else if (t.hasAttribute('aria-label') && /menu/i.test(t.getAttribute('aria-label'))) t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    };

    const lock = on => {
      // compensate the scrollbar that overflow:hidden removes (no layout shift behind the reveal).
      // A plain inline padding, not a custom property on <html>: an inherited custom property
      // change would restyle every element of the page on the first frame.
      if (on) {
        const sbw = Math.max(0, innerWidth - root.clientWidth);
        if (sbw) root.style.paddingRight = `${sbw}px`;
        root.classList.add('menu-is-open');
      } else {
        root.classList.remove('menu-is-open');
        root.style.removeProperty('padding-right');
      }
      if (TS.lockScroll) TS.lockScroll(on);
    };

    /* ---------- pointer settle: the overlay opens under a stationary cursor (at 1440 the header
       toggle sits right where the menu's "Start a Project" pill appears). Until the mouse really
       moves (> 6px), .is-settling keeps every hover style off (CSS) and a pointer click on that
       same spot (e.g. the second click of a double-click on the toggle) is swallowed, so nothing
       flashes or navigates by accident. Hit-testing is untouched; keyboard activation (detail 0)
       always goes through. Fine pointers only: touch never sees this. */
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let settleAt = null;
    const onSettleMove = e => {
      if (!settleAt || Math.hypot(e.clientX - settleAt[0], e.clientY - settleAt[1]) <= 6) return;
      settle();
      const link = e.target && e.target.closest ? e.target.closest('.menu__link') : null;
      if (link) roll(links.indexOf(link));    // its pointerenter was skipped while settling
    };
    menu.addEventListener('click', e => {
      if (!settleAt || e.detail === 0) return;
      // the X sits exactly on the hamburger: a deliberate click on it (not the tail of a double-click
      // on the toggle) closes the menu even if the mouse never moved
      if (closeBtn && closeBtn.contains(e.target) && e.detail === 1 && performance.now() - openedAt > 500) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
    // ...and the tail of that double-click neither selects a word (e.g. the CTA's "Start") nor moves
    // focus. Document-level: in the very first frame the circle reveal has no radius yet, so that
    // second press can land outside the overlay.
    document.addEventListener('mousedown', e => { if (settleAt && e.detail > 1) e.preventDefault(); }, true);
    function settle() {
      settleAt = null;
      menu.classList.remove('is-settling');
      document.removeEventListener('pointermove', onSettleMove, true);
    }
    const unsettle = pt => {
      if (!pt || !finePointer.matches) return;
      settleAt = pt;
      menu.classList.add('is-settling');
      document.addEventListener('pointermove', onSettleMove, true);
    };

    /* ---------- "01 —" marker roll */
    const focusVisible = el => { try { return el.matches(':focus-visible'); } catch (err) { return true; } };
    const pad = i => String(i + 1).padStart(2, '0');
    const roll = i => {
      if (!num || i === shown || i < 0) return;
      const dir = i > shown ? 1 : -1;
      shown = i;
      const spans = [...num.children];
      spans.slice(0, -1).forEach(s => s.remove());
      const old = spans[spans.length - 1];
      const next = document.createElement('span');
      next.textContent = pad(i);
      if (!motion() || !next.animate || !old) { num.replaceChildren(next); return; }
      num.appendChild(next);
      const opts = { duration: 350, easing: 'cubic-bezier(.16,1,.3,1)' };
      next.animate([{ transform: `translateY(${100 * dir}%)` }, { transform: 'translateY(0)' }], opts);
      old.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-100 * dir}%)` }], Object.assign({ fill: 'forwards' }, opts))
        .finished.then(() => old.remove(), () => {});
    };
    links.forEach((a, i) => {
      a.addEventListener('pointerenter', () => { if (!settleAt) roll(i); });
      // keyboard focus rolls the marker; the quiet programmatic focus of a mouse-opened menu
      // does not, so the marker keeps showing the current page's index
      a.addEventListener('focus', () => { if (focusVisible(a)) roll(i); });
    });
    if (list) {
      // back to the current page's index, unless keyboard focus (visible) sits on an item; the quiet
      // programmatic focus of a mouse-opened menu does not hold the marker
      list.addEventListener('pointerleave', () => {
        const a = document.activeElement, i = links.indexOf(a);
        roll(i >= 0 && focusVisible(a) ? i : homeIndex);
      });
      list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) roll(homeIndex); });
    }

    /* ---------- open / close */
    function open(trigger, pointerAt) {
      if (state === 'open') return;
      clearTimeout(timer);
      const fromClosed = state === 'closed';
      opener = trigger || (document.activeElement !== document.body ? document.activeElement : null);
      anchorEl = trigger || headerToggle();
      setOrigin(trigger);
      unsettle(pointerAt);
      menu.hidden = false;
      menu.inert = false;
      menu.removeAttribute('aria-hidden');
      if (fromClosed) {
        lock(true);
        openedAt = performance.now();
        menu.scrollTop = 0;
        anchor(anchorEl);
        roll(homeIndex);
        strokeScale();
        void menu.offsetWidth;            // commit the pre-open pose so the transitions run
      }
      setInert(true);
      syncTriggers(true);
      menu.classList.remove('is-closing');
      menu.classList.add('is-open');
      menu.dataset.state = 'open';
      state = 'open';
      const first = links[0] || closeBtn;
      if (first) first.focus({ preventScroll: true });
      document.addEventListener('keydown', onKey, true);
    }

    function finish() {
      clearTimeout(timer);
      settle();
      menu.classList.remove('is-open', 'is-closing');
      menu.dataset.state = 'closed';
      menu.hidden = true;
      menu.inert = false;
      menu.removeAttribute('aria-hidden');
      state = 'closed';
      lock(false);
      const cb = after; after = null;
      if (cb) cb();
    }

    function close(opts = {}) {
      if (state !== 'open') return;
      state = 'closing';
      settle();
      after = opts.after || null;
      document.removeEventListener('keydown', onKey, true);
      menu.classList.remove('is-open');
      menu.classList.add('is-closing');
      menu.dataset.state = 'closing';
      syncTriggers(false);
      setInert(false);
      // leave the dialog out of the accessibility tree while it animates away
      menu.setAttribute('aria-hidden', 'true');
      menu.inert = true;
      const target = opener && opener.isConnected && opener.getClientRects().length ? opener : document.querySelector('[data-menu-open]');
      setOrigin(target);                  // the circle closes back into the control (re-measured: the page may have resized)
      if (opts.restoreFocus !== false && target) target.focus({ preventScroll: true });
      opener = null;
      if (opts.instant) { finish(); return; }
      timer = setTimeout(finish, motion() ? 690 : 220);
    }

    function onKey(e) {
      if (state !== 'open') return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (!menu.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }

    /* ---------- wiring */
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-menu-open]');
      if (!t || menu.contains(t)) return;
      e.preventDefault();
      // e.detail is 0 for keyboard activation (Enter / Space): no pointer to settle then
      if (state === 'open') close(); else open(t, e.detail ? [e.clientX, e.clientY] : null);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => close());

    menu.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || state !== 'open' || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.getAttribute('aria-disabled') === 'true' || a.target) return;
      const url = new URL(a.href, location.href);
      // a link to the page we are already on: just close (and go back to the top)
      if (url.origin === location.origin && url.pathname === location.pathname && !url.hash) {
        e.preventDefault();
        close({ restoreFocus: false, after: () => { if (TS.scrollTo) TS.scrollTo(0, { offset: 0 }); else scrollTo(0, 0); const m = document.getElementById('main'); if (m) m.focus({ preventScroll: true }); } });
      }
      // otherwise 02-core.js runs the page transition (or the browser navigates immediately)
    });

    // back/forward cache: never come back to a half-open overlay
    addEventListener('pageshow', ev => { if (ev.persisted && state !== 'closed') { document.removeEventListener('keydown', onKey, true); syncTriggers(false); setInert(false); opener = null; finish(); } });
    // the header toggle moves with the viewport (max-width centring, breakpoints): follow it
    addEventListener('resize', () => {
      if (state !== 'open') return;
      const t = anchorEl && anchorEl.isConnected ? anchorEl : headerToggle();
      setOrigin(t);
      anchor(t);
    }, { passive: true });

    // (no font warm-up: the menu uses the site's single typeface, already loaded by the page)

    TS.menu = { open: t => open(t || document.querySelector('[data-menu-open]')), close: () => close(), get state() { return state; } };
  });
})();

/* ---- 12-footer.js ---- */
/* Footer: live clock (visitor's local time, or the studio's when the markup carries data-tz), ring
   rotation paused off-screen (reference loopPauseOffscreen), and early loading of the ring images
   so cards never pop in mid-rotation. Phones show the ring at phone scale too (12-footer.css); on touch
   screens and under Save-Data its images are fetched only as the footer approaches, never on idle. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const panels = [...document.querySelectorAll('[data-ft]')];
    if (!panels.length) return;

    /* ---------- Clock: "10:06:57 PM — your local time" (tabular figures, updates every second) */
    const clocks = [...document.querySelectorAll('[data-ft-clock]')];
    const tz = (clocks[0] && clocks[0].getAttribute('data-tz')) || undefined;
    const make = (locale, opts) => { try { return new Intl.DateTimeFormat(locale, Object.assign(opts, tz ? { timeZone: tz } : {})); } catch (e) { return null; } };
    const fmt = make('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const iso = make('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    if (!fmt || !iso) {
      // unknown time zone (or no Intl): hide the line rather than show a wrong time
      clocks.forEach(c => { const line = c.closest('p'); if (line) line.hidden = true; });
      clocks.length = 0;
    }
    const tick = () => {
      if (!clocks.length) return;
      const now = new Date();
      const text = fmt.format(now).replace(/ /g, ' ');
      const dt = iso.format(now);
      clocks.forEach(c => { if (c.textContent !== text) c.textContent = text; c.setAttribute('datetime', dt); });
    };
    let timer = 0;
    const startClock = () => {
      if (timer || !clocks.length) return;
      tick();
      // align updates to the start of each second
      const loop = () => { tick(); timer = setTimeout(loop, 1000 - (Date.now() % 1000)); };
      timer = setTimeout(loop, 1000 - (Date.now() % 1000));
    };
    const stopClock = () => { clearTimeout(timer); timer = 0; };
    tick();

    /* ---------- Ring images: fade in once loaded; fetch early, but only where the ring is shown */
    const ring = document.querySelector('[data-ft-ring]');
    const wrap = ring && ring.closest('.ft__ring-wrap');
    const ringImgs = ring ? [...ring.querySelectorAll('img')] : [];
    if (ring) {
      ring.setAttribute('data-fade', '');
      ringImgs.forEach(img => {
        const card = img.closest('.ft__card');
        const done = () => card && card.classList.add('is-loaded');
        if (img.complete && img.naturalWidth) done();
        else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
      });
    }
    const ringShown = () => !!wrap && wrap.getClientRects().length > 0;
    let eagerDone = !ringImgs.length;
    const eager = () => {
      if (eagerDone || !ringShown()) return eagerDone;
      ringImgs.forEach(img => { if (img.loading !== 'eager') img.loading = 'eager'; });
      eagerDone = true;
      return true;
    };

    /* ---------- Visibility: run the clock + ring only while a footer panel is on screen */
    const visible = new Set();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          en.target.classList.toggle('is-live', en.isIntersecting);
          if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
        });
        if (visible.size && !document.hidden) startClock(); else stopClock();
      }, { threshold: 0 });
      panels.forEach(p => io.observe(p));
      if (!eagerDone) {
        const near = new IntersectionObserver(entries => {
          if (entries.some(en => en.isIntersecting) && eager()) near.disconnect();
        }, { rootMargin: '1600px 0px 1600px 0px' });
        panels.forEach(p => near.observe(p));
        // Jumps (End key, anchors) can skip the margin: also fetch on idle after load, unless the visitor
        // asked to save data or is on a touch screen (no End key; the near margin covers a fling).
        const noIdle = (navigator.connection && navigator.connection.saveData) || matchMedia('(hover: none) and (pointer: coarse)').matches;
        const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
        const later = () => setTimeout(() => idle(() => { if (eager()) near.disconnect(); }, { timeout: 4000 }), 2500);
        if (!noIdle) {
          if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
        }
      }
    } else {
      panels.forEach(p => p.classList.add('is-live'));
      eager();
      startClock();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopClock(); else if (visible.size) startClock();
    });
  });
})();

/* ---- 20-hero.js ---- */
/* Home hero: load-time appear, rotating statement pill, gallery reveal and keyboard support.
   Tickers (marquee + gallery columns), [data-reveal] and the hero's pause control (WCAG 2.2.2: the section is a
   [data-motion-scope] with the shared toggle, TS.motionToggle) come from 02-core.js. */
(() => {
  'use strict';
  const TS = window.TS || {};
  if (!TS.ready) return;

  /* "Still" = the visitor paused the hero motion with the gallery control (02-core.js; 'ts:motion' on the hero). */
  const still = el => !!(TS.motionStill && TS.motionStill(el));
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  const headerBottom = () => {
    const h = document.querySelector('[data-header]');
    return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  };

  /* Above-the-fold appear (reference §9): fire on load rather than waiting for the scroll
     observer, so short viewports still get the full nav → H1 → copy → CTAs → badge → marquee
     cascade. Two frames guarantee a styled "before" state so the transitions run. */
  function appear(hero) {
    if (!TS.motion()) return;
    const els = hero.querySelectorAll('[data-appear]');
    const reveal = () => els.forEach(el => el.classList.add('is-in'));
    // Late script (slow network): the CSS fail-safe fade (20-hero.css, 2.5s) may already show the
    // copy. Reveal in the same style change that ends it, so nothing drops back and replays.
    const now = document.timeline && document.timeline.currentTime;
    if (now != null && now > 2400 && !TS.intro.held()) { reveal(); return; }
    // behind the intro stage the cascade waits for it to lift (01-intro.js; immediate without an intro)
    TS.afterIntro(() => requestAnimationFrame(() => requestAnimationFrame(reveal)));
  }

  /* Statement pill: 2000ms per slide; the active row rolls up/out (rotateX 50°) while the next
     rolls in from below (rotateX −50°) with a 500ms cubic-bezier(.44,0,.56,1) tween (CSS).
     Runs only while visible, the tab is shown and the hero motion is not paused; static first
     slide under reduced motion. */
  function pill(hero) {
    const slot = hero.querySelector('[data-hero-pill]');
    if (!slot || !TS.motion()) return;
    const rows = [...slot.querySelectorAll('.hero-pill__row')];
    if (rows.length < 2) return;
    let i = 0, timer = 0, visible = true;
    const step = () => {
      const cur = rows[i], next = rows[(i + 1) % rows.length];
      rows.forEach(r => {
        if (r !== cur && r.classList.contains('is-prev')) { r.classList.add('is-snap'); r.classList.remove('is-prev'); }
      });
      void slot.offsetWidth;                         // commit the snapped (parked) rows without a transition
      rows.forEach(r => r.classList.remove('is-snap'));
      cur.classList.remove('is-active'); cur.classList.add('is-prev');
      next.classList.add('is-active');
      i = (i + 1) % rows.length;
    };
    const run = () => {
      clearInterval(timer); timer = 0;
      if (visible && !document.hidden && !still(slot)) timer = setInterval(step, 2000);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(slot);
    } else run();
    document.addEventListener('visibilitychange', run);
    hero.addEventListener('ts:motion', run);
  }

  /* Gallery: open every tile (originals and the ticker's aria-hidden clones) together the first
     time the frame enters the viewport — ZIP scale 1.1→1 + fade, columns staggered in CSS. */
  function gallery(hero) {
    const frame = hero.querySelector('[data-hero-gallery]');
    if (!frame) return;
    const openAll = () => frame.querySelectorAll('.reveal-image:not(.is-in)').forEach(el => el.classList.add('is-in'));
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      frame.classList.add('is-revealing');
      openAll();
      setTimeout(() => frame.classList.remove('is-revealing'), 1800);   // drop the stagger so hover zoom is immediate
    };
    if (TS.motion() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); reveal(); } }, { threshold: 0.01 });
      io.observe(frame);
    } else reveal();
    /* Lead tiles (row 0, 20-hero.css) enter in CSS from the first paint. A ticker clone is a new element and would
       start that entrance over (a 'down' column shows a clone in its lead's place as soon as it runs), so each clone
       joins its original's timeline, or skips to the end once the original has finished. */
    const syncLeads = () => frame.querySelectorAll('[data-ticker-list]').forEach(list => {
      const lead = list.querySelector(':scope > :not([data-clone]) .hero-tile__media--lead img');
      const own = lead && lead.getAnimations ? lead.getAnimations() : [];
      list.querySelectorAll(':scope > [data-clone] .hero-tile__media--lead img').forEach(img => {
        if (img.dataset.leadSync || !img.getAnimations) return;
        img.dataset.leadSync = '1';
        img.getAnimations().forEach(a => {
          const o = own.find(x => x.animationName === a.animationName);
          if (o && o.currentTime != null) a.currentTime = o.currentTime; else a.finish();
        });
      });
    });
    syncLeads();                                   // tickers() (02-core.js) has made the first clones already
    // Ticker rebuilds (resize / late image load) re-clone the items; open new clones once revealed. A clone of the first
    // tile drops the margin standIns() may have given that tile (the loop's start only).
    const unshift = () => frame.querySelectorAll('[data-ticker-list] > [data-clone][style]').forEach(c => { c.style.marginTop = ''; });
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(() => { unshift(); syncLeads(); if (revealed) openAll(); });
      frame.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    }

    /* Hover caption: tiles keep moving (slowed) and are often cut by the frame or viewport edge,
       so while hovered the caption is lifted to stay inside the tile's visible part. */
    let capTile = null, capRaf = 0;
    const capTick = () => {
      if (!capTile) { capRaf = 0; return; }
      const cap = capTile.querySelector('.hero-tile__cap');
      const col = capTile.closest('.hero-col');
      if (cap && col) {
        const t = capTile.getBoundingClientRect(), c = col.getBoundingClientRect();
        const visTop = Math.max(t.top, c.top, 0), visBottom = Math.min(t.bottom, c.bottom, innerHeight);
        const room = visBottom - visTop - cap.offsetHeight - 20;
        const lift = room > 0 ? Math.min(Math.max(0, t.bottom - visBottom), t.bottom - visTop - cap.offsetHeight - 20) : 0;
        cap.style.setProperty('--cap-lift', `${Math.max(0, Math.round(lift))}px`);
      }
      capRaf = requestAnimationFrame(capTick);
    };
    frame.addEventListener('pointerover', e => {
      const tile = e.target.closest('.hero-tile');
      if (tile === capTile || e.pointerType === 'touch') return;
      capTile = tile;
      if (capTile && !capRaf) capRaf = requestAnimationFrame(capTick);
    });
    frame.addEventListener('pointerleave', () => { capTile = null; });

    /* Keyboard: a focused tile pauses its column and is moved to the middle of the column's
       visible part (columns clip with overflow:clip, so focus can never scroll them); if the
       column is mostly off-screen the page is scrolled to the tile. The column resumes when
       focus leaves it. Under reduced motion (static columns) the list is shifted instead. */
    const tickerOf = col => (TS.tickers || []).find(t => t.el === col);
    const parse = kf => parseFloat(String(kf.transform).replace(/[^-\d.]+/g, ' ').trim().split(' ').pop()) || 0;
    const keyboardFocus = el => { try { return el.matches(':focus-visible'); } catch (err) { return true; } };
    frame.addEventListener('focusin', e => {
      // Keyboard focus only: a mouse press also focuses the link, and moving the tile between
      // mousedown and mouseup would turn the click into a miss.
      if (!keyboardFocus(e.target)) return;
      const tile = e.target.closest('.hero-tile');
      const col = tile && tile.closest('[data-ticker]');
      const list = col && col.querySelector('[data-ticker-list]');
      if (!list) return;
      const item = tile.parentElement;
      const t = tickerOf(col);
      const anim = t && t.anim;
      if (anim) anim.pause();
      const c = col.getBoundingClientRect();
      const visTop = Math.max(c.top, headerBottom()), visBottom = Math.min(c.bottom, innerHeight);
      const ih = item.offsetHeight;
      const centre = visBottom - visTop >= ih + 32 ? (visTop + visBottom) / 2 - c.top : col.clientHeight / 2;
      const offset = item.offsetTop - list.offsetTop;                      // item top inside the list at translate 0
      let target = centre - ih / 2 - offset;                               // list translate that puts it there
      if (anim && anim.effect) {
        const kfs = anim.effect.getKeyframes();
        const dur = anim.effect.getTiming().duration;
        if (kfs.length >= 2 && typeof dur === 'number') {
          const from = parse(kfs[0]), to = parse(kfs[kfs.length - 1]);
          target = Math.min(Math.max(target, Math.min(from, to)), Math.max(from, to));
          // an infinite animation wraps at currentTime === duration, so stay just inside it
          if (to !== from) anim.currentTime = Math.min(Math.max(((target - from) / (to - from)) * dur, 0), dur - 1);
        }
      } else {
        target = Math.min(0, Math.max(target, col.clientHeight - list.scrollHeight));
        list.style.transform = `translateY(${target}px)`;
      }
      // After the browser's own focus scroll: bring the tile fully into view below the header.
      requestAnimationFrame(() => {
        if (document.activeElement !== e.target) return;
        const r = tile.getBoundingClientRect(), top = headerBottom() + 12, bottom = innerHeight - 12;
        if (r.top >= top && r.bottom <= bottom) return;
        const delta = r.top < top || r.height > bottom - top ? r.top - top : r.bottom - bottom;
        const y = scrollY + delta;
        if (TS.lenis) TS.lenis.scrollTo(y, { duration: 0.6, immediate: TS.reduced() });
        else scrollTo({ top: y, behavior: TS.reduced() ? 'auto' : 'smooth' });
      });
    });
    frame.addEventListener('focusout', e => {
      const col = e.target.closest('[data-ticker]');
      if (!col || col.contains(e.relatedTarget)) return;
      const t = tickerOf(col);
      if (t && t.anim && !TS.reduced() && !still(col) && inView(col)) t.anim.play();
    });
  }

  /* Stand-ins (home_hero._columns): where a screen hides a column, its projects' tiles are repeated in the columns
     still shown, so every project is on every screen. With motion they sit out the first layout (20-hero.css), and
     after load idle moments let them in one at a time, each only while none of its places in the column (the tile and
     the ticker's copies of it, which share its .is-on) is on screen, and the column's ticker takes the longer loop from
     where it is. Stand-ins this screen does not show (another width, a hidden column) are let in at once: the ticker's
     own rebuild on resize picks them up. */
  /* A stand-in's image waits in <noscript> (home_hero._item) until its tile is let in, so neither it nor the ticker's
     copies of it download anything before. Let in, they load at once (eager, as the ticker's own copies: a lazy image
     beyond the column's clip would only start as it scrolls into view). */
  const unwrap = (li, eager) => li.querySelectorAll('noscript').forEach(ns => {
    const tpl = document.createElement('template');
    tpl.innerHTML = ns.textContent;
    if (eager) tpl.content.querySelectorAll('img').forEach(im => im.setAttribute('loading', 'eager'));
    ns.replaceWith(tpl.content);
  });
  function standIns(frame) {
    const left = [...frame.querySelectorAll('[data-ticker-list] > :not([data-clone]):is(.hero-col__item--lt1440,.hero-col__item--lt800)')];
    if (!left.length) return;
    const narrow = { lt1440: matchMedia('(max-width: 1439.98px)'), lt800: matchMedia('(max-width: 799.98px)') };
    const parse = kf => parseFloat(String(kf.transform).replace(/[^-\d.]+/g, ' ').trim().split(' ').pop());
    const MARGIN = 24;                                 // px kept clear around the visible part (the ticker keeps moving)
    const letIn = (li, shown = true) => {         // not shown at this width: no downloads (lazy) until a resize shows it
      const kids = [...li.parentElement.children];
      const n = kids.filter(k => !k.hasAttribute('data-clone')).length;
      for (let j = kids.indexOf(li); j >= 0 && j < kids.length; j += n) { kids[j].classList.add('is-on'); unwrap(kids[j], shown); }
    };
    let scrolled = 0;
    const onScroll = () => { scrolled = performance.now(); };
    addEventListener('scroll', onScroll, { passive: true });
    // The ticker rebuilds each column once just after it starts (02-core.js, its ResizeObserver's first call), which
    // restarts the loop from the top: nothing comes in before that, or the restart would move what is on screen.
    const t0 = performance.now(), rebuilt = new Set();
    const mo = 'MutationObserver' in window ? new MutationObserver(recs => recs.forEach(r => rebuilt.add(r.target))) : null;
    if (mo) frame.querySelectorAll('[data-ticker-list]').forEach(list => mo.observe(list, { childList: true }));
    const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 120));
    // Lets li in if none of its places is on screen (true), re-timing its column's loop; false: try again later. What
    // comes in above the visible part is offset by a negative margin on the list's first tile (above it too), so no tile
    // on screen moves, in the layout either (no layout shift).
    const tryIn = li => {
      const list = li.parentElement, col = list.closest('[data-ticker]');
      const t = (TS.tickers || []).find(x => x.el === col), anim = t && t.anim, fx = anim && anim.effect;
      const kfs = fx ? fx.getKeyframes() : [], dur = fx ? fx.getTiming().duration : 0;
      const from = kfs.length > 1 ? parse(kfs[0]) : NaN, to = kfs.length > 1 ? parse(kfs[kfs.length - 1]) : NaN;
      if (!(isFinite(from) && isFinite(to) && to !== from && dur > 0)) { letIn(li); return true; }   // no loop to keep
      if (!rebuilt.has(list) && performance.now() - t0 < 4000) return false;
      const kids = [...list.children], n = kids.filter(k => !k.hasAttribute('data-clone')).length, first = kids[0];
      const r = col.getBoundingClientRect(), off = first.getBoundingClientRect().top - r.top;   // the list as drawn
      const top = Math.max(0, -r.top), bottom = Math.min(r.height, innerHeight - r.top);
      const seen = bottom > top, a = top - off - MARGIN, b = bottom - off + MARGIN;   // the visible part, in list space
      let next = li.nextElementSibling;              // the stand-in comes in where its next shown tile is now
      while (next && !next.offsetParent) next = next.nextElementSibling;
      if (!next || next.hasAttribute('data-clone')) return false;
      const len = Math.abs(to - from), at = next.offsetTop - first.offsetTop, places = [];
      for (let k = 0; k * n < kids.length; k++) places.push(k * len + at);   // the tile, then each copy of it
      if (seen && places.some(p => p > a && p < b)) return false;
      const above = seen ? places.filter(p => p <= a).length : 0;
      letIn(li);
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0, last = kids[n - 1];
      const loop = last.offsetTop + last.offsetHeight - first.offsetTop + gap;   // as the ticker measures it
      if (above) first.style.marginTop = `${(parseFloat(first.style.marginTop) || 0) - above * (li.offsetHeight + gap)}px`;
      const T = from + (to - from) * (((anim.currentTime || 0) % dur) / dur);   // the ticker's offset: kept
      const f2 = to > from ? -loop : 0, t2 = to > from ? 0 : -loop;
      const d2 = loop / (parseFloat(col.dataset.speed) || 25) * 1000;
      fx.setKeyframes([{ transform: `translateY(${f2}px)` }, { transform: `translateY(${t2}px)` }]);
      fx.updateTiming({ duration: d2 });
      anim.currentTime = Math.min(d2 - 1, Math.max(0, (T - f2) / (t2 - f2) * d2));
      return true;
    };
    // One stand-in per idle call (its tile and the ticker's copies of it: well under a long task on a slow phone).
    const step = () => {
      for (let i = left.length - 1; i >= 0; i--) {
        const li = left[i];
        const shown = narrow[li.classList.contains('hero-col__item--lt800') ? 'lt800' : 'lt1440'].matches && li.closest('[data-ticker]').offsetParent;
        if (li.classList.contains('is-on') || !shown) { letIn(li, !!shown); left.splice(i, 1); }
      }
      let moved = false;
      if (left.length && performance.now() - scrolled > 250) {   // mid-scroll the visible part is a moving target
        const i = left.findIndex(tryIn);
        if (i >= 0) { left.splice(i, 1); moved = true; }
      }
      if (!left.length) { removeEventListener('scroll', onScroll); if (mo) mo.disconnect(); }
      else if (moved) idle(step);
      else setTimeout(() => idle(step), 400);        // all on screen for now: the columns move on
    };
    const start = () => idle(step);
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
  }

  TS.ready(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    appear(hero);
    pill(hero);
    gallery(hero);
    const frame = hero.querySelector('[data-hero-gallery]');
    if (!frame) return;
    if (TS.motion()) standIns(frame);
    else frame.querySelectorAll('[data-ticker-list] > :is(.hero-col__item--lt1440,.hero-col__item--lt800)').forEach(li => unwrap(li, li.hasAttribute('data-clone')));   // shown from the start
  });
})();

/* ---- 21-idea.js ---- */
/* Home — THE IDEA (image 2). Markup: scripts/sections/home_idea.py · styles: src/css/21-idea.css
   1. Reveal choreography: headline masks rise when the title enters; the hand slides in and the
      strings draw out from the pinch point once the hand is on screen (CSS does the timing).
   2. Perspective screen: the project slides are one plane mapped onto the laptop display's
      measured quad with a matrix3d (recomputed on resize). Without JS a clipped flat box is used.
   3. Slideshow: cross-fades our project screens only while visible; pauses on hover, focus,
      hidden tab or the pause button; never autoplays under reduced motion. When the client's own
      website recordings are supplied (media manifest) the slides hold <video>s instead: only the
      active slide's clip plays (06-video.js holds clips in inert slides), the pause button pauses it.
   The laptop also gets a very small scroll-linked rise (desktop/tablet fine pointers here; phones and touch screens
   get the same rise as a CSS scroll-driven animation, 21-idea.css); string E is kept docked under the lid's top edge
   whatever the laptop's offset. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  /* CSS matrix3d mapping a w x h element (transform-origin 0 0) onto quad TL, TR, BR, BL (px). */
  function quadMatrix3d(w, h, [x0, y0], [x1, y1], [x2, y2], [x3, y3]) {
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1];
    return `matrix3d(${m.map(v => +v.toFixed(9)).join(',')})`;
  }

  ready(() => {
    const root = document.querySelector('[data-idea]');
    if (!root) return;
    const motion = TS.motion ? TS.motion() : false;
    const reduced = TS.reduced ? TS.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Reveal */
    const title = root.querySelector('[data-idea-title]');
    const diagram = root.querySelector('[data-idea-diagram]');
    const copy = root.querySelector('[data-idea-copy]');
    const hand = diagram && diagram.querySelector('.idea__hand');
    if (!motion || !('IntersectionObserver' in window)) {
      [title, diagram, copy].forEach(el => el && el.classList.add('is-in'));
    } else {
      // trigger -> element that gets .is-in (the copy column reveals its lines as one group)
      const pairs = new Map([[title, title], [hand || diagram, diagram], [copy, copy]]);
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const target = pairs.get(en.target);
        if (target) target.classList.add('is-in');
        io.unobserve(en.target);
      }), { rootMargin: '0px 0px -10% 0px', threshold: 0.25 });
      pairs.forEach((_, trigger) => trigger && io.observe(trigger));
    }

    /* ---------- 2. Perspective-correct screen */
    const device = root.querySelector('[data-idea-device]');
    const screen = root.querySelector('[data-idea-screen]');
    if (!device || !screen) return;
    const quad = (device.dataset.quad || '').split(';').map(p => p.split(',').map(Number));
    screen.style.setProperty('--ar', device.dataset.ar || '1.547');
    let lastW = 0, lastH = 0;
    const warp = () => {
      const W = device.clientWidth, H = device.clientHeight;
      if (!W || !H || quad.length !== 4 || (W === lastW && H === lastH)) return;
      lastW = W; lastH = H;
      screen.classList.add('is-warped');
      const w = screen.offsetWidth, h = screen.offsetHeight;
      if (!w || !h) return;
      screen.style.setProperty('--warp', quadMatrix3d(w, h, ...quad.map(([x, y]) => [x * W, y * H])));
    };
    warp();
    if ('ResizeObserver' in window) new ResizeObserver(warp).observe(device);
    else window.addEventListener('resize', warp);

    /* ---------- 2b. String E docks on the lid. It ends 3px under the lid's top edge (poster
       geometry); when the laptop moves - the scroll-linked rise below, or the extra horizontal
       bleed on screens wider than the 1760px artboard (diagram shifts left, laptop right) - the
       string is re-aimed / lengthened so it always disappears exactly behind the lid. */
    const board = root.querySelector('.idea__board');
    const laptop = root.querySelector('.idea__laptop');
    const eLine = root.querySelector('[data-idea-e]');
    // 2c moves the laptop here on fine pointers >= 800px; every other screen with motion rises in CSS (21-idea.css) where
    // scroll timelines exist, which no script follows: there string E is drawn down to the lid's lowest point (the laptop
    // 40px low), and the rest of it stays hidden behind the lid as the laptop settles.
    const lift = matchMedia('(min-width: 800px) and (pointer: fine)');
    const cssRise = motion && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
    let liftPx = !lift.matches && cssRise ? 40 : 0, shift = 0;
    const dockE = () => {
      if (!eLine || !board) return;
      const k = board.clientWidth / 1600;
      if (!k) return;
      const [ax, ay, lidL] = eLine.dataset.ideaE.split(',').map(Number);
      const px = +eLine.getAttribute('x1'), py = +eLine.getAttribute('y1');
      const tx = Math.max(ax, lidL + 160 + shift);   // rest point, or 160px in from the shifted lid corner
      const y = ay + 3 + liftPx / k;
      const x = px + (tx - px) * (y - py) / (ay - py);
      eLine.setAttribute('x2', x.toFixed(2));
      eLine.setAttribute('y2', y.toFixed(2));
    };
    const measureShift = () => {
      if (!board || !laptop || !diagram) return;
      const k = board.clientWidth / 1600;
      const b = board.getBoundingClientRect();
      const px = (laptop.getBoundingClientRect().right - b.right) + (b.left - diagram.getBoundingClientRect().left);
      shift = k ? Math.max(0, px) / k : 0;
      dockE();
    };
    measureShift();
    if ('ResizeObserver' in window) new ResizeObserver(measureShift).observe(root);
    window.addEventListener('resize', measureShift);

    /* ---------- 2c. Subtle scroll-linked rise of the laptop: 40px low while it enters, settling
       exactly when the panel's bottom edge (where the stones are cropped) reaches the viewport, so
       no gap ever opens under the stones. Fine pointers >= 800px only (Lenis-smoothed scroll; every other screen runs
       it in CSS, animation-timeline: view(), with string E docked as above), never under reduced motion. */
    if (motion && 'IntersectionObserver' in window) {
      let on = false, raf = 0, moved = 0;
      const update = () => {
        raf = 0;
        let px = 0;
        if (lift.matches) {
          const d = root.getBoundingClientRect().bottom - innerHeight;   // untransformed bottom of the laptop
          px = 40 * Math.min(1, Math.max(0, d / (device.offsetHeight || 1)));
        }
        if (px !== moved) {
          moved = px;
          device.style.transform = px ? `translate3d(0,${px.toFixed(2)}px,0)` : '';
        }
        const dock = lift.matches ? px : cssRise ? 40 : 0;
        if (dock !== liftPx) { liftPx = dock; dockE(); }
      };
      const onScroll = () => { if (on && !raf) raf = requestAnimationFrame(update); };
      new IntersectionObserver(entries => { on = entries[entries.length - 1].isIntersecting; onScroll(); }, { rootMargin: '10% 0px' }).observe(device);
      if (TS.lenis && TS.lenis.on) TS.lenis.on('scroll', onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      lift.addEventListener ? lift.addEventListener('change', onScroll) : lift.addListener(onScroll);
    }

    /* ---------- 3. Project slideshow */
    const slides = [...screen.querySelectorAll('[data-idea-slide]')];
    const toggle = root.querySelector('[data-idea-toggle]');
    const count = root.querySelector('[data-idea-count]');
    const hasVideo = !!screen.querySelector('[data-video]');   // a single clip still gets the pause button
    if ((slides.length < 2 && !hasVideo) || reduced || !motion || !toggle) return;
    const DWELL = 3600;
    const PRELOAD = 1500;                 // the next slide's clip gets its src this long before the swap
    let idx = 0, timer = 0, early = 0, visible = false, hovering = false, focused = false, paused = false;
    const show = n => {
      const prev = slides[idx];
      idx = (n + slides.length) % slides.length;
      const next = slides[idx];
      if (prev === next) return;
      next.inert = false;
      next.classList.add('is-active');
      prev.classList.remove('is-active');
      prev.inert = true;
      if (count) count.textContent = String(idx + 1).padStart(2, '0');
      if (hasVideo && TS.syncVideos) TS.syncVideos(screen);   // play the incoming clip, pause the outgoing one
    };
    const running = () => visible && !hovering && !focused && !paused && !document.hidden;
    let decoding = false;
    // Decode the incoming screen before the swap: the first cross-fade to each (lazy, 3D-warped)
    // slide otherwise paid its decode + raster in one long frame at the start of the fade.
    const advance = () => {
      timer = 0;
      if (!running()) return;
      const n = (idx + 1) % slides.length;
      const img = slides[n].querySelector('img');
      const go = () => { decoding = false; if (running()) show(n); schedule(); };
      decoding = true;
      if (img && img.decode) img.decode().then(go, go); else go();
    };
    // Load the incoming clip ahead of the swap, so it starts at once instead of after a poster-only gap.
    const preload = () => {
      early = 0;
      const v = hasVideo && TS.preloadVideo && slides[(idx + 1) % slides.length].querySelector('[data-video]');
      if (v) TS.preloadVideo(v);
    };
    const schedule = () => {               // idempotent: a pending advance survives repeated calls
      if (!running() || slides.length < 2) { clearTimeout(timer); clearTimeout(early); timer = early = 0; return; }
      if (!timer && !decoding) {
        timer = setTimeout(advance, DWELL);
        if (hasVideo) early = setTimeout(preload, DWELL - PRELOAD);
      }
    };
    toggle.hidden = false;
    // a batch can hold several records for the device (e.g. after a jump): the last one is current
    new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; schedule(); }, { threshold: 0.3 }).observe(device);
    // hold while a mouse is over the screen (its link / View Project cursor). Not over the control:
    // pressing "play" there must visibly resume the slideshow, and pressing "pause" stops it anyway.
    device.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const over = !!e.target.closest('[data-idea-screen]');
      if (over !== hovering) { hovering = over; schedule(); }
    });
    device.addEventListener('pointerleave', () => { if (hovering) { hovering = false; schedule(); } });
    // hold while a keyboard user is on the visible slide's link (so the link they are about to
    // open cannot change under them). Focus on the toggle itself does not count: a mouse click on
    // "play" leaves the button focused, and that must not keep the slideshow stalled.
    const onSlide = el => {
      if (!el || !el.closest || !el.closest('[data-idea-slide]')) return false;
      try { return el.matches(':focus-visible'); } catch (err) { return true; }
    };
    device.addEventListener('focusin', e => { const f = onSlide(e.target); if (f !== focused) { focused = f; schedule(); } });
    device.addEventListener('focusout', e => { const f = onSlide(e.relatedTarget); if (f !== focused) { focused = f; schedule(); } });
    document.addEventListener('visibilitychange', schedule);
    /* The toggle shows what the clip does, not only what was asked: "pause" while it plays (or is about to), "play"
       while the visitor holds it and whenever it stopped by itself on screen - the phone refused autoplay (iOS Low
       Power Mode, a no-autoplay setting, Save-Data: 06-video.js marks its frame .is-blocked and fires
       'ts:videoblocked') or the browser paused it. A tap on "play" starts the clip inside the tap (TS.playVideo),
       which a phone allows even then. */
    let stopped = false;                   // the active clip is not playing although nothing holds it
    const active = el => !!(el && el.closest && el.closest('[data-idea-slide]') === slides[idx]);
    const shown = () => { const r = device.getBoundingClientRect(); return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) > r.height / 2; };
    const paint = () => {
      const off = paused || stopped;
      toggle.classList.toggle('is-paused', off);
      toggle.setAttribute('aria-pressed', String(off));
    };
    if (hasVideo) {
      const v0 = slides[idx] && slides[idx].querySelector('[data-video]');
      const frame = v0 && (v0.closest('figure') || v0.parentElement);
      stopped = !!(frame && frame.classList.contains('is-blocked'));   // refused before this script listened (Save-Data)
      screen.addEventListener('ts:videoblocked', e => { if (active(e.target)) { stopped = true; paint(); } });
      // media events do not bubble: listen in the capture phase
      screen.addEventListener('playing', e => { if (active(e.target) && stopped) { stopped = false; paint(); } }, true);
      screen.addEventListener('pause', e => {   // off-screen, a hidden tab, a slide change or a hold: not "stopped"
        if (active(e.target) && !paused && !document.hidden && !e.target.closest('[inert]') && shown()) { stopped = true; paint(); }
      }, true);
      paint();
    }
    toggle.addEventListener('click', () => {
      const play = paused || stopped;
      paused = !play;
      stopped = false;
      if (hasVideo) {
        screen.toggleAttribute('data-video-hold', paused);
        const v = play && slides[idx].querySelector('[data-video]');
        if (v && TS.playVideo) TS.playVideo(v);   // synchronously, inside the tap
        if (TS.syncVideos) TS.syncVideos(screen);
      }
      paint();
      schedule();
    });
  });
})();

/* ---- 22-services.js ---- */
/* What We Create — the reference "works" stack on the Website Design image card
   (ref-services-testimonials §2.7). The next image peeks from the bottom-right corner, the previous
   one from the top-right; clicking a peeking card brings it forward, the "Tap Here" badge advances
   (and wraps). The current card stays a normal link to the project. On touch screens the cards' hover motion plays
   while a card is centred (.is-live, below).
   Markup: scripts/sections/service_cards.py media(stack=True); styles: src/css/22-services.css. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  ready(() => {
    document.querySelectorAll('[data-svc-stack]').forEach(stack => {
      const cards = [...stack.querySelectorAll('[data-stack-card]')];
      const next = stack.querySelector('[data-stack-next]');
      const status = stack.querySelector('[data-stack-status]');
      if (cards.length < 2) { if (next) next.hidden = true; return; }
      cards.forEach(card => { if (card.dataset.cursor) card.dataset.cursorLabel = card.dataset.cursor; });
      let index = 0;
      const set = (n, announce) => {
        index = (n + cards.length) % cards.length;
        cards.forEach((card, k) => {
          const pos = Math.max(-2, Math.min(3, k - index));
          card.dataset.pos = String(pos);
          if (pos === 0) {
            card.removeAttribute('tabindex'); card.removeAttribute('aria-hidden');
            if (card.dataset.cursorLabel) card.dataset.cursor = card.dataset.cursorLabel;
          } else {
            card.setAttribute('tabindex', '-1'); card.setAttribute('aria-hidden', 'true');
            delete card.dataset.cursor; // a peeking card advances the stack instead of opening the project
          }
          // a card that comes into view is revealed even if the scroll observer has not fired for it
          const media = card.querySelector('.reveal-image');
          if (media && Math.abs(pos) <= 1) media.classList.add('is-in');
        });
        if (announce && status) status.textContent = `Image ${index + 1} of ${cards.length}`;
      };
      /* Tap Here attention cue: the badge wiggles (twice, CSS) each time the stack comes into view,
         until the visitor has used the stack once. */
      let cue = null;
      if (next && 'IntersectionObserver' in window) {
        cue = new IntersectionObserver(([e]) => stack.classList.toggle('is-cued', e.isIntersecting), { threshold: 0.6 });
        cue.observe(stack);
      }
      const used = () => { if (cue) { cue.disconnect(); cue = null; } stack.classList.remove('is-cued'); };
      cards.forEach((card, k) => card.addEventListener('click', e => {
        if (card.dataset.pos === '0') return;
        e.preventDefault();
        used();
        set(k, true);
      }));
      if (next) next.addEventListener('click', () => { used(); set(index + 1, true); });
      set(0, false);
    });

    /* Touch screens have no hover, so each card's hover motion plays while it is centred on screen instead (.is-live:
       it crosses the middle 30 % of the viewport): the folder papers lift (.svc-info); the parked stack cards lift and
       the AI mark rises with its orbit, tags and flow wires running (.svc-media, .svc-small__art); the small-card
       prints rise once (.was-live). The loops rest after 4.8 s (.is-rest, inside WCAG 2.2.2's 5 s, as the Tap Here
       cue) and play again on the next pass. Hover screens keep :hover; nothing moves under reduced motion. */
    if (TS.motion && TS.motion() && matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      const rest = new WeakMap();
      const live = new IntersectionObserver(entries => entries.forEach(({ target: el, isIntersecting: on }) => {
        clearTimeout(rest.get(el));
        el.classList.toggle('is-live', on);
        el.classList.remove('is-rest');
        if (on) { el.classList.add('was-live'); rest.set(el, setTimeout(() => el.classList.add('is-rest'), 4800)); }
      }), { rootMargin: '-35% 0px -35% 0px' });
      document.querySelectorAll('.svc-info, .svc-media, .svc-small__art').forEach(el => live.observe(el));
    }

    /* Service rows are anchors (/what-we-create/#e-commerce, the page index, the home "+N" chips).
       A row that has not been revealed yet still carries its 60px reveal offset, so the scroll
       would land short of it: settle the row first (no transition), then let the scroll measure. */
    const settle = el => {
      if (!el || !el.matches('.svc-row[data-reveal]') || el.classList.contains('is-in')) return false;
      el.style.transition = 'none';
      el.classList.add('is-in');
      void el.offsetHeight;
      requestAnimationFrame(() => { el.style.transition = ''; });
      return true;
    };
    const target = hash => { try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; } };
    // capture phase: runs before the core's in-page anchor handler measures the target
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.pathname !== location.pathname) return;
      settle(target(a.hash));
    }, true);
    // bubble phase, after the core scrolled to the row: move focus there too (as a native fragment
    // jump would), so Tab continues inside the chosen service instead of in the page index
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || !e.defaultPrevented || a.pathname !== location.pathname) return;
      const el = target(a.hash);
      if (!el || !el.matches('.svc-row')) return;
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
    // arriving with a hash: the browser jumped before the reveal offset was removed — correct it
    const arrive = () => {
      const el = location.hash && target(location.hash);
      if (!settle(el)) return;
      const off = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 96;
      const y = el.getBoundingClientRect().top + window.scrollY - off;
      if (TS.lenis) TS.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    };
    arrive();
  });
})();

/* ---- 23-believe.js ---- */
/* Home 4 — WHAT WE BELIEVE (image 10). Markup: scripts/sections/home_believe.py, CSS 23-believe.css.

   1. Scroll-linked statement ink: the lead sentence starts in the reference grey and brightens word
      by word to white as the block's centre travels from 85 % to 50 % of the viewport (done by the
      time it reaches the natural reading position). The continuation keeps the reference grey, so
      the statement settles on the reference's two-tone composition, the same state reduced motion
      and no-JS visitors get. JS writes one custom property per frame (--p on the block); each lead
      word carries its own threshold (--a) and the CSS maps both to opacity.
   2. Count-up for numeric stats ("20K+", "2M+"): an aria-hidden overlay counts while the real value
      (the exact document string) stays in the DOM, invisible but in place, so there is no layout shift
      and assistive tech / crawlers only ever see the final text. Values below 10 count with one
      decimal (0.0 → 1.9 M+) and land on the exact string ("2M+").
   Everything else (rises, clip reveals, rules) is CSS on the 02-core reveal classes.
   Ink and count-up are off under reduced motion and without JS: the static two-tone statement and
   the final numbers show. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const motion = () => (TS.motion ? TS.motion() : document.documentElement.classList.contains('motion'));
  const RAMP = 1 / 5;   // per-word ramp width in progress units (CSS multiplies by 5): ~2 words light at once

  function ink(block) {
    const lead = block.querySelector('.bel__lead');
    const words = lead ? [...lead.querySelectorAll('.w__i')] : [];   // created by 02-core's data-split
    if (!words.length) return;
    words.forEach((w, i) => {
      const t = words.length > 1 ? i / (words.length - 1) : 0;
      w.style.setProperty('--a', ((1 - RAMP) * t).toFixed(4));
    });
    block.classList.add('is-ink');

    let raf = 0, last = -1, listening = false;
    const update = () => {
      raf = 0;
      const r = block.getBoundingClientRect();
      const vh = innerHeight || document.documentElement.clientHeight;
      const start = vh * 0.85, end = vh * 0.5;
      const p = Math.min(1, Math.max(0, (start - (r.top + r.height / 2)) / (start - end)));
      if (Math.abs(p - last) > 0.0004) { last = p; block.style.setProperty('--p', p.toFixed(4)); }
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(update); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !listening) addEventListener('scroll', request, { passive: true });
        if (!e.isIntersecting && listening) removeEventListener('scroll', request);
        listening = e.isIntersecting;
        request();                              // settle on the exact value when leaving too
      }, { rootMargin: '20% 0px 20% 0px' }).observe(block);
    } else addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    update();
  }

  const easeOut = t => (t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));   // cubic: the digits visibly tick, then settle

  function countUp(stat) {
    const num = stat.querySelector('.bel__num[data-count]');
    if (!num) return;
    const final = num.textContent;
    const raw = num.dataset.count;
    const to = parseFloat(raw);
    const suffix = num.dataset.suffix || '';
    if (!isFinite(to) || final !== raw + suffix) return;      // only animate values we can reproduce exactly
    const decimals = (raw.split('.')[1] || '').length || (to < 10 ? 1 : 0);
    const overlay = document.createElement('span');
    overlay.className = 'bel__count';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.textContent = (0).toFixed(decimals) + suffix;
    num.classList.add('is-counting');
    num.after(overlay);
    const finish = () => { overlay.remove(); num.classList.remove('is-counting'); };
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const delay = (parseFloat(getComputedStyle(stat).getPropertyValue('--d')) || 0) + 180;
      const dur = 1800;
      setTimeout(() => {
        const t0 = performance.now();
        const step = now => {
          const t = Math.min(1, (now - t0) / dur);
          const v = (to * easeOut(t)).toFixed(decimals);
          overlay.textContent = parseFloat(v) === to ? final : v + suffix;   // '2.0M+' never shows: lands on '2M+'
          if (t < 1) requestAnimationFrame(step); else finish();   // settle on the document string
        };
        requestAnimationFrame(step);
      }, delay);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.5 });
    io.observe(stat);
  }

  ready(() => {
    const root = document.querySelector('.bel');
    if (!root || !motion()) return;
    const block = root.querySelector('[data-bel-ink]');
    if (block) ink(block);
    if ('IntersectionObserver' in window) root.querySelectorAll('.bel__stat').forEach(countUp);
  });
})();

/* ---- 23-carousel.js ---- */
/* Coverflow carousel — reference Framer Slideshow (ref-services-testimonials §3.3 / §5).
   [data-carousel] > [data-carousel-viewport] > [data-carousel-track] > [data-carousel-slide]…
   + role=tab dots + [data-carousel-toggle].

   Geometry: slide = viewport width (560 desktop/tablet, container-24 on phone), gap 24, step 584.
   Per-slide effect from its offset p (left edge relative to the content box), piecewise-linear over
   [-W, 0, gap, W] and clamped: opacity .1/1/1/.1, scale .8/1/1/.8, rotateY -20/0/0/20,
   transform-origin-x 100/100/0/0 % (phone: opacity 0/1/1/0, no scale/rotation).
   Motion: 700 ms tween cubic-bezier(.44,0,.56,1) for autoplay (4 s), dots, keys and drag release.
   Direction "right" (reference): the next card waits on the left and travels to the centre.
   Autoplay pauses on hover, focus, drag, off-screen, hidden tab and the rotation button;
   prefers-reduced-motion: no autoplay, no 3D, instant moves. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const DURATION = 700;

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }
  const EASE = bezier(0.44, 0, 0.56, 1);
  const lerp = (x, xs, ys) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) {
      if (x <= xs[i]) { const t = (x - xs[i - 1]) / ((xs[i] - xs[i - 1]) || 1); return ys[i - 1] + t * (ys[i] - ys[i - 1]); }
    }
    return ys[ys.length - 1];
  };
  const mod = (a, n) => ((a % n) + n) % n;
  const expoOut = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function init(root) {
    const viewport = root.querySelector('[data-carousel-viewport]');
    const track = root.querySelector('[data-carousel-track]');
    if (!viewport || !track) return;
    const real = [...track.children].filter(el => el.hasAttribute('data-carousel-slide'));
    const n = real.length;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const toggle = root.querySelector('[data-carousel-toggle]');
    const counters = [];
    if (n < 2) { root.classList.add('is-ready', 'is-single'); return; }

    /* One cloned set so both sides always have neighbours; the wrap point sits n steps away. */
    real.forEach(s => {
      const c = s.cloneNode(true);
      ['id', 'role', 'aria-roledescription', 'aria-label'].forEach(a => c.removeAttribute(a));
      c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('data-clone', '');
      c.inert = true;
      track.appendChild(c);
    });
    const all = [...track.children];
    const total = all.length;
    const sgn = (root.dataset.carouselDirection || 'right') === 'right' ? -1 : 1;
    const interval = parseFloat(root.dataset.interval) || 4000;

    let item = 560, gap = 24, step = 584, fx = null;
    let pos = 0, target = 0, active = -1, raf = 0, timer = 0;
    let hover = false, focusIn = false, inView = false, userPaused = false, dragging = false, drag = null, suppressClick = false;
    const reduced = () => reducedMQ.matches;

    function measure() {
      item = viewport.clientWidth || item;
      gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      step = item + gap;
      const phone = phoneMQ.matches;
      /* reference effectsOptions: desktop/tablet opacity .1 · scale .8 · rotate 20 (no blur);
         phone instance: opacity 0, no scale/3D. Reduced motion keeps only the fade. */
      fx = reduced()
        ? { o: phone ? [0, 1, 1, 0] : [0.1, 1, 1, 0.1], s: [1, 1, 1, 1], r: [0, 0, 0, 0] }
        : phone
          ? { o: [0, 1, 1, 0], s: [1, 1, 1, 1], r: [0, 0, 0, 0] }
          : { o: [0.1, 1, 1, 0.1], s: [0.8, 1, 1, 0.8], r: [-20, 0, 0, 20] };
    }

    function apply() {
      const xs = [-item, 0, gap, item];
      for (let k = 0; k < total; k++) {
        const el = all[k];
        const d = mod(k - pos + n, total) - n;
        const x = sgn * d * step;
        if (Math.abs(d) > 2.5) { el.style.visibility = 'hidden'; el.style.transform = `translate3d(${x}px,0,0)`; continue; }
        const o = lerp(x, xs, fx.o), s = lerp(x, xs, fx.s), r = lerp(x, xs, fx.r), ox = lerp(x, xs, [1, 1, 0, 0]);
        el.style.visibility = '';
        el.style.transformOrigin = `${ox * 100}% 50%`;
        el.style.transform = `translate3d(${x}px,0,0) scale(${s}) rotateY(${r}deg)`;
        el.style.opacity = o.toFixed(3);
        el.style.pointerEvents = Math.abs(d) < 0.5 ? '' : 'none';
      }
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      real.forEach((s, k) => s.setAttribute('aria-hidden', k === i ? 'false' : 'true'));
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      if (inView) countUp(real[i]);
    }

    function settle(animated) {
      raf = 0;
      pos = target = mod(Math.round(target), n);
      apply();
      setActive(pos);
      /* reference timer restarts when the slide changes, i.e. at the START of the 700 ms move:
         moves begin `interval` apart (≈4 s), not interval + duration */
      schedule(animated === true ? Math.max(0, interval - DURATION) : interval);
    }

    function goTo(t, { instant = false } = {}) {
      cancelAnimationFrame(raf);
      target = t;
      setActive(mod(Math.round(t), n));
      const from = pos, dist = t - from;
      if (instant || reduced() || Math.abs(dist) < 1e-3) { pos = t; settle(); return; }
      const t0 = performance.now();
      clearTimeout(timer);
      const tick = now => {
        const p = Math.min(1, (now - t0) / DURATION);
        pos = from + dist * EASE(p);
        apply();
        if (p < 1) raf = requestAnimationFrame(tick); else settle(true);
      };
      raf = requestAnimationFrame(tick);
    }
    const next = () => goTo(Math.round(target) + 1);
    const prev = () => goTo(Math.round(target) - 1);
    const goIndex = i => { let delta = i - mod(Math.round(target), n); if (delta > n / 2) delta -= n; if (delta < -n / 2) delta += n; goTo(Math.round(target) + delta); };

    /* ---------- autoplay */
    const canPlay = () => !reduced() && !userPaused && !hover && !focusIn && inView && !dragging && !document.hidden;
    function schedule(delay) {
      clearTimeout(timer);
      track.setAttribute('aria-live', canPlay() ? 'off' : 'polite');
      if (canPlay() && !raf) timer = setTimeout(next, typeof delay === 'number' ? delay : interval);
    }

    /* ---------- count-up for numeric stats (20K+, 400K+), once per element, when its slide is shown */
    all.forEach(s => s.querySelectorAll('[data-count]').forEach(el => {
      const c = { el, to: parseFloat(el.dataset.count) || 0, suffix: el.dataset.suffix || '', done: false, clone: s.hasAttribute('data-clone') };
      counters.push(c);
      /* the first slide is visible as soon as the section scrolls in: start it at zero */
      if (!reduced() && document.documentElement.classList.contains('motion') && s === real[0]) el.textContent = '0' + c.suffix;
    }));
    function countUp(slide) {
      counters.filter(c => !c.done && !c.clone && slide.contains(c.el)).forEach(c => {
        c.done = true;
        if (reduced() || !document.documentElement.classList.contains('motion')) { c.el.textContent = c.to + c.suffix; return; }
        c.el.textContent = '0' + c.suffix;
        const t0 = performance.now(), dur = 1400;
        const tick = now => {
          const p = Math.max(0, Math.min(1, (now - t0) / dur));
          c.el.textContent = Math.round(c.to * expoOut(p)) + c.suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    /* ---------- controls */
    tabs.forEach((t, i) => t.addEventListener('click', () => goIndex(i)));
    root.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key;
      let handled = true;
      if (k === 'ArrowRight') next();
      else if (k === 'ArrowLeft') prev();
      else if (k === 'Home' && e.target.getAttribute('role') === 'tab') goIndex(0);
      else if (k === 'End' && e.target.getAttribute('role') === 'tab') goIndex(n - 1);
      else handled = false;
      if (!handled) return;
      e.preventDefault();
      if (e.target.getAttribute('role') === 'tab') tabs[mod(Math.round(target), n)].focus();
    });
    if (toggle) {
      toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        root.classList.toggle('is-paused', userPaused);
        toggle.setAttribute('aria-label', userPaused ? 'Start automatic slide show' : 'Stop automatic slide show');
        schedule();
      });
    }
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; schedule(); } });
    root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; schedule(); } });
    root.addEventListener('focusin', () => { focusIn = true; schedule(); });
    root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focusIn = false; schedule(); } });
    document.addEventListener('visibilitychange', () => schedule());
    new IntersectionObserver(entries => {
      inView = entries[entries.length - 1].isIntersecting;
      if (inView && active >= 0) countUp(real[active]);
      schedule();
    }, { threshold: 0.25 }).observe(root);

    /* ---------- drag (x axis, direction lock, no momentum; reference release rules) */
    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: pos, lock: null, samples: [[e.clientX, e.timeStamp]] };
    });
    viewport.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.lock) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.lock === 'y') { drag = null; return; }
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        cancelAnimationFrame(raf); raf = 0;
        dragging = true;
        root.classList.add('is-dragging');
        drag.pos0 = pos; drag.x0 = e.clientX;
        schedule();
      }
      e.preventDefault();
      pos = drag.pos0 - (e.clientX - drag.x0) / (sgn * step);
      apply();
      drag.samples.push([e.clientX, e.timeStamp]);
      while (drag.samples.length > 2 && e.timeStamp - drag.samples[0][1] > 100) drag.samples.shift();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      const dx = e.clientX - d.x0;
      const [sx, st] = d.samples[0];
      const dt = Math.max(1, e.timeStamp - st);
      const v = (e.clientX - sx) / dt * 1000;
      let moved = 0;
      if (e.type !== 'pointercancel' && Math.abs(v) > 200) moved = Math.sign(v) * Math.max(1, Math.round(Math.abs(dx) / item));
      else if (Math.abs(dx) > item / 2) moved = Math.sign(dx) * Math.round(Math.abs(dx) / item);
      goTo(Math.round(d.pos0) - moved / sgn);
    };
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
    viewport.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    viewport.addEventListener('dragstart', e => e.preventDefault());

    /* ---------- layout */
    let rt = 0;
    const relayout = () => { measure(); apply(); };
    new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(relayout); }).observe(viewport);
    const onMQ = () => { relayout(); schedule(); };
    (reducedMQ.addEventListener ? reducedMQ.addEventListener('change', onMQ) : reducedMQ.addListener(onMQ));
    (phoneMQ.addEventListener ? phoneMQ.addEventListener('change', onMQ) : phoneMQ.addListener(onMQ));

    root.classList.add('is-ready');
    root.classList.toggle('is-reduced', reduced());
    track.scrollLeft = 0;
    measure();
    goTo(0, { instant: true });
  }

  ready(() => document.querySelectorAll('[data-carousel]').forEach(init));
})();

/* ---- 24-agency.js ---- */
/* Home 5 — A DIFFERENT KIND OF AGENCY (images 9 + 8). Markup: scripts/sections/home_agency.py,
   CSS 24-agency.css.

   1. Choreography: marks the section [data-agc-ready] (the only state in which CSS hides anything) and
      adds .is-in to each part as it scrolls in: headline lines, rules, the figure (glow → splash →
      body → ground → pins), each point together with its SVG leader group, the meeting scene and the
      note. The figure and the photo wait (≤ 1.2 s) for their images to decode so a reveal never plays
      on an empty box. A point never appears before its hot-spot: its start (--agc-at) waits for the
      figure to land, and points that arrive together are staggered; the note is written once the
      photo has started to open.
   2. Drift: while the figure is on screen its layers follow scroll very slightly — the body ±12 px,
      the splash and its glow −6 px the other way (parallax depth), the floor shadow breathes ±4 %.
      One custom property (--dr, −1…1, eased towards its target) is written per frame; CSS maps it to
      `translate` / `scale`, which compose with the entrance transforms.
   3. Keyboard: focusing the closing CTA shows its reveal wrapper at once (no focus ring on a faded control).
   Off without JS and under reduced motion: everything is static and visible. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const root = document.documentElement;
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const motion = () => (TS.motion ? TS.motion() : root.classList.contains('motion') && !matchMedia('(prefers-reduced-motion: reduce)').matches);

  const LAND = 650;      // ms after the figure starts landing before the first leader grows
  const STAGGER = 150;   // ms between points that arrive together
  const WRITE = 1000;    // ms after the meeting photo starts opening before the note is written

  /* Run fn once the element's images can paint (lazy images may still be loading after a jump), but
     never wait longer than 1.2 s — the same rule as 02-core's .reveal-image. */
  function whenDecoded(el, fn) {
    const imgs = [...el.querySelectorAll('img')].filter(img => !img.complete);
    if (!imgs.length) { fn(); return; }
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    Promise.all(imgs.map(img => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))).then(go);
    setTimeout(go, 1200);
  }

  /* The hidden states (opacity 0, and above all the photo's clip-path: circle(0%)) stop the browser's
     native lazy loading from ever seeing those images: the meeting photo only started to download once
     its own reveal had finished, so the scene opened on an empty box and the photo popped in ~2 s
     later. Fetch the section's lazy images ourselves a good scroll distance ahead (the browsers' own
     lazy-load margin is 1250–2500 px), so every reveal plays on a decoded image. */
  function prime(sec) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    }), { rootMargin: '1500px 0px 1500px 0px' });
    sec.querySelectorAll('[data-agc-fig], [data-agc-scene]').forEach(el => io.observe(el));
  }

  function choreograph(sec) {
    const fig = sec.querySelector('[data-agc-fig]');
    const scene = sec.querySelector('[data-agc-scene]');
    const note = scene && scene.querySelector('.agc-note');
    const groups = new Map([...sec.querySelectorAll('[data-agc-ln]')].map(g => [g.dataset.agcLn, g]));
    let figAt = 0, sceneAt = 0, queue = 0, landing = false, opening = false;
    const waitingPoints = [], waitingNote = [];
    const delay = (el, ms) => el.style.setProperty('--agc-at', `${Math.round(ms)}ms`);

    const landFigure = () => {
      if (!fig || landing) return;
      landing = true;
      whenDecoded(fig, () => {
        figAt = performance.now();
        fig.classList.add('is-in');
        waitingPoints.splice(0).forEach(showPoint);
      });
    };
    const showPoint = pt => {
      if (fig && !figAt) { waitingPoints.push(pt); landFigure(); return; }   // a point never precedes its hot-spot
      const now = performance.now();
      const start = Math.max(now + Math.max(0, LAND - (now - figAt)), queue + STAGGER);
      queue = start;
      [pt, groups.get(pt.dataset.agcPt)].forEach(el => { if (el) { delay(el, start - now); el.classList.add('is-in'); } });
    };
    const openScene = () => {
      if (!scene || opening) return;
      opening = true;
      whenDecoded(scene, () => {
        sceneAt = performance.now();
        scene.classList.add('is-in');
        waitingNote.splice(0).forEach(writeNote);
      });
    };
    const writeNote = el => {
      if (scene && !sceneAt) { waitingNote.push(el); openScene(); return; }
      delay(el, Math.max(0, WRITE - (performance.now() - sceneAt)));
      el.classList.add('is-in');
    };

    const io = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach(e => {
          const el = e.target;
          io.unobserve(el);
          if (el === fig) landFigure();
          else if (el === scene) openScene();
          else if (el === note) writeNote(el);
          else if (el.dataset.agcPt) showPoint(el);
          else el.classList.add('is-in');
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    sec.querySelectorAll('[data-agc-in], [data-agc-fig], [data-agc-pt], [data-agc-scene]').forEach(el => io.observe(el));
  }

  function drift(fig) {
    if (!fig) return;
    let target = 0, cur = null, raf = 0;
    const measure = () => {
      const r = fig.getBoundingClientRect();
      const vh = innerHeight || root.clientHeight;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // +1 entering below … −1 leaving above
      target = Math.max(-1, Math.min(1, p));
    };
    const tick = () => {
      raf = 0;
      measure();
      cur = cur == null ? target : cur + (target - cur) * 0.12;            // eased: the figure floats, never jerks
      if (Math.abs(target - cur) < 0.0005) cur = target;
      fig.style.setProperty('--dr', cur.toFixed(4));
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let listening = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !listening) addEventListener('scroll', request, { passive: true });
      if (!e.isIntersecting && listening) removeEventListener('scroll', request);
      listening = e.isIntersecting;
      fig.classList.toggle('is-drifting', listening);
      request();
    }, { rootMargin: '10% 0px 10% 0px' }).observe(fig);
    addEventListener('resize', request, { passive: true });
  }

  /* Keyboard: Tab can land on the closing CTA before its fade-up has played (the browser scrolls it into view,
     then the reveal still waits its 480 ms delay), leaving the focus ring on a near-invisible control. Show the
     focused control's reveal wrapper at once. */
  function focusReveal(sec) {
    sec.addEventListener('focusin', e => {
      const r = e.target.closest && e.target.closest('[data-reveal]');
      if (r && !r.classList.contains('is-in')) { r.style.setProperty('--d', '0ms'); r.classList.add('is-in'); }
    });
  }

  ready(() => {
    document.querySelectorAll('[data-agc]').forEach(sec => {
      if (!motion() || !('IntersectionObserver' in window)) return;   // static composition
      sec.setAttribute('data-agc-ready', '');
      prime(sec);
      choreograph(sec);
      drift(sec.querySelector('[data-agc-fig]'));
      focusReveal(sec);
    });
  });
})();

/* ---- 25-faq.js ---- */
/* Home FAQ accordion (reference component framer-TAjGh).
   Markup: [data-faq] > [data-faq-item] > h3 > button[aria-expanded][aria-controls] + answer panel.
   Items are independent (several may be open). Opening un-hides the panel, then the CSS grid-row
   transition grows it (300ms cubic-bezier(.44,0,.56,1)); closing collapses it and re-hides it so the
   answer leaves the accessibility tree. Closed answers use hidden="until-found" where supported, so
   the browser's find-in-page still reaches them (the match opens the item). The whole card toggles
   on click, like the reference; Up/Down/Home/End move between questions. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reduced = () => (TS.reduced ? TS.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DURATION = 340;
  const HIDE = 'onbeforematch' in document.documentElement ? 'until-found' : true;

  ready(() => {
    document.querySelectorAll('[data-faq]').forEach(list => {
      const items = [...list.querySelectorAll('[data-faq-item]')];
      const buttons = [];
      items.forEach(item => {
        const btn = item.querySelector('button[aria-controls]');
        const panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
        if (!btn || !panel) return;
        buttons.push(btn);
        let timer = 0;
        const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
        const set = open => {
          clearTimeout(timer);
          btn.setAttribute('aria-expanded', String(open));
          if (open) {
            panel.hidden = false;
            void panel.offsetHeight;           // commit the collapsed row before animating
            item.classList.add('is-open');
          } else {
            item.classList.remove('is-open');
            timer = setTimeout(() => { if (!isOpen()) panel.hidden = HIDE; }, reduced() ? 0 : DURATION);
          }
        };
        if (isOpen()) item.classList.add('is-open'); else panel.hidden = HIDE;
        btn.addEventListener('click', () => set(!isOpen()));
        // find-in-page hit: open instantly (no height tween) so the browser scrolls to the final spot
        panel.addEventListener('beforematch', () => {
          if (isOpen()) return;
          panel.style.transition = 'none';
          set(true);
          void panel.offsetHeight;
          requestAnimationFrame(() => { panel.style.transition = ''; });
        });
        item.addEventListener('click', e => {
          if (e.target.closest('button, a, input, select, textarea')) return;
          const sel = window.getSelection && String(window.getSelection());
          if (sel) return;                      // let people select answer text
          set(!isOpen());
        });
      });

      list.addEventListener('keydown', e => {
        const i = buttons.indexOf(document.activeElement);
        if (i < 0) return;
        let next = -1;
        if (e.key === 'ArrowDown') next = (i + 1) % buttons.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        if (next < 0) return;
        e.preventDefault();
        buttons[next].focus();
      });
    });
  });
})();

/* ---- 26-founder.js ---- */
/* FOUNDER ("Portrait in light"): Who We Are #founder + #why and the home teaser #founder-teaser.
   Markup: scripts/sections/founder.py (+ pages/who.py, sections/home_founder.py) · CSS: src/css/26-founder.css.
   - Fit: both nameplate lines are scaled (--k1/--k2, transform only) to the name's width: on init, when the fonts
     are ready and on resize (never per frame).
   - Entrances ([data-fdr-in]): .is-in once at 30 % visible, after the intro.
   - Light: the plate's warm light follows a finger (passive touch listeners, never preventDefault: the page always
     scrolls) or the mouse, and returns to rest; one sweep on entrance. It never moves on scroll alone, and its job
     stops as soon as it has settled (a resting pointer costs nothing). --lx/--ly are written on the two layers that
     use them, only on change.
   - Journey: a split-flap board (forward-only riffle through his four disciplines) + route strip. Phones (< 800px):
     driven by scroll through the real headline (by the board itself when the journey is taller than the screen,
     e.g. landscape). >= 800px (board beside the plate, all in view at once): the story plays by itself once the
     board is in view (leg 1 ~1.2 s, leg 2 ~1.4 s, then leg 3 stays). Everywhere: a tap on a line flies that leg, a
     tap on the board the next one.
   - Quotes: scroll-linked ink (--p on the figure); quote 2's full stop lights up orange when the swap completes.
   - Restore (#why): tap / click / Enter (keydown) / Space (keyup) toggles a struck line, never on key repeat; each
     line's description tells its state; when "Gireesh wanted to build something different." reaches the reading
     line, the lines still struck restore themselves (once).
   - Teaser: the route strip plays once at 40 % visible, replays on tap (and on mouse enter, throttled).
   One rAF loop serves every job, only while one of them is on screen; all jobs read layout first, then write.
   Reduced motion (no html.motion): instant state changes (the fit, the board drivers and restore still work); no
   sweep, lerp or draws. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    if (!document.querySelector('[data-fdr-fit],[data-fdr-q],[data-fdr-rs]')) return;
    const motion = TS.motion ? TS.motion() : false;
    const after = TS.afterIntro || (f => f());
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const wide = matchMedia('(min-width: 800px)');
    const IO = 'IntersectionObserver' in window;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const EASE = 'cubic-bezier(.22,1,.36,1)';
    const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    let nav = navH();
    addEventListener('resize', () => { nav = navH(); });

    /* ---------- shared rAF scheduler. A job is { read?() -> data, run(data, dt) -> keepGoing }. Every job's layout
       read happens first, then every write, so one frame never forces a style recalc between two jobs (a write
       followed by another job's getBoundingClientRect). dt is capped at 64 ms. */
    const jobs = new Set();
    let raf = 0, last = 0;
    const loop = t => {
      raf = 0;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      const list = [...jobs], data = list.map(j => (j.read ? j.read() : null));
      list.forEach((j, i) => { if (!j.run(data[i], dt)) jobs.delete(j); });
      if (jobs.size) raf = requestAnimationFrame(loop); else last = 0;
    };
    const kick = job => { if (job) jobs.add(job); if (!raf && jobs.size) raf = requestAnimationFrame(loop); };
    // scroll-linked jobs run (once per frame) only while their element is near the viewport
    const near = new Set();
    const onScroll = () => near.forEach(j => kick(j));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    const scrollJob = (el, job, rootMargin) => {
      if (!IO) return;
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { near.add(job); kick(job); } else near.delete(job);
      }, { rootMargin }).observe(el);
    };

    /* rolling counter (01 -> 02, 0/3 -> 1/3): the new value rises into a 1em window */
    function rollTo(roll, text) {
      if (!roll) return;
      const cur = roll.lastElementChild;
      if (cur && cur.textContent === text) return;
      const nu = document.createElement('span');
      nu.textContent = text;
      if (!motion || !cur || !roll.animate) { roll.replaceChildren(nu); return; }
      [...roll.children].forEach(s => { if (s !== cur) s.remove(); });
      roll.appendChild(nu);
      nu.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 450, easing: EASE });
      cur.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 450, easing: EASE, fill: 'forwards' })
        .finished.then(() => cur.remove(), () => cur.remove());
    }

    /* ---------- 1. nameplate fit */
    function fit() {
      const names = [...document.querySelectorAll('[data-fdr-fit]')];
      if (!names.length) return;
      const run = () => names.forEach(n => {
        const target = n.clientWidth;
        if (!target) return;
        n.querySelectorAll('[data-fit]').forEach((l, i) => {
          const w = l.offsetWidth;
          if (!w) return;
          const k = clamp(target / w, .88, 1.12).toFixed(4), prop = `--k${i + 1}`;
          if (n.style.getPropertyValue(prop) !== k) n.style.setProperty(prop, k);
        });
      });
      run();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(run);
        names.forEach(n => ro.observe(n.parentElement));
      } else addEventListener('resize', run);
    }

    /* ---------- 2. entrances */
    function entrances() {
      const els = [...document.querySelectorAll('[data-fdr-in]')];
      const enter = el => { el.classList.add('is-in'); el.dispatchEvent(new CustomEvent('fdr:in')); };
      if (!motion || !IO) { els.forEach(enter); return; }
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        enter(e.target);
      }), { threshold: .3 });
      after(() => els.forEach(el => io.observe(el)));
    }

    /* ---------- 3. the light on the plate */
    function light(fr) {
      const REST = { x: 68, y: 30 }, cur = { x: REST.x, y: REST.y }, tgt = { x: REST.x, y: REST.y };
      // --lx/--ly live on the two layers that use them (registered non-inherited in 26-founder.css): a custom property
      // written on the frame would restyle its whole subtree (the nameplate letters, the 12 texture rows) each time
      const layers = [...fr.querySelectorAll('.fdr-frame__light,.fdr-frame__tex')];
      let input = false, sweep = null, visible = !IO, wx = -1e3, wy = -1e3;
      const write = () => {
        const dx = Math.abs(cur.x - wx) > .05, dy = Math.abs(cur.y - wy) > .05;
        if (!dx && !dy) return;
        if (dx) wx = cur.x;
        if (dy) wy = cur.y;
        layers.forEach(l => {
          if (dx) l.style.setProperty('--lx', `${wx.toFixed(2)}%`);
          if (dy) l.style.setProperty('--ly', `${wy.toFixed(2)}%`);
        });
      };
      const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const job = {
        run(_, dt) {
          if (!visible) return false;
          if (sweep) {                                       // one sweep from the top-left to rest (2.4 s, never looped)
            const t = (performance.now() - sweep.t0) / 2400;
            const e = ease(clamp(t, 0, 1));
            cur.x = 10 + (REST.x - 10) * e;
            cur.y = 6 + (REST.y - 6) * e;
            if (t >= 1) sweep = null;
            write();
            return true;
          }
          const to = input ? tgt : REST;
          const a = 1 - Math.exp(-dt / (input ? 90 : 220));   // follow 90 ms, return 220 ms (frame-rate independent)
          cur.x += (to.x - cur.x) * a;
          cur.y += (to.y - cur.y) * a;
          const moving = Math.abs(to.x - cur.x) > .05 || Math.abs(to.y - cur.y) > .05;
          if (!moving) { cur.x = to.x; cur.y = to.y; }
          write();
          return moving;                                     // settled: stop (the next move kicks the job again)
        },
      };
      const point = (cx, cy) => {
        const r = fr.getBoundingClientRect();
        if (!r.width || !r.height) return;
        tgt.x = clamp((cx - r.left) / r.width * 100, 4, 96);
        tgt.y = clamp((cy - r.top) / r.height * 100, 4, 96);
        input = true;
        sweep = null;
        if (!motion) { cur.x = tgt.x; cur.y = tgt.y; write(); } else kick(job);
      };
      const release = () => {
        if (!input) return;
        input = false;
        if (!motion) { cur.x = REST.x; cur.y = REST.y; write(); } else kick(job);
      };
      // touch: passive listeners only (never preventDefault, touch-action untouched): the light follows the finger even
      // while it scrolls the page
      const touch = e => { const t = e.touches[0]; if (t) point(t.clientX, t.clientY); };
      fr.addEventListener('touchstart', touch, { passive: true });
      fr.addEventListener('touchmove', touch, { passive: true });
      fr.addEventListener('touchend', e => { if (!e.touches.length) release(); }, { passive: true });
      fr.addEventListener('touchcancel', release, { passive: true });
      fr.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && fine.matches) point(e.clientX, e.clientY); });
      fr.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') release(); });
      if (!motion) return;
      fr.addEventListener('fdr:in', () => {
        if (input) return;
        cur.x = 10; cur.y = 6;
        write();
        sweep = { t0: performance.now() + 300 };
        kick(job);
      }, { once: true });
      if (IO) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(job); }, { rootMargin: '10%' }).observe(fr);
    }

    /* ---------- 4. journey: split-flap board + route strip + departure list */
    function flapModule(el, deck) {
      const top = el.querySelector('.fdr-flap__h--t .fdr-flap__w'), bot = el.querySelector('.fdr-flap__h--b .fdr-flap__w');
      let cur = el.dataset.word, target = cur, busy = false;
      const leaf = (half, word) => {
        const s = document.createElement('span'), w = document.createElement('span');
        s.className = `fdr-flap__leaf fdr-flap__leaf--${half}`;
        w.className = 'fdr-flap__w';
        w.textContent = word;
        s.appendChild(w);
        el.appendChild(s);
        return s;
      };
      const settle = word => { cur = word; top.textContent = word; bot.textContent = word; el.dataset.word = word; };
      const step = () => {
        if (cur === target) { busy = false; return; }
        busy = true;
        const i = deck.indexOf(cur);
        const steps = (deck.indexOf(target) - i + deck.length) % deck.length;
        const next = deck[(i + 1) % deck.length];
        if (!motion || !el.animate || i < 0) { settle(target); busy = false; return; }
        const last1 = steps === 1;
        const fallD = last1 ? 120 : 45, landD = last1 ? 150 : 60;
        // a real Solari step: the static top shows the next word at once, the old top half falls over it, then the
        // next word's bottom half lands; the static bottom half changes when it has landed
        const fall = leaf('t', cur);
        top.textContent = next;
        const land = leaf('b', next);
        land.style.transform = 'rotateX(90deg)';
        fall.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }],
          { duration: fallD, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' }).finished
          .then(() => {
            fall.remove();
            return land.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }],
              { duration: landD, easing: 'cubic-bezier(.3,1.25,.55,1)', fill: 'forwards' }).finished;
          })
          .catch(() => {})
          .then(() => {
            land.remove();
            settle(next);
            if (cur !== target) step(); else busy = false;   // riffle on (the target may have changed meanwhile)
          });
      };
      return { to(word) { if (deck.indexOf(word) < 0) return; target = word; if (!busy) step(); } };
    }

    function journey() {
      const j = document.querySelector('[data-fdr-journey]');
      if (!j) return;
      const board = j.querySelector('[data-fdr-board]');
      const rows = [...j.querySelectorAll('.fdr-dep__row')];
      if (!board || rows.length !== 3) return;
      const deck = (board.dataset.deck || '').split('|');
      const [from, to] = [...board.querySelectorAll('[data-flap]')].map(el => flapModule(el, deck));
      const roll = board.querySelector('.fdr-board__n .fdr-roll');
      const sec = j.closest('section');
      const frame = sec && sec.querySelector('[data-fdr-frame]');
      let leg = 1, hold = false, story = true, inView = false, arrive = 0, tTo = 0, storyT = 0;
      j.classList.add('is-live');
      const setLeg = k => {
        if (k === leg) return;
        leg = k;
        from.to(deck[k - 1]);
        clearTimeout(tTo);
        if (motion) tTo = setTimeout(() => to.to(deck[k]), 90); else to.to(deck[k]);
        rows.forEach((r, i) => r.classList.toggle('is-on', i === k - 1));
        rollTo(roll, String(k).padStart(2, '0'));
        board.dataset.leg = String(k);
        clearTimeout(arrive);
        board.classList.remove('is-arrived');
        if (k === 3) { if (motion) arrive = setTimeout(() => board.classList.add('is-arrived'), 600); else board.classList.add('is-arrived'); }
      };

      // (a) phones (< 800px): the board sits above the list, so scroll drives it. The journey's centre travels from
      // 82 % to 35 % of the viewport (thresholds .34 / .67, .02 hysteresis so a leg never flickers at a boundary).
      // When the journey is taller than ~80 % of the visible height (landscape), the board's own centre drives it, so
      // both flaps flip while they are in view rather than under the nav.
      const measure = {
        read() {
          if (hold || wide.matches) return null;
          const vh = innerHeight;
          return { r: (j.offsetHeight > .8 * (vh - nav) ? board : j).getBoundingClientRect(), vh };
        },
        run(d) {
          if (!d) return false;
          const p = clamp((.82 * d.vh - (d.r.top + d.r.height / 2)) / (.47 * d.vh), 0, 1);
          const up = p >= .69 ? 3 : p >= .36 ? 2 : 1;
          const down = p < .32 ? 1 : p < .65 ? 2 : 3;
          if (up > leg) setLeg(up); else if (down < leg) setLeg(down);
          return false;
        },
      };
      after(() => scrollJob(j, measure, '0px'));
      if (IO) new IntersectionObserver(([e]) => { if (!e.isIntersecting) hold = false; }).observe(j);

      // (a') >= 800px: the board is beside the plate and the whole journey is in view at once, so a scroll mapping
      // would finish the story before the visitor settles. Instead it plays by itself, once: when the board is (nearly)
      // fully in view below the nav, after the intro and the plate's entrance, leg 1 holds ~1.2 s, leg 2 ~1.4 s, then
      // leg 3 stays. It pauses while the board is out of view, never runs backwards and stops at the first tap.
      // A #founder landing therefore starts on 01 — 03.
      const play = () => {
        clearTimeout(storyT);
        if (!story || hold || !inView || !wide.matches || leg >= 3) return;
        if (frame && !frame.classList.contains('is-in')) return;     // fdr:in calls play again
        storyT = setTimeout(() => {
          if (story && !hold && inView && wide.matches && leg < 3) { setLeg(leg + 1); play(); }
        }, leg === 1 ? 1200 : 1400);
      };
      if (frame) frame.addEventListener('fdr:in', play);
      if (IO) after(() => {
        const need = () => Math.min(.9, (innerHeight - nav) * .95 / Math.max(1, board.offsetHeight));
        new IntersectionObserver(([e]) => {
          const was = inView;
          inView = e.isIntersecting && e.intersectionRatio >= need() - .005;
          if (inView && !was) play(); else if (!inView && was) clearTimeout(storyT);
        }, { rootMargin: `-${Math.round(nav)}px 0px 0px 0px`, threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(board);
      });

      // (b) a line flies its leg; (c) the board flies the next one (3 wraps to 1). Manual input ends the story and
      // pauses the scroll driver until the journey leaves the viewport. Click only (no touch handlers).
      const manual = k => { hold = true; story = false; clearTimeout(storyT); setLeg(k); };
      rows.forEach((r, i) => r.addEventListener('click', () => manual(i + 1)));
      board.addEventListener('click', () => manual(leg % 3 + 1));
    }

    /* ---------- 5. pull quotes: emphasis moves from sentence 1 to sentence 2 (founder.py times each word's --a) */
    function quotes() {
      if (!motion || !IO) return;                           // CSS default = the end state
      document.querySelectorAll('[data-fdr-q]').forEach(q => {
        q.classList.add('is-ink');
        const dot = q.querySelector('.fdr-dot');
        let lastP = -1;
        const job = {
          read: () => q.getBoundingClientRect(),
          run(r) {
            const vh = innerHeight;
            const p = clamp((.85 * vh - (r.top + r.height / 2)) / (.40 * vh), 0, 1);
            if (Math.abs(p - lastP) > .002 || ((p === 0 || p === 1) && p !== lastP)) { lastP = p; q.style.setProperty('--p', p.toFixed(3)); }
            if (dot && p >= .85) q.classList.add('is-dot');  // the swap is complete: the full stop lights up (one-way)
            return false;
          },
        };
        job.run(job.read());
        scrollJob(q, job, '20%');
      });
    }

    /* ---------- 6. restore (Why TESERACT exists) */
    function restore() {
      const box = document.querySelector('[data-fdr-rs]');
      if (!box) return;
      const head = box.querySelector('.fdr-rs__head'), hint = box.querySelector('.fdr-rs__hint');
      const roll = box.querySelector('.fdr-rs__count .fdr-roll');
      const lines = [...box.querySelectorAll('[data-swap]')];
      const touched = new Set();
      let struckAt = 0, auto = false;
      if (head) head.hidden = false;
      box.classList.add('is-armed');
      if (hint && hint.dataset.fine && fine.matches) hint.textContent = hint.dataset.fine;
      // the strike is visual only, so each line's description says its state (owner micro-labels, pages/who.py)
      const desc = ['Struck through. Press to restore.', 'Restored. Press to strike through again.'].map((t, i) => {
        const s = document.createElement('span');
        s.id = `fdr-rs-d${i}`;
        s.hidden = true;
        s.textContent = t;
        box.appendChild(s);
        return s.id;
      });
      const isOn = l => l.classList.contains('is-restored');
      const set = (l, on) => {
        l.classList.toggle('is-restored', on);
        l.setAttribute('aria-pressed', on ? 'true' : 'false');
        l.setAttribute('aria-describedby', desc[on ? 1 : 0]);
        const n = lines.filter(isOn).length;
        rollTo(roll, String(n));
        box.classList.toggle('is-whole', n === lines.length);
      };
      lines.forEach(l => {
        l.setAttribute('role', 'button');
        l.tabIndex = 0;
        l.setAttribute('aria-pressed', 'false');
        l.setAttribute('aria-describedby', desc[0]);
        l.addEventListener('click', () => { touched.add(l); l.classList.add('is-touched'); set(l, !isOn(l)); });
        // native-button keys: Enter acts on keydown, Space on keyup (its keydown only stops the page scrolling);
        // a held key never repeats the toggle
        let space = false;
        l.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) l.click(); }
          else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (!e.repeat) space = true; }
        });
        l.addEventListener('keyup', e => {
          if ((e.key === ' ' || e.key === 'Spacebar') && space) { space = false; e.preventDefault(); l.click(); }
        });
        l.addEventListener('blur', () => { space = false; });
      });
      const breathe = () => {                                // the invitation: once, on the first line still struck
        const l = lines.find(x => !isOn(x));
        const v = l && l.querySelector('.fdr-rs__v');
        if (!v) return;
        v.classList.add('is-breathe');
        v.addEventListener('animationend', () => v.classList.remove('is-breathe'), { once: true });
      };
      const strike = () => {
        if (struckAt) return;
        struckAt = performance.now();
        box.classList.add('is-struck');
        if (motion) setTimeout(breathe, 450 + (lines.length - 1) * 300 + 1400);
      };
      if (!motion || !IO) strike();
      else after(() => {
        const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio >= .3) { io.disconnect(); strike(); } }, { threshold: .3 });
        io.observe(box);
      });
      // auto-restore: the answer paragraph reaching the reading line restores what the visitor has not touched
      const trigger = document.querySelector('[data-fdr-rs-trigger]');
      if (!trigger || !IO) return;
      const run = () => {
        if (auto) return;
        auto = true;
        strike();
        const wait = motion ? Math.max(0, 1600 - (performance.now() - struckAt)) : 0;
        const todo = lines.filter(l => !isOn(l) && !touched.has(l));
        setTimeout(() => todo.forEach((l, i) => {
          const go = () => { if (!isOn(l) && !touched.has(l)) set(l, true); };
          if (motion) setTimeout(go, i * 260); else go();
        }), wait);
      };
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } },
        { rootMargin: matchMedia('(min-width: 1200px)').matches ? '0px 0px -55% 0px' : '0px 0px -40% 0px' });
      after(() => io.observe(trigger));
    }

    /* ---------- 7. home teaser: the route strip plays once, replays on tap */
    function teaser() {
      const s = document.querySelector('[data-fdr-strip][data-play]');
      if (!s || !motion) return;
      const play = () => { s.classList.remove('is-played'); void s.getBoundingClientRect(); s.classList.add('is-played'); };
      if (IO) after(() => {
        const io = new IntersectionObserver(([e]) => { if (e.intersectionRatio >= .4) { io.disconnect(); play(); } }, { threshold: .4 });
        io.observe(s);
      });
      s.addEventListener('click', play);
      const sec = s.closest('.fdt');
      let lastHover = 0;
      if (sec) sec.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse' || !fine.matches || !s.classList.contains('is-played')) return;
        const now = performance.now();
        if (now - lastHover < 2500) return;
        lastHover = now;
        play();
      });
    }

    fit();
    entrances();
    document.querySelectorAll('[data-fdr-frame]').forEach(light);
    journey();
    quotes();
    restore();
    teaser();
  });
})();

/* ---- 30-who.js ---- */
/* Who We Are (/who-we-are/) — images 5, 6, 7. Markup: scripts/pages/who.py, CSS: 30-who.css.
   - Hero: entrance (light sweep, monitor rise, letters rise, full stop pops) once the monitor image is
     decoded, then the light settles (bounded CSS, no endless loop); fine-pointer tilt on the monitor (±2.5deg,
     ±6px) with the light counter-moving (±10px); touch screens get the same tilt and light from the scroll
     through the hero (P-08); scroll parallax (transform only, <= 40px).
   - Boards ([data-who-in], also the rock): .is-in when they enter (grid draw, leader lines, nodes, the rock's
     rise + one bob); .is-off when they leave (pauses a bob in progress).
   - Phone circuit (< 800px, [data-who-rail]): the trace, nodes and leaders are built from the layout boxes and
     grow one way with scroll (static and complete without html.motion).
   - Rock: scroll parallax (<= 30px) + a slight sway; the glass tile follows the pointer (±6px, lerped), or the
     scroll on touch screens.
   - Dial: rotation linked to scroll through band C (-20deg -> +20deg), lerped; the sphere turns with it.
   - Steps: each number box fills as its step crosses 55 % of the viewport (one-way progress).
   - Clock: the visitor's local time, minute precision, only while the intro is on screen.
   - How we think: spread counters roll in, the panel mark turns with scroll (±4deg), the light field
     drifts with the pointer (with the scroll on touch screens).
   One rAF loop serves every scroll/pointer-linked item and only runs while one of them is on screen; nothing
   moves on its own for more than a few seconds (WCAG 2.2.2).
   Reduced motion (or no html.motion): nothing moves; everything is visible from the start. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    if (!document.body.classList.contains('page-who')) return;
    const motion = TS.motion ? TS.motion() : false;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const desktop = matchMedia('(min-width: 1024px)');

    /* ---------- in-view boards */
    const boards = [...document.querySelectorAll('[data-who-in]')];
    if (!motion || !('IntersectionObserver' in window)) boards.forEach(b => b.classList.add('is-in'));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0) e.target.classList.add('is-in');
        e.target.classList.toggle('is-off', !e.isIntersecting);
      }), { rootMargin: '0px 0px -12% 0px', threshold: [0, 0.08] });
      boards.forEach(b => io.observe(b));
    }

    /* ---------- clock (visitor's local time, hh:mm AM/PM) */
    const clockLine = document.querySelector('[data-who-time]');
    const clock = document.querySelector('[data-who-clock]');
    if (clockLine && clock) {
      let fmt = null, iso = null;
      try {
        fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        iso = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      } catch (e) { fmt = null; }
      if (fmt) {
        const tick = () => {
          const now = new Date();
          const text = fmt.format(now).replace(/\s/g, ' ');
          if (clock.textContent !== text) clock.textContent = text;
          clock.setAttribute('datetime', iso.format(now));
        };
        tick();
        clockLine.hidden = false;
        let timer = 0;
        const run = () => { tick(); timer = setTimeout(run, 60000 - (Date.now() % 60000) + 50); };
        const start = () => { if (!timer) { tick(); timer = setTimeout(run, 60000 - (Date.now() % 60000) + 50); } };
        const stop = () => { clearTimeout(timer); timer = 0; };
        const host = clockLine.closest('section') || clockLine;
        if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(host);
        else start();
      }
    }

    /* ---------- steps: one-way progress through 01-04 */
    const steps = [...document.querySelectorAll('[data-who-step]')];
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-done'); sio.unobserve(e.target); }
      }), { rootMargin: '0px 0px -45% 0px', threshold: 0 });
      steps.forEach(s => sio.observe(s));
    }

    /* ---------- how-we-think spreads: active state (counter roll + panel reveal) */
    const spreads = [...document.querySelectorAll('[data-who-sp]')];
    if (!motion || !('IntersectionObserver' in window)) spreads.forEach(s => s.classList.add('is-in'));
    else {
      const pio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); }),
        { rootMargin: '0px 0px -30% 0px', threshold: 0 });
      spreads.forEach(s => pio.observe(s));
    }

    /* ---------- phone circuit rails (30-who.css .who-rail): one trace per board in the left gutter, a node beside
       each [data-who-pin] box (h = its head / first child, l = its first text line, c = its centre; ! = red, - = no
       node: the leader runs from the trace into the box's own marker) and a leader into it. Positions come from the
       layout boxes (offset chain), so reveal transforms never move a node; rebuilt whenever a board changes size.
       The trace centre and node edges sit on half pixels (crisp at 1x-3x). */
    const phone = matchMedia('(max-width: 799.98px)');
    const rails = [...document.querySelectorAll('[data-who-rail]')].map(svg => ({ svg, board: svg.parentElement, line: null, pins: [], y0: 0, y1: 0, reach: -Infinity }));
    const boxAt = (el, root) => {
      let x = 0, y = 0, n = el;
      while (n && n !== root) {
        x += n.offsetLeft; y += n.offsetTop;
        const p = n.offsetParent;
        if (p && p !== root) { x += p.clientLeft; y += p.clientTop; }
        n = p;
      }
      return n === root ? { x, y } : null;
    };
    const paintRail = r => {   // one-way: the trace reaches the 55 % line of the screen (as the steps do)
      if (!r.line || !motion) return;
      r.reach = Math.max(r.reach, innerHeight * 0.55 - r.svg.getBoundingClientRect().top);
      const f = clamp((r.reach - r.y0) / Math.max(1, r.y1 - r.y0), 0, 1);
      r.line.style.strokeDashoffset = (1 - f).toFixed(4);
      r.pins.forEach(pn => { if (r.reach >= pn.y) pn.g.classList.add('is-on'); });
    };
    const buildRail = r => {
      const { svg, board } = r;
      if (!phone.matches || !board) { if (r.line) { svg.textContent = ''; r.line = null; r.pins = []; } return; }
      const x = Math.floor(parseFloat(getComputedStyle(board).paddingLeft) / 2) + 0.5;
      const pins = [];
      board.querySelectorAll('[data-who-pin]').forEach(el => {
        const b = boxAt(el, board);
        if (!b || !el.offsetHeight) return;
        const m = el.dataset.whoPin;
        let dy = el.offsetHeight / 2;
        if (m[0] === 'h' && el.firstElementChild) {
          const c = el.firstElementChild, cb = boxAt(c, board);
          if (cb) dy = cb.y - b.y + c.offsetHeight / 2;
        } else if (m[0] === 'l') {
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
          dy = el.clientTop + parseFloat(cs.paddingTop) + lh / 2;
        }
        // text pins keep a hair's gap before the words; boxes are met at their border
        const bare = m.includes('-');
        pins.push({ y: Math.floor(b.y + dy) + 0.5, xb: Math.round(m[0] === 'l' && !bare ? b.x - 3 : b.x), red: m.includes('!'), bare });
      });
      if (!pins.length) return;
      pins.sort((a, z) => a.y - z.y);
      const W = board.clientWidth, H = board.clientHeight;
      r.y0 = svg.dataset.from === 'edge' ? 0 : pins[0].y;
      r.y1 = svg.dataset.to === 'edge' ? H : pins[pins.length - 1].y;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = `<line class="who-wire who-wire--rail" x1="${x}" y1="${r.y0}" x2="${x}" y2="${r.y1}" pathLength="1"/>`
        + pins.map(pn => {
          const x1 = pn.bare ? x : x + 4.5;
          return '<g class="who-pin">'
            + (pn.xb > x1 ? `<line class="who-rail__lead" x1="${x1}" y1="${pn.y}" x2="${pn.xb}" y2="${pn.y}" pathLength="1"/>` : '')
            + (pn.bare ? '' : `<g class="who-node${pn.red ? ' who-node--red' : ''}"><rect class="who-node__o" x="${x - 4}" y="${pn.y - 4}" width="8" height="8"/>`
              + `<rect class="who-node__i" x="${x - 1.5}" y="${pn.y - 1.5}" width="3" height="3"/></g>`)
            + '</g>';
        }).join('');
      r.line = svg.querySelector('.who-wire--rail');
      r.pins = [...svg.querySelectorAll('.who-pin')].map((g, i) => ({ g, y: pins[i].y }));
      paintRail(r);
    };
    if (rails.length) {
      const all = () => rails.forEach(buildRail);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(es => es.forEach(e => { const r = rails.find(x => x.board === e.target); if (r) buildRail(r); }));
        rails.forEach(r => r.board && ro.observe(r.board));
      } else { all(); addEventListener('resize', all, { passive: true }); }
      if (phone.addEventListener) phone.addEventListener('change', all);
    }

    /* ---------- hero entrance */
    const hero = document.querySelector('[data-who-hero]');
    if (hero) {
      if (!motion) hero.classList.add('is-on');
      else {
        const im = hero.querySelector('.who-hero__img');
        let done = false;
        // the entrance waits for the intro stage to lift (01-intro.js; immediate without an intro)
        const go = () => { if (done) return; done = true; TS.afterIntro(() => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-on')))); };
        if (im && !im.complete && im.decode) { im.decode().then(go, go); setTimeout(go, 900); } else go();
        new IntersectionObserver(([e]) => hero.classList.toggle('is-off', !e.isIntersecting)).observe(hero);
      }
    }
    if (!motion) return;

    /* ---------- scroll / pointer linked items (one rAF loop) */
    const items = [];
    const visible = new Set();
    const vio = new IntersectionObserver(es => es.forEach(e => {
      // a board can carry several items (rock + rail, dial + rail)
      items.forEach(it => { if (it.el === e.target) { if (e.isIntersecting) visible.add(it); else visible.delete(it); } });
      kick();
    }), { rootMargin: '10% 0px 10% 0px' });
    const add = (el, update) => { if (!el) return; const it = { el, update, s: {} }; items.push(it); vio.observe(el); };

    const pointer = { x: 0, y: 0, active: false };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
      pointer.active = true;
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; kick(); });

    // hero: parallax (<= 40px) + pointer tilt
    if (hero) {
      const mon = hero.querySelector('[data-who-monitor]');
      const tilt = hero.querySelector('[data-who-tilt]');
      const light = hero.querySelector('[data-who-light]');
      const disp = hero.querySelector('[data-who-display]');
      add(hero, it => {
        const s = it.s;
        const r = hero.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height), 0, 1);
        const usePtr = finePointer.matches && desktop.matches;
        // touch screens (no hover pointer): the same tilt and counter-moving light, fed by the scroll through the
        // hero - the monitor turns a little and its top leans back as it rises (P-08)
        const useScroll = !finePointer.matches;
        const tx = usePtr ? pointer.x : useScroll ? p * 0.7 : 0, ty = usePtr ? pointer.y : useScroll ? -p : 0;
        s.px = lerp(s.px || 0, tx, 0.08); s.py = lerp(s.py || 0, ty, 0.08);
        mon.style.transform = `translate3d(0,${(-40 * p).toFixed(2)}px,0) scale(${(1 - 0.06 * p).toFixed(4)})`;
        tilt.style.transform = `perspective(1400px) rotateX(${(-s.py * 2.5).toFixed(3)}deg) rotateY(${(s.px * 2.5).toFixed(3)}deg) translate3d(${(s.px * 6).toFixed(2)}px,${(s.py * 6).toFixed(2)}px,0)`;
        light.style.transform = `translate3d(${(-s.px * 10).toFixed(2)}px,${(30 * p - s.py * 10).toFixed(2)}px,0)`;
        disp.style.transform = `translate3d(0,${(-36 * p).toFixed(2)}px,0)`;
        return Math.abs(s.px - tx) > 0.001 || Math.abs(s.py - ty) > 0.001;
      });
    }

    // rock: scroll parallax + glass tile follows the pointer
    document.querySelectorAll('[data-who-par]').forEach(par => {
      const amt = parseFloat(par.dataset.whoPar) || -30;
      const glass = par.querySelector('[data-who-glass]');
      add(par.closest('.who-board') || par, it => {
        const s = it.s;
        const r = par.getBoundingClientRect();
        const c = clamp((r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2), -1, 1);  // -1 .. 1 across the screen
        // parallax + a slight sway (the rock's float lives in the scroll; its CSS bob plays once, A11Y-06)
        par.style.transform = `translate3d(0,${(c * -amt / 2).toFixed(2)}px,0) rotate(${(c * -0.8).toFixed(3)}deg)`;
        if (!glass) return false;
        // the glass tile drifts against the rock: with the pointer, or with the scroll on touch screens (P-08), so it
        // reads as a pane floating in front rather than a grey patch
        const fine = finePointer.matches;
        const tx = fine ? pointer.x * 6 : c * -5, ty = fine ? pointer.y * 6 : c * 9;
        s.gx = lerp(s.gx || 0, tx, 0.08); s.gy = lerp(s.gy || 0, ty, 0.08);
        glass.style.transform = `translate3d(${s.gx.toFixed(2)}px,${s.gy.toFixed(2)}px,0)`;
        return Math.abs(s.gx - tx) > 0.01 || Math.abs(s.gy - ty) > 0.01;
      });
    });

    // dial: rotation linked to scroll through its band, eased
    document.querySelectorAll('[data-who-dial]').forEach(dial => {
      const svg = dial.querySelector('svg');
      const band = dial.closest('.who-board') || dial;
      const sphere = band.querySelector('.who-sphere svg');   // turns with the dial (half a turn each way), no spin of its own
      add(band, it => {
        const s = it.s;
        const r = band.getBoundingClientRect();
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        const target = -20 + 40 * p;
        s.a = s.a == null ? target : lerp(s.a, target, 0.1);
        svg.style.setProperty('--dial', `${s.a.toFixed(3)}deg`);
        if (sphere) sphere.style.transform = `rotate(${(s.a * 9).toFixed(2)}deg)`;
        return Math.abs(s.a - target) > 0.01;
      });
    });

    // think panels: mark turns with scroll (±4deg), light drifts with the pointer (±6 %)
    spreads.forEach(sp => {
      const vis = sp.querySelector('[data-who-rot]');
      const pnl = sp.querySelector('[data-who-pnl]');
      const lightEl = pnl && pnl.querySelector('.who-pnl__light');
      if (!vis) return;
      add(sp, it => {
        const s = it.s;
        const r = pnl.getBoundingClientRect();
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        vis.style.setProperty('--rot', `${(-4 + 8 * p).toFixed(3)}deg`);
        if (lightEl) {
          // with the pointer, or with the panel's scroll on touch screens (P-08)
          const fine = finePointer.matches;
          const tx = fine ? pointer.x * 6 : (p - 0.5) * 12, ty = fine ? pointer.y * 6 : (0.5 - p) * 8;
          s.lx = lerp(s.lx || 0, tx, 0.06); s.ly = lerp(s.ly || 0, ty, 0.06);
          lightEl.style.setProperty('--lx', `${s.lx.toFixed(2)}%`);
          lightEl.style.setProperty('--ly', `${s.ly.toFixed(2)}%`);
          return Math.abs(s.lx - tx) > 0.02 || Math.abs(s.ly - ty) > 0.02;
        }
        return false;
      });
    });

    // phone circuit rails: grow with the scroll while their board is on screen
    rails.forEach(r => r.board && add(r.board, () => { paintRail(r); return false; }));

    let raf = 0;
    function frame() {
      raf = 0;
      let again = false;
      visible.forEach(it => { if (it.update(it)) again = true; });
      if (again) kick();
    }
    function kick() { if (!raf && visible.size) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick, { passive: true });
  });
})();

/* ---- 32-approach.js ---- */
/* Our Approach (image 4 flowchart). Markup: scripts/pages/approach.py, CSS: 32-approach.css.
   - Poster (>= 1200px): the spine is drawn with scroll progress. Its tip follows a line 74 % down
     the viewport (design y = (0.74 * vh + scrollY - posterTop) / u), smoothed with a lerp, revealed
     by a clip rect; a small blue playhead rides the tip. Every step / decision / burst / sign-off
     group ([data-k] with a data-y trigger) switches on once the tip passes it; a step's extras
     (.ap-x lists, boxes) switch on with it.
   - Flow (< 1200px): each step's rail segment scales with scroll (--p); the step, then its decision
     row and extras, each switch on as they enter the lower part of the viewport (a phone step is
     taller than the screen). Reaching the sign-off switches on anything still pending.
   - Idle loops (marching feedback dots, burst shimmer) only run while on screen.
   Reduced motion: nothing is hidden and nothing moves (masks removed, spine fully drawn). */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const ap = document.querySelector('.ap');
    if (!ap) return;
    const poster = ap.querySelector('.ap-poster');
    const svg = ap.querySelector('.ap-wires');
    const unmask = root => root.querySelectorAll('[mask]').forEach(p => p.removeAttribute('mask'));
    const motion = TS.motion ? TS.motion() : false;
    if (!motion || !svg) { if (svg) unmask(svg); return; }

    const posterMQ = matchMedia('(min-width: 1200px)');
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const clip = svg.querySelector('.w-clip');
    const play = svg.querySelector('.w-play');
    const trav = svg.querySelector('.w-trav');

    /* ---------- keys: every element carrying data-k switches on together */
    const byKey = new Map();
    ap.querySelectorAll('[data-k]').forEach(el => {
      const k = el.dataset.k;
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(el);
    });
    const fired = new Set();
    // step extras (.ap-x: bracket lists, boxes, burst) follow their step on the poster
    const extrasOn = step => step.querySelectorAll('.ap-x').forEach(x => x.classList.add('is-on'));
    const fire = k => {
      if (fired.has(k) || !byKey.has(k)) return;
      fired.add(k);
      byKey.get(k).forEach(el => {
        el.classList.add('is-on');
        if (isPoster && el.matches('.ap-step')) extrasOn(el);
        // drop the reveal masks once the draws are over (keeps later repaints cheap)
        if (el.matches('.w-grp')) setTimeout(() => unmask(el), (+el.dataset.end || 1200) + 120);
      });
      if (k === 'd1' && trav && trav.animate) {
        trav.animate([
          { transform: 'translate(888px,392.5px)' },
          { transform: 'translate(986px,392.5px)', offset: 0.38 },
          { transform: 'translate(986px,549.5px)' },
        ], { duration: 1200, delay: 600, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      }
    };

    /* ---------- poster triggers (design y), sorted */
    const posterTriggers = [...svg.querySelectorAll('.w-grp[data-y]')]
      .map(g => [parseFloat(g.dataset.y), g.dataset.k]).sort((a, b) => a[0] - b[0]);

    /* ---------- flow items: rail segments per step; triggers for steps, their decisions and extras
       (on a phone a step is taller than the viewport, so its decision row / lists reveal on their own) */
    const steps = [...ap.querySelectorAll('.ap-step')].map(el => ({ el, top: 0, h: 1, p: -1 }));
    const parts = [...ap.querySelectorAll('.ap-step .ap-dec[data-k], .ap-step .ap-x')].map(el => ({ el, k: el.dataset.k, top: 0 }));
    const sign = ap.querySelector('.ap-sign');
    let signTop = 0;

    /* ---------- measurements (no layout reads inside the frame loop) */
    let isPoster = posterMQ.matches, u = 1, posterTop = 0, vh = innerHeight;
    const measure = () => {
      isPoster = posterMQ.matches;
      vh = innerHeight;
      const sy = scrollY;
      const r = poster.getBoundingClientRect();
      posterTop = r.top + sy;
      u = r.width / 1333 || 1;
      if (isPoster) {
        // switched from flow: extras of steps that are already on must not stay hidden
        steps.forEach(s => { if (s.el.classList.contains('is-on')) extrasOn(s.el); });
      } else {
        steps.forEach(s => { const b = s.el.getBoundingClientRect(); s.top = b.top + sy; s.h = Math.max(1, b.height); });
        parts.forEach(p => { p.top = p.el.getBoundingClientRect().top + sy; });
        if (sign) signTop = sign.getBoundingClientRect().top + sy;
      }
    };

    /* ---------- frame loop */
    const START = 108, END = 1820, TIP = 0.74;
    let cur = START, raf = 0, started = false, last = 0;
    const frame = now => {
      raf = 0;
      if (!started) return;
      const sy = scrollY;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (isPoster) {
        const target = clamp((vh * TIP + sy - posterTop) / u, START, END);
        cur += (target - cur) * (1 - Math.exp(-dt / 90));   // ~0.17 per 60 fps frame, fps independent
        if (Math.abs(target - cur) < 0.25) cur = target;
        clip.setAttribute('height', cur.toFixed(2));
        const x = cur < 410 ? 685 : 748.5;
        play.setAttribute('cx', x);
        play.setAttribute('cy', cur.toFixed(2));
        play.classList.toggle('is-shown', cur > START + 10 && cur < END - 4);
        for (const [y, k] of posterTriggers) { if (cur >= y) fire(k); else break; }
        if (cur !== target) raf = requestAnimationFrame(frame); else last = 0;
      } else {
        const line = vh * 0.6 + sy, trig = vh * 0.92 + sy;   // 0.92: the first step pops in under the hero on load
        steps.forEach(s => {
          const p = clamp((line - s.top - 16) / s.h, 0, 1);
          if (Math.abs(p - s.p) > 0.001) { s.el.style.setProperty('--p', p.toFixed(4)); s.p = p; }
          if (trig >= s.top + 8) fire(s.el.dataset.k);
        });
        const all = sign && trig >= signTop + 40;   // reaching the sign-off: nothing above may stay hidden
        parts.forEach(p => {
          if (!all && trig < p.top + 24) return;
          fire(p.el.closest('.ap-step').dataset.k);
          if (p.k) fire(p.k); else p.el.classList.add('is-on');
        });
        if (all) { steps.forEach(s => fire(s.el.dataset.k)); fire('end'); }
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    // spine + rail start undrawn
    clip.setAttribute('height', String(START));
    steps.forEach(s => s.el.style.setProperty('--p', '0'));
    ap.classList.add('is-armed');
    measure();

    addEventListener('scroll', kick, { passive: true });
    let rt = 0;
    const remeasure = () => { clearTimeout(rt); rt = setTimeout(() => { measure(); kick(); }, 80); };
    addEventListener('resize', remeasure);
    posterMQ.addEventListener ? posterMQ.addEventListener('change', remeasure) : posterMQ.addListener(remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(ap);

    /* ---------- load: hero first (after fonts settle), then the spine starts drawing */
    const go = () => {
      if (ap.classList.contains('is-loaded')) return;
      measure();
      ap.classList.add('is-loaded');
      setTimeout(() => { started = true; measure(); kick(); }, 650);
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    // ... and after the intro stage has lifted (01-intro.js; immediate without an intro)
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 700))]).then(() => TS.afterIntro(() => requestAnimationFrame(go)));

    /* ---------- idle loops only while their area is visible */
    if ('IntersectionObserver' in window) {
      const live = new Map();
      ap.querySelectorAll('.ap-dec').forEach(dec => {
        const g = svg.querySelector(`.w-grp[data-k="${dec.dataset.k}"]`);
        const cap = dec.querySelector('.ap-dec__no');
        if (g && cap) live.set(cap, g);
      });
      const burst = svg.querySelector('.w-burst');
      const head8 = ap.querySelector('.ap-step[data-k="s8"] .ap-head');
      if (burst && head8) live.set(head8, burst);
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        const g = live.get(en.target);
        if (g) g.classList.toggle('is-live', en.isIntersecting && isPoster);
      }), { rootMargin: '25% 0px' });
      live.forEach((g, el) => io.observe(el));
    }
  });
})();

/* ---- 34-stories.js ---- */
/* CLIENT STORIES — client reviews, the "Client Deck" (markup: scripts/pages/stories.py _reviews, CSS: 34-stories.css).
   [data-voices] (.sto-deck, role=group carousel) > [data-deck-vp] > track > [data-deck-slot]… (article tabpanel each)
   + one control row: [data-deck-prev] · [role=tablist] > [role=tab]… (dots) · [data-deck-next] · [data-deck-status].

   Every visual is a function of one float, pos (0 = the first client in front). Slot k sits at
   d = mod(k - pos + n/2, n) - n/2 (a loop from five cards; fewer: d = k - pos, ends with a 0.35 rubber band) and gets
   translate X(|d|) · scale S(|d|) · rotateY R(|d|) + lean, piecewise-linear over |d| = 0, 1, 2, 3 with nodes from the
   --deck-* tokens on .sto-deck (the single source of truth, also behind the CSS data-pos rest state), plus z-index,
   visibility, --ad = |d| and --rd = clamp(d, 0, 1) + .is-right (d > .5), from which the CSS derives the dim, the
   quote fade / rise and the mirrored caption row of a right-hand card (>= 800 px; on a deck too narrow for the peeks'
   captions, .is-tight fades them with the quote, fit()). One rAF loop runs only while
   dragging, springing, wheeling or nudging; every move is the house spring 400/30/1 (instant under reduced motion).
   Input: drag / swipe / flick (6 px direction lock, momentum; the primary pointer only, and a second finger anywhere
   drops the drag: a pinch zooms the page, touch-action pan-y pinch-zoom, and never flips a card), horizontal trackpad and
   Shift+wheel, a click on a peeking card (>= 800 px; phone slivers sit in the edge-gesture zone), previous / next, the
   dots (APG tabs, automatic activation, Left / Right / Home / End). Nothing auto-advances: the only self-started
   motion is one sub-second nudge the first time the deck is in view (cancelled by any pointer, key or focus in the
   deck, a horizontal wheel, or any wheel while it plays; a vertical page scroll over the deck before it starts only
   postpones it until the scroll stops, so it still plays where it can be seen).
   Settle: data-pos / .is-front; aria-hidden + link tabindex -1 on the cards behind (not inert, so a peek stays
   clickable); roving tabs; focus rescued from a card that left the front; a status line for arrow, drag, wheel and
   peek moves; neighbour stills decoded ahead (not under Save-Data). Stills: only the front card and its neighbours
   load with the page (the others wait as data-src / data-srcset, pages/stories.py); at rest the phone loads |d| <= 1,
   >= 800 px every visible peek (|d| <= 2; their <picture> source loads those there even without this script), and
   once the visitor moves the deck, two cards ahead.
   Also: a one-time star-fill wipe on the front card when its rating first comes into view (.is-seen / .is-wipe), and
   parallax + glare on the front still only (a mouse over it on fine pointers; on touch / pen it follows the finger
   that drags the deck; motion only), so the quote never moves while it is read.
   Without JS the CSS shows all six cards in a grid. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneMQ = matchMedia('(max-width: 799.98px)');
  const fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = () => reducedMQ.matches;
  const motion = () => (TS.motion ? TS.motion() : !reduced());
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const onChange = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  /* bezier() and lerp() as in 23-carousel.js */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }
  const EASE_IO = bezier(0.44, 0, 0.56, 1);     // --ease-io
  const lerp = (x, xs, ys) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) {
      if (x <= xs[i]) { const t = (x - xs[i - 1]) / ((xs[i] - xs[i - 1]) || 1); return ys[i - 1] + t * (ys[i] - ys[i - 1]); }
    }
    return ys[ys.length - 1];
  };
  const AX = [0, 1, 2, 3];
  const K = 400, C = 30, M = 1;                 // the house spring (--spring / --spring-d 400ms, peak 1.027)
  const BAND = 0.35;                            // rubber band beyond the ends (fewer than five cards)

  function init(root) {
    const vp = root.querySelector('[data-deck-vp]');
    const slots = [...root.querySelectorAll('[data-deck-slot]')];
    const n = slots.length;
    if (!vp || n < 2) { root.classList.add('is-ready', 'is-single'); return; }
    const pick = sel => slots.map(s => s.querySelector(sel));
    const links = pick('.sto-voice__link'), media = pick('.sto-voice__media'), imgs = pick('.sto-voice__img'), heads = pick('.sto-voice__head');
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const list = root.querySelector('[role="tablist"]');
    const status = root.querySelector('[data-deck-status]');
    const loop = n >= 5;

    let W = 1, X1 = 1, geo = null, phone = false;
    let pos = 0, target = 0, vel = 0, mode = '', tw = null, raf = 0, last = 0;
    let lean = 0, leanTo = 0, cur = 0, active = -1, say = false;
    let used = false, seen = false, drag = null, suppress = false, wheelT = 0, nudgeT = 0, inView = false, moved = false;
    const warmed = new WeakSet();
    const pending = imgs.map(im => !!(im && (im.dataset.src || im.dataset.srcset)));   // stills not loaded yet

    const dOf = k => (loop ? mod(k - pos + n / 2, n) - n / 2 : k - pos);
    const band = x => BAND * (1 - Math.exp(-x / BAND));
    const bound = p => (loop ? p : p < 0 ? -band(-p) : p > n - 1 ? n - 1 + band(p - n + 1) : p);
    const near = p => (loop ? mod(Math.round(p), n) : clamp(Math.round(p), 0, n - 1));

    /* ---------- geometry: read on init, resize and media-query change only (never during motion) */
    function measure() {
      const cs = getComputedStyle(root);
      const num = (name, d) => { const v = parseFloat(cs.getPropertyValue(name)); return Number.isFinite(v) ? v : d; };
      W = slots[0].offsetWidth || W;
      const k1 = num('--deck-k1', 0.66), k2 = num('--deck-k2', 1.07), g = num('--deck-gap', 0);
      const s2 = num('--deck-s2', 0.7), r2 = num('--deck-r2', 0);
      geo = { x: [0, k1 * W + g, k2 * W + 2 * g, (2 * k2 - k1) * W + 3 * g], s: [1, num('--deck-s1', 0.84), s2, s2], r: [0, num('--deck-r1', 0), r2, r2] };
      X1 = geo.x[1] || 1;
      phone = phoneMQ.matches;
      if (!(geo.r[1] > 0)) lean = leanTo = 0;     // the drag lean is desktop / tablet with motion only
    }

    function apply() {
      const reach = moved || !phone ? 2.5 : 1.5;  // which stills must be there: see load()
      for (let k = 0; k < n; k++) {
        const d = dOf(k), a = Math.abs(d), sg = d < 0 ? -1 : 1, st = slots[k].style;
        if (pending[k] && a < reach) load(k);
        st.transform = `translate3d(${(sg * lerp(a, AX, geo.x)).toFixed(2)}px,0,0) scale(${lerp(a, AX, geo.s).toFixed(4)}) rotateY(${(sg * lerp(a, AX, geo.r) + lean).toFixed(3)}deg)`;
        st.setProperty('--ad', a.toFixed(3));
        st.setProperty('--rd', clamp(d, 0, 1).toFixed(3));
        if (slots[k].classList.contains('is-right') !== d > 0.5) slots[k].classList.toggle('is-right', d > 0.5);
        st.zIndex = String(10 - Math.round(2 * a));
        st.visibility = a > 2.5 ? 'hidden' : 'visible';
        st.pointerEvents = a > 1.5 || (phone && a >= 0.5) ? 'none' : 'auto';
      }
      const c = near(pos);                       // the dot of the nearest card follows the deck live
      if (c !== cur) { tabs.forEach((t, k) => t.classList.toggle('is-current', k === c)); cur = c; }
    }
    /* >= 800 px: where a peek's outer edge (the side its caption row starts from) lies beyond the viewport's clipped
       edge (viewports below about 1190 px), the caption rows fade with the quote instead (.is-tight, CSS), so a peek
       never shows a cut word ("erabad"); wider, the row starts inside the edge's mask fade and reads whole. Read at
       rest only: on settle and on resize */
    function fit() {
      let tight = false;
      if (!phone) {
        const vr = vp.getBoundingClientRect();
        slots.forEach((s, k) => {
          const d = Math.round(dOf(k));
          if (Math.abs(d) !== 1 || !heads[k]) return;
          const r = heads[k].getBoundingClientRect();
          if (d < 0 ? r.left < vr.left : r.right > vr.right) tight = true;
        });
      }
      root.classList.toggle('is-tight', tight);
    }

    /* ---------- the one rAF loop: drag / wheel (pos set by input), tween (the nudge), spring */
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
    function step(now) {
      raf = 0;
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
      last = now;
      let done = false;
      if (mode === 'tween') {
        const p = clamp((now - tw.t0) / tw.dur, 0, 1);
        pos = tw.from + (tw.to - tw.from) * EASE_IO(p);
        if (p >= 1) { mode = 'spring'; vel = 0; tw = null; }        // ...then springs back to target
      } else if (mode === 'spring') {
        const h = dt / 4;                         // semi-implicit Euler, four substeps
        for (let i = 0; i < 4; i++) { vel += (-K * (pos - target) - C * vel) / M * h; pos += vel * h; }
        if (Math.abs(pos - target) < 5e-4 && Math.abs(vel) < 5e-3) { pos = target; done = true; }
      } else if (mode === 'drag' && drag && now - drag.t > 90) leanTo = 0;   // pointer held still: the lean relaxes
      lean += (leanTo - lean) * 0.15;
      if (!leanTo && Math.abs(lean) < 0.01) lean = 0;
      apply();
      if (done) settle();
      if (mode || lean) { raf = requestAnimationFrame(step); }
    }

    function goTo(t, { v = 0, announce = false } = {}) {
      if (!loop) t = clamp(Math.round(t), 0, n - 1);
      stopNudge();
      untilt();
      moved = true;
      target = t; say = announce; tw = null;
      starsSeen(false);
      root.classList.add('is-moving');
      if (reduced()) { pos = t; vel = 0; mode = ''; settle(); return; }
      vel = v; mode = 'spring'; kick();
    }
    function goIndex(i, opts) {                  // shortest way round the loop
      const r = Math.round(target);
      goTo(r + (loop ? mod(i - r + n / 2, n) - n / 2 : i - r), opts);
    }
    function select(i) {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    }
    function describe(k) {
      const text = sel => ((slots[k].querySelector(sel) || {}).textContent || '').trim();
      const rate = slots[k].querySelector('.sto-rate');
      return `${k + 1} of ${n}: ${text('.sto-voice__co')}, ${text('.sto-voice__ind')}.${rate ? ` ${rate.getAttribute('aria-label')}.` : ''}`;
    }
    /* a still that waited as data-src / data-srcset (PERF-11) gets its real sources: from apply() for every card within
       reach (at rest |d| <= 1 on phones, where the far ones sit off screen; |d| <= 2 >= 800 px, where they peek; two
       cards ahead once the visitor has moved the deck, never for the first-view nudge) and for print */
    function load(k) {
      const im = imgs[k];
      pending[k] = false;
      if (!im) return;
      if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); }
      if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); }
    }
    addEventListener('beforeprint', () => pending.forEach((p, k) => { if (p) load(k); }));
    /* loaded neighbour stills (d = ±1, ±2) decode ahead, so a fast flick never shows an empty frame */
    function warm() {
      if (!seen || saveData()) return;
      for (let k = 0; k < n; k++) {
        const a = Math.abs(Math.round(dOf(k))), im = imgs[k];
        if (a < 1 || a > 2 || !im || pending[k] || warmed.has(im)) continue;
        warmed.add(im);
        im.loading = 'eager';
        if (im.decode) im.decode().catch(() => {});
      }
    }

    function settle() {
      mode = ''; vel = 0; tw = null;
      target = near(target); pos = target;
      apply();
      active = target;
      slots.forEach((s, k) => {
        const front = k === active;
        s.dataset.pos = String(Math.round(dOf(k)));
        s.classList.toggle('is-front', front);
        if (front) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        if (links[k]) { if (front) links[k].removeAttribute('tabindex'); else links[k].setAttribute('tabindex', '-1'); }
      });
      select(active);
      const f = document.activeElement;
      if (f && tabs[active] && slots.some((s, k) => k !== active && s.contains(f))) tabs[active].focus({ preventScroll: true });
      if (say && status) status.textContent = describe(active);
      say = false;
      warm();
      fit();
      root.classList.remove('is-moving');
    }

    /* ---------- drag / swipe / flick (patterns from 23-carousel.js, plus momentum and the spring) */
    vp.addEventListener('pointerdown', e => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;   // a second finger never takes over
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, pos0: pos, lock: null, t: e.timeStamp, samples: [] };
    }, { passive: true });
    /* ...and a second finger anywhere (capture, before any handler) makes it a pinch: the browser zooms the page
       (touch-action pan-y pinch-zoom), the drag is dropped and a card already under way springs back to where it was */
    addEventListener('pointerdown', e => {
      if (e.isPrimary || !drag) return;
      const d = drag; drag = null;
      try { vp.releasePointerCapture(d.id); } catch (err) { /* ignore */ }
      if (d.lock !== 'x') return;
      root.classList.remove('is-dragging');
      leanTo = 0;
      goTo(Math.round(d.pos0));
    }, { passive: true, capture: true });
    vp.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.lock) {
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drag = null; return; }   // released outside the deck
        const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.lock === 'y') { drag = null; return; }   // vertical: the page scrolls (touch-action: pan-y)
        try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        stopNudge(); untilt(); starsSeen(false);
        used = true; seen = true; moved = true; mode = 'drag'; vel = 0; tw = null;
        root.classList.add('is-dragging', 'is-moving');
        drag.pos0 = pos; drag.x0 = e.clientX; drag.samples = [];
        // touch / pen: the front still's glare follows the finger, mapped onto the still where it rested
        const m = e.pointerType !== 'mouse' && motion() && media[active];
        drag.glare = m ? { k: active, r: m.getBoundingClientRect() } : null;
      }
      e.preventDefault();
      if (drag.glare) tiltTo(drag.glare.k, drag.glare.r, e.clientX, e.clientY);
      pos = bound(drag.pos0 - (e.clientX - drag.x0) / X1);
      drag.t = e.timeStamp; drag.x = e.clientX;
      drag.samples.push([e.clientX, e.timeStamp]);
      while (drag.samples.length > 2 && e.timeStamp - drag.samples[0][1] > 100) drag.samples.shift();
      if (geo.r[1] > 0 && drag.samples.length > 1) {
        const [x0, t0] = drag.samples[0];
        leanTo = clamp((e.clientX - x0) / Math.max(1, e.timeStamp - t0) * 1000 * 0.006, -6, 6);
      }
      kick();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (d.lock !== 'x') {                      // never dragged: nothing to settle, unless a lost drag left a card mid-way
        if (mode === 'drag') { root.classList.remove('is-dragging'); leanTo = 0; goTo(Math.round(pos), { announce: true }); }
        return;
      }
      root.classList.remove('is-dragging');
      suppress = true;
      setTimeout(() => { suppress = false; }, 0);
      leanTo = 0;
      const cancel = e.type !== 'pointerup';
      const x = cancel ? d.x : e.clientX;                              // a cancelled touch may report 0, 0
      const recent = d.samples.filter(s => e.timeStamp - s[1] <= 100);
      const v = cancel || !recent.length ? 0 : (x - recent[0][0]) / Math.max(16, e.timeStamp - recent[0][1]) * 1000;
      const dx = x - d.x0;
      const base = Math.round(d.pos0), vCards = -v / X1;
      let t = clamp(Math.round(pos + vCards * 0.2), base - 3, base + 3);
      if (t === base && (Math.abs(dx) > 0.2 * X1 || Math.abs(v) > 200)) t = base + ((Math.abs(v) > 200 ? v : dx) < 0 ? 1 : -1);
      goTo(t, { v: vCards, announce: true });
    };
    vp.addEventListener('pointerup', release);
    vp.addEventListener('pointercancel', release);
    // the deck losing its own capture ends the drag (after pointerup a no-op; a card's implicit touch capture moving
    // to the deck on the lock fires on that card, not here)
    vp.addEventListener('lostpointercapture', e => { if (e.target === vp) release(e); });
    vp.addEventListener('click', e => { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    vp.addEventListener('dragstart', e => e.preventDefault());

    /* ---------- horizontal trackpad / Shift+wheel (vertical wheel is never touched) */
    vp.addEventListener('wheel', e => {
      let dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      const dy = e.deltaX ? e.deltaY : e.shiftKey ? 0 : e.deltaY;
      if (!dx || Math.abs(dx) <= Math.abs(dy)) return;
      if (e.deltaMode === 1) dx *= 16;
      e.preventDefault();
      e.stopPropagation();                      // keep it from the smooth scroller (Lenis)
      if (mode !== 'wheel') { stopNudge(); untilt(); starsSeen(false); used = true; seen = true; moved = true; mode = 'wheel'; vel = 0; tw = null; root.classList.add('is-moving'); }
      pos = bound(pos + dx / X1);
      kick();
      clearTimeout(wheelT);
      wheelT = setTimeout(() => { if (mode === 'wheel') goTo(Math.round(pos), { announce: true }); }, 140);
    }, { passive: false });

    /* ---------- a peeking card brings itself forward (>= 800 px; capture: a hidden link never navigates) */
    slots.forEach((s, k) => s.addEventListener('click', e => {
      const a = Math.abs(dOf(k));
      if (phone || a < 0.5 || a > 1.5) return;
      e.preventDefault();
      e.stopPropagation();
      goIndex(k, { announce: true });
    }, true));

    /* ---------- previous / next and the dots */
    const by = s => (loop ? goTo(Math.round(target) + s, { announce: true }) : goIndex(mod(Math.round(target) + s, n), { announce: true }));
    const prev = root.querySelector('[data-deck-prev]'), next = root.querySelector('[data-deck-next]');
    if (prev) prev.addEventListener('click', () => by(-1));
    if (next) next.addEventListener('click', () => by(1));
    tabs.forEach((t, i) => t.addEventListener('click', () => { select(i); goIndex(i); }));
    if (list) list.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.getAttribute('role') !== 'tab') return;
      const r = Math.round(target);
      let i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const s = e.key === 'ArrowRight' ? 1 : -1;
        i = mod(r + s, n);
        select(i);
        if (loop) goTo(r + s); else goIndex(i);
      } else if (e.key === 'Home' || e.key === 'End') {
        i = e.key === 'Home' ? 0 : n - 1;
        select(i);
        goIndex(i);
      } else return;
      e.preventDefault();
      tabs[i].focus();
    });

    /* ---------- first view: one nudge (once per page load) and the stars' fill wipe */
    function stopNudge() {
      clearTimeout(nudgeT); nudgeT = 0;
      if (mode === 'tween') { mode = 'spring'; vel = 0; tw = null; kick(); }   // back to target from wherever it is
    }
    function nudge() {
      nudgeT = 0;
      if (used || !inView || mode || !motion() || root.contains(document.activeElement)) return;
      used = true;
      root.classList.add('is-moving');
      say = false;
      tw = { from: target, to: target + 0.12, t0: performance.now(), dur: 380 };
      mode = 'tween';
      kick();
    }
    root.addEventListener('pointerdown', () => { used = true; stopNudge(); }, { passive: true });
    root.addEventListener('keydown', () => { used = true; stopNudge(); });
    root.addEventListener('focusin', () => { used = true; stopNudge(); });
    root.addEventListener('wheel', () => {          // a page scroll over the deck only postpones a pending nudge
      if (mode === 'tween') { used = true; stopNudge(); } else if (nudgeT) { clearTimeout(nudgeT); nudgeT = setTimeout(nudge, 600); }
    }, { passive: true });
    /* the stars: the wipe plays once, on the front card, when its rating is first fully on screen (CSS: .is-seen +
       .is-wipe); a move that starts before that just shows them filled */
    let wipeIO = null;
    function starsSeen(wipe) {
      if (root.classList.contains('is-seen')) return;
      if (wipeIO) wipeIO.disconnect();
      if (wipe && slots[active]) slots[active].classList.add('is-wipe');
      root.classList.add('is-seen');
    }
    if ('IntersectionObserver' in window) {
      const seeIO = new IntersectionObserver(entries => {
        const e = entries[entries.length - 1];
        if (e.intersectionRatio >= 0.34 && !seen) { seen = true; warm(); }
        inView = e.intersectionRatio >= 0.59;
        clearTimeout(nudgeT);
        nudgeT = inView && !used ? setTimeout(nudge, 600) : 0;
        if (seen && used) seeIO.disconnect();
      }, { threshold: [0, 0.35, 0.6] });
      const rate = slots[0].querySelector('.sto-stars');
      wipeIO = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) starsSeen(true); },
        { threshold: 1, rootMargin: '0px 0px -6% 0px' });
      // the nudge and the star wipe are seen only once the intro stage has lifted (01-intro.js; immediate without one)
      (TS.afterIntro || (fn => fn()))(() => {
        seeIO.observe(root);
        if (rate) wipeIO.observe(rate); else starsSeen(false);
      });
    } else { seen = true; starsSeen(false); }

    /* ---------- parallax + glare on the front still only (motion): a mouse over it (fine pointer, never while the deck
       moves), or the finger that drags the deck (touch / pen; the glare runs across the card in the swipe's direction) */
    const px = { k: -1, tx: 0, ty: 0, th: 0, x: 0, y: 0, h: 0, raf: 0 };
    function tiltStep() {
      px.raf = 0;
      if (px.k < 0) return;
      px.x += (px.tx - px.x) * 0.12; px.y += (px.ty - px.y) * 0.12; px.h += (px.th - px.h) * 0.12;
      const m = media[px.k], im = imgs[px.k];
      if (!px.th && px.h < 0.002) {               // back at rest: clear the inline styles, stop
        if (im) im.style.transform = '';
        m.style.removeProperty('--gx'); m.style.removeProperty('--gy');
        px.k = -1; px.x = px.y = px.h = 0;
        return;
      }
      if (im) im.style.transform = `translate3d(${(px.x * 6 * px.h).toFixed(2)}px,${(px.y * 6 * px.h).toFixed(2)}px,0) scale(${(1 + 0.04 * px.h).toFixed(4)})`;
      m.style.setProperty('--gx', `${((px.x + 1) * 50).toFixed(1)}%`);
      m.style.setProperty('--gy', `${((px.y + 1) * 50).toFixed(1)}%`);
      if (Math.abs(px.tx - px.x) + Math.abs(px.ty - px.y) + Math.abs(px.th - px.h) > 0.002) px.raf = requestAnimationFrame(tiltStep);
    }
    function untilt() {
      if (px.k < 0) return;
      px.th = 0;
      media[px.k].classList.remove('is-hover');
      if (!px.raf) px.raf = requestAnimationFrame(tiltStep);
    }
    function tiltTo(k, r, x, y) {               // aim card k's light at (x, y) within the still's rect r
      if (px.k >= 0 && px.k !== k) { media[px.k].classList.remove('is-hover'); if (imgs[px.k]) imgs[px.k].style.transform = ''; px.x = px.y = px.h = 0; }
      px.k = k; px.th = 1;
      px.tx = clamp(((x - r.left) / r.width) * 2 - 1, -1, 1);
      px.ty = clamp(((y - r.top) / r.height) * 2 - 1, -1, 1);
      media[k].classList.add('is-hover');
      if (!px.raf) px.raf = requestAnimationFrame(tiltStep);
    }
    media.forEach((m, k) => {
      if (!m) return;
      m.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || k !== active || mode || drag || !fineMQ.matches || !motion()) return;
        tiltTo(k, m.getBoundingClientRect(), e.clientX, e.clientY);
      }, { passive: true });
      m.addEventListener('pointerleave', () => { if (px.k === k) untilt(); }, { passive: true });
    });

    /* ---------- layout / preferences */
    let rt = 0;
    new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => { measure(); apply(); if (!mode) fit(); }); }).observe(vp);
    const onMQ = () => {
      measure();
      if (reduced()) { untilt(); if (mode === 'spring' || mode === 'tween') { settle(); return; } }
      apply();
    };
    onChange(reducedMQ, onMQ);
    onChange(phoneMQ, onMQ);

    measure();
    root.classList.add('is-ready');
    settle();                                    // rest state + aria-hidden / tabindex on the cards behind, no announcement
  }

  ready(() => document.querySelectorAll('[data-voices]').forEach(init));
})();

/* ---- 35-contact.js ---- */
/* Contact form (/contact/). Inline validation, then either
   - POST FormData to the configured form service (form[data-endpoint], from site.config.json "form_endpoint"), or
   - open a pre-filled email (mailto:) to the studio address (form[data-email]).
   Also: budget quick answers, select placeholder tint, ?service=… pre-selection, Enter moves to the next field
   (never submits), the iOS tap wash. Without JS the form
   submits natively (action = endpoint or mailto:). */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));

  ready(() => {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.noValidate = true;

    const card = form.closest('.ct-card') || form.parentElement;
    const done = card.querySelector('[data-done]');
    const doneTitle = card.querySelector('[data-done-title]');
    const doneText = card.querySelector('[data-done-text]');
    const reopen = card.querySelector('[data-reopen]');
    const edit = card.querySelector('[data-edit]');
    const status = form.querySelector('[data-status]');
    const submit = form.querySelector('[data-submit]');
    const submitSr = form.querySelector('[data-submit-sr]');
    const submitText = submitSr ? submitSr.textContent : '';
    const endpoint = (form.dataset.endpoint || '').trim();
    const studioEmail = (form.dataset.email || '').trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const required = [...form.querySelectorAll('[required]')];

    /* ---------- validation */
    const problem = el => {
      const v = el.value.trim();
      if (!v) return el.dataset.msgMissing || 'This field is required.';
      if (el.type === 'email' && !EMAIL_RE.test(v)) return el.dataset.msgInvalid || 'Please check this email address.';
      return '';
    };
    const show = (el, msg) => {
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      const err = document.getElementById(`${el.id}-err`);
      if (!err) return;
      err.querySelector('span').textContent = msg;
      err.hidden = !msg;
    };
    required.forEach(el => {
      // Validate on leave only once something was typed (tabbing through stays quiet) …
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) show(el, problem(el)); });
      // … and clear/update an error live while it is being fixed.
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') show(el, problem(el)); });
    });

    /* ---------- select placeholder tint */
    form.querySelectorAll('select').forEach(sel => {
      const sync = () => sel.classList.toggle('is-empty', !sel.value);
      sel.addEventListener('change', sync); sync();
    });

    /* ---------- budget quick answers (toggle buttons that fill the free-text field) */
    const budget = form.querySelector('#ct-budget');
    const quicks = [...form.querySelectorAll('[data-fill]')];
    const syncQuick = () => quicks.forEach(b => b.setAttribute('aria-pressed', String(!!budget && budget.value.trim() === b.dataset.fill)));
    quicks.forEach(b => b.addEventListener('click', () => {
      if (!budget) return;
      budget.value = budget.value.trim() === b.dataset.fill ? '' : b.dataset.fill;
      syncQuick();
    }));
    if (budget) budget.addEventListener('input', syncQuick);

    /* ---------- tap feedback: iOS Safari paints :active on touch only under a touch listener, so a passive no-op one
       on the form gives the chips and quick answers their short :active wash (35-contact.css; Android has it anyway) */
    form.addEventListener('touchstart', () => {}, { passive: true });

    /* ---------- Enter (the phone keyboard's "next", enterkeyhint) in a one-line field moves on to the next field
       instead of submitting half a form: only the button sends. The textarea keeps its newlines. */
    const fields = [...form.querySelectorAll('.ct-input')];
    form.addEventListener('keydown', e => {
      const el = e.target;
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || el.tagName !== 'INPUT' || !fields.includes(el)) return;
      e.preventDefault();
      const next = fields[fields.indexOf(el) + 1];
      if (next) next.focus();
    });

    /* ---------- ?service=website-design (or the exact name) pre-selects the select + chip */
    try {
      const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
      const want = norm(new URLSearchParams(location.search).get('service'));
      if (want) {
        const sel = form.querySelector('#ct-build');
        const opt = sel && [...sel.options].find(o => o.value && norm(o.value) === want);
        if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change')); }
        const chip = [...form.querySelectorAll('input[name="help"]')].find(c => norm(c.value) === want);
        if (chip) chip.checked = true;
      }
    } catch (e) { /* ignore malformed URLs */ }

    /* ---------- helpers */
    const labelOf = name => {
      const field = form.elements[name];
      const el = field && (field.id ? form.querySelector(`label[for="${field.id}"]`) : null);
      return el && el.firstChild ? el.firstChild.textContent.trim() : name;
    };
    const legendOf = name => {
      const input = form.querySelector(`input[name="${name}"]`);
      const lg = input && input.closest('fieldset') && input.closest('fieldset').querySelector('legend');
      return lg && lg.firstChild ? lg.firstChild.textContent.trim() : name;
    };
    const values = () => {
      const fd = new FormData(form);
      const v = k => String(fd.get(k) || '').trim();
      return { name: v('name'), email: v('email'), company: v('company'), build: v('build'), help: fd.getAll('help').map(String), budget: v('budget'), idea: v('idea'), trap: v('_gotcha') };
    };
    const mailtoHref = d => {
      const lines = [`${labelOf('name')}: ${d.name}`, `${labelOf('email')}: ${d.email}`];
      if (d.company) lines.push(`${labelOf('company')}: ${d.company}`);
      if (d.build) lines.push(`${labelOf('build')} ${d.build}`);
      if (d.help.length) lines.push(`${legendOf('help')} ${d.help.join(', ')}`);
      if (d.budget) lines.push(`${labelOf('budget')}: ${d.budget}`);
      lines.push('', `${labelOf('idea')}:`, d.idea);
      const body = lines.join('\n').replace(/\r?\n/g, '\r\n');
      const subject = `New project — ${d.name}`;
      return `mailto:${studioEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    const mailLink = (text) => {
      const a = document.createElement('a');
      a.href = `mailto:${studioEmail}`; a.textContent = text || studioEmail;
      return a;
    };
    const busy = on => {
      submit.disabled = on;
      submit.classList.toggle('is-busy', on);
      form.setAttribute('aria-busy', String(on));
      if (submitSr) submitSr.textContent = on ? 'Sending…' : submitText;
    };
    const setStatus = nodes => {
      if (!status) return;
      status.replaceChildren(...nodes);
      status.hidden = !nodes.length;
    };
    const scrollIntoViewIfNeeded = el => {
      const r = el.getBoundingClientRect();
      if (r.top < 80 || r.top > innerHeight * 0.7) TS.scrollTo ? TS.scrollTo(el, { offset: -120 }) : el.scrollIntoView({ block: 'start' });
    };

    /* ---------- success / edit */
    const showDone = (mode, href) => {
      if (!done) return;
      doneText.replaceChildren();
      if (mode === 'sent') {
        doneTitle.textContent = 'Thank you. Your message is on its way.';
        doneText.append("We'll take it from there.");
      } else {
        doneTitle.textContent = 'Your email app should now be open.';
        doneText.append('Your message is written and ready, just press send. If nothing opened, you can write to us at ', mailLink(), '.');
      }
      if (reopen) { reopen.hidden = mode === 'sent'; if (href) reopen.href = href; }
      card.classList.add('is-sent');
      done.hidden = false;
      done.focus({ preventScroll: true });
      scrollIntoViewIfNeeded(card);
    };
    if (edit) edit.addEventListener('click', () => {
      card.classList.remove('is-sent');
      done.hidden = true;
      const first = form.querySelector('#ct-name');
      if (first) first.focus();
    });

    /* ---------- submit */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      setStatus([]);
      let firstBad = null;
      required.forEach(el => { const msg = problem(el); show(el, msg); if (msg && !firstBad) firstBad = el; });
      if (firstBad) {
        scrollIntoViewIfNeeded(firstBad);
        firstBad.focus({ preventScroll: !!TS.lenis });
        return;
      }
      const d = values();

      if (!endpoint) {
        const href = mailtoHref(d);
        window.location.href = href;
        showDone('mail', href);
        return;
      }
      if (d.trap) { showDone('sent'); return; } // honeypot filled: quietly drop

      busy(true);
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        form.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change')));
        syncQuick();
        showDone('sent');
      } catch (err) {
        setStatus(["Something went wrong and your message wasn't sent. Please try again, or email us at ", mailLink(), '.']);
      } finally {
        busy(false);
      }
    });
  });
})();

/* ---- 36-project.js ---- */
/* PROJECT PAGES — full-screen still viewer (owner default, 15 Oct: "a still that is tapped opens full screen").
   Markup: scripts/pages/project.py _zoom (every still is a[data-zoom] linking to its largest file, so without JS it
   opens the image itself) + viewer() (an inert <template id="pj-viewer-tpl"> holding the <dialog>); CSS: 36-project.css
   "Still viewer". Dormant until the first tap / click: nothing is built and nothing loads before it. Then the dialog
   is cloned once, with one slide per still visible on the page right now, in page order, the tapped one in front.
   Each slide shows the page's own (already loaded) image at once and swaps to the largest file once that has decoded;
   the neighbours load theirs next (not on Save-Data), the others when they come to the front.
   Gestures (touch-action:none, pointer events): swipe left / right between stills (the track follows the finger; a
   18 % drag or a flick changes slide, a rubber band at both ends); pinch to zoom around the fingers (1x up to MAX,
   rubber band past both limits); pan when zoomed (a pan that starts against the image's edge swipes on to the next
   still); double-tap zooms in at that point / back out; at 1x a vertical swipe closes (the still follows the finger,
   the black fades). Mouse: a click on the still toggles the zoom at the pointer, drag pans, the wheel zooms around the
   pointer (a horizontal wheel pans, or changes slide at 1x). Keys: Left / Right, Home / End, + / - / 0, Esc.
   Controls (pages/project.viewer): previous · close · next at the bottom (the thumb zone), the "3 / 10" count on top.
   Closing - X, Esc, Back (opening adds a history entry, so the phone's back gesture closes the viewer instead of
   leaving the page), a vertical swipe, a tap on the black around the still - morphs the still back into its frame on
   the page (scrolled into view first when the visitor swiped to another one) and returns focus to that frame's link.
   Opening morphs out of the tapped frame (FLIP). Under reduced motion every change is instant. */
(() => {
  'use strict';
  const TS = window.TS || {};
  const ready = TS.ready || (fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn()));
  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => (TS.motion ? TS.motion() : !reducedMQ.matches);
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const EASE = 'cubic-bezier(.22,1,.36,1)';   // --ease
  const DUR = 380;                             // morph / settle
  const GAP = 16;                              // between slides (36-project.css .pj-viewer__track gap)
  const SWIPE = 0.18, FLICK = 0.35;            // share of the width / px per ms that changes slide
  const DISMISS = 110, DISMISS_V = 0.5;        // vertical drag (px) / speed that closes
  const LOCK = 8, TAP_MS = 280, TAP_PX = 30;   // gesture direction lock, double-tap window

  ready(() => {
    const tpl = document.getElementById('pj-viewer-tpl');
    if (!tpl || !document.querySelector('a[data-zoom]') || typeof HTMLDialogElement !== 'function') return;
    document.querySelectorAll('a[data-zoom]').forEach(a => a.setAttribute('aria-haspopup', 'dialog'));
    let viewer = null;
    // capture phase: ahead of the page transitions (02-core.js), which would otherwise leave for the image file
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[data-zoom]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      (viewer || (viewer = build(tpl))).open(a);
    }, true);
  });

  function build(tpl) {
    const dlg = tpl.content.firstElementChild.cloneNode(true);
    document.body.appendChild(dlg);
    const $ = s => dlg.querySelector(s);
    const stage = $('[data-viewer-stage]'), track = $('[data-viewer-track]'), count = $('[data-viewer-count]');
    const shade = $('.pj-viewer__shade'), chrome = [count, $('.pj-viewer__bar')];
    const prevBtn = $('[data-viewer-prev]'), nextBtn = $('[data-viewer-next]'), closeBtn = $('[data-viewer-close]');
    let items = [], index = 0, W = 0, H = 0, padX = 12, padY = 78;
    let z = { s: 1, x: 0, y: 0 };              // zoom of the front still: scale + translation (px) from its fitted centre
    let open = false, closing = false, pushed = false, pending = null, fallback = 0, reopen = null;
    let g = null, lastTap = null, tapTimer = 0, wheelLock = 0;
    const pts = new Map();

    const cur = () => items[index];
    const shown = el => !!el && el.getClientRects().length > 0;
    const pageImg = a => [...a.querySelectorAll('img')].find(shown) || a.querySelector('img');
    const transformOf = (s, x, y) => `translate3d(${x}px,${y}px,0) scale(${s})`;

    /* ---------- layout: every still fitted between the count and the controls, centred on the screen */
    function measure() {
      W = stage.clientWidth; H = stage.clientHeight;
      padX = W < 800 ? 12 : 48;
      const bar = chrome[1].getBoundingClientRect(), top = count.getBoundingClientRect();
      padY = Math.max(48, Math.round(Math.max(top.bottom, H - bar.top) + 10));
      dlg.style.setProperty('--slide-w', W + 'px');
      items.forEach(fit);
    }
    function fit(it) {
      const ar = it.w / it.h;
      const bw = Math.max(40, Math.min(W - 2 * padX, (H - 2 * padY) * ar));
      it.bw = bw; it.bh = bw / ar;
      it.el.style.width = bw + 'px'; it.el.style.height = it.bh + 'px';
      // readable zoom: the captures are 2x (desktop) / 3x (phone) files of their CSS layout width
      const native = it.w / (it.phone ? 3 : 2);
      it.dbl = clamp(native / bw * 1.1, 2, 3.5);
      it.max = Math.min(6, Math.max(4, it.dbl * 1.6));
    }
    // the translation range that keeps a zoomed still covering the screen (centred on an axis where it is smaller)
    function bounds(it, s) {
      const ex = Math.max(0, (s * it.bw - W) / 2), ey = Math.max(0, (s * it.bh - H) / 2);
      return { minX: -ex, maxX: ex, minY: -ey, maxY: ey };
    }
    const rubber = (v, a, b) => (v < a ? a - (a - v) * 0.35 : v > b ? b + (v - b) * 0.35 : v);

    /* ---------- drawing (transitions only when motion is on and asked for) */
    function animTo(el, transform, on) {
      el.style.transition = on && motion() ? `transform ${DUR}ms ${EASE}` : 'none';
      el.style.transform = transform;
    }
    function freeze(el) {            // stop a running settle where it is
      if (!el || !el.style.transition || el.style.transition === 'none') return;
      const t = getComputedStyle(el).transform;
      el.style.transition = 'none';
      el.style.transform = t === 'none' ? '' : t;
    }
    function place(on, off = 0) { animTo(track, `translate3d(${-index * (W + GAP) + off}px,0,0)`, on); }
    function apply(on) { const it = cur(); if (it) animTo(it.el, transformOf(z.s, z.x, z.y), on); dlg.classList.toggle('is-zoomed', z.s > 1.01); }
    function readZoom() {           // the front still's zoom as drawn now (after freeze())
      const m = new DOMMatrixReadOnly(getComputedStyle(cur().el).transform);
      z = { s: Math.hypot(m.a, m.b) || 1, x: m.e, y: m.f };
    }
    function zoomAt(s, px, py, on) {
      const it = cur();
      s = clamp(s, 1, it.max);
      // keep the image point under (px, py) in place
      let x = px - W / 2 - (s / z.s) * (px - W / 2 - z.x), y = py - H / 2 - (s / z.s) * (py - H / 2 - z.y);
      const b = bounds(it, s);
      z = { s, x: s <= 1.001 ? 0 : clamp(x, b.minX, b.maxX), y: s <= 1.001 ? 0 : clamp(y, b.minY, b.maxY) };
      apply(on);
    }
    function settleZoom() {
      const it = cur(), s = z.s < 1.01 ? 1 : Math.min(z.s, it.max), b = bounds(it, s);
      z = s === 1 ? { s: 1, x: 0, y: 0 } : { s, x: clamp(z.x, b.minX, b.maxX), y: clamp(z.y, b.minY, b.maxY) };
      apply(true);
    }
    function toggleZoom(px, py) {
      if (z.s > 1.01) { z = { s: 1, x: 0, y: 0 }; apply(true); } else zoomAt(cur().dbl, px, py, true);
    }

    /* ---------- loading: the page's own image first, the largest file once decoded */
    function prime(i) {
      const it = items[i];
      if (!it || it.el.getAttribute('src')) return;
      const p = it.page;
      if (p && p.complete && p.naturalWidth && p.currentSrc) it.el.src = p.currentSrc;
    }
    function upgrade(i) {
      const it = items[i];
      if (!it || it.big) return Promise.resolve();
      const big = it.big = new Image();
      big.decoding = 'async';
      big.src = it.src;
      const swap = () => { if (it.big === big) it.el.src = it.src; };
      return (big.decode ? big.decode() : Promise.reject()).then(swap, () => new Promise(res => {
        if (big.complete && big.naturalWidth) { swap(); res(); return; }
        big.onload = () => { swap(); res(); }; big.onerror = res;
      }));
    }
    function loadAround() {
      [index, index - 1, index + 1].forEach(prime);
      if (!cur().el.getAttribute('src')) cur().el.src = cur().src;   // nothing cached: the file itself
      upgrade(index).then(() => { if (open && !saveData()) { upgrade(index + 1); upgrade(index - 1); } });
    }

    function update() {
      // the count, and for screen readers the still's own description after it
      const sr = document.createElement('span');
      sr.className = 'sr-only'; sr.textContent = cur().el.alt ? `: ${cur().el.alt}` : '';
      count.replaceChildren(`${index + 1} / ${items.length}`, sr);
      prevBtn.setAttribute('aria-disabled', String(index === 0));
      nextBtn.setAttribute('aria-disabled', String(index === items.length - 1));
    }
    function go(i, on = true) {
      i = clamp(i, 0, items.length - 1);
      if (i !== index) {
        const old = cur();
        animTo(old.el, transformOf(1, 0, 0), false);
        index = i; z = { s: 1, x: 0, y: 0 }; apply(false);
        update(); loadAround();
      }
      place(on);
    }

    /* ---------- open / close */
    function morph(opening, from) {
      const it = cur();
      const fade = (el, a, b, ms) => el.animate([{ opacity: a }, { opacity: b }], { duration: ms, easing: 'ease', fill: 'both' });
      if (!motion()) return Promise.resolve();
      const anims = [fade(shade, opening ? 0 : +getComputedStyle(shade).opacity, opening ? 1 : 0, opening ? 260 : 320)];
      chrome.forEach(el => anims.push(fade(el, opening ? 0 : 1, opening ? 1 : 0, 220)));
      if (from && from.width > 0) {
        it.el.style.transition = 'none';
        const now = it.el.style.transform || transformOf(1, 0, 0);
        it.el.style.transform = transformOf(1, 0, 0);
        const b = it.el.getBoundingClientRect();
        it.el.style.transform = now;
        const tx = from.left + from.width / 2 - (b.left + b.width / 2), ty = from.top + from.height / 2 - (b.top + b.height / 2);
        const flip = `translate3d(${tx}px,${ty}px,0) scale(${from.width / b.width},${from.height / b.height})`;
        anims.push(it.el.animate(opening ? [{ transform: flip }, { transform: now }] : [{ transform: now }, { transform: flip }],
          { duration: DUR, easing: EASE, fill: 'both' }));
      } else if (!opening) anims.push(it.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease', fill: 'both' }));
      return Promise.all(anims.map(a => a.finished.catch(() => {}))).then(() => anims);
    }

    function show(link) {
      if (closing) { reopen = link; return; }   // a tap while the last still flies home: open once it has landed
      if (open) return;
      const links = [...document.querySelectorAll('a[data-zoom]')].filter(a => shown(a) && pageImg(a));
      if (!links.includes(link)) links.push(link);
      items = links.map(a => {
        const p = pageImg(a);
        const el = document.createElement('img');
        el.className = 'pj-viewer__img'; el.alt = p.alt; el.decoding = 'async'; el.draggable = false;
        const slide = document.createElement('div');
        const w = +p.getAttribute('width') || p.naturalWidth || 16, h = +p.getAttribute('height') || p.naturalHeight || 10;
        const phone = h > w;
        slide.className = 'pj-viewer__slide' + (phone ? ' pj-viewer__slide--phone' : '');
        slide.appendChild(el);
        return { link: a, page: p, src: a.href, w, h, phone, el, slide, big: null };
      });
      index = Math.max(0, links.indexOf(link));
      track.replaceChildren(...items.map(it => it.slide));
      dlg.classList.toggle('is-single', items.length < 2);
      dlg.classList.remove('is-dismissing', 'is-zoomed', 'is-grabbing');
      const from = cur().page.getBoundingClientRect();   // before the scroll lock can move the page
      if (TS.lockScroll) TS.lockScroll(true);
      dlg.showModal();
      open = true; z = { s: 1, x: 0, y: 0 };
      shade.style.opacity = '';
      measure(); place(false); apply(false); update(); loadAround();
      try { history.pushState({ pjViewer: true }, ''); pushed = true; } catch (e) { pushed = false; }
      addEventListener('popstate', onPop);
      addEventListener('resize', onResize);
      morph(true, from).then(anims => (anims || []).forEach(a => a.cancel()));
    }

    // a visitor's close (X, Esc, swipe, a tap on the black): through Back when the viewer added a history entry
    function close() {
      if (!open || closing) return;
      if (pushed) {
        pushed = false; pending = true;
        history.back();
        fallback = setTimeout(() => { if (pending) { pending = null; finish(); } }, 450);   // no popstate came
        return;
      }
      finish();
    }
    function onPop() { if (!open || closing) return; pushed = false; pending = null; clearTimeout(fallback); finish(); }
    function onResize() { if (!open || closing) return; measure(); z = { s: 1, x: 0, y: 0 }; apply(false); place(false); }

    function finish() {
      if (!open || closing) return;
      closing = true;
      removeEventListener('popstate', onPop);
      removeEventListener('resize', onResize);
      clearTimeout(tapTimer); lastTap = null; g = null; pts.clear();
      const it = cur();
      if (TS.lockScroll) TS.lockScroll(false);
      // the still shown last, on the page and in view (it may sit further down, or off in a phone strip)
      try { it.link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); } catch (e) { it.link.scrollIntoView(false); }
      const r = it.page.getBoundingClientRect();
      const from = r.width && r.bottom > 0 && r.top < innerHeight ? r : null;
      morph(false, from).then(anims => {
        dlg.close();
        (anims || []).forEach(a => a.cancel());
        const next = reopen;
        cleanup();
        it.link.focus({ preventScroll: true });
        if (next) show(next);
      });
    }
    function cleanup() {
      items.forEach(i => { if (i.big) { i.big.onload = i.big.onerror = null; i.big.src = ''; } });
      track.replaceChildren(); items = []; reopen = null;
      dlg.classList.remove('is-dismissing', 'is-zoomed', 'is-grabbing');
      open = false; closing = false;
    }
    // the browser closed the dialog itself (e.g. a second Esc it does not let the page cancel): tidy up at once
    dlg.addEventListener('close', () => {
      if (!open || closing) return;
      const link = cur() && cur().link;
      removeEventListener('popstate', onPop); removeEventListener('resize', onResize);
      if (TS.lockScroll) TS.lockScroll(false);
      cleanup();
      if (pushed) { pushed = false; history.back(); }
      if (link) link.focus({ preventScroll: true });
    });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });

    /* ---------- controls and keys */
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn.addEventListener('click', () => go(index + 1));
    dlg.addEventListener('keydown', e => {
      if (!open || closing || e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key, onBtn = e.target.closest && e.target.closest('button');
      if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); go(index + (k === 'ArrowRight' ? 1 : -1)); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); go(k === 'Home' ? 0 : items.length - 1); }
      else if (k === '+' || k === '=') { e.preventDefault(); zoomAt(z.s * 1.5, W / 2, H / 2, true); }
      else if (k === '-' || k === '_') { e.preventDefault(); zoomAt(z.s / 1.5, W / 2, H / 2, true); }
      else if (k === '0') { e.preventDefault(); z = { s: 1, x: 0, y: 0 }; apply(true); }
      else if (k === 'PageUp' || k === 'PageDown' || k === 'ArrowUp' || k === 'ArrowDown' || (k === ' ' && !onBtn)) e.preventDefault();   // the page behind stays put
    });

    /* ---------- gestures */
    const velocity = h => {
      if (h.length < 2) return { x: 0, y: 0 };
      const a = h[0], b = h[h.length - 1], dt = Math.max(1, b[0] - a[0]);
      return { x: (b[1] - a[1]) / dt, y: (b[2] - a[2]) / dt };
    };
    function stopAll() {
      freeze(track);
      const it = cur();
      if (it && it.el.style.transition && it.el.style.transition !== 'none') { freeze(it.el); readZoom(); }
      // a settle of the track was cut short: continue from where it is
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      return m.e + index * (W + GAP);
    }
    function startPinch() {
      const [a, b] = [...pts.values()];
      if (g && (g.mode === 'swipe')) place(false);
      if (g && g.mode === 'dismiss') { dlg.classList.remove('is-dismissing'); shade.style.opacity = ''; apply(false); }
      g = { mode: 'pinch', d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, z0: { ...z } };
    }
    function pinchMove() {
      const [a, b] = [...pts.values()], it = cur();
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let s = g.z0.s * Math.hypot(a.x - b.x, a.y - b.y) / g.d0;
      s = s > it.max ? it.max + (s - it.max) * 0.3 : s < 1 ? 1 - (1 - s) * 0.45 : s;
      z = { s, x: m.x - W / 2 - (s / g.z0.s) * (g.m0.x - W / 2 - g.z0.x), y: m.y - H / 2 - (s / g.z0.s) * (g.m0.y - H / 2 - g.z0.y) };
      apply(false);
    }
    stage.addEventListener('pointerdown', e => {
      if (!open || closing || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        const off = stopAll();
        g = { mode: 'pending', x0: e.clientX, y0: e.clientY, off: Math.abs(off) > 1 ? off : 0, z0: { ...z }, onImg: e.target === cur().el,
          type: e.pointerType, hist: [[e.timeStamp, e.clientX, e.clientY]] };
        if (g.off) { g.mode = 'swipe'; place(false, g.off); }
      } else if (pts.size === 2) startPinch();
    });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId) || !g) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.mode === 'pinch') { if (pts.size >= 2) pinchMove(); return; }
      const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      g.hist.push([e.timeStamp, e.clientX, e.clientY]);
      while (g.hist.length > 2 && e.timeStamp - g.hist[0][0] > 100) g.hist.shift();
      if (g.mode === 'pending') {
        if (Math.hypot(dx, dy) < LOCK) return;
        const horiz = Math.abs(dx) >= Math.abs(dy);
        if (z.s > 1.01) {
          const b = bounds(cur(), z.s);
          const edge = horiz && items.length > 1 && ((dx > 0 && z.x >= b.maxX - 1) || (dx < 0 && z.x <= b.minX + 1));
          g.mode = edge ? 'swipe' : 'pan';
        } else g.mode = horiz ? (items.length > 1 ? 'swipe' : 'none') : 'dismiss';
        if (g.mode === 'pan') dlg.classList.add('is-grabbing');
        if (g.mode === 'dismiss') dlg.classList.add('is-dismissing');
      }
      const mx = e.clientX - g.x0, my = e.clientY - g.y0;
      if (g.mode === 'swipe') {
        let off = g.off + mx;
        if ((index === 0 && off > 0) || (index === items.length - 1 && off < 0)) off *= 0.35;
        place(false, off);
      } else if (g.mode === 'pan') {
        const b = bounds(cur(), z.s);
        z = { s: z.s, x: rubber(g.z0.x + mx, b.minX, b.maxX), y: rubber(g.z0.y + my, b.minY, b.maxY) };
        apply(false);
      } else if (g.mode === 'dismiss') {
        const k = Math.min(1, Math.abs(my) / (H * 0.6));
        animTo(cur().el, `translate3d(0,${my}px,0) scale(${1 - k * 0.14})`, false);
        shade.style.opacity = String(1 - k * 0.9);
      }
    });
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (!g) return;
      if (g.mode === 'pinch') {
        if (pts.size === 1) {               // one finger stays: it pans on from here
          const [p] = [...pts.values()];
          g = { mode: 'pan', x0: p.x, y0: p.y, off: 0, z0: { ...z }, hist: [] };
          dlg.classList.add('is-grabbing');
        } else if (!pts.size) { g = null; settleZoom(); }
        return;
      }
      if (pts.size) return;
      const st = g; g = null;
      dlg.classList.remove('is-grabbing');
      const mx = e.clientX - st.x0, my = e.clientY - st.y0, v = velocity(st.hist);
      if (st.mode === 'pending') { if (e.type === 'pointerup') tap(e, st); else place(true); }
      else if (st.mode === 'swipe') {
        const off = st.off + mx;
        let to = index;
        if (off < -W * SWIPE || (v.x < -FLICK && mx < 0)) to += 1;
        else if (off > W * SWIPE || (v.x > FLICK && mx > 0)) to -= 1;
        go(to);
      } else if (st.mode === 'pan') settleZoom();
      else if (st.mode === 'dismiss') {
        if (Math.abs(my) > DISMISS || (Math.abs(v.y) > DISMISS_V && Math.sign(v.y) === Math.sign(my))) close();
        else {
          dlg.classList.remove('is-dismissing');
          shade.style.transition = motion() ? `opacity ${DUR}ms ease` : 'none';
          shade.style.opacity = '';
          apply(true);
        }
      }
    }
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    function tap(e, st) {
      if (st.type === 'mouse') { if (st.onImg) toggleZoom(e.clientX, e.clientY); else if (z.s <= 1.01) close(); return; }
      if (lastTap && e.timeStamp - lastTap.t < TAP_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < TAP_PX) {
        clearTimeout(tapTimer); lastTap = null;
        toggleZoom(e.clientX, e.clientY);
        return;
      }
      lastTap = { t: e.timeStamp, x: e.clientX, y: e.clientY };
      const onImg = st.onImg;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { lastTap = null; if (!onImg && z.s <= 1.01) close(); }, TAP_MS);
    }
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      if (!open || closing || g) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? H : 1;
      const dx = e.deltaX * unit, dy = e.deltaY * unit;
      if (!e.ctrlKey && Math.abs(dx) > Math.abs(dy)) {
        if (z.s > 1.01) { const b = bounds(cur(), z.s); z = { s: z.s, x: clamp(z.x - dx, b.minX, b.maxX), y: z.y }; apply(false); }
        else if (Math.abs(dx) > 12 && e.timeStamp > wheelLock) { wheelLock = e.timeStamp + 450; go(index + (dx > 0 ? 1 : -1)); }
        return;
      }
      if (!dy) return;
      freeze(cur().el); readZoom();
      zoomAt(z.s * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0025)), e.clientX, e.clientY, false);
    }, { passive: false });
    dlg.addEventListener('gesturestart', e => e.preventDefault());   // older iOS Safari: never zoom the page behind
    dlg.addEventListener('contextmenu', e => { if (g) e.preventDefault(); });

    return { open: show };
  }
})();
