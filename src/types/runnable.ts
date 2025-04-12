export interface Runnable {
  run: () => Promise<void>
  abort: () => void
}
