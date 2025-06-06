import { BaseEntity, EntityUpdateProps, EntityRenderProps } from './BaseEntity';
import { InputManager } from './InputManager';
import { NewPaddle } from './NewPaddle';
import { NewBall } from './NewBall';
import { NewBlock, BlockType } from './NewBlock';
import { PowerUp, PowerUpType } from './PowerUp';
import { Particle } from './Particle';

export enum GameStatus {
  Ready,    // 게임 시작 전 준비 상태
  Playing,  // 게임 진행 중
  Paused,   // 일시 정지
  GameOver, // 게임 오버
  LevelComplete, // 레벨 완료
}

export interface GameEngineCallbacks {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onGameStatusChange?: (status: GameStatus, score?: number) => void; // score 추가 for GameOver
  // 필요에 따라 추가 콜백 정의
}

export class NewGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entities: BaseEntity[] = [];
  private inputManager: InputManager;
  private paddle: NewPaddle | null = null;
  private paddleInitialWidth: number = 100; // 패들 기본 너비
  private paddleHeight: number = 20;    // 패들 높이
  private paddleSpeed: number = 500;    // 패들 이동 속도 (픽셀/초)
  private balls: NewBall[] = [];
  private blocks: NewBlock[] = [];
  private powerUps: PowerUp[] = [];
  private particles: Particle[] = [];
  private activePowerUps: Map<PowerUpType, { endTime?: number, originalValue?: any }> = new Map();
  private readonly POWER_UP_DROP_CHANCE = 0.2; // 20% 확률로 아이템 드랍
  private ballSpeed: number = 300; // 공의 기본 속도 (픽셀/초)
  private ballRadius: number = 8;
  private ballInitialDx: number;
  private ballInitialDy: number;
  private animationFrameId: number = 0;
  private lastTime: number = 0;

  public status: GameStatus = GameStatus.Ready;
  private score: number = 0;
  public initialLives: number = 3; // Game.tsx에서 참조 가능하도록 public으로 변경
  private lives: number = this.initialLives;

  private callbacks: GameEngineCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.inputManager = InputManager.getInstance(); // InputManager 싱글톤 인스턴스 사용
    this.callbacks = callbacks;

    // ballInitialDx, ballInitialDy 설정
    this.ballInitialDx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1); // 초기 x 방향 랜덤
    this.ballInitialDy = -this.ballSpeed; // 초기 y 방향은 위로

    this.initializeLevel(1); // 레벨 초기화 (패들, 공, 벽돌 생성 포함)
  }

  private initializeLevel(levelNumber: number): void {
    this.entities = [];
    this.balls = [];
    this.blocks = [];
    this.powerUps = [];
    this.particles = []; // 파티클 배열 초기화
    this.activePowerUps.clear();
    this.score = 0;
    this.lives = this.initialLives;

    // 패들 생성 (기존 로직)
    const paddleX = this.canvas.width / 2 - this.paddleInitialWidth / 2;
    const paddleY = this.canvas.height - this.paddleHeight - 30; // 화면 하단에서 약간 위
    this.paddle = new NewPaddle(
      paddleX,
      paddleY,
      this.paddleInitialWidth,
      this.paddleHeight,
      this.paddleSpeed,
      this.canvas.width // 초기 캔버스 너비 전달
    );
    this.addEntity(this.paddle);

    // 공 생성
    this.resetBall();

    // 벽돌 생성 (간단한 예시 레벨)
    const blockRowCount = 3;
    const blockColumnCount = 8;
    // canvasWidth가 constructor 시점에서는 0일 수 있으므로, this.canvas.width 사용
    const availableWidth = this.canvas.width > 0 ? this.canvas.width : 640; // 기본값 설정
    const blockWidth = (availableWidth - 40) / blockColumnCount - 5; // 여백 고려
    const blockHeight = 20;
    const blockPadding = 5;
    const blockOffsetTop = 30;
    const blockOffsetLeft = 20;

    for (let r = 0; r < blockRowCount; r++) {
      for (let c = 0; c < blockColumnCount; c++) {
        const blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
        const blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
        // 간단한 타입 분배 예시
        let type = BlockType.Normal;
        if (r === 0) type = BlockType.Strong; // 첫 줄은 강한 블록
        if (r === 1 && (c === 0 || c === blockColumnCount -1)) type = BlockType.Unbreakable; // 특정 위치는 안깨지는 블록

        const block = new NewBlock(blockX, blockY, blockWidth, blockHeight, type);
        this.blocks.push(block);
        this.addEntity(block);
      }
    }

    // 초기 콜백 호출
    this.callbacks.onLivesChange?.(this.lives);
    this.callbacks.onScoreChange?.(this.score);
    this.setGameStatus(GameStatus.Ready);
  }

  private resetBall(): void {
    // 기존 공 제거
    this.balls.forEach(ball => ball.destroy());
    this.entities = this.entities.filter(e => !(e instanceof NewBall && e.isDestroyed));
    this.balls = this.balls.filter(b => !b.isDestroyed);


    if (this.paddle) {
      const ballX = this.paddle.x + this.paddle.width / 2;
      const ballY = this.paddle.y - this.ballRadius - 5;
      const newBall = new NewBall(
        ballX, ballY, this.ballRadius,
        this.ballInitialDx, this.ballInitialDy,
        this.canvas.width, this.canvas.height
      );
      this.balls.push(newBall);
      this.addEntity(newBall);
    }
  }

  private gameLoop(timestamp: number): void {
    if (this.status === GameStatus.Paused) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }

    const deltaTime = (timestamp - this.lastTime) / 1000; // 초 단위 시간 변화량
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    if (this.status === GameStatus.Playing || this.status === GameStatus.Ready) {
         this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  private checkCollisions(): void {
    if (!this.paddle) return;

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.isDestroyed) continue; // 이미 제거된 공은 스킵

      // 공 - 화면 하단 충돌 (공 놓침)
      if (ball.y + ball.radius > this.canvas.height) {
        ball.destroy();
        this.lives--;
        this.callbacks.onLivesChange?.(this.lives);
        if (this.lives <= 0) {
          this.setGameStatus(GameStatus.GameOver); // setGameStatus에서 score 전달
        } else {
          this.resetBall();
          this.resetPaddlePosition();
          this.setGameStatus(GameStatus.Ready);
        }
        continue;
      }

      // 공 - 패들 충돌 (AABB)
      if (
        ball.x - ball.radius < this.paddle.x + this.paddle.width &&
        ball.x + ball.radius > this.paddle.x &&
        ball.y - ball.radius < this.paddle.y + this.paddle.height &&
        ball.y + ball.radius > this.paddle.y
      ) {
        if (ball.dy > 0) {
             ball.dy = -Math.abs(ball.dy);
            let hitPos = (ball.x - this.paddle.x) / this.paddle.width;
            ball.dx = (hitPos - 0.5) * 2 * this.ballSpeed;
        }
      }

      // 공 - 벽돌 충돌 (AABB)
      for (let j = this.blocks.length - 1; j >= 0; j--) {
        const block = this.blocks[j];
        if (block.isDestroyed) continue;

        if (
          ball.x - ball.radius < block.x + block.width &&
          ball.x + ball.radius > block.x &&
          ball.y - ball.radius < block.y + block.height &&
          ball.y + ball.radius > block.y
        ) {
          const overlapX = (ball.radius + block.width / 2) - Math.abs(ball.x - (block.x + block.width / 2));
          const overlapY = (ball.radius + block.height / 2) - Math.abs(ball.y - (block.y + block.height / 2));

          if (overlapX > overlapY) {
            ball.dy = -ball.dy;
          } else {
            ball.dx = -ball.dx;
          }

          if (block.hit()) {
            this.score += block.points;
            this.callbacks.onScoreChange?.(this.score);
            this.createBlockDestroyParticles(block); // 파티클 생성 호출

            // 아이템 드랍 로직
            if (Math.random() < this.POWER_UP_DROP_CHANCE) {
              this.spawnPowerUp(block.x + block.width / 2, block.y + block.height / 2);
            }
          }
          if (this.blocks.every(b => b.isDestroyed || b.blockType === BlockType.Unbreakable)) {
            this.setGameStatus(GameStatus.LevelComplete);
          }
          break;
        }
      }
    }

    // 패들 - 아이템 충돌
    for (let k = this.powerUps.length - 1; k >= 0; k--) {
      const powerUp = this.powerUps[k];
      if (powerUp.isDestroyed) continue;

      if (
        this.paddle &&
        powerUp.x < this.paddle.x + this.paddle.width &&
        powerUp.x + powerUp.width > this.paddle.x &&
        powerUp.y < this.paddle.y + this.paddle.height &&
        powerUp.y + powerUp.height > this.paddle.y
      ) {
        this.applyPowerUpEffect(powerUp.type);
        powerUp.destroy();
        // this.callbacks.onPowerUpCollected?.(powerUp.type); // 필요시 콜백
      }

      // 화면 하단으로 나간 아이템 제거
      if (powerUp.y > this.canvas.height) {
        powerUp.destroy();
      }
    }
  }

  private spawnPowerUp(x: number, y: number): void {
    const powerUpTypes = Object.values(PowerUpType);
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const powerUp = new PowerUp(x - 15, y, randomType); // x 좌표 중앙 정렬
    this.powerUps.push(powerUp);
    this.addEntity(powerUp);
  }

  private applyPowerUpEffect(type: PowerUpType): void {
    this.clearPowerUpEffect(type);

    const duration = 10000; // 10초 지속

    switch (type) {
      case PowerUpType.WidePaddle:
        if (this.paddle) {
          this.activePowerUps.set(type, {
            endTime: Date.now() + duration,
            originalValue: this.paddle.width
          });
          this.paddle.setWidth(this.paddle.width * 1.5);
          // console.log('WidePaddle activated');
        }
        break;
      case PowerUpType.ExtraLife:
        this.lives++;
        this.callbacks.onLivesChange?.(this.lives);
        // console.log('ExtraLife collected');
        break;
      case PowerUpType.MultiBall:
        const currentBallsCount = this.balls.length;
        if (currentBallsCount > 0 && currentBallsCount < 5) { // 최대 공 개수 제한 (예: 5개)
          for (let i = 0; i < currentBallsCount; i++) {
            const originalBall = this.balls[i];
            if (this.balls.length >= 5) break;

            const newBall1 = new NewBall(
              originalBall.x, originalBall.y, originalBall.radius,
              originalBall.dx * 0.8 - originalBall.dy * 0.6,
              originalBall.dy * 0.8 + originalBall.dx * 0.6,
              this.canvas.width, this.canvas.height
            );
            this.balls.push(newBall1);
            this.addEntity(newBall1);

            if (this.balls.length >= 5) break;

            const newBall2 = new NewBall(
              originalBall.x, originalBall.y, originalBall.radius,
              originalBall.dx * 0.8 + originalBall.dy * 0.6,
              originalBall.dy * 0.8 - originalBall.dx * 0.6,
              this.canvas.width, this.canvas.height
            );
            this.balls.push(newBall2);
            this.addEntity(newBall2);
          }
        }
        // console.log('MultiBall activated');
        break;
      case PowerUpType.SlowBall:
        this.balls.forEach(ball => ball.multiplySpeed(0.7));
        this.activePowerUps.set(type, { endTime: Date.now() + duration });
        // console.log('SlowBall activated');
        break;
      case PowerUpType.FastBall:
        this.balls.forEach(ball => ball.multiplySpeed(1.3));
        this.activePowerUps.set(type, { endTime: Date.now() + duration });
        // console.log('FastBall activated');
        break;
      default:
        // console.log(`${type} collected, no effect implemented yet.`);
        break;
    }
  }

  private clearPowerUpEffect(typeToClear?: PowerUpType): void {
      if (typeToClear && this.activePowerUps.has(typeToClear)) {
          const effect = this.activePowerUps.get(typeToClear);
          switch (typeToClear) {
              case PowerUpType.WidePaddle:
                  if (this.paddle && effect?.originalValue) {
                      this.paddle.setWidth(effect.originalValue as number);
                      // console.log('WidePaddle deactivated by new pickup');
                  }
                  break;
            case PowerUpType.SlowBall:
            case PowerUpType.FastBall:
                this.balls.forEach(ball => ball.resetSpeed());
                // console.log(`${typeToClear} deactivated by new pickup`);
                break;
          }
          this.activePowerUps.delete(typeToClear);
      }
  }

  private update(deltaTime: number): void {
    if (this.status !== GameStatus.Playing) {
        if (this.status === GameStatus.Ready && this.inputManager.isKeyPressed('Space')) { // 스페이스바로 시작 (spacebar는 code 임)
            this.setGameStatus(GameStatus.Playing);
        } else {
             return;
        }
    }

    const updateProps: EntityUpdateProps = { deltaTime };
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.isDestroyed) {
        this.entities.splice(i, 1);
        if (entity instanceof NewBall) this.balls = this.balls.filter(b => b !== entity);
        if (entity instanceof NewBlock) this.blocks = this.blocks.filter(b => b !== entity);
        if (entity instanceof PowerUp) this.powerUps = this.powerUps.filter(p => p !== entity);
        if (entity instanceof Particle) this.particles = this.particles.filter(p => p !== entity); // 파티클 배열에서도 제거
      } else {
        entity.update(updateProps);
      }
    }
    this.checkCollisions();

    // 만료된 파워업 효과 제거
    const now = Date.now();
    for (const [type, effect] of this.activePowerUps.entries()) {
      if (effect.endTime && now >= effect.endTime) {
        switch (type) {
          case PowerUpType.WidePaddle:
            if (this.paddle && effect.originalValue) {
              this.paddle.setWidth(effect.originalValue as number);
              // console.log('WidePaddle expired');
            }
            break;
            case PowerUpType.SlowBall:
            case PowerUpType.FastBall:
              this.balls.forEach(ball => ball.resetSpeed());
              // console.log(`${type} expired`);
              break;
        }
        this.activePowerUps.delete(type);
      }
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 배경 그라데이션 (예: 하늘색에서 연보라색으로)
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGradient.addColorStop(0, "#E0F7FA"); // 연한 하늘색 (Light Cyan)
    bgGradient.addColorStop(1, "#E1BEE7"); // 연한 보라색 (Light Purple)
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const renderProps: EntityRenderProps = { ctx: this.ctx };

    // 모든 엔티티 렌더링
    this.entities.forEach(entity => entity.render(renderProps));

    // UI 요소 렌더링 (점수, 생명 등 - 필요시)
    // this.renderUI();
  }

  public setGameStatus(newStatus: GameStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;

    if (newStatus === GameStatus.GameOver) {
      this.callbacks.onGameStatusChange?.(this.status, this.score); // GameOver 시 score 전달
    } else {
      this.callbacks.onGameStatusChange?.(this.status);
    }
    // console.log(`Game status changed to: ${GameStatus[newStatus]}`);

    if (newStatus === GameStatus.GameOver || newStatus === GameStatus.LevelComplete) {
         // 게임 루프 정지 로직 (필요시)
         if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
        }
    }
  }

  public start(): void {
    if (this.status === GameStatus.GameOver || this.status === GameStatus.LevelComplete) {
      this.initializeLevel(1); // This sets status to Ready
      // Game loop will be started below
    } else if (this.status === GameStatus.Paused) {
      this.setGameStatus(GameStatus.Playing); // Resume playing
      // Game loop will be started/continued below
    } else if (this.status === GameStatus.Ready) {
      // Status is already Ready. Game loop will be started below.
      // update() will handle transition to Playing.
    }

    // Common logic to start or continue the game loop
    // This should run if the status is Ready (initial, after game over/level complete),
    // or if it was Paused and is now Playing.
    if (this.status === GameStatus.Ready || this.status === GameStatus.Playing) {
      this.lastTime = performance.now();
      if (!this.animationFrameId) {
        this.gameLoop(this.lastTime);
      }
    }
  }

  public pause(): void {
    if (this.status === GameStatus.Playing) {
      this.setGameStatus(GameStatus.Paused);
    }
  }

  public resume(): void {
    if (this.status === GameStatus.Paused) {
      this.setGameStatus(GameStatus.Playing);
      this.lastTime = performance.now(); // 재시작 시간 초기화
       if (!this.animationFrameId) {
           this.gameLoop(this.lastTime);
       }
    }
  }

  public addEntity(entity: BaseEntity): void {
    this.entities.push(entity);
  }

  public destroy(): void { // 엔진 정리 메소드
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.entities = [];
    this.balls = [];
    this.blocks = [];
    this.powerUps = [];
    this.particles = []; // 파티클 배열 초기화
    this.activePowerUps.clear();
    this.inputManager.destroy();
    this.setGameStatus(GameStatus.GameOver);
  }

  private createBlockDestroyParticles(block: NewBlock): void {
    const particleCount = 10 + Math.floor(Math.random() * 10); // 10~19개 파티클
    // block.colors가 { [key in BlockType]: string[] } 형태이므로, block.blockType으로 접근
    const blockColorSet = block.colors[block.blockType];
    const blockColor = blockColorSet[0]; // 블록 기본 색상 사용 (또는 block.getCurrentColor() 같은 메소드)


    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100; // 50 ~ 150 사이 속도
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      const radius = 1 + Math.random() * 3; // 1 ~ 4 픽셀 반지름
      const lifeSpan = 500 + Math.random() * 500; // 0.5 ~ 1초 생존

      const particle = new Particle(
        block.x + block.width / 2, // 블록 중앙에서 시작
        block.y + block.height / 2,
        velocityX, velocityY,
        radius, blockColor, lifeSpan
      );
      this.particles.push(particle);
      this.addEntity(particle); // 중요: 파티클도 entities 배열에 추가하여 업데이트/렌더링되도록 함
    }
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    if (this.paddle) {
      // 패들의 새 canvasWidth 설정
      this.paddle.canvasWidth = width;
      // 패들 위치 재조정 (예: 화면 비율에 맞게 또는 중앙으로)
      this.paddle.x = width / 2 - this.paddle.width / 2;
      this.paddle.y = height - this.paddleHeight - 30;

      // 경계 재확인 (setWidth 내에서도 하지만, 여기서도 한번 더)
      if (this.paddle.x < 0) this.paddle.x = 0;
      if (this.paddle.x + this.paddle.width > width) this.paddle.x = width - this.paddle.width;
    }
    // 다른 엔티티들의 위치 재조정 로직도 필요할 수 있음
    this.balls.forEach(ball => ball.setCanvasSize(width, height));

    // 블록 위치도 화면 크기에 맞춰 재배치해야 한다면 initializeLevel 호출 또는 별도 로직 필요
    // 여기서는 initializeLevel을 다시 호출하여 블록을 재생성 (점수는 유지되나 레벨 진행상황 초기화 가능성)
    // 더 나은 방법은 블록들의 상대적 위치를 저장하고 resize 시 재계산하는 것
    // this.initializeLevel(1); // 임시로 레벨1 다시 로드 (주의: 점수/생명 외 상태 초기화됨)
    // => 위에서 initializeLevel을 호출하면 패들과 공도 재생성되므로, paddle/ball resize와 중복/충돌.
    // => 일단 블록은 resize 시 위치 고정으로 두고, initializeLevel 호출은 주석 처리.
    // => 또는, initializeLevel에서 paddle, ball 생성 부분은 조건부로 실행하도록 수정 필요.

    this.render();
  }

  // 공을 놓쳤을 때 패들 위치 초기화 (예시)
  public resetPaddlePosition(): void {
    if (this.paddle) {
      this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
      // this.paddle.y는 고정일 가능성이 높음
    }
  }
}
