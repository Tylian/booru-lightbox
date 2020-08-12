type BuilderRef = (ref: HTMLElement) => void;
type BuilderChild = DomBuilder<HTMLElement> | HTMLElement | string;

type EventListener<E extends Event = Event> = (this: HTMLElement, evt: E) => void;

export default class DomBuilder<T extends HTMLElement> {
  static create<K extends keyof HTMLElementTagNameMap>(type: K): DomBuilder<HTMLElementTagNameMap[K]> {
    return new DomBuilder(type);
  }

  private element?: T = undefined;
  private refs: BuilderRef[] = [];
  private attributes = new Map<string, string>();
  private classnames = new Set<string>();
  private events: Record<string, EventListener[]> = {};
  private children: BuilderChild[] = [];

  constructor(public type: string) { }

  attr(values: Record<string, string | boolean>): DomBuilder<T>;
  attr(name: string, value: string | boolean): DomBuilder<T>;
  attr(name: string | Record<string, string | boolean>, value?: string | boolean): DomBuilder<T> {
    if(typeof name !== "string") {
      Object.entries(name).forEach(([name, value]) => {
        this.attr(name, value);
      });
    } else {
      if(typeof value == "string" && value !== "") {
        this.attributes.set(name, value);
      } else if(typeof value === "boolean" && value) {
        this.attributes.set(name, name);
      } else if(value === false || value === undefined || value === "") {
        this.attributes.delete(name);
      }
    }
    return this;
  }

  classname(values: Record<string, boolean>): DomBuilder<T>;
  classname(...values:string[]): DomBuilder<T>;
  classname(name: string, value: boolean): DomBuilder<T>;
  classname(...args: any): DomBuilder<T> {
    if(args.length == 2 && typeof args[0] == "string" && typeof args[1] == "boolean") {
      const [name, value] = args as [string, boolean];
      if(value) {
        this.classnames.add(name);
      } else {
        this.classnames.delete(name);
      }
    } else if(args.length == 1 && typeof args[0] == "object") {
      const [values] = args as [Record<string, boolean>];
      Object.entries(values).forEach(([name, value]) => {
        this.classname(name, value);
      });
    } else {
      const values = args as string[];
      values.forEach((value) => {
        this.classnames.add(value);
      });
    }
    return this;
  }
  
  append(...children: BuilderChild[]): DomBuilder<T> {
    this.children.push(...children);
    return this;
  }

  prepend(...children: BuilderChild[]): DomBuilder<T> {
    this.children.unshift(...children);
    return this;
  }

  on<E extends keyof HTMLElementEventMap>(event: E, fn: EventListener<HTMLElementEventMap[E]>): DomBuilder<T> {
    if(this.events[event] === undefined) {
      this.events[event] = [fn as EventListener];
    } else {
      this.events[event].push(fn as EventListener);
    }
    return this;
  }

  ref(...refs: BuilderRef[]): DomBuilder<T> {
    this.refs.push(...refs);
    return this;
  }

  build(): T {
    if(this.element === undefined) {
      this.element = this.buildElement();
    }

    this.refs.forEach(ref => {
      ref(this.element!);
    });

    return this.element;
  }

  private buildElement(): T {
    const element = document.createElement(this.type) as T;

    this.attributes.forEach((value, name) => {
      element.setAttribute(name, value);
    });

    element.setAttribute('class', [...this.classnames.values()].join(" "));

    for(let [event, callbacks] of Object.entries(this.events)) {
      for(let callback of callbacks) {
        element.addEventListener(event, callback);
      }
    }

    for(let child of this.children) {
      let node: Node;
      if(child instanceof DomBuilder) {
        node = child.build();
      } else if(typeof child === "string") {
        node = document.createTextNode(child);
      } else {
        node = child;
      }

      element.appendChild(node);
    }

    return element;
  }
}
