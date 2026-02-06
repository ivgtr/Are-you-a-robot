<svelte:options customElement="fake-close-checkbox" />

<script>
  let popups = [
    { id: 0, title: '🎉 おめでとうございます！', body: 'あなたは100万人目の訪問者です！', x: 5, y: 5, visible: true },
    { id: 1, title: '⚠️ ウイルスが検出されました！', body: '今すぐスキャンしてください', x: 30, y: 20, visible: true },
    { id: 2, title: '🍪 Cookieを受け入れますか？', body: '最適な体験のために必要です', x: 15, y: 40, visible: true },
  ];
  let nextId = 3;
  let attempts = 0;
  let checkboxVisible = false;
  let message = '';
  let showMessage = false;
  let cleared = false;
  let checkboxClickCount = 0;
  let gameOver = false;
  let checkboxAppearances = 0;
  let checkboxClickedThisAppearance = false;

  // チェックボックスを3回素早くクリックすると広告を突破して認証成功
  const CLICKS_TO_CLEAR = 3;
  // チェックボックスは最大3回しか出現しない
  const MAX_APPEARANCES = 3;

  // ドラッグ/スワイプ状態
  let drag = null;
  let swipeOut = null;
  const SWIPE_THRESHOLD = 80;
  const SWIPE_VELOCITY = 0.5;

  const adTitles = [
    '🎰 今すぐ無料でプレイ！',
    '📱 アプリをダウンロード！',
    '💰 簡単に稼げる副業！',
    '🔔 通知を許可しますか？',
    '🍪 Cookieを受け入れますか？',
    '📧 メルマガに登録しませんか？',
    '⚠️ ウイルスが検出されました！',
    '🎁 プレゼントが届いています！',
    '📊 アンケートにご協力ください',
    '🔄 アップデートが必要です',
    '💎 限定オファー残り3分！',
    '🏆 抽選に当選しました！',
  ];

  const adBodies = [
    '今すぐクリック →',
    '残り時間わずか！',
    '無料で始められます',
    'この広告を閉じることはできません',
    '本当に閉じますか？',
    '閉じる前にこちらをチェック',
    'お見逃しなく！',
    '今だけ特別価格！',
  ];

  const closeMessages = [
    'それは偽の×ボタンでした',
    '広告が増殖しました',
    'もう一つ広告が出現！',
    '閉じたつもりが開いた！',
    '×ボタンが広告でした',
    'まだまだ広告はあります',
  ];

  const swipeMessages = [
    'スワイプしても無駄です',
    '広告は逃げない...増える！',
    'いい腕してますね、でも無意味',
    'フリックで消えると思った？',
    'スワイプ対応広告です（嘘）',
    'ドラッグお疲れ様です',
  ];

  function spawnPopup(sourceX, sourceY) {
    // ポップアップ数の上限 (多すぎるとパフォーマンス低下)
    if (popups.length >= 8) {
      popups = popups.slice(-5);
    }
    const newPopup = {
      id: nextId++,
      title: adTitles[Math.floor(Math.random() * adTitles.length)],
      body: adBodies[Math.floor(Math.random() * adBodies.length)],
      x: Math.max(0, Math.min(50, sourceX + (Math.random() - 0.5) * 30)),
      y: Math.max(0, Math.min(55, sourceY + (Math.random() - 0.5) * 25)),
      visible: true,
    };
    popups = [...popups, newPopup];
  }

  function handleClose(popup) {
    if (gameOver) return;
    attempts++;

    // 偽の×ボタン: 閉じる代わりに新しい広告を生成
    popups = popups.filter(p => p.id !== popup.id);

    // 1〜2個の新しい広告を生成
    const numNew = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numNew; i++) {
      spawnPopup(popup.x, popup.y);
    }

    message = closeMessages[attempts % closeMessages.length];
    showMessage = true;
    setTimeout(() => { showMessage = false; }, 1500);

    // たまにチェックボックスがチラ見えする演出
    if (attempts > 0 && attempts % 5 === 0) {
      checkboxAppearances++;
      if (checkboxAppearances > MAX_APPEARANCES) {
        // もう出現しない → ゲームオーバー
        gameOver = true;
        message = '広告に完全に埋もれました。ゲームオーバー';
        showMessage = true;
        return;
      }
      checkboxClickedThisAppearance = false;
      checkboxVisible = true;
      setTimeout(() => {
        // チェックボックスをクリック済みなら追加ポップアップを出さない
        if (!cleared && !checkboxClickedThisAppearance) {
          checkboxVisible = false;
          spawnPopup(20, 35);
          spawnPopup(30, 45);
        }
      }, 800);
    }
  }

  function handleCheckboxClick() {
    if (cleared || gameOver) return;
    checkboxClickCount++;
    checkboxClickedThisAppearance = true;

    // 累計3回チェックボックスをクリックすればクリア
    if (checkboxClickCount >= CLICKS_TO_CLEAR) {
      cleared = true;
      message = '広告の壁を突破しました...認証成功！';
      showMessage = true;
      popups = [];
      return;
    }

    checkboxVisible = false;
    for (let i = 0; i < 3; i++) {
      spawnPopup(15 + Math.random() * 35, 25 + Math.random() * 30);
    }
    message = `認証エリアにアクセス中... (${checkboxClickCount}/${CLICKS_TO_CLEAR})`;
    showMessage = true;
    setTimeout(() => { showMessage = false; }, 2000);
  }

  // ===== ドラッグ&スワイプ =====

  function handleDragStart(e, popup) {
    if (gameOver || cleared) return;
    // ボタン上からのドラッグは無視（クリックを優先）
    if (e.target.closest('button')) return;

    const point = e.touches ? e.touches[0] : e;
    drag = {
      id: popup.id,
      startX: point.clientX,
      startY: point.clientY,
      offsetX: 0,
      offsetY: 0,
      startTime: Date.now(),
      popup,
    };
  }

  function handleDragMove(e) {
    if (!drag) return;
    if (e.cancelable) e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    drag.offsetX = point.clientX - drag.startX;
    drag.offsetY = point.clientY - drag.startY;
    drag = drag;
  }

  function handleDragEnd() {
    if (!drag) return;

    const dx = drag.offsetX;
    const elapsed = Date.now() - drag.startTime;
    const velocity = Math.abs(dx) / Math.max(1, elapsed);

    if (Math.abs(dx) > SWIPE_THRESHOLD || (velocity > SWIPE_VELOCITY && Math.abs(dx) > 20)) {
      // スワイプで飛ばす → ただし新しい広告が出る
      const popup = drag.popup;
      const direction = dx > 0 ? 1 : -1;
      swipeOut = { id: popup.id, direction };
      drag = null;

      setTimeout(() => {
        swipeOut = null;
        // スワイプで消しても handleClose と同じ扱い（広告増殖）
        handleClose(popup);
        // スワイプ用メッセージで上書き
        message = swipeMessages[Math.floor(Math.random() * swipeMessages.length)];
        showMessage = true;
        setTimeout(() => { showMessage = false; }, 1500);
      }, 300);
    } else {
      // 移動距離不足 → スナップバック
      drag = null;
    }
  }

  function getPopupStyle(popup) {
    let base = `left: ${popup.x}%; top: ${popup.y}%;`;

    if (swipeOut && swipeOut.id === popup.id) {
      return base + ` transform: translateX(${swipeOut.direction * 400}px) rotate(${swipeOut.direction * 20}deg); opacity: 0; transition: transform 0.3s ease-out, opacity 0.3s ease-out;`;
    }

    if (drag && drag.id === popup.id) {
      const rotation = drag.offsetX * 0.08;
      const opacity = Math.max(0.4, 1 - Math.abs(drag.offsetX) / 250);
      return base + ` transform: translate(${drag.offsetX}px, ${drag.offsetY}px) rotate(${rotation}deg); opacity: ${opacity}; transition: none; z-index: 20; cursor: grabbing;`;
    }

    return base;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:window
  on:mousemove={handleDragMove}
  on:mouseup={handleDragEnd}
  on:touchmove|passive={handleDragMove}
  on:touchend={handleDragEnd}
/>

<div class="container">
  <div class="checkbox-area" class:visible={checkboxVisible || cleared}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="real-checkbox" on:click={handleCheckboxClick}>
      <input type="checkbox" checked={cleared} />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>{cleared ? '認証成功' : '私はロボットではありません'}</label>
    </div>
  </div>

  {#each popups as popup (popup.id)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="popup"
      class:dragging={drag && drag.id === popup.id}
      style={getPopupStyle(popup)}
      on:mousedown={(e) => handleDragStart(e, popup)}
      on:touchstart={(e) => handleDragStart(e, popup)}
    >
      <div class="popup-header">
        <span class="popup-title">{popup.title}</span>
        <button class="close-btn" on:click|stopPropagation={() => handleClose(popup)}>×</button>
      </div>
      <div class="popup-body">
        <p>{popup.body}</p>
        <div class="fake-buttons">
          <button class="fake-btn primary" on:click|stopPropagation={() => handleClose(popup)}>OK</button>
          <button class="fake-btn" on:click|stopPropagation={() => handleClose(popup)}>閉じる</button>
        </div>
      </div>
    </div>
  {/each}

  {#if showMessage}
    <div class="message">{message}</div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">閉じた広告: {attempts} / 現在の広告: {popups.length}</div>
  {/if}

  {#if !cleared && !gameOver && popups.length > 0}
    <div class="swipe-hint">← スワイプで広告を消す →</div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 300px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    overflow: hidden;
  }

  .checkbox-area {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 0;
  }

  .checkbox-area.visible {
    opacity: 1;
    pointer-events: auto;
    z-index: 50;
  }

  .real-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }

  .real-checkbox input {
    width: 18px;
    height: 18px;
    accent-color: #333;
  }

  .real-checkbox label {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
    cursor: pointer;
  }

  .popup {
    position: absolute;
    width: 190px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
    animation: popIn 0.25s ease-out;
    cursor: grab;
    user-select: none;
    touch-action: none;
  }

  .popup.dragging {
    cursor: grabbing;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 9px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    border-radius: 6px 6px 0 0;
    gap: 4px;
  }

  .popup-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .close-btn {
    width: 18px;
    height: 18px;
    border: none;
    background: #e0e0e0;
    border-radius: 3px;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    flex-shrink: 0;
    padding: 0;
  }

  .close-btn:hover {
    background: #d0d0d0;
    color: #333;
  }

  .popup-body {
    padding: 8px 9px;
  }

  .popup-body p {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    color: #666;
    margin-bottom: 8px;
  }

  .fake-buttons {
    display: flex;
    gap: 5px;
  }

  .fake-btn {
    flex: 1;
    padding: 4px 6px;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    cursor: pointer;
    color: #333;
  }

  .fake-btn.primary {
    background: #333;
    color: #fff;
    border-color: #333;
  }

  .fake-btn:hover {
    opacity: 0.8;
  }

  .message {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #c0392b;
    background: rgba(255, 255, 255, 0.95);
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    animation: fadeInOut 1.5s ease-out forwards;
    pointer-events: none;
    white-space: nowrap;
    z-index: 100;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; }
    15% { opacity: 1; }
    75% { opacity: 1; }
    100% { opacity: 0; }
  }

  .attempts {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
    z-index: 100;
  }

  .swipe-hint {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    color: #bbb;
    pointer-events: none;
    z-index: 0;
    animation: hintPulse 2s ease-in-out infinite;
  }

  @keyframes hintPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
</style>
