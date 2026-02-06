<svelte:options customElement="escaping-checkbox" />

<script>
  let x = 50;
  let y = 50;
  let containerRef;

  function handleMouseMove(e) {
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const checkboxCenterX = x;
    const checkboxCenterY = y;

    const distance = Math.sqrt(
      Math.pow(mouseX - checkboxCenterX, 2) +
      Math.pow(mouseY - checkboxCenterY, 2)
    );

    // マウスが100px以内に近づいたら逃げる
    if (distance < 100) {
      const angle = Math.atan2(checkboxCenterY - mouseY, checkboxCenterX - mouseX);
      const escapeDistance = 50;

      x = Math.max(30, Math.min(rect.width - 30, x + Math.cos(angle) * escapeDistance));
      y = Math.max(30, Math.min(rect.height - 30, y + Math.sin(angle) * escapeDistance));
    }
  }
</script>

<div class="container" bind:this={containerRef} on:mousemove={handleMouseMove}>
  <div class="checkbox-wrapper" style="left: {x}px; top: {y}px;">
    <input type="checkbox" id="escaping-check" />
    <label for="escaping-check">私はロボットではありません</label>
  </div>
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 280px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    overflow: hidden;
  }

  .checkbox-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    transform: translate(-50%, -50%);
    transition: left 0.3s ease-out, top 0.3s ease-out;
    cursor: pointer;
    white-space: nowrap;
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
</style>
