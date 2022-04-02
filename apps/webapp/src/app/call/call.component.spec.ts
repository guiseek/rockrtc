import { FrequencyAnalyserDirective } from '../shared/frequency-analyser.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppProviders } from '../app.providers';

import { CallComponent } from './call.component';

describe('CallComponent', () => {
  let component: CallComponent;
  let fixture: ComponentFixture<CallComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ CallComponent, FrequencyAnalyserDirective ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [ AppProviders.forPorts(environment) ],
    }).createComponent( CallComponent );

    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
