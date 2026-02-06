<svelte:options customElement="glitch-checkbox" />

<script>
  import { onDestroy } from 'svelte';
  import CheckboxWrapper from '../internal/CheckboxWrapper.svelte';

  let text = '私はロボットではありません';
  let isGlitching = false;
  let hoverCount = 0;
  let glitchInterval;
  let cleared = false;
  let inCooldown = false;
  let gameOver = false;
  let cooldownUsed = false;
  let isChecked = false;
  let cooldownTimeout = null;

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
          cooldownTimeout = setTimeout(() => {
            inCooldown = false;
            if (!cleared) {
              gameOver = true;
              text = 'システムが完全にロックされました。ゲームオーバー';
            }
          }, COOLDOWN_DURATION);
        } else {
          inCooldown = true;
          cooldownTimeout = setTimeout(() => { inCooldown = false; }, COOLDOWN_DURATION);
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

  function handleChange(e) {
    isChecked = e.target.checked;
  }

  function handleClick(e) {
    if (cleared || gameOver) return;
    // グリッチ中はクリックを無効化
    if (isGlitching) {
      isChecked = false;
      return;
    }
    // クールダウン中またはグリッチ確率100%到達後の非グリッチ時にチェック成功 = クリア
    if (isChecked && glitchProbability >= 1) {
      cleared = true;
      text = '...グリッチの隙を突かれた。認証成功';
    }
  }

  onDestroy(() => {
    if (glitchInterval) clearInterval(glitchInterval);
    if (cooldownTimeout) clearTimeout(cooldownTimeout);
  });
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="checkbox-outer"
    class:glitching={isGlitching}
    on:mouseenter={handleMouseEnter}
    on:click={handleClick}
  >
    <CheckboxWrapper
      id="glitch-check"
      checked={isChecked}
      disabled={cleared || gameOver}
      label={text}
      on:change={handleChange}
    />
  </div>
  {#if hoverCount > 0}
    <div class="stats">
      <span class="probability">グリッチ確率: {Math.round(glitchProbability * 100)}%</span>
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

  .checkbox-outer {
    transition: all 0.1s;
  }

  .checkbox-outer.glitching {
    animation: glitch 0.1s infinite;
    border-color: var(--ar-color-error, #b91c1c);
    box-shadow: 0 0 8px rgba(185, 28, 28, 0.2);
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

  .stats {
    margin-top: var(--ar-space-4, 8px);
    display: flex;
    gap: var(--ar-space-6, 12px);
  }

  .probability {
    padding: var(--ar-space-2, 4px) var(--ar-space-4, 8px);
    background: var(--ar-color-surface-dim, #f5f5f5);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius, 4px);
    font-family: var(--ar-font-mono, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-secondary, #666);
  }
</style>
