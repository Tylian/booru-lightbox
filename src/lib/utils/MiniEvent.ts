export default class EventEmitter<T extends { [K in keyof T]: (...args: any) => void }> {
  private handlers: {
    [K in keyof T]?: Array<T[K]>;
  } = {};

  on<K extends keyof T>(event: K, handler: T[K]): T[K] {
    if (!Array.isArray(this.handlers[event])) {
      this.handlers[event] = [];
    }

    this.handlers[event]!.push(handler);
    return handler;
  }

  off<K extends keyof T>(event: K, handler: T[K]): void {
    if (!handler) {
      this.handlers[event] = [];
    } else {
      if (Array.isArray(this.handlers[event])) {
        this.handlers[event] = this.handlers[event]!.filter(item => item !== handler);
      }
    }
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const eventHandlers = this.handlers[event];
    if (!eventHandlers) {
      return;
    }

    eventHandlers.forEach((handler: T[K]): void => handler(...Array.from(arguments).slice(1)));
  }
}
