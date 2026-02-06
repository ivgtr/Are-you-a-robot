<script>
  export let id;
  export let checked = false;
  export let disabled = false;
  export let label = '私はロボットではありません';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="checkbox-wrapper" on:click>
  <input type="checkbox" {id} {checked} {disabled} on:change on:focus on:keydown />
  <label for={id}>{label}</label>
</div>

<style>
  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: var(--ar-checkbox-wrapper-gap, 8px);
    padding: var(--ar-checkbox-wrapper-padding, 10px 14px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border-dark, #d0d0d0);
    border-radius: var(--ar-radius, 4px);
    width: fit-content;
    cursor: pointer;
  }

  input[type="checkbox"] {
    width: var(--ar-checkbox-size, 18px);
    height: var(--ar-checkbox-size, 18px);
    cursor: pointer;
    accent-color: var(--ar-checkbox-accent, #333);
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text, #333);
  }
</style>
