export class Timer {
  start: number;
  constructor() {
    this.start = performance.now();
  }

  time(): number {
    const snapshot = performance.now() - this.start;
    this.start = performance.now();
    false && console.log(`function took: ${snapshot} ms`);
    return snapshot;
  }
}
