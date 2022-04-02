export class FrequencyAnalyser {
  private audioContext: AudioContext;
  private canvasContext: CanvasRenderingContext2D;

  private audioSourceNode: MediaElementAudioSourceNode;
  private analyserNode: AnalyserNode;
  private bufferLength: number;
  private dataArray: Uint8Array;

  private config = {
    bars: 256,
    barWidth: 2,
    barHeight: 1,
    barGap: 1,
    barColor: '#00ff00',
  };

  constructor(
    audio: HTMLAudioElement,
    private canvas: HTMLCanvasElement
  ) {
    this.audioContext = new AudioContext();
    this.canvasContext = this.getCanvasContext(canvas);

    this.audioSourceNode = this.audioContext.createMediaElementSource(audio);

    this.analyserNode = this.audioContext.createAnalyser();
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.audioSourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    console.log(this.analyserNode);

    audio.onplay = () => {
      this.frameLooper();
    };
  }

  private render() {
    this.canvas.width = innerWidth - 40;

    const { width, height } = this.canvas;

    if (this.canvasContext) {
      this.canvasContext.clearRect(0, 0, width, height);
      this.canvasContext.fillStyle = 'black';

      this.config.bars = width;

      for (let i = 0; i < this.config.bars; i++) {
        this.config.barWidth = width / this.config.bars;
        this.config.barGap = i * (this.config.barWidth + 2);
        this.config.barHeight = -this.dataArray[i] / 1.6;
        this.canvasContext.fillRect(
          this.config.barGap,
          height,
          this.config.barWidth,
          this.config.barHeight
        );
      }
    }
  }

  private frameLooper() {
    return () => {
      requestAnimationFrame(this.frameLooper());
      this.analyserNode.getByteFrequencyData(this.dataArray);
      this.render();
    };
  }

  private getCanvasContext(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    return ctx as CanvasRenderingContext2D;
  }
}
