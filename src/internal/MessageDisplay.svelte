<script>
  export let message = '';
  export let type = 'error';
  export let visible = true;
</script>

{#if visible && message}
  <div
    class="message"
    class:success={type === 'success'}
    class:error={type === 'error'}
    class:warning={type === 'warning'}
  >
    {message}
  </div>
{/if}

<style>
  .message {
    margin-top: var(--ar-space-5, 10px);
    padding: var(--ar-message-padding, 10px 12px);
    border-radius: var(--ar-radius, 4px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-message-font-size, 12px);
    animation: slideIn 0.2s ease-out;
  }

  .success {
    background: var(--ar-color-success-bg, #f0faf0);
    color: var(--ar-color-success, #1a6b2a);
    border: 1px solid var(--ar-color-success-border, #d4e8d4);
  }

  .error {
    background: var(--ar-color-error-bg, #fef2f2);
    color: var(--ar-color-error, #b91c1c);
    border: 1px solid var(--ar-color-error-border, #fecaca);
  }

  .warning {
    background: var(--ar-color-warning-bg, #fffbe6);
    color: var(--ar-color-warning, #7a6c1a);
    border: 1px solid var(--ar-color-warning-border, #e6d98c);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
