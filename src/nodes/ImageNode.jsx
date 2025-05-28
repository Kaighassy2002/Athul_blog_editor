import { DecoratorNode } from "lexical";
import * as React from "react";
import ImageComponent from "../plugins/ImageComponents";

export class ImageNode extends DecoratorNode {
  __src;

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__key);
  }

  constructor(src, key) {
    super(key);
    this.__src = src;
  }

  createDOM() {
    return document.createElement("span");
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return new ImageNode(serializedNode.src);
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
    };
  }

  decorate() {
    return <ImageComponent src={this.__src} />;
  }
}

export function $createImageNode(src) {
  return new ImageNode(src);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
