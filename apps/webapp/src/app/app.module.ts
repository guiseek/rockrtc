import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { UiMaterialModule } from '@rockrtc/ui/material';

import { SharedModule } from './shared/shared.module';

import { CallComponent } from './call/call.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';

import { AppProviders } from './app.providers';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, HomeComponent, CallComponent],
  imports: [
    SharedModule,
    BrowserModule,
    UiMaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          component: HomeComponent,
        },
        {
          path: ':id',
          component: CallComponent,
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [AppProviders.forPorts(environment)],
  bootstrap: [AppComponent],
})
export class AppModule {}
