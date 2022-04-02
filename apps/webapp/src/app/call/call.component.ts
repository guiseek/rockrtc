import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Peer } from '@rockrtc/ports';

@Component({
  selector: 'rockrtc-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit{
  room = '';
  constructor(
    readonly route: ActivatedRoute,
    private _router: Router,
    readonly peer: Peer
  ) {
    const { room } = this.route.snapshot.parent!.params;
    if (room) this.room = room;
  }

  ngOnInit(): void {
    console.log(this.room);

    this.peer.connect(this.room);

    this.peer.event.on('track', (track) => {
      console.log('RockRTC Track: ', track);
    });

    this.peer.event.on('dataChannel', (channel) => {
      console.log('RockRTC Data Channel: ', channel);
    })
  }

  hangUp() {
    this._router.navigate(['/']);
  }
}
