import { initializeApp } from './controller';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const fittestCanvas = document.getElementById('fittest');
  const fittestCtx = fittestCanvas ? fittestCanvas.getContext('2d') : null;

  initializeApp(ctx, fittestCtx);
});
