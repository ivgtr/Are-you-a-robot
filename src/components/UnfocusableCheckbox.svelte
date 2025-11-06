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
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  input[type="checkbox"]:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
  }

  .hint {
    margin-top: 12px;
    font-size: 12px;
    color: #666;
    font-family: Arial, sans-serif;
  }
</style>
