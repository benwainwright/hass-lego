export class SequenceAbortedError extends Error {
  public constructor(name: string) {
    super(`Sequence '${name}' was aborted`);
  }
}
