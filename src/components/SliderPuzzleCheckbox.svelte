<svelte:options customElement="slider-puzzle-checkbox" />

<script>
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let solved = false;

  // 3x3 スライドパズル (0 = empty)
  let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let emptyIndex = 8;

  const labels = ['私', 'は', 'ロ', 'ボ', 'ッ', 'ト', 'で', 'は', ''];
  const solvedState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  const shuffleMessages = [
    'パズルが再シャッフルされました',
    '追加認証ステップが必要です',
    'パズルの難易度が上がりました',
    'タイムアウト！再挑戦してください',
    'もう一度パズルを解いてください',
  ];

  function shuffle() {
    // ランダムに有効な移動を繰り返してシャッフル
    for (let i = 0; i < 100; i++) {
      const neighbors = getMovableTiles();
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      swapTile(pick, true);
    }
  }

  function getMovableTiles() {
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
    const movable = [];

    if (row > 0) movable.push(emptyIndex - 3); // up
    if (row < 2) movable.push(emptyIndex + 3); // down
    if (col > 0) movable.push(emptyIndex - 1); // left
    if (col < 2) movable.push(emptyIndex + 1); // right

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
    if (solved) return;
    swapTile(index, false);
  }

  function checkSolved() {
    const isSolved = tiles.every((t, i) => t === solvedState[i]);
    if (isSolved) {
      solved = true;
      attempts++;

      // 解いても再シャッフルされる
      setTimeout(() => {
        message = shuffleMessages[attempts % shuffleMessages.length];
        showMessage = true;
        setTimeout(() => { showMessage = false; }, 2000);
        solved = false;
        shuffle();
      }, 1200);
    }
  }

  // 初期シャッフル
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
        class:correct={tile === solvedState[i] && tile !== 0}
        class:solved={solved}
        on:click={() => handleTileClick(i)}
      >
        {#if tile !== 0}
          <span class="tile-label">{labels[tile - 1]}</span>
          <span class="tile-number">{tile}</span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="target">
    <span class="target-label">目標: 「私はロボットでは」</span>
  </div>

  {#if solved}
    <div class="result success">
      ✓ パズル完成！認証処理中...
    </div>
  {/if}

  {#if showMessage}
    <div class="result error">
      ✗ {message}
    </div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">完成回数: {attempts} (認証: 未完了)</div>
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

  .tile.solved {
    background: #e8f5e9;
    border-color: #81c784;
  }

  .tile-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #333;
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
