export function h(tag, attrs, ...children) {
  let parts = tag.split(/(?=[.#])/);
  let name = parts[0];
  let element = document.createElement(name);

  for (let i = 1; i < parts.length; i++) {
    switch (parts[i][0]) {
      case ".":
        element.classList.add(parts[i].substr(1));
        break;
      case "#":
        attrs['id'] = parts[i].substr(1);
    }
  }

  for (let [name, value] of Object.entries(attrs || {})) {
    if (name.substr(0, 2) == "on") {
      element.addEventListener(name.substr(2), value);
    } else if (value === true) {
      element.setAttribute(name, name);
    } else if (value !== false && value !== null) {
      element.setAttribute(name, value.toString());
    }
  }

  function handleChildren(children) {
    for (var i = 0; i < children.length; i++) {
      let child = children[0];

      if (child == null || child == undefined)
        continue;

      if (Array.isArray(child)) {
        handleChildren(child);

      } else if (child.nodeType === undefined) {
        element.appendChild(child);
      } else {
        document.createTextNode(child);
      }
    }
  }

  handleChildren(children);
  return element;
}

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }
}
