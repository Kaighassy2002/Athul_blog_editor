import React, { useRef, useEffect, useState } from "react";
import Moveable from "react-moveable";

const ImageComponent = ({ src }) => {
  const ref = useRef(null);
  const [selected, setSelected] = useState(false);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setSelected(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={ref}
        style={{
          display: "inline-block",
          touchAction: "none",
          width: frame.width,
          height: frame.height,
          border: selected ? "1px solid #4A90E2" : "none", 
          cursor: "pointer",
        }}
        onClick={() => setSelected(true)}
      >
        <img
          src={src}
          alt="moveable"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    {selected && ref.current && (
      <Moveable
        target={ref.current}
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
        onResize={({ width, height ,drag}) => {
          setFrame((prev) => ({
            ...prev,
            width,
            height,
            translate: drag.beforeTranslate,
          }));
        }}
        onRotate={({ beforeRotate }) => {
          setFrame((prev) => ({
            ...prev,
            rotate: beforeRotate,
          }));
        }}
      />
       )}
    </>
  );
};

export default ImageComponent;
