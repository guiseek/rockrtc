import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { environment } from '../environments/environment';

import { CallComponent } from './call/call.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';

import { AppProviders } from './app.providers';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, HomeComponent, CallComponent],
  imports: [
    SharedModule,
    BrowserModule,
    ReactiveFormsModule,
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
