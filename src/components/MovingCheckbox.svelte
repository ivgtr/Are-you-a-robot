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
    height: 300px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    overflow: hidden;
  }

  .checkbox-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transform: translate(-50%, -50%);
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    white-space: nowrap;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    pointer-events: none;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
    pointer-events: none;
  }

  .hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #666;
    font-family: Arial, sans-serif;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 4px;
  }
</style>
