import { DataTransferImpl } from './data-transfer.impl';
import { EventEmitterImpl } from './event-emitter.impl';
import { getPercentage } from './utils/get-percentage';
import { uuid } from './utils/uuid';
import {
  Peer,
  Socket,
  Signaling,
  PeerUiState,
  SignalMessage,
} from '@rockrtc/ports';


export class PeerImpl implements Peer {
  user: string;
  meet?: string;

  uiState: PeerUiState;

  stream: MediaStream;
  remote?: MediaStream;

  conn: RTCPeerConnection;

  private receiveMeta?: string;
  receiveBuffer: ArrayBuffer[] = [];
  receivedSize = 0;

  private receiveChannel!: RTCDataChannel;
  private sendChannel!: RTCDataChannel;

  event: EventEmitterImpl;

  constructor(
    configuration: RTCConfiguration,
    private signaling: Signaling<Socket>
  ) {
    this.conn = new RTCPeerConnection(configuration);

    this.stream = new MediaStream();
    this.user = this.stream.id;

    this.event = new EventEmitterImpl();

    this.uiState = {
      audio: false,
      video: false,
    };
  }

  public connect(meet?: string, constraints?: MediaStreamConstraints) {
    if (meet) this.meet = meet;

    this.signalUp(constraints);
    this.waitData();
  }

  openChannel(fn: (channel: DataTransferImpl) => void) {
    const channel = this.conn.createDataChannel(uuid());
    channel.onopen = () => {
      fn(new DataTransferImpl(channel));
    };
  }

  async signalUp(constraints: MediaStreamConstraints = { audio: true }) {
    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this.gotStream());

    this.conn.onicecandidate = this.getIceCandidate();

    this.signaling.on('message', (message) => {
      this.getSignalMessage()(message);
    });
  }

  waitData(): void {
    this.conn.onicecandidate = this.getIceCandidate();

    this.conn.onconnectionstatechange = this.onConnectionChange();

    this.conn.ondatachannel = (evt) => {
      this.receiveChannel = evt.channel;
      this.receiveChannel.onmessage = ({
        data,
      }: MessageEvent<ArrayBuffer | string>) => {
        if (typeof data === 'string') {
          this.receiveMeta = data;

          this.event.get('message').map((fn) => fn(data));
        }

        if (data instanceof ArrayBuffer) {
          this.onReceiveMessageCallback(data);

          this.event.get('data').map((fn) => fn(data));
        }
      };
    };

    this.sendChannel = this.conn.createDataChannel('sendDataChannel');
    this.sendChannel.onopen = () => {
      this.event.get('dataChannel').map((fn) => fn(this.sendChannel));
    };
  }

  gotStream(): (stream: MediaStream) => void {
    return (stream) => {
      this.stream = stream;

      this.event.get('stream').map((fn) => fn(stream));

      // const [videoTrack] = this.stream.getVideoTracks();
      const [audioTrack] = this.stream.getAudioTracks();

      // this.conn.addTrack(videoTrack);
      this.conn.addTrack(audioTrack);

      this.remote = new MediaStream();

      this.conn.ontrack = ({ isTrusted, track }) => {
        if (this.remote && isTrusted && track) {
          this.remote.addTrack(track);
        }

        this.event.get('track').map((fn) => fn(track));
      };

      this.conn
        .createOffer()
        .then(this.setDescription())
        .catch(this.errorHandler);
    };
  }

  setDescription(): (description: RTCSessionDescriptionInit) => void {
    return (description) => {
      this.conn.setLocalDescription(description).then(() => {
        const message = {
          sdp: this.conn.localDescription,
          meet: this.meet,
          code: this.meet,
          user: this.user,
        };
        this.signaling.emit('message', message);
      });
    };
  }

  getSignalMessage(): (message: SignalMessage) => void {
    return ({ user, sdp, ice }) => {
      if (user === this.user) {
        return;
      }

      if (sdp) {
        this.conn
          .setRemoteDescription(new RTCSessionDescription(sdp))
          .then(() => {
            if (sdp.type === 'offer') {
              this.conn
                .createAnswer()
                .then(this.setDescription())
                .catch(this.errorHandler);
            }
          })
          .catch(this.errorHandler);
      } else if (ice) {
        this.conn
          .addIceCandidate(new RTCIceCandidate(ice))
          .catch(this.errorHandler);

        this.event.get('iceCandidateChange').map((fn) => fn(ice));
      }
    };
  }

  getIceCandidate(): (event: RTCPeerConnectionIceEvent) => void {
    return (event) => {
      this.event.get('iceConnectionChange').map((fn) => fn(event));

      if (event.candidate != null) {
        const message = {
          ice: event.candidate,
          meet: this.meet,
          code: this.meet,
          user: this.user,
        };
        this.signaling.emit('message', message);
      }
    };
  }

  onConnectionChange(): (event: Event) => void {
    return ({ currentTarget }: Event) => {
      const peer = currentTarget as RTCPeerConnection;

      this.event.get('connectionChange').map((fn) => fn(peer.connectionState));
    };
  }


  public send(message: string): void {
    this.sendChannel.send(message);
  }

  public upload(file: File): void {
    this.sendChannel.binaryType = 'arraybuffer';

    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onload = ({ target }: ProgressEvent<FileReader>) => {
      const result = target?.result as ArrayBuffer;

      if (offset === 0) {
        this.send(`${file.name};${file.size}`);
      }

      this.sendChannel.send(result);

      offset += result.byteLength;

      this.event.get('progress').map((fn) =>
        fn({
          byteLength: result.byteLength,
          percent: getPercentage(offset, file.size),
          offset,
        })
      );

      if (offset < file.size) {
        readSlice(offset);
      } else {
        const progress = { byteLength: 0, percent: 0, offset: 0 };
        this.event.get('progress').map((fn) => fn(progress));
      }
    };

    const readSlice = (o: number) => {
      const slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    readSlice(0);
  }

  onReceiveMessageCallback(data: ArrayBuffer): void {
    this.receiveBuffer.push(data);
    this.receivedSize += data.byteLength;

    let name = '';

    if (this.receiveMeta) {
      const meta = this.receiveMeta?.split(';');
      const [filename, size] = meta ? meta : [];

      this.event.get('progress').map((fn) =>
        fn({
          percent: getPercentage(this.receivedSize, +size),
          byteLength: data.byteLength,
          offset: this.receivedSize,
        })
      );

      name = filename;
    }
    if (data.byteLength < 16384) {
      const received = new Blob(this.receiveBuffer);

      this.receiveBuffer = [];
      this.receivedSize = 0;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(received);
      link.download = name;
      link.click();

      delete this.receiveMeta;

      const progress = { byteLength: 0, percent: 0, offset: 0 };
      this.event.get('progress').map((fn) => fn(progress));
    }
  }

  toggleAudio(stream: MediaStream) {
    const tracks = stream.getAudioTracks();
    tracks.forEach((t) => (t.enabled = !t.enabled));
    this.uiState.audio = !this.uiState.audio;

    const events = this.event.get('toggleAudio');
    events.map((fn) => fn(this.uiState.audio));
  }

  toggleVideo(stream: MediaStream) {
    const tracks = stream.getVideoTracks();
    tracks.forEach((t) => (t.enabled = !t.enabled));

    this.uiState.video = !this.uiState.video;

    const events = this.event.get('toggleVideo');
    events.map((fn) => fn(this.uiState.video));
  }

  toggle(stream: MediaStream, kind: keyof PeerUiState = 'video') {
    let tracks: MediaStreamTrack[];

    if (kind === 'video') {
      tracks = stream.getVideoTracks();
    } else {
      tracks = stream.getAudioTracks();
    }

    tracks.forEach((t) => (t.enabled = !t.enabled));

    this.uiState[kind] = !this.uiState[kind];
  }

  errorHandler(error: RTCPeerConnectionIceErrorEvent): void {
    console.error(error);
  }

  close() {
    const tracks = this.stream.getTracks();
    tracks.forEach((t) => t.stop());
    this.conn.close();
  }
}
