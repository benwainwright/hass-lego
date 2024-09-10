/**
 * @alpha
 */
export enum ExecutionMode {
  /**
   * If a previous execution is in progress when triggered, that execution will be cancelled
   */
  Restart = "Restart",

  /**
   * If a previous execution is in progress when triggered, the new execution will continue regardless
   */
  Parallel = "Parallel",

  /**
   * If a previous execution was in progress, the new execution will execute when that execution has finished
   */
  Queue = "Queue",
}
