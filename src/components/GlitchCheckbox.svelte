<svelte:options customElement="glitch-checkbox" />

<script>
  let text = '私はロボットではありません';
  let isGlitching = false;

  const glitchTexts = [
    '私は□□□ではありません',
    '01101000 01110101 01101101 01100001 01101110',
    'I am not a robot',
    'ERROR: TEXT_CORRUPTED',
    '私はロボ̷̢̛̺̗̈́ッ̴̰̈́̾̚ト̶̖̏で̸͓̑す',
    '私はロボットではありません',
    'SYSTEM.OUT.PRINTLN("人間");',
    '私は███████████',
  ];

  function startGlitch() {
    if (isGlitching) return;
    isGlitching = true;

    let count = 0;
    const interval = setInterval(() => {
      text = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
      count++;

      if (count > 20) {
        clearInterval(interval);
        text = '私はロボットではありません';
        isGlitching = false;
      }
    }, 100);
  }

  function handleMouseEnter() {
    if (Math.random() > 0.3) {
      startGlitch();
    }
  }
</script>

<div class="container">
  <div
    class="checkbox-wrapper"
    class:glitching={isGlitching}
    on:mouseenter={handleMouseEnter}
  >
    <input type="checkbox" id="glitch-check" />
    <label for="glitch-check">{text}</label>
  </div>
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
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
    100% {
      transform: translate(0);
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
</style>
