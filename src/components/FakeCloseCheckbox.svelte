<svelte:options customElement="fake-close-checkbox" />

<script>
  let popups = [
    { id: 0, title: '🎉 おめでとうございます！', body: 'あなたは100万人目の訪問者です！', x: 10, y: 10, visible: true },
  ];
  let nextId = 1;
  let attempts = 0;
  let checkboxVisible = false;
  let message = '';
  let showMessage = false;

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

  function spawnPopup(sourceX, sourceY) {
    const newPopup = {
      id: nextId++,
      title: adTitles[Math.floor(Math.random() * adTitles.length)],
      body: adBodies[Math.floor(Math.random() * adBodies.length)],
      x: Math.max(0, Math.min(55, sourceX + (Math.random() - 0.5) * 40)),
      y: Math.max(0, Math.min(55, sourceY + (Math.random() - 0.5) * 30)),
      visible: true,
    };
    popups = [...popups, newPopup];
  }

  function handleClose(popup) {
    attempts++;

    // 偽の×ボタン: 閉じる代わりに新しい広告を生成
    popup.visible = false;
    popups = popups.filter(p => p.visible);

    // 1〜2個の新しい広告を生成
    const numNew = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numNew; i++) {
      spawnPopup(popup.x, popup.y);
    }

    message = closeMessages[attempts % closeMessages.length];
    showMessage = true;
    setTimeout(() => { showMessage = false; }, 1500);

    // たまにチェックボックスがチラ見えする演出
    if (attempts % 7 === 0) {
      checkboxVisible = true;
      setTimeout(() => {
        checkboxVisible = false;
        spawnPopup(25, 40);
        spawnPopup(35, 45);
      }, 800);
    }
  }

  function handleCheckboxClick() {
    // チェックボックスが見えてもクリックすると広告で覆われる
    checkboxVisible = false;
    for (let i = 0; i < 3; i++) {
      spawnPopup(20 + Math.random() * 30, 30 + Math.random() * 30);
    }
    message = '認証エリアは広告スポンサーにより保護されています';
    showMessage = true;
    setTimeout(() => { showMessage = false; }, 2000);
  }
</script>

<div class="container">
  <div class="checkbox-area" class:visible={checkboxVisible}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="real-checkbox" on:click={handleCheckboxClick}>
      <input type="checkbox" />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>私はロボットではありません</label>
    </div>
  </div>

  {#each popups as popup (popup.id)}
    {#if popup.visible}
      <div
        class="popup"
        style="left: {popup.x}%; top: {popup.y}%;"
      >
        <div class="popup-header">
          <span class="popup-title">{popup.title}</span>
          <button class="close-btn" on:click={() => handleClose(popup)}>×</button>
        </div>
        <div class="popup-body">
          <p>{popup.body}</p>
          <div class="fake-buttons">
            <button class="fake-btn primary" on:click={() => handleClose(popup)}>OK</button>
            <button class="fake-btn" on:click={() => handleClose(popup)}>閉じる</button>
          </div>
        </div>
      </div>
    {/if}
  {/each}

  {#if showMessage}
    <div class="message">{message}</div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">閉じた広告: {attempts} / 新たな広告: {popups.length}</div>
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
    width: 200px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
    animation: popIn 0.2s ease-out;
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    border-radius: 6px 6px 0 0;
  }

  .popup-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  .close-btn {
    width: 20px;
    height: 20px;
    border: none;
    background: #e0e0e0;
    border-radius: 3px;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: #d0d0d0;
    color: #333;
  }

  .popup-body {
    padding: 10px;
  }

  .popup-body p {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #666;
    margin-bottom: 10px;
  }

  .fake-buttons {
    display: flex;
    gap: 6px;
  }

  .fake-btn {
    flex: 1;
    padding: 5px 8px;
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
    bottom: 35px;
    left: 50%;
    transform: translateX(-50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #c0392b;
    background: rgba(255, 255, 255, 0.95);
    padding: 6px 14px;
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
</style>
