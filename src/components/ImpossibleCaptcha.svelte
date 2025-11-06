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
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    max-width: 400px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 4px;
  }

  .icon {
    font-size: 24px;
  }

  .title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .image-box {
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .image-box:hover {
    border-color: #4285f4;
  }

  .image-box.selected {
    border-color: #4285f4;
    background: #e8f0fe;
  }

  .emoji {
    font-size: 48px;
  }

  .checkmark {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: #4285f4;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
  }

  .verify-btn {
    width: 100%;
    padding: 12px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .verify-btn:hover {
    background: #3367d6;
  }

  .attempts {
    margin-top: 12px;
    padding: 8px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #856404;
  }
</style>
