<script>
  export let label;
  export let variant = 'badge';
</script>

<div class="counter" class:badge={variant === 'badge'} class:inline={variant === 'inline'}>
  {label}
</div>

<style>
  .counter {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
  }

  .badge {
    padding: var(--ar-counter-padding, 6px 8px);
    background: var(--ar-color-warning-bg, #fffbe6);
    border: 1px solid var(--ar-color-warning-border, #e6d98c);
    border-radius: var(--ar-radius, 4px);
    text-align: center;
    color: var(--ar-color-warning, #7a6c1a);
  }

  .inline {
    color: var(--ar-color-text-muted, #999);
  }
</style>
