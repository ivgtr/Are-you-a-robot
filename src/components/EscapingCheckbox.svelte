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
    height: 300px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    overflow: hidden;
  }

  .checkbox-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transform: translate(-50%, -50%);
    transition: left 0.3s ease-out, top 0.3s ease-out;
    cursor: pointer;
    white-space: nowrap;
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
</style>
