<svelte:options customElement="slider-puzzle-checkbox" />

<script>
  import { onDestroy, createEventDispatcher } from 'svelte';
  import GameHeader from '../internal/GameHeader.svelte';
  import MessageDisplay from '../internal/MessageDisplay.svelte';
  import AttemptsCounter from '../internal/AttemptsCounter.svelte';

  const dispatch = createEventDispatcher();
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let cleared = false;
  let repairClicks = 0;
  let gameOver = false;
  let repairMsgTimeout = null;
  let failTimeout = null;

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
        repairMsgTimeout = setTimeout(() => { showMessage = false; }, 2000);
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
        if (failTimeout) clearTimeout(failTimeout);
        gameOver = true;
        message = '文字が破損したまま完成させてしまいました。ゲームオーバー';
        showMessage = true;
        dispatch('gameover');
        return;
      }

      let msg = failMessages[attempts % failMessages.length];
      msg = msg.replace('{wrong}', displayLabels[brokenIndex]);
      message = msg;
      showMessage = true;

      failTimeout = setTimeout(() => {
        showMessage = false;
        shuffle();
      }, 2500);
    }
  }

  onDestroy(() => {
    if (repairMsgTimeout) clearTimeout(repairMsgTimeout);
    if (failTimeout) clearTimeout(failTimeout);
  });

  // 初期化
  breakOneLabel();
  shuffle();
</script>

<div class="container">
  <GameHeader icon="🧩" title="パズルを完成させて認証してください" />

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
    <MessageDisplay message="✓ {message}" type="success" />
  {:else if showMessage}
    <MessageDisplay message="{brokenIndex === -1 ? '✓' : '✗'} {message}" type={brokenIndex === -1 ? 'success' : 'error'} />
  {/if}

  {#if attempts > 0}
    <div class="attempts-spacing">
      <AttemptsCounter label="完成回数: {attempts} (認証: {cleared ? '完了！' : '未完了 - 文字破損'})" variant="inline" />
    </div>
  {/if}
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
  }

  .puzzle-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ar-space-2, 4px);
    max-width: 240px;
    margin: 0 auto var(--ar-space-7, 14px);
  }

  .tile {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border-dark, #d0d0d0);
    border-radius: var(--ar-radius, 4px);
    cursor: pointer;
    transition: transform 0.1s, background 0.15s, border-color 0.15s;
    position: relative;
  }

  .tile:hover:not(.empty) {
    border-color: var(--ar-color-border-focus, #999);
    background: var(--ar-color-surface-dim, #f5f5f5);
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
    background: var(--ar-color-success-bg, #f0faf0);
    border-color: #b8d4b8;
  }

  .tile.broken {
    background: var(--ar-color-error-bg, #fef2f2);
    border-color: #fca5a5;
  }

  .tile-label {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 22px;
    font-weight: var(--ar-font-weight-semibold, 600);
    color: var(--ar-color-text, #333);
  }

  .tile.broken .tile-label {
    color: var(--ar-color-error, #b91c1c);
  }

  .tile-number {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 9px;
    color: var(--ar-color-text-faint, #bbb);
    position: absolute;
    bottom: 3px;
    right: 5px;
  }

  .target {
    text-align: center;
    margin-bottom: var(--ar-space-5, 10px);
  }

  .target-label {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-muted, #999);
    display: block;
    margin-bottom: 2px;
  }

  .target-hint {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-xs, 10px);
    color: var(--ar-color-error, #b91c1c);
  }

  .attempts-spacing {
    margin-top: var(--ar-space-5, 10px);
    text-align: right;
  }
</style>
