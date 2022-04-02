import { FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'rockrtc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  room = new FormControl('', Validators.required)

  constructor(private _router: Router) {}

  onSubmit() {
    console.log('room', this.room.value);

    if (this.room.valid) {
      const path = ['/', this.room.value]
      this._router.navigate(path);
    }
  }
}
