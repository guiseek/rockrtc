import 'jest-preset-angular/setup-jest';

Object.defineProperty(window, 'MediaStream', {
  value: class MediaStream {
    getAudioTracks = () => [];
    getVideoTracks = () => [];
  },
});
Object.defineProperty(window, 'RTCPeerConnection', {
  value: class {
    onicecandidate = null;
    onaddstream = null;

    createDataChannel() {
      return {
        onopen: null,
        send: null,
      };
    }

    createOffer() {
      return new Promise((resolve) => {
        resolve({
          sdp: 'sdp',
          type: 'offer',
        });
      });
    }

    createAnswer() {
      return new Promise((resolve) => {
        resolve({
          sdp: 'sdp',
          type: 'answer',
        });
      });
    }

    setRemoteDescription() {
      return new Promise((resolve) => {
        resolve({});
      });
    }

    addStream() {
      return new Promise((resolve) => {
        resolve({});
      });
    }

    addIceCandidate() {
      return new Promise((resolve) => {
        resolve({});
      });
    }
  },
});

