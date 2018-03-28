class StreamInUseError extends Error {
  constructor() {
    super('Stream already in use. Close it before reusal.');
  }
}

module.exports = StreamInUseError;
