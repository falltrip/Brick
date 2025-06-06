interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  lifetime: number;
  maxLifetime: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  update(deltaTime: number) {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Apply gravity
      particle.velocity.y += particle.gravity * deltaTime;
      
      // Update position
      particle.x += particle.velocity.x * deltaTime * 60;
      particle.y += particle.velocity.y * deltaTime * 60;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime;
      
      // Update lifetime
      particle.lifetime -= deltaTime;
      
      // Remove dead particles
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    for (const particle of this.particles) {
      // Calculate alpha based on remaining lifetime
      const alpha = particle.lifetime / particle.maxLifetime;
      
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Draw particle
      ctx.fillStyle = this.adjustAlpha(particle.color, alpha);
      
      // Different particle shapes
      if (Math.random() < 0.3) {
        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (Math.random() < 0.7) {
        // Square
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      } else {
        // Star
        this.drawStar(ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    ctx.restore();
  }

  createCollisionParticles(x: number, y: number, direction: 'top' | 'right' | 'bottom' | 'left', color: string) {
    const count = 10;
    const baseVelocity = 3;
    
    for (let i = 0; i < count; i++) {
      let velocityX, velocityY;
      
      switch (direction) {
        case 'top':
          velocityX = (Math.random() - 0.5) * baseVelocity;
          velocityY = Math.random() * baseVelocity;
          break;
        case 'right':
          velocityX = -Math.random() * baseVelocity;
          velocityY = (Math.random() - 0.5) * baseVelocity;
          break;
        case 'bottom':
          velocityX = (Math.random() - 0.5) * baseVelocity;
          velocityY = -Math.random() * baseVelocity;
          break;
        case 'left':
          velocityX = Math.random() * baseVelocity;
          velocityY = (Math.random() - 0.5) * baseVelocity;
          break;
      }
      
      this.particles.push({
        x,
        y,
        size: Math.random() * 4 + 2,
        color,
        velocity: { x: velocityX, y: velocityY },
        lifetime: Math.random() * 0.5 + 0.2,
        maxLifetime: Math.random() * 0.5 + 0.2,
        gravity: 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
  }

  createBlockDestroyParticles(x: number, y: number, color: string) {
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 6 + 3,
        color,
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        },
        lifetime: Math.random() * 0.8 + 0.4,
        maxLifetime: Math.random() * 0.8 + 0.4,
        gravity: 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 4
      });
    }
    
    // Add some sparkles
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 3 + 1,
        color: '#ffffff',
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        },
        lifetime: Math.random() * 0.6 + 0.2,
        maxLifetime: Math.random() * 0.6 + 0.2,
        gravity: 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 6
      });
    }
  }

  createPowerUpParticles(x: number, y: number, color: string) {
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = Math.random() * 5 + 5;
      
      this.particles.push({
        x,
        y,
        size: Math.random() * 5 + 2,
        color,
        velocity: {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        },
        lifetime: Math.random() * 0.7 + 0.3,
        maxLifetime: Math.random() * 0.7 + 0.3,
        gravity: -0.05, // Slight anti-gravity for power-up particles
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3
      });
    }
    
    // Add some stars
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 8 + 2;
      
      this.particles.push({
        x,
        y,
        size: Math.random() * 6 + 3,
        color: '#ffff00',
        velocity: {
          x: Math.cos(angle) * distance * 0.5,
          y: Math.sin(angle) * distance * 0.5 - 2 // Upward bias
        },
        lifetime: Math.random() * 1 + 0.5,
        maxLifetime: Math.random() * 1 + 0.5,
        gravity: 0.05,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
  }

  private adjustAlpha(color: string, alpha: number): string {
    // For hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // For rgb/rgba colors
    if (color.startsWith('rgb')) {
      if (color.startsWith('rgba')) {
        // Replace the alpha value
        return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, `rgba($1, $2, $3, ${alpha})`);
      } else {
        // Convert rgb to rgba
        return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${alpha})`);
      }
    }
    
    // For named colors or other formats, convert to rgba
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Convert computed rgb to rgba
    return computedColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${alpha})`);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}