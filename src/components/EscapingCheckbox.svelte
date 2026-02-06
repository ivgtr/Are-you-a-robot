<svelte:options customElement="escaping-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let x = 50;
  let y = 50;
  let containerRef;
  let chaseCount = 0;

  const taunts = [
    'もう少し！',
    '惜しい！',
    '頑張って！',
    '捕まえてみて！',
    'そっちじゃないよ！',
    '速すぎる？',
    '諦めないで！',
    'ロボットなら捕まえられるかも？',
  ];

  let tauntTimeouts = [];
  let hasBeenTired = false;
  let tauntText = '';
  let showTaunt = false;
  let isTired = false;
  let tiredTimeout = null;
  let gameOver = false;
  let cleared = false;

  // 20回追跡されると疲れて一瞬(1.2秒)停止する — チャンスは1回だけ
  const TIRED_THRESHOLD = 20;
  const TIRED_DURATION = 1200;

  function getEscapeBehavior() {
    const rand = Math.random();
    if (rand < 0.15) {
      // フェイント: 一瞬近づいてから逃げる
      return 'feint';
    } else if (rand < 0.35) {
      // ジグザグ: 斜め方向にずれて逃げる
      return 'zigzag';
    }
    return 'straight';
  }

  function handleCheckboxClick() {
    if (gameOver || cleared) return;
    if (isTired) {
      cleared = true;
      tauntText = '捕まった...認証成功！';
      showTaunt = true;
    }
  }

  function handleMouseMove(e) {
    if (!containerRef || gameOver || cleared) return;

    const rect = containerRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const distance = Math.sqrt(
      Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
    );

    if (distance < 120) {
      chaseCount++;

      // 疲れている間は逃げない（クリアのチャンス）
      if (isTired) return;

      // 一定回数追跡されると疲れる — チャンスは1回のみ
      if (!hasBeenTired && chaseCount > 0 && chaseCount % TIRED_THRESHOLD === 0) {
        isTired = true;
        hasBeenTired = true;
        tauntText = 'はぁ...はぁ...（疲れた）今がチャンス！';
        showTaunt = true;
        tiredTimeout = setTimeout(() => {
          isTired = false;
          showTaunt = false;
          // チャンスを逃した → ゲームオーバー
          if (!cleared) {
            gameOver = true;
            tauntText = 'チャンスを逃しました。ゲームオーバー';
            showTaunt = true;
          }
        }, TIRED_DURATION);
        return;
      }

      const angle = Math.atan2(y - mouseY, x - mouseX);

      // 距離に反比例する逃走速度 (近いほど速い)
      const baseEscape = Math.max(30, 80 - distance * 0.4);
      const behavior = getEscapeBehavior();

      let escapeX, escapeY;

      if (behavior === 'feint') {
        // フェイント: 反対方向に大きく逃げる
        escapeX = x + Math.cos(angle) * baseEscape * 1.5;
        escapeY = y + Math.sin(angle) * baseEscape * 1.5;
      } else if (behavior === 'zigzag') {
        // ジグザグ: 垂直方向にずらす
        const perpAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
        escapeX = x + Math.cos(angle) * baseEscape * 0.5 + Math.cos(perpAngle) * baseEscape * 0.8;
        escapeY = y + Math.sin(angle) * baseEscape * 0.5 + Math.sin(perpAngle) * baseEscape * 0.8;
      } else {
        escapeX = x + Math.cos(angle) * baseEscape;
        escapeY = y + Math.sin(angle) * baseEscape;
      }

      x = Math.max(30, Math.min(rect.width - 30, escapeX));
      y = Math.max(30, Math.min(rect.height - 30, escapeY));

      // 一定回数追いかけたら挑発テキストを表示
      if (chaseCount % 5 === 0) {
        tauntText = taunts[Math.floor(Math.random() * taunts.length)];
        showTaunt = true;
        const tid = setTimeout(() => { showTaunt = false; }, 1500);
        tauntTimeouts.push(tid);
      }
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }

  onDestroy(() => {
    if (tiredTimeout) clearTimeout(tiredTimeout);
    tauntTimeouts.forEach(t => clearTimeout(t));
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="container"
  bind:this={containerRef}
  on:mousemove={handleMouseMove}
  on:touchmove|preventDefault={handleTouchMove}
>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="checkbox-wrapper" class:game-over={gameOver} style="left: {x}px; top: {y}px;" on:click={handleCheckboxClick}>
    <input type="checkbox" id="escaping-check" checked={cleared} disabled={gameOver} />
    <label for="escaping-check">{gameOver ? 'ゲームオーバー' : cleared ? '認証成功' : '私はロボットではありません'}</label>
  </div>
  {#if showTaunt}
    <div class="taunt">{tauntText}</div>
  {/if}
  {#if chaseCount > 0}
    <div class="chase-count">追跡回数: {chaseCount}</div>
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
    touch-action: none;
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
    transition: left 0.25s ease-out, top 0.25s ease-out;
    cursor: pointer;
    white-space: nowrap;
  }

  .checkbox-wrapper.game-over {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #b91c1c;
    background: #fef2f2;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #333;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
  }

  .taunt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #999;
    pointer-events: none;
    animation: fadeInOut 1.5s ease-out forwards;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -60%) scale(1); }
  }

  .chase-count {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
  }
</style>
