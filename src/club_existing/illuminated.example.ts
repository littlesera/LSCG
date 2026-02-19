/**
 * Usage examples for the illuminated.js TypeScript wrapper
 * This file demonstrates how to use the lighting library with type safety
 */

import { 
  Vec2, 
  Lamp, 
  DiscObject, 
  RectangleObject, 
  PolygonObject,
  LineObject,
  Lighting, 
  DarkMask 
} from "./illuminated-wrapper";

// Example 1: Creating a simple lamp
export function createSimpleLamp() {
  const lamp = new Lamp({
    position: new Vec2(100, 100),
    distance: 200,
    diffuse: 0.8,
    color: 'rgba(250,220,150,0.8)',
    radius: 10,
    samples: 2
  });
  
  return lamp;
}

// Example 2: Creating opaque objects that cast shadows
export function createOpaqueObjects() {
  // Circular object
  const disc = new DiscObject({
    center: new Vec2(200, 200),
    radius: 30,
    diffuse: 0.8
  });

  // Rectangular object
  const rect = new RectangleObject({
    topleft: new Vec2(50, 50),
    bottomright: new Vec2(150, 100),
    diffuse: 0.9
  });

  // Polygon object
  const polygon = new PolygonObject({
    points: [
      new Vec2(300, 300),
      new Vec2(350, 300),
      new Vec2(350, 350),
      new Vec2(325, 375),
      new Vec2(300, 350)
    ],
    diffuse: 0.8
  });

  // Line object (wall)
  const line = new LineObject({
    a: new Vec2(400, 100),
    b: new Vec2(400, 400),
    diffuse: 0.9
  });

  return { disc, rect, polygon, line };
}

// Example 3: Creating a lighting scene
export function createLightingScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Create light source
  const lamp = new Lamp({
    position: new Vec2(250, 250),
    distance: 300,
    diffuse: 0.8,
    color: 'rgba(250,220,150,0.9)',
    radius: 5,
    samples: 2
  });

  // Create obstacles
  const objects = [
    new DiscObject({
      center: new Vec2(200, 200),
      radius: 40
    }),
    new RectangleObject({
      topleft: new Vec2(350, 150),
      bottomright: new Vec2(450, 250)
    })
  ];

  // Create lighting with shadows
  const lighting = new Lighting({
    light: lamp,
    objects: objects
  });

  // Compute and render
  lighting.compute(canvas.width, canvas.height);
  lighting.render(ctx);

  return lighting;
}

// Example 4: Creating a dark mask with multiple lights
export function createDarkMaskScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Create multiple light sources
  const lights = [
    new Lamp({
      position: new Vec2(100, 100),
      distance: 150,
      color: 'rgba(255,200,100,0.8)'
    }),
    new Lamp({
      position: new Vec2(400, 300),
      distance: 200,
      color: 'rgba(100,200,255,0.8)'
    })
  ];

  // Create dark mask
  const darkMask = new DarkMask({
    lights: lights,
    color: 'rgba(0,0,0,0.9)'
  });

  // Compute and render
  darkMask.compute(canvas.width, canvas.height);
  darkMask.render(ctx);

  return darkMask;
}

// Example 5: Animated lighting (for game loop)
export function animateLighting(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Create animated lamp
  const lamp = new Lamp({
    position: new Vec2(250, 250),
    distance: 200,
    color: 'rgba(250,220,150,0.8)',
    radius: 10,
    samples: 3
  });

  // Create static obstacles
  const objects = [
    new DiscObject({ center: new Vec2(200, 200), radius: 30 }),
    new RectangleObject({ 
      topleft: new Vec2(350, 150), 
      bottomright: new Vec2(450, 250) 
    })
  ];

  const lighting = new Lighting({ light: lamp, objects });

  // Animation loop
  let angle = 0;
  function animate() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update lamp position in a circular pattern
    lamp.position = new Vec2(
      250 + Math.cos(angle) * 100,
      250 + Math.sin(angle) * 100
    );
    angle += 0.02;

    // Re-compute and render
    lighting.compute(canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw lighting
    lighting.render(ctx);

    requestAnimationFrame(animate);
  }

  animate();
}

// Example 6: Using Vec2 utilities
export function vec2Examples() {
  const v1 = new Vec2(10, 20);
  const v2 = new Vec2(5, 15);

  // Vector operations
  const sum = v1.add(v2);        // Vector addition
  const diff = v1.sub(v2);       // Vector subtraction
  const scaled = v1.mul(2);      // Scalar multiplication
  const inverse = v1.inv();      // Inverse
  const normalized = v1.normalize(); // Normalized vector
  
  // Vector properties
  const dot = v1.dot(v2);        // Dot product
  const lengthSquared = v1.length2(); // Length squared
  const distance = v1.dist2(v2); // Distance squared
  
  // Bounds checking
  const topleft = new Vec2(0, 0);
  const bottomright = new Vec2(100, 100);
  const inBounds = v1.inBound(topleft, bottomright);

  return { sum, diff, scaled, inverse, normalized, dot, lengthSquared, distance, inBounds };
}
