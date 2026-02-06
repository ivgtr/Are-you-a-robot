<svelte:options customElement="infinite-loading-checkbox" />

<script>
  let clicked = false;
  let dots = '';

  function handleClick() {
    if (!clicked) {
      clicked = true;
      startLoading();
    }
  }

  function startLoading() {
    setInterval(() => {
      dots = dots.length >= 3 ? '' : dots + '.';
    }, 500);
  }
</script>

<div class="container">
  <div class="checkbox-wrapper" class:loading={clicked} on:click={handleClick}>
    {#if !clicked}
      <input type="checkbox" id="loading-check" />
      <label for="loading-check">私はロボットではありません</label>
    {:else}
      <div class="spinner"></div>
      <span class="loading-text">検証中{dots}</span>
    {/if}
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
    min-width: 240px;
  }

  .checkbox-wrapper.loading {
    cursor: wait;
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

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid #555;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #666;
  }
</style>
