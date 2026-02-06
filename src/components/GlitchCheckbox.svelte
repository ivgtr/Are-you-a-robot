<svelte:options customElement="glitch-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let text = '私はロボットではありません';
  let isGlitching = false;
  let hoverCount = 0;
  let glitchInterval;
  let cleared = false;
  let inCooldown = false;
  let gameOver = false;
  let cooldownUsed = false;

  // グリッチ確率100%到達後の最初のクールダウンが唯一のチャンス
  const COOLDOWN_DURATION = 500;

  const glitchTexts = [
    '私は□□□ではありません',
    '01101000 01110101 01101101 01100001 01101110',
    'I am not a robot',
    'ERROR: TEXT_CORRUPTED',
    '私はロボ̷̢̛̺̗̈́ッ̴̰̈́̾̚ト̶̖̏で̸͓̑す',
    '私はロボットではありません',
    'SYSTEM.OUT.PRINTLN("人間");',
    '私は███████████',
    'undefined is not a human',
    'segmentation fault (core dumped)',
    '01000010 01000101 01000101 01010000',
    '人人人人人人人人人人人',
  ];

  // ホバーするたびに発動確率が上がる
  $: glitchProbability = Math.min(1, 0.5 + hoverCount * 0.1);

  function startGlitch() {
    if (isGlitching) return;
    isGlitching = true;

    let count = 0;
    glitchInterval = setInterval(() => {
      text = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
      count++;

      if (count > 20) {
        clearInterval(glitchInterval);
        glitchInterval = null;
        text = '私はロボットではありません';
        isGlitching = false;
        // グリッチ確率100%到達後のクールダウンが唯一のチャンス
        if (glitchProbability >= 1 && !cooldownUsed) {
          cooldownUsed = true;
          inCooldown = true;
          text = '...システム安定化中（今がチャンス！）';
          setTimeout(() => {
            inCooldown = false;
            if (!cleared) {
              gameOver = true;
              text = 'システムが完全にロックされました。ゲームオーバー';
            }
          }, COOLDOWN_DURATION);
        } else {
          inCooldown = true;
          setTimeout(() => { inCooldown = false; }, COOLDOWN_DURATION);
        }
      }
    }, 100);
  }

  function handleMouseEnter() {
    if (cleared || inCooldown || gameOver) return;
    hoverCount++;
    if (Math.random() < glitchProbability) {
      startGlitch();
    }
  }

  function handleClick(e) {
    if (cleared || gameOver) return;
    // グリッチ中はクリックを無効化
    if (isGlitching) {
      e.preventDefault();
      const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = false;
      return;
    }
    // クールダウン中またはグリッチ確率100%到達後の非グリッチ時にチェック成功 = クリア
    const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked && glitchProbability >= 1) {
      cleared = true;
      text = '...グリッチの隙を突かれた。認証成功';
    }
  }

  onDestroy(() => {
    if (glitchInterval) clearInterval(glitchInterval);
  });
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="checkbox-wrapper"
    class:glitching={isGlitching}
    on:mouseenter={handleMouseEnter}
    on:click={handleClick}
  >
    <input type="checkbox" id="glitch-check" />
    <label for="glitch-check">{text}</label>
  </div>
  {#if hoverCount > 0}
    <div class="stats">
      <span class="probability">グリッチ確率: {Math.round(glitchProbability * 100)}%</span>
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    width: fit-content;
    cursor: pointer;
    transition: all 0.1s;
  }

  .checkbox-wrapper.glitching {
    animation: glitch 0.1s infinite;
    border-color: #b91c1c;
    box-shadow: 0 0 8px rgba(185, 28, 28, 0.2);
  }

  .checkbox-wrapper.glitching input[type="checkbox"],
  .checkbox-wrapper.glitching label {
    pointer-events: none;
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
    20% {
      transform: translate(-2px, 2px);
      filter: hue-rotate(90deg);
    }
    40% {
      transform: translate(-2px, -2px) skewX(2deg);
      filter: hue-rotate(180deg);
    }
    60% {
      transform: translate(2px, 2px) skewX(-1deg);
      filter: hue-rotate(270deg);
    }
    80% {
      transform: translate(2px, -2px);
      filter: hue-rotate(360deg);
    }
    100% {
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
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
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 13px;
    min-width: 200px;
    color: #333;
  }

  .stats {
    margin-top: 8px;
    display: flex;
    gap: 12px;
  }

  .probability {
    padding: 4px 8px;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 11px;
    color: #666;
  }
</style>
