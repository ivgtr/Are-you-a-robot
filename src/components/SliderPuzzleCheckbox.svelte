<svelte:options customElement="slider-puzzle-checkbox" />

<script>
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let cleared = false;
  let repairClicks = 0;
  let gameOver = false;

  // 破損文字を5回クリックすると修復される
  const REPAIR_CLICKS = 5;
  // パズル完成チャンスは2回まで（修復前1回 + 修復後1回）
  const MAX_SOLVES = 2;

  // 3x3 スライドパズル (0 = empty)
  // 「私はロボットでは」の8文字だが、1文字が欠損している
  let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let emptyIndex = 8;

  // 正しくは「私はロボットでは」だが、一部の文字が別の文字に置き換わっている
  const correctLabels = ['私', 'は', 'ロ', 'ボ', 'ッ', 'ト', 'で', 'は'];
  // 実際に表示されるラベル（1文字がおかしい）
  let displayLabels = [...correctLabels];
  let brokenIndex = 0;

  const brokenReplacements = ['人', '口', 'ポ', 'つ', '卜', 'て', 'ば', '□', '?', '＿'];

  function breakOneLabel() {
    brokenIndex = Math.floor(Math.random() * 8);
    displayLabels = [...correctLabels];
    displayLabels[brokenIndex] = brokenReplacements[Math.floor(Math.random() * brokenReplacements.length)];
  }

  const solvedState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  const failMessages = [
    '文字が1つ間違っています。正しい認証文を完成できません',
    'パズルは完成しましたが、認証文が不正です',
    '「{wrong}」が正しくありません。正しい文字が見つかりません',
    'フォントデータが破損しています。再試行してください',
    '認証文の検証に失敗しました。文字化けが検出されました',
  ];

  function shuffle() {
    for (let i = 0; i < 80; i++) {
      const neighbors = getMovableTiles();
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      swapTile(pick, true);
    }
  }

  function getMovableTiles() {
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
    const movable = [];

    if (row > 0) movable.push(emptyIndex - 3);
    if (row < 2) movable.push(emptyIndex + 3);
    if (col > 0) movable.push(emptyIndex - 1);
    if (col < 2) movable.push(emptyIndex + 1);

    return movable;
  }

  function swapTile(index, silent) {
    const movable = getMovableTiles();
    if (!movable.includes(index)) return;

    [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
    emptyIndex = index;
    tiles = [...tiles];

    if (!silent) {
      checkSolved();
    }
  }

  function handleTileClick(index) {
    if (cleared || gameOver) return;
    const tile = tiles[index];
    // 破損タイルをクリックした場合、修復カウントを増やす
    if (tile !== 0 && tile - 1 === brokenIndex) {
      repairClicks++;
      if (repairClicks >= REPAIR_CLICKS) {
        // 文字を修復
        displayLabels = [...correctLabels];
        brokenIndex = -1; // 修復済み
        message = 'フォントデータを修復しました！パズルを完成させてください';
        showMessage = true;
        setTimeout(() => { showMessage = false; }, 2000);
        return;
      }
    }
    swapTile(index, false);
  }

  function checkSolved() {
    if (cleared || gameOver) return;
    const isSolved = tiles.every((t, i) => t === solvedState[i]);
    if (isSolved) {
      attempts++;

      // 文字が修復済みの場合、認証成功
      if (brokenIndex === -1) {
        cleared = true;
        message = 'パズル完成！認証成功';
        showMessage = true;
        return;
      }

      // 揃っても文字が間違っている
      if (attempts >= MAX_SOLVES) {
        // もうチャンスがない → ゲームオーバー
        gameOver = true;
        message = '文字が破損したまま完成させてしまいました。ゲームオーバー';
        showMessage = true;
        return;
      }

      let msg = failMessages[attempts % failMessages.length];
      msg = msg.replace('{wrong}', displayLabels[brokenIndex]);
      message = msg;
      showMessage = true;

      setTimeout(() => {
        showMessage = false;
        shuffle();
      }, 2500);
    }
  }

  // 初期化
  breakOneLabel();
  shuffle();
</script>

<div class="container">
  <div class="header">
    <span class="lock">🧩</span>
    <span class="title">パズルを完成させて認証してください</span>
  </div>

  <div class="puzzle-grid">
    {#each tiles as tile, i}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        class="tile"
        class:empty={tile === 0}
        class:correct={tile === solvedState[i] && tile !== 0 && tile - 1 !== brokenIndex}
        class:broken={tile !== 0 && tile - 1 === brokenIndex}
        on:click={() => handleTileClick(i)}
      >
        {#if tile !== 0}
          <span class="tile-label">{displayLabels[tile - 1]}</span>
          <span class="tile-number">{tile}</span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="target">
    <span class="target-label">目標: 「私はロボットでは」</span>
    {#if brokenIndex >= 0}
      <span class="target-hint">※ 破損文字をクリックで修復 ({repairClicks}/{REPAIR_CLICKS})</span>
    {:else}
      <span class="target-hint" style="color: #1a6b2a;">※ 文字修復済み！パズルを完成させてください</span>
    {/if}
  </div>

  {#if cleared}
    <div class="result" style="background: #f0faf0; color: #1a6b2a; border: 1px solid #d4e8d4;">
      <input type="checkbox" checked style="margin-right: 6px;" />
      ✓ {message}
    </div>
  {:else if showMessage}
    <div class="result error">
      {brokenIndex === -1 ? '✓' : '✗'} {message}
    </div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">完成回数: {attempts} (認証: {cleared ? '完了！' : '未完了 - 文字破損'})</div>
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

  .lock {
    font-size: 18px;
  }

  .title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  .puzzle-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    max-width: 240px;
    margin: 0 auto 14px;
  }

  .tile {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s, background 0.15s, border-color 0.15s;
    position: relative;
  }

  .tile:hover:not(.empty) {
    border-color: #999;
    background: #f5f5f5;
  }

  .tile:active:not(.empty) {
    transform: scale(0.95);
  }

  .tile.empty {
    background: transparent;
    border-color: transparent;
    cursor: default;
  }

  .tile.correct {
    background: #f0faf0;
    border-color: #b8d4b8;
  }

  .tile.broken {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  .tile-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #333;
  }

  .tile.broken .tile-label {
    color: #b91c1c;
  }

  .tile-number {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 9px;
    color: #bbb;
    position: absolute;
    bottom: 3px;
    right: 5px;
  }

  .target {
    text-align: center;
    margin-bottom: 10px;
  }

  .target-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
    display: block;
    margin-bottom: 2px;
  }

  .target-hint {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10px;
    color: #c0392b;
  }

  .result {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .result.error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
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
