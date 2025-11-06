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
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .message {
    margin-bottom: 20px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    text-align: center;
  }

  .checkbox-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
    background: white;
    border: 1px solid #ccc;
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
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
    white-space: nowrap;
  }

  .attempts {
    margin-top: 12px;
    padding: 8px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #856404;
  }
</style>
