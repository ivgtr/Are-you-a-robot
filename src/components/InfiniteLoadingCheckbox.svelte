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
    min-width: 250px;
  }

  .checkbox-wrapper.loading {
    cursor: wait;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #666;
  }
</style>
