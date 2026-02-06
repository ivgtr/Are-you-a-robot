<svelte:options customElement="moving-checkbox" />

<script>
  let position = 0;
  const positions = [
    { left: '10%', top: '20%' },
    { left: '70%', top: '15%' },
    { left: '30%', top: '60%' },
    { left: '80%', top: '70%' },
    { left: '15%', top: '80%' },
    { left: '60%', top: '40%' }
  ];

  function handleClick(e) {
    e.preventDefault();
    position = (position + 1) % positions.length;
  }
</script>

<div class="container">
  <div
    class="checkbox-wrapper"
    style="left: {positions[position].left}; top: {positions[position].top};"
    on:click={handleClick}
  >
    <input type="checkbox" id="moving-check" />
    <label for="moving-check">私はロボットではありません</label>
  </div>
  <p class="hint">※ クリックすると位置が変わります</p>
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
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    white-space: nowrap;
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
  }
</style>
