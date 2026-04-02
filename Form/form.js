// ScrollTriggerプラグインを有効化（GSAPでスクロール制御を使うために必須）
gsap.registerPlugin(ScrollTrigger);

// 必要なDOM要素を取得
const pin      = document.getElementById('js-pin');        // ピン留めするラッパー要素
const track    = document.getElementById('js-track');      // 横にスライドさせるコンテンツ全体
const progress = document.getElementById('js-progress');   // 進捗バー
const dotsNav  = document.getElementById('js-dots');       // セクションナビ（ドット）
const cursor   = document.getElementById('js-cursor');     // カスタムカーソル本体
const ring     = document.getElementById('js-cursor-ring');// カーソル追従リング

/* ─────────────────────────────
   ドットナビゲーション生成
   ───────────────────────────── */

// セクション数（横スクロール内のページ数）
const sectionCount = 5;

// 指定数分のドットを生成
const dots = Array.from({ length: sectionCount }, (_, i) => {
  const d = document.createElement('div');

  // 最初のドットのみアクティブ状態
  d.className = 'section-dot' + (i === 0 ? ' is-active' : '');

  dotsNav.appendChild(d);
  return d;
});


/* ─────────────────────────────
   カスタムカーソル処理
   ───────────────────────────── */

// 現在位置(cx, cy) と 緩やか追従位置(rx, ry)
let cx = 0, cy = 0, rx = 0, ry = 0;

// マウス移動時に現在座標を更新
window.addEventListener('mousemove', e => {
  cx = e.clientX;
  cy = e.clientY;
});

// アニメーションループ（慣性付き追従）
(function loop() {

  // イージング補間（追従を滑らかにする）
  rx += (cx - rx) * 0.12;
  ry += (cy - ry) * 0.12;

  // カーソル本体は即座に追従
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';

  // リングは遅れて追従（視覚的な演出）
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';

  requestAnimationFrame(loop);
})();


/* ─────────────────────────────
   横スクロール移動量を算出
   ───────────────────────────── */

// コンテンツ全幅 - 画面幅 ＝ 横移動量
const getAmount = () => -(track.scrollWidth - window.innerWidth);


/* =====================================================
   横スクロール本体処理

   ・pinで要素を固定
   ・縦スクロール量を横移動量へ変換
   ・進捗バーとドットを同期更新
===================================================== */

gsap.to(track, {
  x: getAmount,        // 横方向へ移動
  ease: 'none',        // スクロール連動なのでイージング無し

  scrollTrigger: {
    trigger: pin,      // トリガー要素
    pin: true,         // ピン留め有効
    start: 'top top',  // 上端に来たら開始

    // 横移動量と同じだけ縦スクロールを確保
    end: () => `+=${Math.abs(getAmount())}`,

    scrub: 1.2,        // スクロールとの滑らかな同期
    anticipatePin: 1,  // ピン開始時のガタつき軽減

    // スクロール進捗ごとの更新処理
    onUpdate: self => {

      // 進捗バー幅を更新（0〜100%）
      progress.style.width = `${self.progress * 100}%`;

      // 現在のセクションインデックスを算出
      const idx = Math.round(self.progress * (sectionCount - 1));

      // ドットのアクティブ状態を切り替え
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
      });
    },
  },
});


/* ─────────────────────────────
   パネル入場アニメーション
   ───────────────────────────── */

// ページロード時にふわっと表示
gsap.fromTo('.panel',
  { opacity: 0, y: 40 },                // 初期状態（少し下＋透明）
  {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.1,                        // 順番に表示
    delay: 0.3
  }
);


/* ─────────────────────────────
   リサイズ対応
   ───────────────────────────── */

// 画面サイズ変更時に再計算
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});


/* ─────────────────────────────
   タッチパッド横スワイプ暴発対策
   ───────────────────────────── */

// 横スクロール量の方が大きい場合はデフォルト動作を止める
window.addEventListener('wheel', e => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    e.preventDefault();
  }
}, { passive: false });