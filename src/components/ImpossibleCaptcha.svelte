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
    if (selectedImages.has(id)) {
      selectedImages.delete(id);
    } else {
      selectedImages.add(id);
    }
    selectedImages = selectedImages;
  }

  function verify() {
    attempts++;

    // 5回に1回、偽の正解演出
    if (attempts % 5 === 0) {
      showFakeSuccess = true;
      showError = false;

      setTimeout(() => {
        showFakeSuccess = false;
        errorMessage = 'やっぱり不正解です。再試行してください';
        showError = true;
        selectedImages.clear();
        selectedImages = selectedImages;
        shuffleImages();
        promptIndex++;
      }, 1500);
      return;
    }

    errorMessage = reasons[attempts % reasons.length];
    showError = true;
    showFakeSuccess = false;

    selectedImages.clear();
    selectedImages = selectedImages;

    // 検証失敗時に画像をシャッフル
    shuffleImages();

    // 3回失敗ごとにお題を変更
    if (attempts % 3 === 0) {
      promptIndex++;
    }
  }
</script>

<div class="container">
  <div class="header">
    <div class="icon">{currentPrompt.icon}</div>
    <div class="title">{currentPrompt.text}</div>
  </div>

  <div class="grid">
    {#each images as image (image.id)}
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

  <button class="verify-btn" on:click={verify}>
    確認
  </button>

  {#if showFakeSuccess}
    <div class="result success">
      ✓ 認証成功！リダイレクト中...
    </div>
  {/if}

  {#if showError}
    <div class="result error">
      ✗ {errorMessage}
    </div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">
      試行回数: {attempts}
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    max-width: 400px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .icon {
    font-size: 20px;
  }

  .title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }

  .image-box {
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
  }

  .image-box:hover {
    border-color: #999;
  }

  .image-box:active {
    transform: scale(0.95);
  }

  .image-box.selected {
    border-color: #333;
    background: #f5f5f5;
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
    background: #333;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .verify-btn {
    width: 100%;
    padding: 10px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .verify-btn:hover {
    background: #1a1a1a;
  }

  .result {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .result.success {
    background: #f0faf0;
    color: #1a6b2a;
    border: 1px solid #d4e8d4;
  }

  .result.error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .attempts {
    margin-top: 10px;
    padding: 8px;
    background: #fffbe6;
    border: 1px solid #e6d98c;
    border-radius: 4px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #7a6c1a;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
