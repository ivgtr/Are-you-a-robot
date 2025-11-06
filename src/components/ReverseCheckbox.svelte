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

  label {
    cursor: pointer;
    user-select: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
  }

  .message {
    margin-top: 12px;
    padding: 12px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 13px;
  }

  .success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
</style>
