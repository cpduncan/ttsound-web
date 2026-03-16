type Listener<T> = (state: T) => void;

export class Store<T extends object> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.state = initial;
  }

  get(): Readonly<T> {
    return this.state;
  }

  set(partial: Partial<T>) {
    this.state = Object.assign({}, this.state, partial);
    this.listeners.forEach((l) => l(this.state));
  }

  subscribe(l: Listener<T>): () => void {
    this.listeners.add(l);
    l(this.state);
    return () => this.listeners.delete(l);
  }
}
