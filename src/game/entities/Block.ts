import { Entity } from './Entity';

export class Block extends Entity {
  width: number;
  height: number;
  type: number;
  points: number;
  faces: Array<{
    eyeType: 'normal' | 'happy' | 'sleepy';
    mouthType: 'smile' | 'open' | 'neutral';
  }>;
  currentFace: number;
  blink: { isBlinking: boolean; timer: number };

  constructor(x: number, y: number, width: number, height: number, type: number) {
    super(x, y);
    this.width = width;
    this.height = height;
    this.type = type;
    
    // Points based on block type
    this.points = type * 10;
    
    // Create face variations
    this.faces = [
      { eyeType: 'normal', mouthType: 'smile' },
      { eyeType: 'happy', mouthType: 'smile' },
      { eyeType: 'normal', mouthType: 'open' },
      { eyeType: 'sleepy', mouthType: 'neutral' }
    ];
    
    // Randomly select a face
    this.currentFace = Math.floor(Math.random() * this.faces.length);
    
    // Blinking state
    this.blink = {
      isBlinking: false,
      timer: Math.random() * 5 + 2
    };
  }

  getColor(): string {
    // Colors based on block type
    switch (this.type) {
      case 1: return '#ff6b6b'; // Red
      case 2: return '#48dbfb'; // Blue
      case 3: return '#1dd1a1'; // Green
      case 4: return '#feca57'; // Yellow
      case 5: return '#c8d6e5'; // White
      default: return '#ff9ff3'; // Pink
    }
  }

  update(deltaTime: number) {
    // Update blink timer
    this.blink.timer -= deltaTime;
    
    if (this.blink.timer <= 0) {
      this.blink.isBlinking = !this.blink.isBlinking;
      this.blink.timer = this.blink.isBlinking ? 0.2 : (Math.random() * 5 + 2);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Draw block shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);
    
    // Draw block body
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    const color = this.getColor();
    const darkerColor = this.getDarkerColor(color, 0.2);
    
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, darkerColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.fill();
    
    // Draw block border
    ctx.strokeStyle = this.getDarkerColor(color, 0.3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.stroke();
    
    // Draw block shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.roundRect(this.x + 4, this.y + 2, this.width - 8, this.height / 3, 3);
    ctx.fill();
    
    // Draw face
    this.drawFace(ctx);
  }

  private drawFace(ctx: CanvasRenderingContext2D) {
    const face = this.faces[this.currentFace];
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const eyeDistance = this.width * 0.2;
    
    // Draw eyes
    switch (face.eyeType) {
      case 'normal':
        // Left eye
        if (!this.blink.isBlinking) {
          ctx.beginPath();
          ctx.arc(centerX - eyeDistance, centerY - 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#333";
          ctx.fill();
          
          // Right eye
          ctx.beginPath();
          ctx.arc(centerX + eyeDistance, centerY - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Blinking
          ctx.beginPath();
          ctx.moveTo(centerX - eyeDistance - 3, centerY - 2);
          ctx.lineTo(centerX - eyeDistance + 3, centerY - 2);
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(centerX + eyeDistance - 3, centerY - 2);
          ctx.lineTo(centerX + eyeDistance + 3, centerY - 2);
          ctx.stroke();
        }
        break;
        
      case 'happy':
        // Happy eyes (upside-down U)
        ctx.beginPath();
        ctx.arc(centerX - eyeDistance, centerY - 2, 3, Math.PI, Math.PI * 2);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX + eyeDistance, centerY - 2, 3, Math.PI, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'sleepy':
        // Sleepy eyes (half-closed)
        ctx.beginPath();
        ctx.arc(centerX - eyeDistance, centerY - 2, 3, 0.2 * Math.PI, 0.8 * Math.PI, true);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX + eyeDistance, centerY - 2, 3, 0.2 * Math.PI, 0.8 * Math.PI, true);
        ctx.stroke();
        break;
    }
    
    // Draw mouth
    switch (face.mouthType) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, 5, 0, Math.PI);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
        
      case 'open':
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#333";
        ctx.fill();
        break;
        
      case 'neutral':
        ctx.beginPath();
        ctx.moveTo(centerX - 4, centerY + 5);
        ctx.lineTo(centerX + 4, centerY + 5);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
    }
  }

  private getDarkerColor(color: string, amount: number): string {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Darken
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}