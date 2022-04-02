import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrequencyAnalyserDirective } from './frequency-analyser.directive';



@NgModule({
  declarations: [
    FrequencyAnalyserDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FrequencyAnalyserDirective
  ]
})
export class SharedModule { }
