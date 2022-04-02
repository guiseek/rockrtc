import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { environment } from '../environments/environment';

import { HomeComponent } from './home/home.component';

import { AppProviders } from './app.providers';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          component: HomeComponent,
        },
        {
          path: ':room',
          loadChildren: () =>
            import('./call/call.module').then((m) => m.CallModule),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [AppProviders.forPorts(environment)],
  bootstrap: [AppComponent],
})
export class AppModule {}
