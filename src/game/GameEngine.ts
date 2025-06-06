import { Ball } from './entities/Ball';
import { Paddle } from './entities/Paddle';
import { Block } from './entities/Block';
import { PowerUp } from './entities/PowerUp';
import { ParticleSystem } from './effects/ParticleSystem';
import { levels } from './levels/levels';
import { checkCollision } from './utils/collision';

export type PowerUpType = 'extraLife' | 'widePaddle' | 'multiball' | 'slowBall' | 'fastBall';

interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLifeLost: () => void;
  onLevelComplete: () => void;
  onPowerUpCollected: (type: PowerUpType) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private paddle: Paddle;
  private balls: Ball[] = [];
  private blocks: Block[] = [];
  private powerUps: PowerUp[] = [];
  private particleSystem: ParticleSystem;
  private score: number = 0;
  private level: number;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private callbacks: GameCallbacks;
  private paddleWidth: number = 100;
  private paddleWidthTimer: number | null = null;
  private keyState: { [key: string]: boolean } = {};
  private lastPaddleX: number = 0;

  constructor(canvas: HTMLCanvasElement, level: number, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.level = level;
    this.callbacks = callbacks;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    this.lastPaddleX = canvasWidth / 2 - this.paddleWidth / 2;
    
    this.paddle = new Paddle(
      this.lastPaddleX,
      canvasHeight - 30,
      this.paddleWidth,
      20
    );
    
    this.resetBall();
    this.particleSystem = new ParticleSystem();
    this.initializeLevel();
    this.setupEventListeners();
  }

  private resetBall() {
    this.balls = [];
    const ball = new Ball(
      this.paddle.x + this.paddle.width / 2,
      this.canvas.height - 50,
      8,
      { x: 1, y: -2 }
    );
    this.balls.push(ball);
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keyState[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key] = false;
    });
  }

  private updatePaddlePosition() {
    const moveSpeed = 10; // Increased from 7
    const currentX = this.paddle.x;
    
    if (this.keyState['ArrowLeft'] || this.keyState['a'] || this.keyState['A']) {
      this.paddle.targetX = Math.max(0, currentX - moveSpeed);
    }
    if (this.keyState['ArrowRight'] || this.keyState['d'] || this.keyState['D']) {
      this.paddle.targetX = Math.min(this.canvas.width - this.paddle.width, currentX + moveSpeed);
    }
    
    // 패들이 움직였을 때만 위치 업데이트
    if (this.paddle.targetX !== currentX) {
      this.paddle.update();
    }
    this.lastPaddleX = this.paddle.x; // Always update lastPaddleX to the current paddle position
  }

  private initializeLevel() {
    const levelData = levels[this.level - 1];
    if (!levelData || !levelData.layout) return;

    const blockWidth = 60;
    const blockHeight = 20;
    const padding = 10;
    const offsetTop = 50;

    levelData.layout.forEach((row, rowIndex) => {
      row.forEach((blockType, colIndex) => {
        if (blockType === 0) return;

        const x = colIndex * (blockWidth + padding) + padding;
        const y = rowIndex * (blockHeight + padding) + offsetTop;

        const block = new Block(x, y, blockWidth, blockHeight, blockType);
        this.blocks.push(block);
      });
    });
  }

  private spawnPowerUp(x: number, y: number) {
    const powerUpTypes: PowerUpType[] = ['extraLife', 'widePaddle', 'multiball', 'slowBall', 'fastBall'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const powerUp = new PowerUp(x, y, 15, randomType);
    this.powerUps.push(powerUp);
  }

  private updatePowerUps(deltaTime: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);

      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(i, 1);
        continue;
      }

      if (
        powerUp.x > this.paddle.x &&
        powerUp.x < this.paddle.x + this.paddle.width &&
        powerUp.y + powerUp.radius > this.paddle.y &&
        powerUp.y - powerUp.radius < this.paddle.y + this.paddle.height
      ) {
        this.applyPowerUpEffect(powerUp.type);
        this.callbacks.onPowerUpCollected(powerUp.type);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private applyPowerUpEffect(type: PowerUpType) {
    switch (type) {
      case 'widePaddle':
        const originalWidth = this.paddleWidth;
        this.paddle.width = this.paddleWidth * 1.5;
        if (this.paddleWidthTimer) clearTimeout(this.paddleWidthTimer);
        this.paddleWidthTimer = window.setTimeout(() => {
          this.paddle.width = originalWidth;
        }, 10000);
        break;
      case 'multiball':
        const numBalls = this.balls.length;
        for (let i = 0; i < numBalls; i++) {
          const ball = this.balls[i];
          const newBall = new Ball(ball.x, ball.y, ball.radius, {
            x: ball.velocity.x * -1,
            y: ball.velocity.y
          });
          this.balls.push(newBall);
        }
        break;
      case 'slowBall':
        this.balls.forEach(ball => {
          ball.velocity.x *= 0.7;
          ball.velocity.y *= 0.7;
        });
        break;
      case 'fastBall':
        this.balls.forEach(ball => {
          ball.velocity.x *= 1.3;
          ball.velocity.y *= 1.3;
        });
        break;
    }
  }

  private update(deltaTime: number) {
    if (!this.isRunning) return;

    this.updatePaddlePosition();
    
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.update(deltaTime);
      
      if (ball.y > this.canvas.height) {
        this.balls.splice(i, 1);
        
        if (this.balls.length === 0) {
          this.callbacks.onLifeLost();
          this.paddle.x = this.lastPaddleX;
          this.resetBall();
        }
        continue;
      }
      
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
        ball.velocity.x = -ball.velocity.x;
        this.particleSystem.createCollisionParticles(
          ball.x,
          ball.y,
          ball.velocity.x > 0 ? 'left' : 'right',
          '#ffffff'
        );
      }
      
      if (ball.y - ball.radius < 0) {
        ball.velocity.y = -ball.velocity.y;
        this.particleSystem.createCollisionParticles(
          ball.x,
          ball.y,
          'top',
          '#ffffff'
        );
      }
      
      if (
        ball.y + ball.radius > this.paddle.y &&
        ball.y - ball.radius < this.paddle.y + this.paddle.height &&
        ball.x > this.paddle.x &&
        ball.x < this.paddle.x + this.paddle.width
      ) {
        const hitPosition = (ball.x - this.paddle.x) / this.paddle.width;
        const angleRange = Math.PI / 3;
        const angle = angleRange * (hitPosition - 0.5);
        
        const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
        ball.velocity.x = Math.sin(angle) * speed;
        ball.velocity.y = -Math.cos(angle) * speed;
        
        this.particleSystem.createCollisionParticles(
          ball.x,
          this.paddle.y,
          'bottom',
          '#ffcc00'
        );
      }
      
      for (let j = this.blocks.length - 1; j >= 0; j--) {
        const block = this.blocks[j];
        const collision = checkCollision(ball, block);
        
        if (collision.collided) {
          if (collision.direction === 'left' || collision.direction === 'right') {
            ball.velocity.x = -ball.velocity.x;
          } else {
            ball.velocity.y = -ball.velocity.y;
          }
          
          this.particleSystem.createBlockDestroyParticles(
            block.x + block.width / 2,
            block.y + block.height / 2,
            block.getColor()
          );
          
          this.score += block.points;
          this.callbacks.onScoreChange(this.score);
          
          if (Math.random() < 0.2) {
            this.spawnPowerUp(block.x + block.width / 2, block.y + block.height / 2);
          }
          
          this.blocks.splice(j, 1);
          
          if (this.blocks.length === 0) {
            this.callbacks.onLevelComplete();
          }
          
          break;
        }
      }
    }
    
    this.updatePowerUps(deltaTime);
    this.particleSystem.update(deltaTime);
  }

  private render() {
    if (!this.isRunning) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.blocks.forEach(block => block.render(this.ctx));
    this.paddle.render(this.ctx);
    this.balls.forEach(ball => ball.render(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
    this.particleSystem.render(this.ctx);
  }

  private gameLoop(timestamp: number) {
    if (!this.isRunning) return;

    const deltaTime = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = 0;
    this.gameLoop(0);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.balls = [];
    this.blocks = [];
    this.powerUps = [];
    this.score = 0;
  }

  public pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public resume() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = 0;
    this.gameLoop(0);
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.paddle.y = height - 30;
    this.paddle.x = Math.min(this.lastPaddleX, width - this.paddle.width);
    
    this.blocks = [];
    this.initializeLevel();
  }
}