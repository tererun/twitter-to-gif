declare module "gif-encoder-2" {
  export default class GIFEncoder {
    constructor(
      width: number,
      height: number,
      algorithm?: "neuquant" | "octree",
      useOptimizer?: boolean,
      totalFrames?: number
    );
    out: {
      getData(): Uint8Array;
    };
    setDelay(ms: number): void;
    setRepeat(repeat: number): void;
    setQuality(quality: number): void;
    setFrameRate(fps: number): void;
    start(): void;
    addFrame(ctx: CanvasRenderingContext2D): void;
    finish(): void;
  }
}
