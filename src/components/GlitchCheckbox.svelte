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
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    min-width: 200px;
  }
</style>
