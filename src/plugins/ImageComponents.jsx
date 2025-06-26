import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useState } from "react";
import { $getNodeByKey } from "lexical";
import interact from "interactjs";

export default function ImageComponent({ src, x, y, width, height, rotation, nodeKey }) {
  const ref = useRef(null);
  const rotateRef = useRef(null);
  const [editor] = useLexicalComposerContext();
  const [selected, setSelected] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [localState, setLocalState] = useState({ x, y, width, height, rotation });

  // Sync with props
  useEffect(() => {
    setLocalState({ x, y, width, height, rotation });
  }, [x, y, width, height, rotation]);

  // Deselect on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag and Resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let currentX = localState.x;
    let currentY = localState.y;
    let currentWidth = localState.width;
    let currentHeight = localState.height;

    interact(el)
      .draggable({
        inertia: true,
        listeners: {
          move(event) {
            currentX += event.dx;
            currentY += event.dy;
            setLocalState((prev) => ({ ...prev, x: currentX, y: currentY }));
          },
          end() {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if (node) {
                const writable = node.getWritable();
                writable.__x = currentX;
                writable.__y = currentY;
              }
            });
          },
        },
      })
      .resizable({
        edges: { top: true, right: true, bottom: true, left: true },
        inertia: true,
        modifiers: lockAspectRatio
          ? [interact.modifiers.aspectRatio({ ratio: width / height })]
          : [],
        listeners: {
          move(event) {
            currentX += event.deltaRect.left;
            currentY += event.deltaRect.top;
            currentWidth = event.rect.width;
            currentHeight = event.rect.height;

            setLocalState((prev) => ({
              ...prev,
              x: currentX,
              y: currentY,
              width: currentWidth,
              height: currentHeight,
            }));
          },
          end() {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if (node) {
                const writable = node.getWritable();
                writable.__x = currentX;
                writable.__y = currentY;
                writable.__width = currentWidth;
                writable.__height = currentHeight;
              }
            });
          },
        },
      });

    return () => {
      interact(el).unset();
    };
  }, [editor, nodeKey, lockAspectRatio]);

  // Rotation
  useEffect(() => {
    const rotateHandle = rotateRef.current;
    const imageBox = ref.current;
    if (!rotateHandle || !imageBox) return;

    interact(rotateHandle).draggable({
      listeners: {
        move(event) {
          const rect = imageBox.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const rad = Math.atan2(event.client.y - centerY, event.client.x - centerX);
          const deg = (rad * 180) / Math.PI;
          const snappedDeg = Math.round(deg / 5) * 5;

          setLocalState((prev) => ({ ...prev, rotation: snappedDeg }));

          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
              const writable = node.getWritable();
              writable.__rotation = snappedDeg;
            }
          });
        },
      },
    });

    return () => {
      interact(rotateHandle).unset();
    };
  }, [editor, nodeKey]);

  // Delete and arrow key movement
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleKeyDown = (e) => {
      if (!selected) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node) node.getWritable().remove();
        });
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0,
        dy = 0;
      if (e.key === "ArrowUp") dy = -step;
      if (e.key === "ArrowDown") dy = step;
      if (e.key === "ArrowLeft") dx = -step;
      if (e.key === "ArrowRight") dx = step;

      if (dx !== 0 || dy !== 0) {
        setLocalState((prev) => {
          const newX = prev.x + dx;
          const newY = prev.y + dy;
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
              const writable = node.getWritable();
              writable.__x = newX;
              writable.__y = newY;
            }
          });
          return { ...prev, x: newX, y: newY };
        });
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [editor, nodeKey, selected]);

  const { x: lx, y: ly, width: lw, height: lh, rotation: rot } = localState;

  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={() => setSelected(true)}
      style={{
        display: "block",
        position: "relative",
        width: `${lw}px`,
        height: `${lh}px`,
        transform: `translate(${lx}px, ${ly}px) rotate(${rot}deg)`,
        transition: "transform 0.05s ease-out",
        cursor: "move",
        border: selected ? "2px solid #4A90E2" : "1px solid #ccc",
        borderRadius: "6px",
        boxShadow: selected ? "0 0 10px rgba(0, 123, 255, 0.3)" : "none",
        margin: "10px 0",
        overflow: "visible",
        userSelect: "none",
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* Rotation handle */}
      {selected && (
        <div
          ref={rotateRef}
          style={{
            position: "absolute",
            top: "-22px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "20px",
            height: "20px",
            backgroundColor: "#4A90E2",
            borderRadius: "50%",
            cursor: "grab",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "10px",
            pointerEvents: "auto",
          }}
          title="Drag to rotate"
        >
          ↻
        </div>
      )}

      {/* Aspect ratio toggle */}
      {selected && (
        <button
          onClick={() => setLockAspectRatio((prev) => !prev)}
          style={{
            position: "absolute",
            bottom: "-28px",
            left: "0",
            fontSize: "15px",
            padding: "2px 6px",
            background: "#4A90E2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {lockAspectRatio ? "🔒 Ratio" : "🔓 Free"}
        </button>
      )}
    </div>
  );
}
