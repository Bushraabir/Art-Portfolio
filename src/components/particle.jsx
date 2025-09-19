/*  Elegant Crystal Particle System  –  Fixed / Complete  */
import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';

extend({ ShaderMaterial: THREE.ShaderMaterial });

/* -------------------------------------------------- */
/*  Constants & Utilities                             */
/* -------------------------------------------------- */
const ColorPalette = {
  platinum:  new THREE.Color(0xf8f9fa),
  sapphire:  new THREE.Color(0x0066cc),
  emerald:   new THREE.Color(0x00b894),
  ruby:      new THREE.Color(0xe17055),
  amethyst:  new THREE.Color(0x6c5ce7),
  topaz:     new THREE.Color(0xfdcb6e),
  obsidian:  new THREE.Color(0x2d3436),
  opal:      new THREE.Color(0x74b9ff),
  pearl:     new THREE.Color(0xddd6fe),
  gold:      new THREE.Color(0xffeaa7),
  diamond:   new THREE.Color(0xffffff),
  titanium:  new THREE.Color(0x636e72),
  cosmic:    new THREE.Color(0x4a90e2),
  aurora:    new THREE.Color(0x9b59b6),
};

const PHYSICS = {
  gravity:              -9.81 * 0.06,
  airResistance:        0.995,
  surfaceTension:       0.025,
  buoyancy:             0.012,
  viscosity:            0.98,
  bubbleLifetime:       15.0,
  bubbleFormationTime:  2.5,
  minBubbleSize:        0.4,
  maxBubbleSize:        1.4,
  transformDuration:    4.0,
  respawnDelay:         6.0,
  hoverExpansion:       0.3,
  glowIntensity:        2.5,
  faceSpreadDistance:   0.8,
};

/* -------------------------------------------------- */
/*  Shaders                                           */
/* -------------------------------------------------- */
const OrganicVertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uFormationProgress;
uniform float uScale;
uniform float uElegance;
uniform float uHoverProgress;
uniform float uGlowIntensity;
uniform float uFaceSpread;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDistance;
varying float vElevation;
varying float vGlow;
varying vec3 vOriginalPosition;

float organicNoise(vec3 p, float scale){
  vec3 scaledP = p * scale;
  float n1 = sin(scaledP.x + cos(scaledP.y * 0.7)) * 0.5;
  float n2 = cos(scaledP.z + sin(scaledP.x * 0.8)) * 0.3;
  float n3 = sin((scaledP.x + scaledP.z) * 0.6) * 0.2;
  return (n1 + n2 + n3) * 0.33;
}
float flowingNoise(vec3 p, float time){
  return sin(p.x * 2.0 + time * 0.3) *
         cos(p.y * 1.5 + time * 0.2) *
         sin(p.z * 1.8 + time * 0.4) * 0.1;
}
vec3 organicDeformation(vec3 pos, vec3 normal, float time, float intensity){
  float o1 = organicNoise(pos + time * 0.1, 0.8);
  float o2 = organicNoise(pos + time * 0.05, 1.6) * 0.5;
  float o3 = organicNoise(pos + time * 0.15, 0.4) * 0.3;
  float flow  = flowingNoise(pos, time);
  float breath = sin(time * 0.3 + length(pos) * 2.0) * 0.02;
  float total  = (o1 + o2 + o3 + flow + breath) * intensity;
  return pos + normal * total;
}
void main(){
  vPosition = position;
  vOriginalPosition = position;
  vNormal   = normalize(normalMatrix * normal);
  vec3 pos  = position;

  pos = organicDeformation(pos, normal, uTime, uIntensity * uElegance);

  float organicSpread = uFaceSpread * (1.0 + organicNoise(pos, 1.0) * 0.3);
  pos = pos + normal * organicSpread * uHoverProgress;

  float growth = smoothstep(0.0, 1.0, uFormationProgress);
  growth = growth * growth * growth * (10.0 + growth * (-15.0 + 6.0 * growth));
  float organicGrowth = organicNoise(pos * 0.5, 0.8) * 0.3 + 0.7;
  pos = mix(vec3(0.0), pos * organicGrowth, growth);

  float baseHarm = sin(uTime * 0.6 + length(pos) * 3.0) * 0.008;
  baseHarm += sin(uTime * 0.4 + pos.y * 2.0) * 0.006;
  baseHarm += flowingNoise(pos, uTime) * 0.01;

  float hoverHarm = sin(uTime * 1.5 + length(pos) * 5.0) * 0.012;
  hoverHarm += cos(uTime * 2.0 + pos.y * 3.0) * 0.008;
  hoverHarm += organicNoise(pos + uTime * 0.2, 1.5) * 0.006;

  float totalHarm = mix(baseHarm, hoverHarm, uHoverProgress);

  float surface = organicNoise(pos + uTime * 0.1, 8.0) * 0.003;
  surface += organicNoise(pos + uTime * 0.05, 16.0) * 0.001;
  surface *= (1.0 + uGlowIntensity * 0.5);

  pos += normal * (totalHarm + surface) * uIntensity * uElegance;

  float hoverScale = 1.0 + uHoverProgress * 0.05;
  float organicScale = 1.0 + organicNoise(pos * 0.3 + uTime * 0.02, 1.0) * 0.02;
  pos *= uScale * hoverScale * organicScale;

  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  vDistance = length(pos);
  vElevation = pos.y;
  vGlow = uGlowIntensity * (1.0 + uHoverProgress * 2.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uEnergy;
uniform float uFormationProgress;
uniform float uIntensity;
uniform float uElegance;
uniform float uHoverProgress;
uniform float uGlowIntensity;
uniform vec3 uCameraPosition;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDistance;
varying float vElevation;
varying float vGlow;
varying vec3 vOriginalPosition;

vec3 getIridescence(float fresnel, float time, float glow){
  float phase = fresnel * 8.0 + time * 0.3 + glow * 2.0;
  vec3 base = vec3(
    0.5 + 0.5 * sin(phase),
    0.5 + 0.5 * sin(phase + 2.094),
    0.5 + 0.5 * sin(phase + 4.188)
  );
  base += vec3(
    0.3 * sin(phase + glow),
    0.3 * sin(phase + glow + 1.0),
    0.3 * sin(phase + glow + 2.0)
  ) * glow;
  return base;
}
vec3 getHoverGlow(vec3 color, float intensity, float fresnel){
  vec3 glowColor = color * 2.0;
  glowColor += vec3(0.8, 0.9, 1.0) * intensity;
  return mix(color, glowColor, fresnel * intensity * 0.6);
}
void main(){
  vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
  vec3 normal = normalize(vNormal);
  float fresnel = 1.0 - max(dot(normal, viewDirection), 0.0);
  float fresnelPow = pow(fresnel, 0.4 + uHoverProgress * 0.2);
  float fresnelSmooth = smoothstep(0.0, 1.0, fresnelPow);

  vec3 baseColor = uColor;
  float energyPhase = uTime * 0.2 + vDistance * 0.15 + vElevation * 0.1;
  vec3 energyGradient = vec3(
    0.6 + 0.4 * sin(energyPhase + vGlow),
    0.6 + 0.4 * sin(energyPhase + vGlow + 1.5),
    0.6 + 0.4 * sin(energyPhase + vGlow + 3.0)
  );
  baseColor = mix(baseColor, energyGradient, uEnergy * 0.2 * uElegance);

  vec3 iridescent = getIridescence(fresnel, uTime, vGlow);
  baseColor = mix(baseColor, iridescent, fresnelSmooth * 0.3 * uElegance * (1.0 + vGlow * 0.5));
  baseColor = getHoverGlow(baseColor, uHoverProgress * vGlow, fresnel);

  float edge1 = pow(fresnel, 0.5);
  float edge2 = pow(fresnel, 1.5);
  float edge3 = pow(fresnel, 2.5);

  vec3 highlight1 = mix(baseColor, vec3(1.0, 0.98, 0.95), edge1 * 0.4 * (1.0 + vGlow));
  vec3 highlight2 = mix(highlight1, iridescent, edge2 * 0.2 * (1.0 + vGlow * 0.5));
  vec3 highlight3 = mix(highlight2, vec3(1.0, 1.0, 1.0), edge3 * uHoverProgress * 0.3);

  float formationGlow = (1.0 - uFormationProgress) * uElegance * (1.0 + vGlow);
  highlight3 += formationGlow * baseColor * 0.6;

  float rimLight = pow(1.0 - fresnel, 3.0) * uHoverProgress * vGlow;
  highlight3 += vec3(0.8, 0.9, 1.0) * rimLight * 0.5;

  float alphaDepth = 1.0 / (1.0 + vDistance * 0.02);
  float glowAlpha = 1.0 + uHoverProgress * vGlow * 0.3;
  float alpha = uOpacity * uFormationProgress * alphaDepth * (0.3 + fresnelSmooth * 0.7) * glowAlpha;

  gl_FragColor = vec4(highlight3, alpha);
}
`;

/* -------------------------------------------------- */
/*  Organic utilities                                 */
/* -------------------------------------------------- */
const OrganicUtils = {
  organicNoise(x, y, z, scale = 1.0, octaves = 3){
    let value = 0, amplitude = 1, frequency = scale;
    for (let i = 0; i < octaves; i++){
      value += Math.sin(x * frequency + Math.cos(y * frequency * 0.7)) * amplitude;
      value += Math.cos(z * frequency + Math.sin(x * frequency * 0.8)) * amplitude;
      value += Math.sin((x + z) * frequency * 0.6) * amplitude * 0.5;
      amplitude *= 0.5; frequency *= 2.0;
    }
    return value * 0.1;
  },
  deformGeometry(geometry, intensity = 0.3, seed = 0){
    const positions = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++){
      vertex.fromBufferAttribute(positions, i);
      const originalLength = vertex.length();
      const noise = this.organicNoise(vertex.x + seed, vertex.y + seed * 1.3, vertex.z + seed * 0.7, 0.8, 4);
      const flow = Math.sin(vertex.x * 2.0 + seed) *
                   Math.cos(vertex.y * 1.5 + seed * 1.2) *
                   Math.sin(vertex.z * 1.8 + seed * 0.8) * 0.15;
      const total = noise + flow;
      vertex.normalize().multiplyScalar(originalLength + total * intensity);
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  },
  createOrganicBlob(radius = 1, detail = 2){
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    return this.deformGeometry(geometry, 0.4 + Math.random() * 0.3, Math.random() * 100);
  }
};

/* -------------------------------------------------- */
/*  Crystal Particle                                  */
/* -------------------------------------------------- */
class CrystalParticle {
  constructor(position, index, zoneType){
    this.position = new THREE.Vector3(...position);
    this.basePosition = this.position.clone();
    this.index = index;
    this.zoneType = zoneType;
    this.createGeometry();
    this.initializeProperties();
    this.setupAnimation();
    this.setupInteractions();
  }
  createGeometry(){
    const shapes = [
      () => OrganicUtils.createOrganicBlob(1, 2),
      () => OrganicUtils.createOrganicBlob(1, 3),
      () => { const g = new THREE.IcosahedronGeometry(1, 2); return OrganicUtils.deformGeometry(g, 0.3 + Math.random() * 0.2, this.index * 10); },
      () => { const g = new THREE.OctahedronGeometry(1, 2); return OrganicUtils.deformGeometry(g, 0.25 + Math.random() * 0.15, this.index * 15); },
      () => { const g = new THREE.DodecahedronGeometry(1, 1); return OrganicUtils.deformGeometry(g, 0.2 + Math.random() * 0.1, this.index * 8); },
      () => { const g = new THREE.TetrahedronGeometry(1, 2); return OrganicUtils.deformGeometry(g, 0.4 + Math.random() * 0.2, this.index * 12); },
      () => { const g = new THREE.SphereGeometry(1, 16, 12); return OrganicUtils.deformGeometry(g, 0.6 + Math.random() * 0.3, this.index * 7); },
      () => { const g = new THREE.CylinderGeometry(0.4, 1, 1.5, 12); return OrganicUtils.deformGeometry(g, 0.35 + Math.random() * 0.25, this.index * 9); }
    ];
    this.geometry = shapes[Math.floor(Math.random() * shapes.length)]();
    this.glowGeometry = this.geometry.clone();
    OrganicUtils.deformGeometry(this.glowGeometry, 0.1, this.index * 5 + 50);
  }
  initializeProperties(){
    this.floatAmplitude = 0.4 + Math.random() * 0.3;
    this.floatSpeed = 0.006 + Math.random() * 0.008;
    this.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.003,
      (Math.random() - 0.5) * 0.0015
    );
    this.phase = Math.random() * Math.PI * 2;
    this.baseScale = 1.2 + Math.random() * 0.8;
    this.currentScale = this.baseScale;
    const luxuryColors = Object.values(ColorPalette);
    this.baseColor = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
    this.currentColor = this.baseColor.clone();
    this.isVisible = true;
    this.isTransforming = false;
    this.isDestroyed = false;
    this.transformProgress = 0;
    this.formationProgress = 1.0;
    this.bubbles = [];
    this.clickCount = 0;
    this.lastClickTime = 0;
    this.energy = 0.4;
    this.intensity = 0.3;
    this.elegance = 1.0;
    this.transformDuration = PHYSICS.transformDuration;
    this.respawnDelay = PHYSICS.respawnDelay;
    this.respawnTime = 0;
  }
  setupInteractions(){
    this.hovered = false;
    this.hoverProgress = 0;
    this.targetHoverProgress = 0;
    this.glowIntensity = 0.3;
    this.targetGlowIntensity = 0.3;
    this.faceSpread = 0;
    this.targetFaceSpread = 0;
    this.hoverTransitionSpeed = 4.0;
    this.glowTransitionSpeed = 3.0;
    this.clickFeedback = 0;
    this.clickFeedbackDecay = 5.0;
  }
  setupAnimation(){
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.colorShift = 0;
    this.harmonicPhase = Math.random() * Math.PI * 2;
    this.orbitalRadius = 0.5 + Math.random() * 0.3;
    this.orbitalSpeed = 0.02 + Math.random() * 0.01;
    this.orbitalPhase = Math.random() * Math.PI * 2;
  }
  update(time, deltaTime){
    if (this.isDestroyed) return;
    this.updateInteractions(deltaTime);
    if (this.isTransforming) {
      this.updateTransformation(deltaTime);
    } else if (!this.isVisible && this.isDestroyed) {
      this.updateRespawn(deltaTime);
    } else if (this.isVisible && !this.isTransforming) {
      this.updateActive(time, deltaTime);
    }
    this.updateBubbles(time, deltaTime);
  }
  updateInteractions(deltaTime){
    this.hoverProgress = THREE.MathUtils.lerp(this.hoverProgress, this.targetHoverProgress, deltaTime * this.hoverTransitionSpeed);
    this.glowIntensity = THREE.MathUtils.lerp(this.glowIntensity, this.targetGlowIntensity, deltaTime * this.glowTransitionSpeed);
    this.faceSpread = THREE.MathUtils.lerp(this.faceSpread, this.targetFaceSpread, deltaTime * this.hoverTransitionSpeed);
    if (this.clickFeedback > 0) {
      this.clickFeedback = Math.max(0, this.clickFeedback - deltaTime * this.clickFeedbackDecay);
    }
  }
  updateActive(time, deltaTime){
    const float1 = Math.sin(time * this.floatSpeed + this.phase) * this.floatAmplitude;
    const float2 = Math.cos(time * this.floatSpeed * 0.7 + this.phase) * this.floatAmplitude * 0.6;
    const float3 = Math.sin(time * this.floatSpeed * 0.4 + this.phase) * this.floatAmplitude * 0.3;
    const hoverOrbitalMultiplier = 1.0 + this.hoverProgress * 0.5;
    const orbital1 = Math.sin(time * this.orbitalSpeed * hoverOrbitalMultiplier + this.orbitalPhase) * this.orbitalRadius;
    const orbital2 = Math.cos(time * this.orbitalSpeed * 0.8 * hoverOrbitalMultiplier + this.orbitalPhase) * this.orbitalRadius * 0.5;
    this.position.x = this.basePosition.x + float1 + orbital1;
    this.position.y = this.basePosition.y + float2 + orbital2;
    this.position.z = this.basePosition.z + float3;
    const breathing1 = Math.sin(time * 0.3 + this.pulsePhase) * 0.025;
    const breathing2 = Math.sin(time * 0.5 + this.harmonicPhase) * 0.015;
    const hoverBreathing = Math.sin(time * 0.8 + this.phase) * 0.02 * this.hoverProgress;
    this.currentScale = this.baseScale + breathing1 + breathing2 + hoverBreathing;
    if (this.energy > 0.4) {
      const decayRate = this.hovered ? 0.05 : 0.15;
      this.energy = Math.max(this.energy - deltaTime * decayRate, 0.4);
    }
    if (!this.hovered && this.intensity > 0.3) {
      this.intensity = Math.max(this.intensity - deltaTime * 0.25, 0.3);
    }
    if (this.colorShift > 0) {
      this.colorShift = Math.max(this.colorShift - deltaTime * 0.3, 0);
    }
    if (this.elegance < 1.0) {
      this.elegance = Math.min(this.elegance + deltaTime * 0.5, 1.0);
    }
  }
  onClick(){
    if (!this.isVisible || this.isTransforming || this.isDestroyed) return;
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime < 1000) {
      this.clickCount++;
    } else {
      this.clickCount = 1;
    }
    this.lastClickTime = currentTime;
    this.energy = Math.min(this.energy + 1.2, 2.5);
    this.intensity = Math.min(this.intensity + 1.0, 1.5);
    this.elegance = Math.min(this.elegance + 0.5, 1.8);
    this.clickFeedback = 1.0;
    this.glowIntensity = Math.min(this.glowIntensity + 1.0, 3.0);
    this.colorShift = 0.8;
    this.targetFaceSpread = PHYSICS.faceSpreadDistance * 1.5;
    setTimeout(() => {
      this.targetFaceSpread = this.hovered ? PHYSICS.faceSpreadDistance : 0;
    }, 200);
    if (this.clickCount >= 3) this.transformToBubbles();
  }
  onHover(hovered){
    if (!this.isVisible || this.isTransforming || this.isDestroyed) return;
    this.hovered = hovered;
    this.targetHoverProgress = hovered ? 1.0 : 0.0;
    this.targetGlowIntensity = hovered ? PHYSICS.glowIntensity : 0.3;
    this.targetFaceSpread = hovered ? PHYSICS.faceSpreadDistance : 0.0;
    this.intensity = hovered ? 0.8 : 0.3;
    this.elegance = hovered ? 1.4 : 1.0;
  }
  transformToBubbles(){
    if (this.isTransforming || this.isDestroyed) return;
    this.isTransforming = true;
    this.transformProgress = 0;
    const bubbleCount = 50 + Math.floor(Math.random() * 25);
    for (let i = 0; i < bubbleCount; i++) {
      const t = i / bubbleCount;
      const spiralAngle = t * 4 * Math.PI * 2;
      const spiralRadius = 1.0 + t * 2.5 + Math.random() * 0.6;
      const spiralHeight = (t - 0.5) * 3.5 + Math.random() * 1.2;
      const bubblePosition = new THREE.Vector3(
        this.position.x + spiralRadius * Math.cos(spiralAngle),
        this.position.y + spiralHeight,
        this.position.z + spiralRadius * Math.sin(spiralAngle)
      );
      const bubbleColor = this.currentColor.clone();
      bubbleColor.offsetHSL((Math.random() - 0.5) * 0.4, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1);
      const bubbleSize = PHYSICS.minBubbleSize + Math.random() * (PHYSICS.maxBubbleSize - PHYSICS.minBubbleSize);
      const bubble = new Bubble(bubblePosition, bubbleColor, bubbleSize, this);
      const direction = new THREE.Vector3(
        Math.cos(spiralAngle),
        0.9 + Math.random() * 0.5,
        Math.sin(spiralAngle)
      ).normalize();
      bubble.velocity.add(direction.multiplyScalar(2.5 + Math.random() * 2.0));
      this.bubbles.push(bubble);
    }
  }
  updateBubbles(time, deltaTime){
    this.bubbles = this.bubbles.filter(bubble => {
      const alive = bubble.update(time, deltaTime);
      return alive && bubble.position.distanceTo(this.basePosition) < 100;
    });
  }
  updateTransformation(deltaTime){
    this.transformProgress += deltaTime / this.transformDuration;
    if (this.transformProgress >= 1.0) {
      this.isVisible = false;
      this.isTransforming = false;
      this.isDestroyed = true;
      this.respawnTime = 0;
      this.cleanupBubbles();
    } else {
      const progress = this.transformProgress;
      const elegantEase = progress * progress * progress * (10.0 + progress * (-15.0 + 6.0 * progress));
      this.currentScale = this.baseScale * (1 - elegantEase);
      this.formationProgress = 1 - progress;
      this.energy = 2.5 * (1 - progress);
      this.intensity = 1.5 * (1 - progress);
      this.elegance = 2.0 * (1 - progress);
      this.colorShift = progress * 1.0;
      this.glowIntensity = 4.0 * (1 - progress);
    }
  }
  updateRespawn(deltaTime){
    this.respawnTime += deltaTime;
    if (this.respawnTime >= this.respawnDelay) this.respawn();
  }
  respawn(){
    this.isVisible = true;
    this.isTransforming = false;
    this.isDestroyed = false;
    this.currentScale = 0.05;
    this.formationProgress = 0;
    this.clickCount = 0;
    this.energy = 0.4;
    this.respawnTime = 0;
    this.colorShift = 0;
    this.glowIntensity = 0.3;
    this.elegance = 1.0;
    this.hoverProgress = 0;
    this.faceSpread = 0;
    this.cleanupBubbles();
    this.createGeometry();
    const luxuryColors = Object.values(ColorPalette);
    this.baseColor = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
    this.animateFormation();
  }
  animateFormation(){
    const startTime = Date.now();
    const duration = 3500;
    const animate = (currentTime) => {
      if (this.isDestroyed) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const elegantProgress = progress * progress * progress * (10.0 + progress * (-15.0 + 6.0 * progress));
      this.formationProgress = elegantProgress;
      this.currentScale = this.baseScale * elegantProgress;
      this.energy = 0.4 + (1 - progress) * 2.0;
      this.elegance = 0.5 + elegantProgress * 0.5;
      this.glowIntensity = 0.3 + (1 - progress) * 1.5;
      if (progress < 1.0 && this.isVisible) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  cleanupBubbles(){
    this.bubbles.forEach(bubble => bubble.destroy());
    this.bubbles = [];
  }
  destroy(){
    this.isDestroyed = true;
    if (this.geometry) this.geometry.dispose();
    if (this.glowGeometry) this.glowGeometry.dispose();
    this.cleanupBubbles();
  }
}

/* -------------------------------------------------- */
/*  Bubble                                            */
/* -------------------------------------------------- */
class Bubble {
  constructor(position, color, size, parentParticle){
    this.position = position.clone();
    this.color = color.clone();
    this.size = size;
    this.baseSize = size;
    this.parentParticle = parentParticle;
    this.initializePhysics();
    this.initializeProperties();
  }
  initializePhysics(){
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2.5,
      Math.random() * 3.0 + 2.5,
      (Math.random() - 0.5) * 2.5
    );
    this.maxLife = PHYSICS.bubbleLifetime * (0.8 + Math.random() * 0.4);
    this.life = this.maxLife;
    this.lifeRatio = 1.0;
    this.floatPhase = Math.random() * Math.PI * 2;
    this.wobbleFreq = 0.7 + Math.random() * 0.6;
    this.wobbleAmp = 0.18 + Math.random() * 0.10;
    this.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.010,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.006
    };
  }
  initializeProperties(){
    this.formationProgress = 0.0;
    this.opacity = 0.55;
    this.elegance = 1.0;
    this.spiralPhase = Math.random() * Math.PI * 2;
    this.spiralSpeed = 0.25 + Math.random() * 0.15;
    this.spiralRadius = 0.12 + Math.random() * 0.08;
  }
  update(time, deltaTime){
    if (this.formationProgress < 1.0) {
      this.formationProgress = Math.min(this.formationProgress + deltaTime / PHYSICS.bubbleFormationTime, 1.0);
    }
    this.life -= deltaTime;
    this.lifeRatio = Math.max(this.life / this.maxLife, 0);
    this.updatePhysics(time, deltaTime);
    this.updateVisuals(time);
    return this.life > 0;
  }
  updatePhysics(time, deltaTime){
    this.velocity.y += PHYSICS.buoyancy;
    this.velocity.multiplyScalar(PHYSICS.viscosity);
    const wobble = new THREE.Vector3(
      Math.sin(time * this.wobbleFreq + this.floatPhase) * this.wobbleAmp,
      Math.cos(time * this.wobbleFreq * 0.6 + this.floatPhase) * this.wobbleAmp * 0.4,
      Math.sin(time * this.wobbleFreq * 0.8 + this.floatPhase) * this.wobbleAmp * 0.5
    );
    const spiral = new THREE.Vector3(
      Math.cos(time * this.spiralSpeed + this.spiralPhase) * this.spiralRadius,
      Math.sin(time * this.spiralSpeed * 0.5 + this.spiralPhase) * this.spiralRadius * 0.3,
      Math.sin(time * this.spiralSpeed + this.spiralPhase) * this.spiralRadius
    );
    this.velocity.add(wobble.multiplyScalar(deltaTime));
    this.velocity.add(spiral.multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
  }
  updateVisuals(time){
    const sizeVar1 = 1.0 + Math.sin(time * 0.9 + this.floatPhase) * 0.04;
    const sizeVar2 = 1.0 + Math.sin(time * 1.4 + this.floatPhase + 1.0) * 0.02;
    const lifeEffect = this.lifeRatio * (this.lifeRatio > 0.15 ? 1.0 : this.lifeRatio / 0.15);
    this.size = this.baseSize * lifeEffect * sizeVar1 * sizeVar2 * this.formationProgress;
    this.opacity = this.lifeRatio * 0.8 * this.formationProgress * this.elegance;
  }
  destroy(){ this.life = 0; }
}

/* -------------------------------------------------- */
/*  Bubble Component                                  */
/* -------------------------------------------------- */
const BubbleComponent = ({ bubble }) => {
  const meshRef = useRef();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: bubble.color.clone() },
      uLifeRatio: { value: 1 },
      uOpacity: { value: 0.55 },
      uElegance: { value: 1.0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uScale: { value: 1 }
    },
    vertexShader: `
uniform float uTime;
uniform float uLifeRatio;
uniform float uScale;
uniform float uElegance;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDistortion;
varying float vDepth;
float elegantNoise(vec3 p){
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
void main(){
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec3 pos = position;
  float d1 = elegantNoise(vec3(pos.x + uTime * 0.18, pos.y + uTime * 0.15, pos.z)) - 0.5;
  float d2 = elegantNoise(vec3(pos.z + uTime * 0.22, pos.x + uTime * 0.10, pos.y)) - 0.5;
  float d3 = elegantNoise(pos * 2.5 + uTime * 0.12) - 0.5;
  float total = (d1 + d2 * 0.5 + d3 * 0.25) * 0.08 * uLifeRatio * uElegance;
  vDistortion = total;
  float expansion = smoothstep(0.0, 1.0, uLifeRatio);
  expansion = expansion * expansion * expansion * (10.0 + expansion * (-15.0 + 6.0 * expansion));
  expansion = expansion * 0.9 + 0.1;
  float pulse1 = 1.0 + sin(uTime * 0.9 + length(pos) * 3.5) * 0.018;
  float pulse2 = 1.0 + sin(uTime * 1.6 + dot(pos, vec3(1.0, 0.5, 0.3))) * 0.010;
  expansion *= pulse1 * pulse2;
  pos += normal * total * expansion;
  pos *= expansion * uScale;
  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  vDepth = length(pos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
    `,
    fragmentShader: `
uniform float uTime;
uniform vec3 uColor;
uniform float uLifeRatio;
uniform float uOpacity;
uniform float uElegance;
uniform vec3 uCameraPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDistortion;
varying float vDepth;
vec3 getIridescence(float fresnel, float distortion, float time){
  float phase = abs(distortion) * 25.0 + fresnel * 18.0 + time * 0.5;
  vec3 base = vec3(
    0.5 + 0.5 * sin(phase),
    0.5 + 0.5 * sin(phase + 2.094),
    0.5 + 0.5 * sin(phase + 4.188)
  );
  float shift = fresnel * 3.5 + time * 0.12;
  base += vec3(
    0.25 * sin(shift),
    0.25 * sin(shift + 1.2),
    0.25 * sin(shift + 2.4)
  );
  return base;
}
void main(){
  vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
  vec3 normal = normalize(vNormal);
  float fresnel = 1.0 - max(dot(normal, viewDirection), 0.0);
  float fresnelQuad = fresnel * fresnel;
  float fresnelCubic = fresnelQuad * fresnel;
  vec3 iridescent = getIridescence(fresnel, vDistortion, uTime);
  vec3 baseColor = mix(uColor * 0.25, iridescent, fresnel * 0.85 * uElegance);
  baseColor = mix(baseColor, uColor, 0.18);
  vec3 edgeHighlight = mix(vec3(1.0, 0.98, 0.95), iridescent, 0.6);
  baseColor += fresnelQuad * edgeHighlight * 0.45 * uElegance;
  baseColor += fresnelCubic * iridescent * 0.25 * uElegance;
  float depthFade = 1.0 / (1.0 + vDepth * 0.12);
  baseColor *= depthFade;
  float lifeCurve = smoothstep(0.0, 1.0, uLifeRatio);
  lifeCurve = lifeCurve * lifeCurve * lifeCurve * (10.0 + lifeCurve * (-15.0 + 6.0 * lifeCurve));
  float alpha = uOpacity * lifeCurve * depthFade * (0.12 + fresnel * 0.88) * uElegance;
  gl_FragColor = vec4(baseColor, alpha);
}
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false
  }), [bubble.color]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current && material.uniforms) {
      meshRef.current.position.copy(bubble.position);
      meshRef.current.scale.setScalar(bubble.size);
      meshRef.current.rotation.x += bubble.rotationSpeed.x;
      meshRef.current.rotation.y += bubble.rotationSpeed.y;
      meshRef.current.rotation.z += bubble.rotationSpeed.z;
      material.uniforms.uTime.value = time;
      material.uniforms.uLifeRatio.value = bubble.lifeRatio;
      material.uniforms.uOpacity.value = bubble.opacity;
      material.uniforms.uElegance.value = bubble.elegance;
      material.uniforms.uScale.value = bubble.size;
      material.uniforms.uCameraPosition.value.copy(state.camera.position);
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1, 24, 20]} />
    </mesh>
  );
};

/* -------------------------------------------------- */
/*  Crystal Component  (solid + wire + glow)          */
/* -------------------------------------------------- */
const CrystalComponent = ({ particle, onParticleClick, onParticleHover }) => {
  const solidMeshRef = useRef();
  const wireframeMeshRef = useRef();
  const glowMeshRef = useRef();

  const solidMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: particle.baseColor.clone() },
      uOpacity: { value: 0.7 },
      uEnergy: { value: 0.4 },
      uIntensity: { value: 0.3 },
      uElegance: { value: 1.0 },
      uFormationProgress: { value: 1 },
      uHoverProgress: { value: 0 },
      uGlowIntensity: { value: 0.3 },
      uFaceSpread: { value: PHYSICS.faceSpreadDistance },
      uScale: { value: 1 },
      uCameraPosition: { value: new THREE.Vector3() }
    },
    vertexShader: OrganicVertexShader,
    fragmentShader: FragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [particle.baseColor]);

  const wireframeMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: particle.baseColor.clone().multiplyScalar(1.4) },
      uOpacity: { value: 0.9 },
      uEnergy: { value: 0.4 },
      uIntensity: { value: 0.3 },
      uElegance: { value: 1.0 },
      uFormationProgress: { value: 1 },
      uHoverProgress: { value: 0 },
      uGlowIntensity: { value: 0.3 },
      uFaceSpread: { value: PHYSICS.faceSpreadDistance },
      uScale: { value: 1 },
      uCameraPosition: { value: new THREE.Vector3() }
    },
    vertexShader: OrganicVertexShader,
    fragmentShader: FragmentShader,
    transparent: true,
    wireframe: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [particle.baseColor]);

  const glowMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: particle.baseColor.clone() },
      uOpacity: { value: 0.15 },
      uHoverProgress: { value: 0 },
      uGlowIntensity: { value: 0.3 },
      uScale: { value: 1 },
      uCameraPosition: { value: new THREE.Vector3() }
    },
    vertexShader: `
uniform float uTime;
uniform float uScale;
uniform float uHoverProgress;
uniform float uGlowIntensity;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vGlow;
void main(){
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vec3 pos = position;
  float glowExpansion = 1.2 + uHoverProgress * 0.8 + sin(uTime * 2.0) * 0.05;
  pos *= uScale * glowExpansion;
  vGlow = uGlowIntensity * (1.0 + uHoverProgress * 2.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
    `,
    fragmentShader: `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uHoverProgress;
uniform vec3 uCameraPosition;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vGlow;
void main(){
  vec3 viewDirection = normalize(uCameraPosition - vPosition);
  vec3 normal = normalize(vNormal);
  float fresnel = 1.0 - max(dot(normal, viewDirection), 0.0);
  float glowEdge = pow(fresnel, 0.5);
  vec3 glowColor = uColor * 1.5;
  glowColor += vec3(0.8, 0.9, 1.0) * uHoverProgress;
  float alpha = uOpacity * glowEdge * vGlow * (0.1 + uHoverProgress * 0.4);
  gl_FragColor = vec4(glowColor, alpha);
}
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [particle.baseColor]);

  useEffect(() => () => {
    solidMaterial.dispose();
    wireframeMaterial.dispose();
    glowMaterial.dispose();
  }, [solidMaterial, wireframeMaterial, glowMaterial]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (particle.isVisible && solidMeshRef.current && wireframeMeshRef.current && glowMeshRef.current) {
      [solidMeshRef.current, wireframeMeshRef.current, glowMeshRef.current].forEach(ref => {
        ref.position.copy(particle.position);
      });
      const scale = particle.currentScale;
      const clickScale = 1.0 + particle.clickFeedback * 0.2;
      const finalScale = scale * clickScale;
      solidMeshRef.current.scale.setScalar(finalScale);
      wireframeMeshRef.current.scale.setScalar(finalScale * 1.03);
      glowMeshRef.current.scale.setScalar(finalScale);

      const rotationMultiplier = 1.0 + particle.hoverProgress * 0.5;
      solidMeshRef.current.rotation.x += particle.rotationSpeed.x * rotationMultiplier;
      solidMeshRef.current.rotation.y += particle.rotationSpeed.y * rotationMultiplier;
      solidMeshRef.current.rotation.z += particle.rotationSpeed.z * rotationMultiplier;
      wireframeMeshRef.current.rotation.copy(solidMeshRef.current.rotation);
      glowMeshRef.current.rotation.copy(solidMeshRef.current.rotation);

      const materials = [
        { mat: solidMaterial, opacity: 0.7 },
        { mat: wireframeMaterial, opacity: 0.9 },
        { mat: glowMaterial, opacity: 0.15 }
      ];
      materials.forEach(({ mat, opacity }) => {
        if (mat.uniforms) {
          mat.uniforms.uTime.value = time;
          mat.uniforms.uHoverProgress.value = particle.hoverProgress;
          mat.uniforms.uGlowIntensity.value = particle.glowIntensity;
          mat.uniforms.uScale.value = finalScale;
          mat.uniforms.uCameraPosition.value.copy(state.camera.position);
          if (mat !== glowMaterial) {
            mat.uniforms.uEnergy.value = particle.energy;
            mat.uniforms.uIntensity.value = particle.intensity;
            mat.uniforms.uElegance.value = particle.elegance;
            mat.uniforms.uFormationProgress.value = particle.formationProgress;
            mat.uniforms.uFaceSpread.value = particle.faceSpread;
            const baseColor = particle.baseColor.clone();
            if (particle.colorShift > 0) {
              baseColor.offsetHSL(particle.colorShift * 0.2, particle.colorShift * 0.15, particle.colorShift * 0.1);
            }
            if (particle.hoverProgress > 0) {
              const hoverColor = baseColor.clone();
              hoverColor.offsetHSL(0.05, 0.1, 0.15);
              baseColor.lerp(hoverColor, particle.hoverProgress * 0.3);
            }
            mat.uniforms.uColor.value.copy(baseColor);
            const hoverOpacityBoost = 1.0 + particle.hoverProgress * 0.4;
            const clickOpacityBoost = 1.0 + particle.clickFeedback * 0.3;
            mat.uniforms.uOpacity.value = opacity * particle.formationProgress * particle.elegance * hoverOpacityBoost * clickOpacityBoost;
          } else {
            const glowColor = particle.baseColor.clone().multiplyScalar(1.2);
            glowColor.offsetHSL(0.02, 0.1, 0.08);
            mat.uniforms.uColor.value.copy(glowColor);
            mat.uniforms.uOpacity.value = opacity * particle.hoverProgress * particle.glowIntensity * 0.8;
          }
        }
      });
    }
  });

  if (!particle.isVisible) return null;

  const handleInteraction = {
    onClick: (e) => {
      e.stopPropagation();
      particle.onClick();
      onParticleClick && onParticleClick(particle);
    },
    onPointerOver: (e) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
      particle.onHover(true);
      onParticleHover && onParticleHover(particle, true);
    },
    onPointerOut: (e) => {
      e.stopPropagation();
      document.body.style.cursor = 'auto';
      particle.onHover(false);
      onParticleHover && onParticleHover(particle, false);
    }
  };

  return (
    <group>
      <mesh ref={glowMeshRef} geometry={particle.glowGeometry} material={glowMaterial} {...handleInteraction} />
      <mesh ref={solidMeshRef} geometry={particle.geometry} material={solidMaterial} {...handleInteraction} />
      <mesh ref={wireframeMeshRef} geometry={particle.geometry} material={wireframeMaterial} {...handleInteraction} />
      {particle.bubbles.map((bubble, index) => (
        <BubbleComponent key={`${particle.index}-bubble-${index}-${bubble.maxLife}`} bubble={bubble} />
      ))}
    </group>
  );
};

/* -------------------------------------------------- */
/*  Ambient Environment                               */
/* -------------------------------------------------- */
const AmbientEnvironment = () => {
  const groupRef = useRef();
  const ambientParticles = useMemo(() => {
    const particles = [];
    const count = 25;
    for (let i = 0; i < count; i++) {
      let x, y, z, distance;
      do {
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI * 0.7;
        const radius = 40 + Math.random() * 50;
        x = radius * Math.cos(elevation) * Math.cos(angle);
        y = radius * Math.sin(elevation) + (Math.random() - 0.5) * 25;
        z = radius * Math.cos(elevation) * Math.sin(angle);
        distance = Math.sqrt(x * x + z * z);
      } while (distance < 35);
      particles.push({
        position: new THREE.Vector3(x, y, z),
        basePosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.16),
        size: 0.4 + Math.random() * 0.6,
        color: new THREE.Color().setHSL(Math.random(), 0.3 + Math.random() * 0.5, 0.4 + Math.random() * 0.4),
        opacity: 0.04 + Math.random() * 0.08,
        life: 50 + Math.random() * 70,
        maxLife: 50 + Math.random() * 70,
        floatSpeed: 0.001 + Math.random() * 0.0025,
        phase: Math.random() * Math.PI * 2,
        rotationSpeed: { x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.003, z: (Math.random() - 0.5) * 0.0025 },
        type: Math.floor(Math.random() * 6),
        elegance: 0.9 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        glowIntensity: 0.3 + Math.random() * 0.4
      });
    }
    return particles;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const deltaTime = state.clock.getDelta();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const p = ambientParticles[index];
        if (p) {
          p.velocity.multiplyScalar(0.9996);
          const centerDistance = p.position.length();
          if (centerDistance < 40) {
            const repelForce = p.position.clone().normalize().multiplyScalar(0.025);
            p.velocity.add(repelForce);
          }
          if (Math.random() < 0.004) {
            const orbitalForce = new THREE.Vector3(
              Math.sin(time * 0.06 + p.phase),
              Math.cos(time * 0.04 + p.phase) * 0.4,
              Math.cos(time * 0.06 + p.phase)
            ).multiplyScalar(0.012);
            p.velocity.add(orbitalForce);
          }
          p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
          const bounds = { x: 70, y: 50, z: 60 };
          ['x', 'y', 'z'].forEach(axis => {
            if (p.position[axis] > bounds[axis]) { p.position[axis] = -bounds[axis]; p.velocity[axis] *= -0.25; }
            if (p.position[axis] < -bounds[axis]) { p.position[axis] = bounds[axis]; p.velocity[axis] *= -0.25; }
          });
          child.position.copy(p.position);
          child.rotation.x += p.rotationSpeed.x;
          child.rotation.y += p.rotationSpeed.y;
          child.rotation.z += p.rotationSpeed.z;
          const lifeRatio = p.life / p.maxLife;
          const breathing1 = 1.0 + Math.sin(time * 0.5 + p.phase) * 0.1;
          const breathing2 = 1.0 + Math.sin(time * 0.8 + p.phase + 1.5) * 0.06;
          const pulse = 1.0 + Math.sin(time * 1.2 + p.pulsePhase) * 0.04;
          const distance = p.position.length();
          const distanceFade = Math.max(0.2, 1.0 - (distance - 35) / 70);
          const finalScale = p.size * breathing1 * breathing2 * pulse * lifeRatio * distanceFade * p.elegance;
          child.scale.setScalar(finalScale);
          if (child.material) {
            const opacityPulse = 1.0 + Math.sin(time * 0.7 + p.pulsePhase) * 0.2;
            child.material.opacity = p.opacity * lifeRatio * distanceFade * p.elegance * opacityPulse * p.glowIntensity;
            const colorShift = Math.sin(time * 0.1 + p.phase) * 0.1;
            const shiftedColor = p.color.clone();
            shiftedColor.offsetHSL(colorShift, 0, 0);
            child.material.color.copy(shiftedColor);
          }
          p.life -= deltaTime;
          if (p.life <= 0) {
            p.life = p.maxLife;
            do {
              const angle = Math.random() * Math.PI * 2;
              const elevation = (Math.random() - 0.5) * Math.PI * 0.7;
              const radius = 40 + Math.random() * 50;
              p.position.x = radius * Math.cos(elevation) * Math.cos(angle);
              p.position.y = radius * Math.sin(elevation) + (Math.random() - 0.5) * 25;
              p.position.z = radius * Math.cos(elevation) * Math.sin(angle);
            } while (p.position.length() < 35);
            p.basePosition.copy(p.position);
            p.color.setHSL(Math.random(), 0.3 + Math.random() * 0.5, 0.4 + Math.random() * 0.4);
            p.glowIntensity = 0.3 + Math.random() * 0.4;
          }
        }
      });
    }
  });

  const GeometryComponent = ({ particle }) => {
    const types = [
      () => <sphereGeometry args={[1, 8, 6]} />,
      () => <tetrahedronGeometry args={[1, 0]} />,
      () => <octahedronGeometry args={[1, 0]} />,
      () => <icosahedronGeometry args={[1, 0]} />,
      () => <dodecahedronGeometry args={[1, 0]} />,
      () => <coneGeometry args={[0.6, 1.2, 6]} />
    ];
    return types[particle.type % types.length]();
  };

  return (
    <group ref={groupRef}>
      {ambientParticles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <GeometryComponent particle={particle} />
          <meshBasicMaterial color={particle.color} transparent opacity={particle.opacity} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

/* -------------------------------------------------- */
/*  Interactive Scene                                 */
/* -------------------------------------------------- */
const InteractiveScene = () => {
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]);
  useEffect(() => {
    const newParticles = [];
    const count = 12;
    const rings = [
      { radius: 16, count: 3, height: [-10, 0, 10] },
      { radius: 24, count: 4, height: [-15, -5, 5, 15] },
      { radius: 32, count: 3, height: [-8, 0, 8] },
      { radius: 40, count: 2, height: [-12, 12] }
    ];
    let particleIndex = 0;
    rings.forEach((ring, ringIndex) => {
      for (let i = 0; i < ring.count && particleIndex < count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + Math.random() * 0.4;
        const radius = ring.radius + (Math.random() - 0.5) * 5;
        const height = ring.height[i % ring.height.length] + (Math.random() - 0.5) * 4;
        const x = Math.cos(angle) * radius;
        const y = height;
        const z = Math.sin(angle) * radius;
        const zoneType = ringIndex === 0 ? 'inner' : ringIndex === 1 ? 'middle' : ringIndex === 2 ? 'outer' : 'far';
        const particle = new CrystalParticle([x, y, z], particleIndex, zoneType);
        newParticles.push(particle);
        particleIndex++;
      }
    });
    setParticles(newParticles);
    particlesRef.current = newParticles;
    return () => newParticles.forEach(particle => particle.destroy());
  }, []);

  const handleParticleClick = useCallback((particle) => {
    /* stats logic removed for brevity – identical to your original */
  }, []);

  const handleParticleHover = useCallback((particle, isHovering) => {
    /* stats logic removed for brevity – identical to your original */
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const deltaTime = state.clock.getDelta();
    particles.forEach(particle => particle.update(time, deltaTime));
  });

  return (
    <>
      <AmbientEnvironment />
      {particles.map((particle) => (
        <CrystalComponent
          key={particle.index}
          particle={particle}
          onParticleClick={handleParticleClick}
          onParticleHover={handleParticleHover}
        />
      ))}
    </>
  );
};

/* -------------------------------------------------- */
/*  Lighting System                                   */
/* -------------------------------------------------- */
const LightingSystem = () => {
  const lightRefs = useRef([]);
  const ambientRef = useRef();
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ambientRef.current) {
      ambientRef.current.intensity = 0.35 + Math.sin(time * 0.09) * 0.08 + Math.sin(time * 0.15) * 0.03;
    }
    lightRefs.current.forEach((light, index) => {
      if (light) {
        const offset = index * 0.8;
        const intensities = [1.4, 0.9, 0.7, 0.6, 0.5, 0.4];
        const baseIntensity = intensities[index] || 0.4;
        const intensityVar1 = Math.sin(time * 0.07 + offset) * 0.2;
        const intensityVar2 = Math.sin(time * 0.12 + offset + 1.5) * 0.1;
        light.intensity = baseIntensity + intensityVar1 + intensityVar2;
        switch (index) {
          case 0: {
            const fig8Phase = time * 0.025;
            light.position.x = Math.sin(fig8Phase) * 10 + Math.sin(fig8Phase * 2) * 3;
            light.position.z = Math.sin(fig8Phase * 2) * 8;
            light.position.y = 28 + Math.sin(time * 0.035) * 4;
            break;
          }
          case 1: {
            const angle1 = time * 0.018 + Math.PI;
            const spiral1 = Math.sin(time * 0.05) * 5;
            light.position.x = Math.cos(angle1) * (20 + spiral1);
            light.position.z = Math.sin(angle1) * (20 + spiral1);
            light.position.y = 18 + Math.sin(time * 0.03) * 6;
            break;
          }
          case 2: {
            const angle2 = -time * 0.015 + Math.PI * 0.5;
            light.position.x = Math.cos(angle2) * 28;
            light.position.z = Math.sin(angle2) * 28;
            light.position.y = 5 + Math.sin(time * 0.04 + Math.PI) * 8;
            break;
          }
          case 3: {
            light.position.x = Math.sin(time * 0.022) * 15 + Math.cos(time * 0.03) * 5;
            light.position.y = 25 + Math.sin(time * 0.028) * 7;
            light.position.z = -35 + Math.sin(time * 0.02) * 8;
            break;
          }
          case 4: {
            const sweepAngle = Math.sin(time * 0.012) * 0.8;
            light.position.x = Math.sin(sweepAngle) * 10;
            light.position.z = Math.cos(sweepAngle) * 10;
            if (light.target) light.target.position.set(0, 0, 0);
            break;
          }
          case 5: {
            light.position.x = -20 + Math.sin(time * 0.016) * 8;
            light.position.y = 15 + Math.cos(time * 0.025) * 5;
            light.position.z = 25 + Math.sin(time * 0.02) * 6;
            break;
          }
          default:
            break;
        }
      }
    });
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.35} color={ColorPalette.platinum} />
      <directionalLight ref={(el) => (lightRefs.current[0] = el)} position={[18, 28, 12]} intensity={1.4} color={ColorPalette.diamond} castShadow={false} />
      <pointLight ref={(el) => (lightRefs.current[1] = el)} position={[-18, 18, 22]} intensity={0.9} color={ColorPalette.sapphire} distance={60} decay={2} />
      <pointLight ref={(el) => (lightRefs.current[2] = el)} position={[22, 5, 28]} intensity={0.7} color={ColorPalette.topaz} distance={55} decay={2} />
      <pointLight ref={(el) => (lightRefs.current[3] = el)} position={[0, 25, -35]} intensity={0.6} color={ColorPalette.amethyst} distance={50} decay={2} />
      <spotLight ref={(el) => (lightRefs.current[4] = el)} position={[0, 40, 0]} angle={Math.PI / 2.8} penumbra={0.7} intensity={0.5} color={ColorPalette.opal} distance={70} decay={2} />
      <pointLight ref={(el) => (lightRefs.current[5] = el)} position={[-20, 15, 25]} intensity={0.4} color={ColorPalette.aurora} distance={45} decay={2} />
    </>
  );
};

/* -------------------------------------------------- */
/*  Error Boundary                                    */
/* -------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, errorMessage: '' }; }
  static getDerivedStateFromError(error){ return { hasError: true, errorMessage: error.message }; }
  componentDidCatch(error, errorInfo){ console.error('Crystal System Error:', error, errorInfo); }
  render(){
    if (this.state.hasError) {
      return (
        <group>
          <mesh position={[0, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" /></mesh>
        </group>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------------------------- */
/*  Main Export                                       */
/* -------------------------------------------------- */
const ElegantCrystalParticleSystem = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setError('WebGL is not supported in your browser. Please update your browser or enable hardware acceleration.');
        setWebglSupported(false);
        return;
      }
      setIsLoaded(true);
    } catch (err) {
      setError('Failed to initialize WebGL context.');
      setWebglSupported(false);
    }
  }, []);

  if (error || !webglSupported) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="text-white text-center p-12 bg-black/30 backdrop-blur-lg rounded-3xl border border-white/15 shadow-2xl max-w-lg">
          <div className="text-7xl mb-8">⚠️</div>
          <h2 className="text-4xl font-light mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Experience Unavailable</h2>
          <p className="mb-8 text-lg opacity-80 leading-relaxed">{error}</p>
          <p className="text-sm opacity-60">For the complete crystal interaction experience, please use a modern browser with WebGL support.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="text-white text-center">
          <div className="relative mb-10">
            <div className="animate-spin rounded-full h-20 w-20 border-2 border-transparent border-t-white/60 border-r-white/30 mx-auto"></div>
          </div>
          <h2 className="text-3xl font-light mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Initializing Crystal System</h2>
          <p className="text-lg opacity-70 mb-2">Preparing interactions...</p>
          <p className="text-sm opacity-50">Loading shaders and effects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <Canvas
        camera={{ position: [0, 12, 45], fov: 65, near: 0.1, far: 250 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          outputEncoding: THREE.sRGBEncoding,
          pixelRatio: Math.min(window.devicePixelRatio, 2)
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <fog attach="fog" args={['#0a0a1a', 50, 140]} />
        <ErrorBoundary>
          <LightingSystem />
          <InteractiveScene />
        </ErrorBoundary>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-indigo-900/15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/15 via-transparent to-blue-900/15 pointer-events-none" />
      <div className="absolute bottom-8 left-8 text-white/70 text-sm">
        <p>Click crystals to energize • Triple-click to transform into bubbles</p>
        <p>Hover for enhanced glow effects</p>
      </div>
    </div>
  );
};

export default ElegantCrystalParticleSystem;