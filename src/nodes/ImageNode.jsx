import { DecoratorNode } from "lexical";
import * as React from "react";
import ImageComponent from "../plugins/ImageComponents";

export class ImageNode extends DecoratorNode {
  __src;
  __x;
  __y;
  __width;
  __height;
  __rotation;

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__x,
      node.__y,
      node.__width,
      node.__height,
      node.__rotation,
      node.__key // ✅ preserve the key on clone
    );
  }

  constructor(src, x = 0, y = 0, width = 200, height = 200, rotation = 0, key) {
    super(key);
    this.__src = src;
    this.__x = x;
    this.__y = y;
    this.__width = width;
    this.__height = height;
    this.__rotation = rotation;
  }

  createDOM() {
    const span = document.createElement("span");
    span.className = "image-node";
    return span;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <ImageComponent
        src={this.__src}
        x={this.__x}
        y={this.__y}
        width={this.__width}
        height={this.__height}
        rotation={this.__rotation}
        nodeKey={this.getKey()}
      />
    );
  }

  exportDOM() {
    const img = document.createElement("img");
    img.src = this.__src;
    img.width = this.__width;
    img.height = this.__height;
    img.alt = "Image";
    img.style.transform = `translate(${this.__x}px, ${this.__y}px) rotate(${this.__rotation}deg)`;
    img.style.display = "block";
    img.style.margin = "1rem auto";
    return { element: img };
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      x: this.__x,
      y: this.__y,
      width: this.__width,
      height: this.__height,
      rotation: this.__rotation,
    };
  }

  static importJSON(data) {
    return new ImageNode(
      data.src,
      data.x,
      data.y,
      data.width,
      data.height,
      data.rotation
    );
  }
}

export function $createImageNode(src, x, y, width, height, rotation) {
  return new ImageNode(src, x, y, width, height, rotation);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
