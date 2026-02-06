<svelte:options customElement="stack-drop-checkbox" />

<script>
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let checkboxFallen = false;
  let checkboxOffset = 0;
  let checkboxTilt = 0;

  let blocks = [
    { id: 0, color: '#e74c3c', label: '利用規約', alive: true, offset: 0 },
    { id: 1, color: '#e67e22', label: 'プライバシー', alive: true, offset: 0 },
    { id: 2, color: '#f1c40f', label: 'Cookie同意', alive: true, offset: 0 },
    { id: 3, color: '#2ecc71', label: '通知許可', alive: true, offset: 0 },
    { id: 4, color: '#3498db', label: '位置情報', alive: true, offset: 0 },
  ];

  const failMessages = [
    'チェックボックスが落下しました！',
    'バランスを崩してしまいました',
    '積み直してやり直しです',
    '物理法則には逆らえません',
    'もっと慎重にスライドしてください',
  ];

  const successButMessages = [
    'ブロックを全て除去しましたが、チェックボックスの着地位置が不正です',
    '認証エリア外に着地しました。やり直してください',
    'ブロック除去は成功しましたが、認証サーバーが応答しません',
  ];

  function hitBlock(block) {
    if (checkboxFallen) return;

    const aliveBlocks = blocks.filter(b => b.alive);
    const blockIndex = aliveBlocks.findIndex(b => b.id === block.id);

    // ブロックをスライドして外す
    block.alive = false;
    block.offset = (Math.random() > 0.5 ? 1 : -1) * 200;
    blocks = [...blocks];

    attempts++;

    // 上のブロックが少なくなるとバランスを崩す
    const remaining = blocks.filter(b => b.alive).length;

    if (remaining <= 2) {
      // 必ずバランスを崩す
      checkboxTilt = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30);
      setTimeout(() => {
        checkboxFallen = true;
        checkboxOffset = checkboxTilt > 0 ? 120 : -120;
        message = failMessages[attempts % failMessages.length];
        showMessage = true;
        setTimeout(() => {
          showMessage = false;
          resetStack();
        }, 2000);
      }, 400);
    } else if (remaining === 0) {
      // 全部除去しても失敗
      message = successButMessages[attempts % successButMessages.length];
      showMessage = true;
      setTimeout(() => {
        showMessage = false;
        resetStack();
      }, 2500);
    } else {
      // 途中でもランダムにバランスを崩す
      if (Math.random() < 0.35) {
        checkboxTilt = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10);
        setTimeout(() => {
          if (Math.random() < 0.4) {
            checkboxFallen = true;
            checkboxOffset = checkboxTilt > 0 ? 100 : -100;
            message = failMessages[attempts % failMessages.length];
            showMessage = true;
            setTimeout(() => {
              showMessage = false;
              resetStack();
            }, 2000);
          }
        }, 300);
      }
    }
  }

  function resetStack() {
    checkboxFallen = false;
    checkboxOffset = 0;
    checkboxTilt = 0;
    blocks = blocks.map(b => ({ ...b, alive: true, offset: 0 }));
  }
</script>

<div class="container">
  <div class="header">
    <span class="icon">🏗️</span>
    <span class="title">ブロックを慎重に外して認証を取り出せ</span>
  </div>

  <div class="play-area">
    <div class="stack">
      <div
        class="checkbox-top"
        class:fallen={checkboxFallen}
        style="transform: rotate({checkboxTilt}deg) translateX({checkboxOffset}px);"
      >
        <input type="checkbox" disabled />
        <span>認証</span>
      </div>

      {#each blocks as block (block.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div
          class="block"
          class:removed={!block.alive}
          style="background: {block.color}; transform: translateX({block.offset}px);"
          on:click={() => block.alive && hitBlock(block)}
        >
          <span class="block-label">{block.label}</span>
          {#if block.alive}
            <span class="hit-hint">← タップで除去</span>
          {/if}
        </div>
      {/each}

      <div class="base">🏁 認証エリア</div>
    </div>
  </div>

  {#if showMessage}
    <div class="message">{message}</div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">試行回数: {attempts}</div>
  {/if}
</div>

<style>
  .container {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .icon {
    font-size: 18px;
  }

  .title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  .play-area {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    position: relative;
  }

  .checkbox-top {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #fff;
    border: 2px solid #333;
    border-radius: 4px;
    transition: transform 0.4s ease;
    white-space: nowrap;
    z-index: 2;
  }

  .checkbox-top.fallen {
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0.5;
  }

  .checkbox-top input {
    width: 16px;
    height: 16px;
    accent-color: #333;
  }

  .checkbox-top span {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #333;
  }

  .block {
    width: 220px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease;
    position: relative;
  }

  .block:hover:not(.removed) {
    filter: brightness(1.1);
  }

  .block:active:not(.removed) {
    transform: scale(0.98);
  }

  .block.removed {
    opacity: 0;
    pointer-events: none;
    height: 0;
    margin: 0;
    overflow: hidden;
  }

  .block-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .hit-hint {
    position: absolute;
    right: -90px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 9px;
    color: #bbb;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .block:hover .hit-hint {
    opacity: 1;
  }

  .base {
    width: 220px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #333;
    color: #fff;
    border-radius: 3px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    margin-top: 4px;
  }

  .message {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    text-align: center;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .attempts {
    margin-top: 10px;
    text-align: right;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
  }
</style>
