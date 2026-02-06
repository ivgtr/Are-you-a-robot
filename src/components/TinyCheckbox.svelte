<svelte:options customElement="tiny-checkbox" />

<script>
  let attempts = 0;

  function handleClick() {
    attempts++;
  }
</script>

<div class="container">
  <div class="message">
    下のチェックボックスにチェックを入れてください
  </div>

  <div class="checkbox-area">
    <div class="checkbox-wrapper" on:click={handleClick}>
      <input type="checkbox" id="tiny-check" />
      <label for="tiny-check">私はロボットではありません</label>
    </div>
  </div>

  {#if attempts > 0}
    <div class="attempts">
      クリック試行回数: {attempts}
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

  .message {
    margin-bottom: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    text-align: center;
    color: #333;
  }

  .checkbox-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    transform: scale(0.1);
    cursor: pointer;
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
    white-space: nowrap;
    color: #333;
  }

  .attempts {
    margin-top: 10px;
    padding: 8px;
    background: #fffbe6;
    border: 1px solid #e6d98c;
    border-radius: 4px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #7a6c1a;
  }
</style>
