<svelte:options customElement="reverse-checkbox" />

<script>
  let checked = false;

  function handleChange() {
    checked = !checked;
  }
</script>

<div class="container">
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      id="reverse-check"
      bind:checked
      on:change={handleChange}
    />
    <label for="reverse-check">私はロボットです</label>
  </div>
  {#if checked}
    <div class="message success">
      ✓ ロボットであることが確認されました
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

  .message {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
  }

  .success {
    background: #f0faf0;
    color: #1a6b2a;
    border: 1px solid #d4e8d4;
  }
</style>
