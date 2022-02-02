# visual-audio

## Pull the latest changes from Git
$ git pull

## Install NPM packages as needed
$ rush update

## Do a clean rebuild of everything
$ rush rebuild

## Run watch & server
$ cd packages/app-performer && rushx start


### TODO:

- [x] Set up monorepo
- [x] Move audio processing and GL logic to Web Worker (AudioWorklet / OffscreenCanvas)
- [ ] Allow audio source from file
- [x] Implement video recorder
- [ ] Live animation controls via MIDI
- [ ] Implement UI for animation builder
