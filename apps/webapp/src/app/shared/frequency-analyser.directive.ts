import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { FrequencyAnalyser } from '@rockrtc/domain';

@Directive({
  selector: '[rockrtcFrequencyAnalyser]',
})
export class FrequencyAnalyserDirective implements OnInit {
  @Input()
  audio!: HTMLAudioElement;

  constructor(private elementRef: ElementRef<HTMLCanvasElement>) {}

  ngOnInit() {
    new FrequencyAnalyser(
      this.audio,
      this.elementRef.nativeElement
    );
  }
}
