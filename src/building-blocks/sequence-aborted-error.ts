export class SequenceAbortedError extends Error {
  public constructor() {
    super("Sequence was aborted");
  }
}
