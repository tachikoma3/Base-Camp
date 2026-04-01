
    gsap.registerPlugin(ScrollTrigger);

    const pin      = document.getElementById('js-pin');
    const track    = document.getElementById('js-track');
    const progress = document.getElementById('js-progress');
    const dotsNav  = document.getElementById('js-dots');
    const cursor   = document.getElementById('js-cursor');
    const ring     = document.getElementById('js-cursor-ring');

    /* ── ドット生成 ── */
    const sectionCount = 5;
    const dots = Array.from({ length: sectionCount }, (_, i) => {
      const d = document.createElement('div');
      d.className = 'section-dot' + (i === 0 ? ' is-active' : '');
      dotsNav.appendChild(d);
      return d;
    });

    /* ── カスタムカーソル ── */
    let cx = 0, cy = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    (function loop() {
      rx += (cx - rx) * 0.12;
      ry += (cy - ry) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      ring.style.left   = rx + 'px';
      ring.style.top    = ry + 'px';
      requestAnimationFrame(loop);
    })();

    /* ── 横スクロール量の計算 ── */
    const getAmount = () => -(track.scrollWidth - window.innerWidth);

    /* =====================================================
      【横スクロール本体】

      trigger: pin        → .pin-wrapper がトリガー
      pin: true           → .pin-wrapper をピン留めする
      gsap.to(track, ...) → .page-track を横に動かす

      GSAPは pin した要素の直後にスペーサーを自動挿入し、
      縦スクロール量を横移動量へ変換してくれる。
    ===================================================== */
    gsap.to(track, {
      x: getAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: 'top top',
        end: () => `+=${Math.abs(getAmount())}`,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: self => {
          progress.style.width = `${self.progress * 100}%`;
          const idx = Math.round(self.progress * (sectionCount - 1));
          dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        },
      },
    });

    /* ── パネル入場アニメ ── */
    gsap.fromTo('.panel',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.3 }
    );

    /* ── リサイズ対応 ── */
    window.addEventListener('resize', () => ScrollTrigger.refresh());

    /* ── タッチパッド横スワイプ対策 ── */
    window.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
    }, { passive: false });
