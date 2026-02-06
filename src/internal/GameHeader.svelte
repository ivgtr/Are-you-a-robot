<script>
  export let icon;
  export let title;
</script>

<div class="header">
  <span class="icon">{icon}</span>
  <span class="title">{title}</span>
</div>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: var(--ar-header-gap, 8px);
    margin-bottom: var(--ar-space-7, 14px);
    padding: var(--ar-header-padding, 10px 12px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius, 4px);
  }

  .icon {
    font-size: var(--ar-header-icon-size, 18px);
  }

  .title {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-medium, 500);
    color: var(--ar-color-text, #333);
  }
</style>
