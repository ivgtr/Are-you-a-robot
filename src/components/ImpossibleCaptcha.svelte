<svelte:options customElement="impossible-captcha" />

<script>
  let selectedImages = new Set();
  let attempts = 0;
  let errorMessage = '';
  let showError = false;
  let showFakeSuccess = false;
  let promptIndex = 0;

  const prompts = [
    { icon: '🤖', text: '「車」を含む画像をすべて選択してください' },
    { icon: '🔍', text: '「バス」ではない車をすべて選択してください' },
    { icon: '🎯', text: '「赤い車」をすべて選択してください' },
    { icon: '🧩', text: '「2ドアの車」をすべて選択してください' },
    { icon: '👀', text: '「走っている車」を選択してください' },
    { icon: '🤯', text: '「車に見えるが車ではないもの」を選択してください' },
    { icon: '💀', text: '「存在しない車」を選択してください' },
  ];

  let images = [
    { id: 1, label: '🚗' },
    { id: 2, label: '🚕' },
    { id: 3, label: '🚙' },
    { id: 4, label: '🚌' },
    { id: 5, label: '🚎' },
    { id: 6, label: '🏎️' },
    { id: 7, label: '🚓' },
    { id: 8, label: '🚑' },
    { id: 9, label: '🚒' },
  ];

  $: currentPrompt = prompts[Math.min(promptIndex, prompts.length - 1)];

  const reasons = [
    '選択した画像が多すぎます',
    '選択した画像が少なすぎます',
    '画像の選択が正確ではありません',
    'タイムアウトしました。もう一度お試しください',
    '不正なアクセスが検出されました',
    'ロボットの可能性があります',
    '画像の読み込みに失敗しました',
    'サーバーエラーが発生しました',
    '選択順序が不正です',
    'この画像セットは期限切れです',
  ];

  function shuffleImages() {
    images = images
      .map(img => ({ ...img, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort, ...img }) => img);
  }

  function toggleImage(id) {
    if (cleared || gameOver) return;
    if (selectedImages.has(id)) {
      selectedImages.delete(id);
    } else {
      selectedImages.add(id);
    }
    selectedImages = selectedImages;
  }

  // 各お題に対する正解のimage id集合
  // 「車」= 🚗(1), 🚕(2), 🚙(3), 🏎️(6), 🚓(7) — バス(4,5)と緊急車両(8,9)は除外
  const correctAnswers = {
    0: new Set([1, 2, 3, 6, 7]),       // 「車」を含む画像
    1: new Set([1, 2, 3, 6, 7]),       // 「バス」ではない車
    2: new Set([9]),                     // 「赤い車」= 🚒
    3: new Set([1, 6]),                  // 「2ドアの車」= 🚗, 🏎️
    4: new Set([6]),                     // 「走っている車」= 🏎️
  };

  let cleared = false;
  let gameOver = false;

  // 3回不正解でゲームオーバー
  const MAX_ATTEMPTS = 3;

  function checkCorrectAnswer() {
    const answer = correctAnswers[Math.min(promptIndex, Object.keys(correctAnswers).length - 1)];
    if (!answer) return false;
    if (selectedImages.size !== answer.size) return false;
    for (const id of selectedImages) {
      if (!answer.has(id)) return false;
    }
    return true;
  }

  function verify() {
    if (cleared || gameOver) return;

    // 正解チェック（最初の5つのお題にのみ正解が存在する）
    if (promptIndex < Object.keys(correctAnswers).length && checkCorrectAnswer()) {
      cleared = true;
      showFakeSuccess = true;
      showError = false;
      attempts++;
      return;
    }

    attempts++;

    // 上限チェック
    if (attempts >= MAX_ATTEMPTS) {
      gameOver = true;
      errorMessage = `${MAX_ATTEMPTS}回不正解。ゲームオーバー`;
      showError = true;
      showFakeSuccess = false;
      return;
    }

    errorMessage = reasons[(attempts - 1) % reasons.length];
    showError = true;
    showFakeSuccess = false;

    selectedImages.clear();
    selectedImages = selectedImages;

    // プロンプトを次に進める
    promptIndex++;

    // 検証失敗時に画像をシャッフル
    shuffleImages();
  }
</script>

<div class="container">
  <div class="header">
    <div class="icon">{currentPrompt.icon}</div>
    <div class="title">{currentPrompt.text}</div>
  </div>

  <div class="grid">
    {#each images as image (image.id)}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        class="image-box"
        class:selected={selectedImages.has(image.id)}
        on:click={() => toggleImage(image.id)}
      >
        <span class="emoji">{image.label}</span>
        {#if selectedImages.has(image.id)}
          <div class="checkmark">✓</div>
        {/if}
      </div>
    {/each}
  </div>

  <button type="button" class="verify-btn" on:click={verify} disabled={cleared || gameOver}>
    {gameOver ? 'ゲームオーバー' : '確認'}
  </button>

  {#if showFakeSuccess && cleared}
    <div class="result success">
      <input type="checkbox" checked disabled style="margin-right: 6px;" />
      ✓ 正解！認証成功
    </div>
  {/if}

  {#if showError}
    <div class="result error">
      ✗ {errorMessage}
    </div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">
      試行回数: {attempts}/{MAX_ATTEMPTS}
    </div>
  {/if}
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
    max-width: 400px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: var(--ar-space-5, 10px);
    margin-bottom: var(--ar-space-6, 12px);
    padding: var(--ar-header-padding, 10px 12px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius, 4px);
  }

  .icon {
    font-size: 20px;
  }

  .title {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-medium, 500);
    color: var(--ar-color-text, #333);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ar-space-3, 6px);
    margin-bottom: var(--ar-space-6, 12px);
  }

  .image-box {
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border-dark, #d0d0d0);
    border-radius: var(--ar-radius, 4px);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
  }

  .image-box:hover {
    border-color: var(--ar-color-border-focus, #999);
  }

  .image-box:active {
    transform: scale(0.95);
  }

  .image-box.selected {
    border-color: var(--ar-color-primary, #333);
    background: var(--ar-color-surface-dim, #f5f5f5);
  }

  .emoji {
    font-size: 40px;
  }

  .checkmark {
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 20px;
    height: 20px;
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border-radius: var(--ar-radius-full, 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ar-message-font-size, 12px);
    font-weight: var(--ar-font-weight-bold, 700);
  }

  .verify-btn {
    width: 100%;
    padding: var(--ar-space-5, 10px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border: none;
    border-radius: var(--ar-radius, 4px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-medium, 500);
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }

  .verify-btn:hover:not(:disabled) {
    background: var(--ar-color-primary-hover, #1a1a1a);
  }

  .verify-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .result {
    margin-top: var(--ar-space-5, 10px);
    padding: var(--ar-message-padding, 10px 12px);
    border-radius: var(--ar-radius, 4px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-message-font-size, 12px);
    animation: slideIn 0.2s ease-out;
  }

  .result.success {
    background: var(--ar-color-success-bg, #f0faf0);
    color: var(--ar-color-success, #1a6b2a);
    border: 1px solid var(--ar-color-success-border, #d4e8d4);
  }

  .result.error {
    background: var(--ar-color-error-bg, #fef2f2);
    color: var(--ar-color-error, #b91c1c);
    border: 1px solid var(--ar-color-error-border, #fecaca);
  }

  .attempts {
    margin-top: var(--ar-space-5, 10px);
    padding: var(--ar-space-4, 8px);
    background: var(--ar-color-warning-bg, #fffbe6);
    border: 1px solid var(--ar-color-warning-border, #e6d98c);
    border-radius: var(--ar-radius, 4px);
    text-align: center;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-warning, #7a6c1a);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
