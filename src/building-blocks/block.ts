export abstract class Block<I = void, O = void> {
  /**
   * There is no reason to actually use this property. It exists as a typescript hack
   * in order to allow the type of a subclass to be inferred from the abstract version
   */
  public inputType: I | undefined;

  /**
   * There is no reason to actually use this property. It exists as a typescript hack
   * in order to allow the type of a subclass to be inferred from the abstract version
   */
  public outputType: O | undefined;
}
