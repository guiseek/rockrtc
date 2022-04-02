import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Peer } from '@rockrtc/ports';

@Component({
  selector: 'rockrtc-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit {
  room = '';

  constructor(
    readonly route: ActivatedRoute,
    private _router: Router,
    readonly peer: Peer
  ) {
    const { params } = route.snapshot.parent ?? {};
    if (params) {
      const { room } = params;
      this.room = room;
    }
  }

  ngOnInit(): void {
    console.log(this.room);

    this.peer.event.on('track', (track) => {
      console.log('RockRTC Track: ', track);
    });

    this.peer.event.on('connectionChange', (event) => {
      console.log('connectionChange: ', event);
    });

    this.peer.event.on('data', (event) => {
      console.log('data: ', event);
    });

    this.peer.event.on('iceCandidateChange', (event) => {
      console.log('iceCandidateChange: ', event);
    });

    this.peer.event.on('iceConnectionChange', (event) => {
      console.log('iceConnectionChange: ', event);
    });

    this.peer.event.on('iceGatheringChange', (event) => {
      console.log('iceGatheringChange: ', event);
    });

    this.peer.event.on('message', (event) => {
      console.log('message: ', event);
    });

    this.peer.event.on('signalingChange', (event) => {
      console.log('signalingChange: ', event);
    });

    this.peer.event.on('message', (event) => {
      console.log('message: ', event);
    });

    this.peer.event.on('progress', (event) => {
      console.log('progress: ', event);
    });

    this.peer.event.on('dataChannel', (channel) => {
      console.log('RockRTC Data Channel: ', channel);
    });
  }

  connect() {
    this.peer.connect(this.room);
  }

  hangUp() {
    this._router.navigate(['/']);
  }
}
