<svelte:options customElement="moving-checkbox" />

<script>
  let clickCount = 0;
  let left = '50%';
  let top = '40%';
  let decoys = [];
  let containerRef;

  // クリック回数に応じたアニメーション速度
  $: transitionDuration = Math.max(0.05, 0.4 - clickCount * 0.05);

  function getRandomPosition() {
    const l = Math.floor(Math.random() * 70 + 10);
    const t = Math.floor(Math.random() * 60 + 15);
    return { left: l + '%', top: t + '%' };
  }

  function handleClick(e) {
    e.preventDefault();
    clickCount++;

    // ランダムな位置に移動
    const newPos = getRandomPosition();
    left = newPos.left;
    top = newPos.top;

    // 5回目以降: 分身の術
    if (clickCount >= 5 && decoys.length < 4) {
      addDecoy();
    }

    // 分身もランダム移動
    decoys = decoys.map(d => ({
      ...d,
      ...getRandomPosition(),
    }));
  }

  function addDecoy() {
    const pos = getRandomPosition();
    decoys = [...decoys, {
      id: decoys.length,
      left: pos.left,
      top: pos.top,
    }];
  }

  function handleDecoyClick(e) {
    e.preventDefault();
    clickCount++;

    // デコイをクリックしても全体が移動
    const newPos = getRandomPosition();
    left = newPos.left;
    top = newPos.top;

    decoys = decoys.map(d => ({
      ...d,
      ...getRandomPosition(),
    }));

    if (decoys.length < 4) {
      addDecoy();
    }
  }
</script>

<div class="container" bind:this={containerRef}>
  <!-- 本物のチェックボックス -->
  <div
    class="checkbox-wrapper"
    style="left: {left}; top: {top}; transition-duration: {transitionDuration}s;"
    on:click={handleClick}
  >
    <input type="checkbox" id="moving-check" />
    <label for="moving-check">私はロボットではありません</label>
  </div>

  <!-- 分身 (デコイ) -->
  {#each decoys as decoy (decoy.id)}
    <div
      class="checkbox-wrapper decoy"
      style="left: {decoy.left}; top: {decoy.top}; transition-duration: {transitionDuration}s;"
      on:click={handleDecoyClick}
    >
      <input type="checkbox" />
      <label>私はロボットではありません</label>
    </div>
  {/each}

  {#if clickCount > 0}
    <p class="hint">
      {#if clickCount < 5}
        クリック回数: {clickCount}
      {:else}
        クリック回数: {clickCount} — どれが本物？
      {/if}
    </p>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 280px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    overflow: hidden;
  }

  .checkbox-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    transform: translate(-50%, -50%);
    transition-property: left, top;
    transition-timing-function: ease-in-out;
    cursor: pointer;
    white-space: nowrap;
  }

  .checkbox-wrapper.decoy {
    opacity: 0.9;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    pointer-events: none;
    accent-color: #333;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
    pointer-events: none;
  }

  .hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: #999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: rgba(250, 250, 250, 0.95);
    padding: 3px 8px;
    border-radius: 3px;
    white-space: nowrap;
  }
</style>
