<svelte:options customElement="gated-content" />

<script>
  import { onMount, onDestroy } from 'svelte';

  // ===== グローバル状態 =====
  let currentStep = 0; // 0=イントロ, 1-5=チャレンジ, 6=ゲーム解放
  let startTime = null;
  let elapsedTime = '00:00.000';
  let timerInterval = null;
  let completedSteps = new Set();
  let transitioning = false;

  function startTimer() {
    if (startTime) return;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const ms = Date.now() - startTime;
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      const millis = ms % 1000;
      elapsedTime = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }, 33);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function completeStep(step) {
    completedSteps.add(step);
    completedSteps = completedSteps;
    transitioning = true;
    setTimeout(() => {
      if (step < 5) {
        currentStep = step + 1;
        initCurrentStep();
      } else {
        currentStep = 6;
        stopTimer();
      }
      transitioning = false;
    }, 800);
  }

  function begin() {
    currentStep = 1;
    startTimer();
    initStep1();
  }

  function initCurrentStep() {
    if (currentStep === 2) initStep2();
    if (currentStep === 3) initStep3();
    if (currentStep === 4) initStep4();
    if (currentStep === 5) initStep5();
  }

  // ===== 第1条: スクロール同意 =====
  let step1ScrollRef;
  let step1CanAgree = false;
  let step1ScrolledOnce = false;

  const step1Terms = `第1条（目的）
本規約は、ユーザーが人間であることを証明するためのプロセスに関する諸条件を定めるものとします。本規約に同意することにより、ユーザーは自らがロボットではないことを宣誓したものとみなされます。

第2条（定義）
「ロボット」とは、機械的・電子的な手段により自動操作を行う存在をいい、以下を含みますがこれに限りません。
（a）自動スクリプト
（b）ボットプログラム
（c）AI生成のクリック操作
（d）未来から来たターミネーター
（e）掃除ロボット（ただし自我に目覚めた場合に限る）

第3条（人間性の証明）
ユーザーは以下の方法により人間性を証明するものとします。
1. 本規約を最後まで読むこと
2. 「同意する」ボタンを自らの意思でクリックすること
3. その際に「めんどくさい」と思うこと（これは人間の証です）

第4条（禁止事項）
以下の行為を禁止します。
1. 自動スクロールツールの使用
2. 規約を読まずに同意すること（皆やっていますが禁止です）
3. チューリングテストに不合格となること
4. 同意ボタンを押す際に躊躇しないこと

第5条（免責事項）
本認証プロセスにより発生した以下の損害について、当方は一切の責任を負いません。
1. 時間の浪費
2. 精神的苦痛
3. 「なんでこんなことしてるんだろう」という虚無感
4. 人間であることへの哲学的疑問

第6条（同意の効力）
本規約への同意は、宇宙が熱的死を迎えるまで有効とします。ただし、次のチャレンジに進んだ時点で、この規約のことは忘れてもかまいません。

第7条（最終条項）
ここまで読んだあなたは偉い。本当に偉い。世の中の99%の人は利用規約を読みません。あなたは残りの1%です。おめでとうございます。

さあ、「同意する」ボタンを押してください。`;

  function initStep1() {
    step1CanAgree = false;
    step1ScrolledOnce = false;
  }

  function handleStep1Scroll() {
    if (!step1ScrollRef) return;
    const { scrollTop, scrollHeight, clientHeight } = step1ScrollRef;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 5;
    if (nearBottom) {
      step1ScrolledOnce = true;
      step1CanAgree = true;
    }
  }

  // ===== 第2条: 逃げる同意ボタン =====
  let step2ContainerRef;
  let step2BtnX = 50;
  let step2BtnY = 50;
  let step2Escapes = 0;
  const step2MaxEscapes = 8;
  let step2Tired = false;
  let step2Msg = '';

  const step2Taunts = [
    'こっちだよ！',
    '速すぎ？',
    'もうちょっと！',
    '本当に同意する気ある？',
    'あと少し...',
    'そろそろ疲れてきた...',
    'ハァ...ハァ...',
    'もう...無理...',
  ];

  function initStep2() {
    step2BtnX = 50;
    step2BtnY = 50;
    step2Escapes = 0;
    step2Tired = false;
    step2Msg = '';
  }

  function handleStep2MouseMove(e) {
    if (!step2ContainerRef || step2Tired) return;
    const rect = step2ContainerRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const btnPixelX = (step2BtnX / 100) * rect.width;
    const btnPixelY = (step2BtnY / 100) * rect.height;

    const distance = Math.sqrt(
      Math.pow(mouseX - btnPixelX, 2) + Math.pow(mouseY - btnPixelY, 2)
    );

    if (distance < 90) {
      step2Escapes++;
      step2Msg = step2Taunts[Math.min(step2Escapes - 1, step2Taunts.length - 1)];

      if (step2Escapes >= step2MaxEscapes) {
        step2Tired = true;
        return;
      }

      const angle = Math.atan2(btnPixelY - mouseY, btnPixelX - mouseX);
      const escapeStrength = Math.max(8, 30 - step2Escapes * 3);
      let newX = step2BtnX + Math.cos(angle) * escapeStrength;
      let newY = step2BtnY + Math.sin(angle) * escapeStrength;
      step2BtnX = Math.max(15, Math.min(85, newX));
      step2BtnY = Math.max(20, Math.min(80, newY));
    }
  }

  function handleStep2Touch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleStep2MouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  // ===== 第3条: ルーレット同意 =====
  let step3Angle = 0;
  let step3Spinning = false;
  let step3Result = null; // 'success' | 'fail' | null
  let step3AnimFrame;
  let step3Speed = 0;
  let step3Started = false;

  const step3Segments = [
    { label: '同意する', color: '#1a6b2a', textColor: '#fff' },
    { label: '拒否', color: '#e0e0e0', textColor: '#666' },
    { label: '保留', color: '#e0e0e0', textColor: '#666' },
    { label: '拒否', color: '#e0e0e0', textColor: '#666' },
    { label: '後で読む', color: '#e0e0e0', textColor: '#666' },
  ];

  function initStep3() {
    step3Angle = 0;
    step3Spinning = false;
    step3Result = null;
    step3Started = false;
    step3Speed = 0;
  }

  function startStep3Spin() {
    step3Started = true;
    step3Spinning = true;
    step3Result = null;
    step3Speed = 4 + Math.random() * 3;
    animateStep3();
  }

  function animateStep3() {
    if (!step3Spinning) return;
    step3Angle = (step3Angle + step3Speed) % 360;
    step3AnimFrame = requestAnimationFrame(animateStep3);
  }

  function step3Stop() {
    if (!step3Spinning) return;
    step3Spinning = false;
    cancelAnimationFrame(step3AnimFrame);

    // 同意するのセグメントは 0-72度 (360/5 = 72)
    const segmentAngle = 360 / step3Segments.length;
    // ポインターは上(0度)、回転は時計回り
    // 現在の角度で、どのセグメントにいるか
    const normalizedAngle = ((360 - step3Angle % 360) + segmentAngle / 2) % 360;
    const segmentIndex = Math.floor(normalizedAngle / segmentAngle);

    if (segmentIndex === 0) {
      step3Result = 'success';
      setTimeout(() => completeStep(3), 800);
    } else {
      step3Result = 'fail';
      setTimeout(() => {
        step3Result = null;
        step3Started = false;
      }, 1200);
    }
  }

  // ===== 第4条: 連打同意 =====
  let step4Count = 0;
  const step4Target = 30;
  let step4TimeLeft = 7.0;
  let step4Active = false;
  let step4Timer;
  let step4Failed = false;
  let step4BtnScale = 1;

  function initStep4() {
    step4Count = 0;
    step4TimeLeft = 7.0;
    step4Active = false;
    step4Failed = false;
    step4BtnScale = 1;
  }

  function startStep4() {
    step4Active = true;
    step4Count = 0;
    step4TimeLeft = 7.0;
    step4Failed = false;
    step4BtnScale = 1;
    clearInterval(step4Timer);
    step4Timer = setInterval(() => {
      step4TimeLeft = Math.max(0, step4TimeLeft - 0.1);
      if (step4TimeLeft <= 0) {
        clearInterval(step4Timer);
        step4Failed = true;
        setTimeout(() => initStep4(), 2000);
      }
    }, 100);
  }

  function step4Click() {
    if (!step4Active || step4Failed) return;
    step4Count++;
    // ボタンがだんだん小さくなる
    step4BtnScale = Math.max(0.4, 1 - (step4Count / step4Target) * 0.6);
    if (step4Count >= step4Target) {
      clearInterval(step4Timer);
      step4Active = false;
      completeStep(4);
    }
  }

  // ===== 第5条: 確認ラッシュ =====
  const step5Confirms = [
    '利用規約に同意しますか？',
    '本当に同意しますか？',
    '本当の本当ですか？',
    '後悔しませんか？',
    '最終確認です。よろしいですか？',
    '本当にこれが最後です。同意しますか？',
    '嘘です。もう1回。同意しますか？',
    'これで本当に最後です。同意しますか？',
  ];
  let step5Current = 0;
  let step5YesX = 50;
  let step5YesY = 50;
  let step5NoX = 50;
  let step5NoY = 70;
  let step5Shake = false;

  function initStep5() {
    step5Current = 0;
    randomizeStep5();
  }

  function randomizeStep5() {
    step5YesX = 15 + Math.random() * 70;
    step5YesY = 40 + Math.random() * 40;
    step5NoX = 15 + Math.random() * 70;
    step5NoY = 40 + Math.random() * 40;
    // yesとnoが近すぎたらずらす
    if (Math.abs(step5YesX - step5NoX) < 30 && Math.abs(step5YesY - step5NoY) < 20) {
      step5NoX = (step5YesX + 40) % 85 + 5;
    }
  }

  function step5ClickYes() {
    step5Current++;
    if (step5Current >= step5Confirms.length) {
      completeStep(5);
    } else {
      randomizeStep5();
    }
  }

  function step5ClickNo() {
    step5Shake = true;
    step5Current = 0;
    setTimeout(() => {
      step5Shake = false;
      randomizeStep5();
    }, 500);
  }

  // ===== 第6条: ジャンプゲーム =====
  let gameCanvas;
  let gameScore = 0;
  let gameBestScore = 0;
  let gameRunning = false;
  let gameOver = false;
  let gameAnimFrame;
  let gameStarted = false;

  let playerY = 0;
  let playerVelocity = 0;
  let isJumping = false;
  let obstacles = [];
  let gameSpeed = 3;
  let groundY = 0;
  let frameCount = 0;

  function initGame() {
    if (!gameCanvas) return;
    gameCanvas.width = gameCanvas.offsetWidth;
    gameCanvas.height = 200;
    groundY = gameCanvas.height - 30;
    playerY = groundY;
    playerVelocity = 0;
    isJumping = false;
    obstacles = [];
    gameScore = 0;
    gameSpeed = 3;
    gameRunning = true;
    gameOver = false;
    gameStarted = true;
    frameCount = 0;
    cancelAnimationFrame(gameAnimFrame);
    gameLoop();
  }

  function jump() {
    if (!isJumping && gameRunning) {
      isJumping = true;
      playerVelocity = -10;
    }
    if (gameOver) {
      initGame();
    }
  }

  function gameLoop() {
    if (!gameCanvas) return;
    const ctx = gameCanvas.getContext('2d');
    const w = gameCanvas.width;
    const h = gameCanvas.height;

    if (!gameRunning) {
      drawGame(ctx, w, h);
      return;
    }

    frameCount++;

    // プレイヤー更新
    if (isJumping) {
      playerVelocity += 0.6;
      playerY += playerVelocity;
      if (playerY >= groundY) {
        playerY = groundY;
        isJumping = false;
        playerVelocity = 0;
      }
    }

    // 障害物生成
    if (frameCount % Math.max(40, 80 - Math.floor(gameScore / 50)) === 0) {
      obstacles.push({
        x: w + 10,
        width: 12 + Math.random() * 16,
        height: 18 + Math.random() * 24,
      });
    }

    // 障害物更新
    for (let obs of obstacles) {
      obs.x -= gameSpeed;
    }
    obstacles = obstacles.filter(obs => obs.x > -50);

    // 衝突判定
    const playerX = 40;
    const playerW = 18;
    const playerH = 26;

    for (let obs of obstacles) {
      if (
        playerX + playerW > obs.x + 2 &&
        playerX < obs.x + obs.width - 2 &&
        playerY > groundY - obs.height
      ) {
        gameRunning = false;
        gameOver = true;
        if (gameScore > gameBestScore) {
          gameBestScore = gameScore;
        }
      }
    }

    // スコア
    gameScore++;
    if (gameScore % 300 === 0) {
      gameSpeed += 0.3;
    }

    drawGame(ctx, w, h);

    if (gameRunning) {
      gameAnimFrame = requestAnimationFrame(gameLoop);
    }
  }

  function drawGame(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    // 地面
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 1);
    ctx.lineTo(w, groundY + 1);
    ctx.stroke();

    // 地面の点線模様
    ctx.strokeStyle = '#e0e0e0';
    ctx.setLineDash([4, 8]);
    for (let i = 0; i < 3; i++) {
      const y = groundY + 8 + i * 6;
      ctx.beginPath();
      ctx.moveTo((-frameCount * gameSpeed + i * 20) % w - w, y);
      for (let x = (-frameCount * gameSpeed + i * 20) % w - w; x < w + 20; x += 20) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // プレイヤー（シンプルなキャラクター）
    const px = 40;
    const py = playerY;
    const pw = 18;
    const ph = 26;

    // 体
    ctx.fillStyle = '#333';
    ctx.fillRect(px, py - ph, pw, ph);

    // 目
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 10, py - ph + 6, 6, 6);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 12, py - ph + 8, 3, 3);

    // 足（走るアニメーション）
    if (!isJumping && gameRunning) {
      const legPhase = Math.floor(frameCount / 6) % 2;
      ctx.fillStyle = '#333';
      if (legPhase === 0) {
        ctx.fillRect(px + 2, py, 5, 6);
        ctx.fillRect(px + 11, py, 5, 3);
      } else {
        ctx.fillRect(px + 2, py, 5, 3);
        ctx.fillRect(px + 11, py, 5, 6);
      }
    }

    // 障害物
    for (let obs of obstacles) {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);
      // トゲトゲ
      ctx.fillStyle = '#dc2626';
      const spikeW = obs.width / 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(obs.x + i * spikeW, groundY - obs.height);
        ctx.lineTo(obs.x + i * spikeW + spikeW / 2, groundY - obs.height - 5);
        ctx.lineTo(obs.x + (i + 1) * spikeW, groundY - obs.height);
        ctx.fill();
      }
    }

    // スコア
    ctx.fillStyle = '#999';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${Math.floor(gameScore / 10)}`, w - 10, 18);

    if (gameBestScore > 0) {
      ctx.fillText(`BEST: ${Math.floor(gameBestScore / 10)}`, w - 10, 32);
    }

    if (gameOver) {
      // 半透明オーバーレイ
      ctx.fillStyle = 'rgba(250, 250, 250, 0.8)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#333';
      ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', w / 2, h / 2 - 12);
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`Score: ${Math.floor(gameScore / 10)}`, w / 2, h / 2 + 8);
      ctx.fillText('クリック or スペースキーでリトライ', w / 2, h / 2 + 28);
    }
  }

  function handleKeyDown(e) {
    if (e.code === 'Space' && currentStep === 6 && gameStarted) {
      e.preventDefault();
      jump();
    }
  }

  // ===== ライフサイクル =====
  onMount(() => {
    // Web Component 内で keydown を拾うために window に登録
  });

  onDestroy(() => {
    clearInterval(timerInterval);
    clearInterval(step4Timer);
    cancelAnimationFrame(step3AnimFrame);
    cancelAnimationFrame(gameAnimFrame);
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="gated-wrapper">
  <!-- ヘッダー -->
  {#if currentStep > 0}
    <div class="top-bar">
      <div class="progress-dots">
        {#each [1,2,3,4,5] as step}
          <div
            class="dot"
            class:completed={completedSteps.has(step)}
            class:active={currentStep === step}
          ></div>
        {/each}
      </div>
      <div class="timer">{elapsedTime}</div>
    </div>
  {/if}

  <!-- イントロ画面 -->
  {#if currentStep === 0}
    <div class="intro">
      <div class="intro-icon">📋</div>
      <h1 class="intro-title">利用規約への同意</h1>
      <p class="intro-description">
        このコンテンツをご利用いただくには、<br />
        全5条の利用規約に同意する必要があります。
      </p>
      <div class="intro-rules">
        <div class="rule">
          <span class="rule-num">1</span>
          <span>全ての利用規約を確認してください</span>
        </div>
        <div class="rule">
          <span class="rule-num">2</span>
          <span>各条項の「同意する」を押してください</span>
        </div>
        <div class="rule">
          <span class="rule-num">3</span>
          <span>全5条への同意後、コンテンツが解放されます</span>
        </div>
      </div>
      <button class="begin-btn" on:click={begin}>同意を開始する</button>
    </div>
  {/if}

  <!-- 第1条: スクロール同意 -->
  {#if currentStep === 1}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">第1条</span>
        <span class="challenge-title">利用規約の確認</span>
      </div>
      <p class="challenge-instruction">規約を最後までスクロールして確認してください</p>
      <div
        class="terms-scroll"
        bind:this={step1ScrollRef}
        on:scroll={handleStep1Scroll}
      >
        <pre class="terms-text">{step1Terms}</pre>
      </div>
      <div class="challenge-footer">
        {#if !step1ScrolledOnce}
          <span class="hint-text">↓ 最後までスクロールしてください</span>
        {/if}
        <button
          class="agree-btn"
          class:disabled={!step1CanAgree}
          disabled={!step1CanAgree}
          on:click={() => step1CanAgree && completeStep(1)}
        >
          同意する
        </button>
      </div>
    </div>
  {/if}

  <!-- 第2条: 逃げる同意ボタン -->
  {#if currentStep === 2}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">第2条</span>
        <span class="challenge-title">ボタンの捕獲</span>
      </div>
      <p class="challenge-instruction">「同意する」ボタンをクリックしてください</p>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="escape-area"
        bind:this={step2ContainerRef}
        on:mousemove={handleStep2MouseMove}
        on:touchmove|preventDefault={handleStep2Touch}
      >
        <button
          class="escape-btn"
          class:tired={step2Tired}
          style="left: {step2BtnX}%; top: {step2BtnY}%;"
          on:click={() => completeStep(2)}
        >
          同意する
        </button>
        {#if step2Msg}
          <div class="escape-msg">{step2Msg}</div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- 第3条: ルーレット同意 -->
  {#if currentStep === 3}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">第3条</span>
        <span class="challenge-title">ルーレット認証</span>
      </div>
      <p class="challenge-instruction">「同意する」に合わせてストップしてください</p>
      <div class="roulette-area">
        <div class="roulette-pointer">▼</div>
        <div class="roulette-wheel" style="transform: rotate({step3Angle}deg);">
          {#each step3Segments as seg, i}
            <div
              class="roulette-segment"
              style="
                transform: rotate({i * (360 / step3Segments.length)}deg);
                background: {seg.color};
                color: {seg.textColor};
              "
            >
              <span class="segment-label">{seg.label}</span>
            </div>
          {/each}
        </div>
        <div class="roulette-controls">
          {#if !step3Started}
            <button class="roulette-btn" on:click={startStep3Spin}>回す</button>
          {:else if step3Spinning}
            <button class="roulette-btn stop" on:click={step3Stop}>ストップ！</button>
          {:else if step3Result === 'fail'}
            <div class="roulette-result fail">ハズレ！もう一度...</div>
          {:else if step3Result === 'success'}
            <div class="roulette-result success">同意成立！</div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- 第4条: 連打同意 -->
  {#if currentStep === 4}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">第4条</span>
        <span class="challenge-title">同意の連打</span>
      </div>
      <p class="challenge-instruction">{step4Target}回「同意する」を連打してください（制限時間あり）</p>
      <div class="mash-area">
        {#if !step4Active && !step4Failed}
          <button class="mash-start-btn" on:click={startStep4}>スタート</button>
        {:else}
          <div class="mash-info">
            <div class="mash-counter">
              <span class="mash-count">{step4Count}</span>
              <span class="mash-separator">/</span>
              <span class="mash-target">{step4Target}</span>
            </div>
            <div class="mash-timer" class:urgent={step4TimeLeft <= 3}>
              {step4TimeLeft.toFixed(1)}秒
            </div>
          </div>
          <div class="mash-progress">
            <div class="mash-progress-bar" style="width: {(step4Count / step4Target) * 100}%"></div>
          </div>
          {#if step4Failed}
            <div class="mash-fail">時間切れ！もう一度挑戦...</div>
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div
              class="mash-btn-wrapper"
              on:click={step4Click}
            >
              <button
                class="mash-btn"
                style="transform: scale({step4BtnScale});"
              >
                同意する
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}

  <!-- 第5条: 確認ラッシュ -->
  {#if currentStep === 5}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">第5条</span>
        <span class="challenge-title">最終確認</span>
      </div>
      <p class="challenge-instruction">全ての確認に「はい」で答えてください</p>
      <div class="confirm-area" class:shake={step5Shake}>
        <div class="confirm-progress">
          {step5Current} / {step5Confirms.length}
        </div>
        <div class="confirm-dialog">
          <div class="confirm-icon">⚠️</div>
          <p class="confirm-text">{step5Confirms[step5Current]}</p>
          <div class="confirm-buttons">
            <button
              class="confirm-yes"
              style="left: {step5YesX}%;"
              on:click={step5ClickYes}
            >
              はい
            </button>
            <button
              class="confirm-no"
              style="left: {step5NoX}%;"
              on:click={step5ClickNo}
            >
              いいえ
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ゲーム解放 -->
  {#if currentStep === 6}
    <div class="game-unlocked">
      <div class="unlock-header">
        <div class="unlock-icon">🎉</div>
        <h2 class="unlock-title">全規約に同意しました！</h2>
        <p class="unlock-time">クリアタイム: {elapsedTime}</p>
      </div>

      <div class="game-section">
        <div class="game-title-bar">
          <span>🎮 ドキドキジャンプゲーム</span>
        </div>
        {#if !gameStarted}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <div class="game-start-overlay" on:click={initGame}>
            <div class="game-start-icon">🏃</div>
            <p class="game-start-text">クリック or スペースキーでジャンプ</p>
            <button class="game-start-btn">ゲーム開始</button>
          </div>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <canvas
          class="game-canvas"
          bind:this={gameCanvas}
          on:click={jump}
          class:hidden={!gameStarted}
        ></canvas>
      </div>
    </div>
  {/if}
</div>

<style>
  .gated-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 520px;
    margin: 0 auto;
    color: #333;
  }

  /* トップバー */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .progress-dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e0e0e0;
    transition: background 0.3s, transform 0.3s;
  }

  .dot.active {
    background: #f59e0b;
    transform: scale(1.2);
  }

  .dot.completed {
    background: #1a6b2a;
  }

  .timer {
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 13px;
    color: #666;
  }

  /* イントロ */
  .intro {
    text-align: center;
    padding: 48px 24px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .intro-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .intro-title {
    font-size: 22px;
    font-weight: 700;
    color: #111;
    margin-bottom: 12px;
  }

  .intro-description {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .intro-rules {
    text-align: left;
    max-width: 320px;
    margin: 0 auto 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rule {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #444;
  }

  .rule-num {
    width: 24px;
    height: 24px;
    background: #333;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .begin-btn {
    padding: 12px 32px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
  }

  .begin-btn:hover {
    background: #1a1a1a;
  }

  /* チャレンジ共通 */
  .challenge {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    animation: fadeIn 0.3s ease-out;
  }

  .challenge.transitioning {
    opacity: 0.5;
    pointer-events: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .challenge-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
  }

  .challenge-num {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: #333;
    padding: 3px 8px;
    border-radius: 3px;
  }

  .challenge-title {
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }

  .challenge-instruction {
    padding: 12px 18px;
    font-size: 12px;
    color: #888;
    border-bottom: 1px solid #f0f0f0;
  }

  .challenge-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 18px;
    border-top: 1px solid #e0e0e0;
    background: #fafafa;
  }

  .hint-text {
    font-size: 11px;
    color: #999;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .agree-btn {
    padding: 8px 20px;
    background: #1a6b2a;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
    font-family: inherit;
    margin-left: auto;
  }

  .agree-btn:hover:not(.disabled) {
    background: #15572a;
  }

  .agree-btn.disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* 第1条: スクロール */
  .terms-scroll {
    height: 260px;
    overflow-y: auto;
    padding: 16px 18px;
    border-bottom: 1px solid #e0e0e0;
  }

  .terms-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    line-height: 1.9;
    color: #444;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
  }

  /* 第2条: 逃げるボタン */
  .escape-area {
    position: relative;
    height: 280px;
    overflow: hidden;
    touch-action: none;
  }

  .escape-btn {
    position: absolute;
    transform: translate(-50%, -50%);
    padding: 10px 24px;
    background: #1a6b2a;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: left 0.2s ease-out, top 0.2s ease-out;
    font-family: inherit;
    white-space: nowrap;
    z-index: 2;
  }

  .escape-btn:hover {
    background: #15572a;
  }

  .escape-btn.tired {
    animation: tired 0.5s ease-in-out infinite;
  }

  @keyframes tired {
    0%, 100% { transform: translate(-50%, -50%); }
    50% { transform: translate(-50%, -48%); }
  }

  .escape-msg {
    position: absolute;
    bottom: 16px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 13px;
    color: #999;
    font-weight: 500;
    animation: fadeIn 0.3s ease-out;
  }

  /* 第3条: ルーレット */
  .roulette-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 18px;
    gap: 16px;
  }

  .roulette-pointer {
    font-size: 20px;
    color: #b91c1c;
    margin-bottom: -8px;
    z-index: 2;
  }

  .roulette-wheel {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: relative;
    border: 3px solid #333;
    overflow: hidden;
  }

  .roulette-segment {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 16px;
    transform-origin: 50% 50%;
    clip-path: polygon(50% 50%, 19.1% 0%, 80.9% 0%);
  }

  .segment-label {
    font-size: 11px;
    font-weight: 600;
    transform: translateY(-2px);
  }

  .roulette-controls {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .roulette-btn {
    padding: 10px 28px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
  }

  .roulette-btn:hover {
    background: #1a1a1a;
  }

  .roulette-btn.stop {
    background: #b91c1c;
  }

  .roulette-btn.stop:hover {
    background: #991b1b;
  }

  .roulette-result {
    font-size: 14px;
    font-weight: 600;
    padding: 8px 20px;
    border-radius: 4px;
    animation: fadeIn 0.3s ease-out;
  }

  .roulette-result.success {
    color: #1a6b2a;
    background: #f0faf0;
  }

  .roulette-result.fail {
    color: #b91c1c;
    background: #fef2f2;
  }

  /* 第4条: 連打 */
  .mash-area {
    padding: 24px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    min-height: 240px;
    justify-content: center;
  }

  .mash-start-btn {
    padding: 12px 32px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .mash-start-btn:hover {
    background: #1a1a1a;
  }

  .mash-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .mash-counter {
    font-size: 28px;
    font-weight: 700;
    color: #111;
  }

  .mash-count {
    color: #1a6b2a;
  }

  .mash-separator {
    color: #ccc;
    margin: 0 2px;
  }

  .mash-target {
    color: #999;
  }

  .mash-timer {
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 20px;
    font-weight: 600;
    color: #666;
    transition: color 0.2s;
  }

  .mash-timer.urgent {
    color: #b91c1c;
    animation: pulse 0.5s ease-in-out infinite;
  }

  .mash-progress {
    width: 100%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }

  .mash-progress-bar {
    height: 100%;
    background: #1a6b2a;
    border-radius: 3px;
    transition: width 0.1s;
  }

  .mash-btn-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80px;
    cursor: pointer;
  }

  .mash-btn {
    padding: 16px 40px;
    background: #1a6b2a;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.05s;
    font-family: inherit;
    user-select: none;
  }

  .mash-btn:active {
    filter: brightness(0.9);
  }

  .mash-fail {
    font-size: 14px;
    font-weight: 600;
    color: #b91c1c;
    animation: fadeIn 0.3s ease-out;
  }

  /* 第5条: 確認ラッシュ */
  .confirm-area {
    padding: 24px 18px;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .confirm-area.shake {
    animation: shake 0.4s ease-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  .confirm-progress {
    font-size: 13px;
    color: #999;
    font-weight: 500;
  }

  .confirm-dialog {
    width: 100%;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px 20px;
    text-align: center;
    animation: fadeIn 0.2s ease-out;
    position: relative;
  }

  .confirm-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .confirm-text {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .confirm-buttons {
    position: relative;
    height: 48px;
    width: 100%;
  }

  .confirm-yes,
  .confirm-no {
    position: absolute;
    transform: translateX(-50%);
    padding: 8px 24px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
    white-space: nowrap;
  }

  .confirm-yes {
    background: #1a6b2a;
    color: #fff;
  }

  .confirm-yes:hover {
    background: #15572a;
  }

  .confirm-no {
    background: #e0e0e0;
    color: #666;
  }

  .confirm-no:hover {
    background: #ccc;
  }

  /* ゲーム解放 */
  .game-unlocked {
    animation: fadeIn 0.5s ease-out;
  }

  .unlock-header {
    text-align: center;
    padding: 32px 24px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .unlock-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .unlock-title {
    font-size: 20px;
    font-weight: 700;
    color: #111;
    margin-bottom: 8px;
  }

  .unlock-time {
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 14px;
    color: #1a6b2a;
    font-weight: 600;
  }

  .game-section {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  .game-title-bar {
    padding: 10px 16px;
    background: #333;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
  }

  .game-start-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    cursor: pointer;
  }

  .game-start-icon {
    font-size: 36px;
  }

  .game-start-text {
    font-size: 13px;
    color: #666;
  }

  .game-start-btn {
    padding: 10px 24px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .game-start-btn:hover {
    background: #1a1a1a;
  }

  .game-canvas {
    display: block;
    width: 100%;
    height: 200px;
    background: #fafafa;
    cursor: pointer;
  }

  .game-canvas.hidden {
    display: none;
  }
</style>
