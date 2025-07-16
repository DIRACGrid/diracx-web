export class Operators {
  static readonly EGUALS = new Operators("=", "eq");
  static readonly NOT_EQUALS = new Operators("!=", "neq");
  static readonly GREATER_THAN = new Operators(">", "gt");
  static readonly LESS_THAN = new Operators("<", "lt");
  static readonly IN = new Operators("is in", "in");
  static readonly NOT_IN = new Operators("is not in", "not in");
  static readonly LIKE = new Operators("like", "like");
  static readonly LAST = new Operators("in the last", "last");

  private constructor(
    private readonly display: string,
    private readonly internal: string,
  ) {}

  getInternal(): string {
    return this.internal;
  }

  getDisplay(): string {
    return this.display;
  }

  static getDisplayFromInternal(internal: string): string {
    const operator = Operators.getAll().find(
      (op) => op.getInternal() === internal,
    );
    if (operator) {
      return operator.getDisplay();
    }
    throw new Error(`Operator with internal name "${internal}" not found.`);
  }

  static getInternalFromDisplay(display: string): string {
    const operator = Operators.getAll().find(
      (op) => op.getDisplay() === display,
    );
    if (operator) {
      return operator.getInternal();
    }
    throw new Error(`Operator with display name "${display}" not found.`);
  }

  static getAll(): Operators[] {
    return [
      Operators.EGUALS,
      Operators.NOT_EQUALS,
      Operators.GREATER_THAN,
      Operators.LESS_THAN,
      Operators.IN,
      Operators.NOT_IN,
      Operators.LIKE,
      Operators.LAST,
    ];
  }

  static getAllDisplays(): string[] {
    return Operators.getAll().map((op) => op.getDisplay());
  }

  static getAllInternals(): string[] {
    return Operators.getAll().map((op) => op.getInternal());
  }

  static getStringOperators(): Operators[] {
    return [
      Operators.EGUALS,
      Operators.NOT_EQUALS,
      Operators.IN,
      Operators.NOT_IN,
      Operators.LIKE,
    ];
  }

  static getNumberOperators(): Operators[] {
    return [
      Operators.EGUALS,
      Operators.NOT_EQUALS,
      Operators.GREATER_THAN,
      Operators.LESS_THAN,
      Operators.IN,
      Operators.NOT_IN,
      Operators.LIKE,
    ];
  }

  static getBooleanOperators(): Operators[] {
    return [Operators.EGUALS, Operators.NOT_EQUALS];
  }

  static getDateOperators(): Operators[] {
    return [Operators.GREATER_THAN, Operators.LESS_THAN, Operators.LAST];
  }

  static getDefaultOperators(): Operators[] {
    return [
      Operators.EGUALS,
      Operators.NOT_EQUALS,
      Operators.GREATER_THAN,
      Operators.LESS_THAN,
      Operators.LIKE,
    ];
  }

  static getFreeTextOperators(): Operators[] {
    return [
      Operators.LIKE,
      Operators.IN,
      Operators.NOT_IN,
      Operators.LAST,
      Operators.GREATER_THAN,
      Operators.LESS_THAN,
    ];
  }
}
