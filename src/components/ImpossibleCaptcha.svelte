<svelte:options customElement="impossible-captcha" />

<script>
  let selectedImages = new Set();
  let attempts = 0;

  const images = [
    { id: 1, label: '🚗', isCorrect: true },
    { id: 2, label: '🚕', isCorrect: true },
    { id: 3, label: '🚙', isCorrect: true },
    { id: 4, label: '🚌', isCorrect: false },
    { id: 5, label: '🚎', isCorrect: false },
    { id: 6, label: '🏎️', isCorrect: true },
    { id: 7, label: '🚓', isCorrect: true },
    { id: 8, label: '🚑', isCorrect: false },
    { id: 9, label: '🚒', isCorrect: false }
  ];

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
    // 常に失敗するが、理由は毎回変わる
    const reasons = [
      '選択した画像が多すぎます',
      '選択した画像が少なすぎます',
      '画像の選択が正確ではありません',
      'タイムアウトしました。もう一度お試しください',
      '不正なアクセスが検出されました',
      'ロボットの可能性があります',
      '画像の読み込みに失敗しました',
      'サーバーエラーが発生しました'
    ];

    alert(reasons[attempts % reasons.length]);
    selectedImages.clear();
    selectedImages = selectedImages;
  }
</script>

<div class="container">
  <div class="header">
    <div class="icon">🤖</div>
    <div class="title">「車」を含む画像をすべて選択してください</div>
  </div>

  <div class="grid">
    {#each images as image}
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
    transition: border-color 0.15s;
  }

  .image-box:hover {
    border-color: #999;
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
</style>
