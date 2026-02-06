<svelte:options customElement="unfocusable-checkbox" />

<script>
  function handleFocus(e) {
    // フォーカスを即座に外す
    e.target.blur();
  }

  function handleKeyDown(e) {
    // すべてのキーボード入力を無効化
    e.preventDefault();
  }
</script>

<div class="container">
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      id="unfocusable-check"
      tabindex="-1"
      on:focus={handleFocus}
      on:keydown={handleKeyDown}
    />
    <label for="unfocusable-check">私はロボットではありません</label>
  </div>
  <p class="hint">※ キーボードでの操作はできません</p>
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

  input[type="checkbox"]:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
  }

  .hint {
    margin-top: 10px;
    font-size: 11px;
    color: #999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>
