import React, { useRef, useEffect, useState } from "react";
import Moveable from "react-moveable";

const ImageComponent = ({ src }) => {
  const ref = useRef(null);
  const [frame, setFrame] = useState({
    translate: [0, 0],
    rotate: 0,
    width: 300,
    height: 300,
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px) rotate(${frame.rotate}deg)`;
      ref.current.style.width = `${frame.width}px`;
      ref.current.style.height = `${frame.height}px`;
    }
  }, [frame]);

  return (
    <>
      <div
        ref={ref}
        style={{
          display: "inline-block",
          touchAction: "none",
        }}
      >
        <img
          src={src}
          alt="moveable"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <Moveable
        target={ref}
        draggable
        resizable
        rotatable
        keepRatio={false}
        throttleDrag={1}
        throttleResize={1}
        throttleRotate={0}
        onDrag={({ beforeTranslate }) => {
          setFrame((prev) => ({
            ...prev,
            translate: beforeTranslate,
          }));
        }}
        onResize={({ width, height }) => {
          setFrame((prev) => ({
            ...prev,
            width,
            height,
          }));
        }}
        onRotate={({ beforeRotate }) => {
          setFrame((prev) => ({
            ...prev,
            rotate: beforeRotate,
          }));
        }}
      />
    </>
  );
};

export default ImageComponent;
