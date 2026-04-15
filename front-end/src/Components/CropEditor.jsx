import { useState, useRef, useCallback, useEffect } from "react";

export default function CropEditor({ src, onDone, onCancel }) {
  const containerRef = useRef();
  const imgRef = useRef();
  const [imgRect, setImgRect] = useState(null);
  const [crop, setCrop] = useState(null);
  const dragState = useRef(null);

  const computeImgRect = useCallback(() => {
    const img = imgRef.current;
    const con = containerRef.current;
    if (!img || !con) return;
    const conW = con.clientWidth;
    const conH = con.clientHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(conW / natW, conH / natH);
    const rW = natW * scale;
    const rH = natH * scale;
    const rect = { x: (conW - rW) / 2, y: (conH - rH) / 2, w: rW, h: rH };
    setImgRect(rect);
    setCrop({ x: rect.x, y: rect.y, w: rW, h: rH });
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) computeImgRect();
    else img.onload = computeImgRect;
    window.addEventListener("resize", computeImgRect);
    return () => window.removeEventListener("resize", computeImgRect);
  }, [src, computeImgRect]);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const getPos = (e, el) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMouseDown = (e) => {
    if (!imgRect) return;
    e.preventDefault();
    const pos = getPos(e, containerRef.current);
    const handle = e.target.dataset.handle;

    if (handle) {
      dragState.current = { type: "resize", handle, startCrop: { ...crop }, startPos: pos };
    } else if (
      crop &&
      pos.x >= crop.x &&
      pos.x <= crop.x + crop.w &&
      pos.y >= crop.y &&
      pos.y <= crop.y + crop.h
    ) {
      dragState.current = { type: "move", startCrop: { ...crop }, startPos: pos };
    } else {
      const sx = clamp(pos.x, imgRect.x, imgRect.x + imgRect.w);
      const sy = clamp(pos.y, imgRect.y, imgRect.y + imgRect.h);
      dragState.current = { type: "draw", startX: sx, startY: sy };
      setCrop({ x: sx, y: sy, w: 0, h: 0 });
    }
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!dragState.current || !imgRect) return;
      const pos = getPos(e, containerRef.current);
      const ds = dragState.current;
      const ir = imgRect;

      if (ds.type === "draw") {
        const x1 = clamp(ds.startX, ir.x, ir.x + ir.w);
        const y1 = clamp(ds.startY, ir.y, ir.y + ir.h);
        const x2 = clamp(pos.x, ir.x, ir.x + ir.w);
        const y2 = clamp(pos.y, ir.y, ir.y + ir.h);
        setCrop({
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          w: Math.abs(x2 - x1),
          h: Math.abs(y2 - y1),
        });
      }

      if (ds.type === "move") {
        const dx = pos.x - ds.startPos.x;
        const dy = pos.y - ds.startPos.y;
        const nx = clamp(ds.startCrop.x + dx, ir.x, ir.x + ir.w - ds.startCrop.w);
        const ny = clamp(ds.startCrop.y + dy, ir.y, ir.y + ir.h - ds.startCrop.h);
        setCrop({ ...ds.startCrop, x: nx, y: ny });
      }

      if (ds.type === "resize") {
        const { handle, startCrop: sc } = ds;
        const dx = pos.x - ds.startPos.x;
        const dy = pos.y - ds.startPos.y;
        let { x, y, w, h } = sc;

        if (handle.includes("e")) w = clamp(sc.w + dx, 20, ir.x + ir.w - x);
        if (handle.includes("s")) h = clamp(sc.h + dy, 20, ir.y + ir.h - y);
        if (handle.includes("w")) {
          const nx = clamp(sc.x + dx, ir.x, sc.x + sc.w - 20);
          w = sc.x + sc.w - nx;
          x = nx;
        }
        if (handle.includes("n")) {
          const ny = clamp(sc.y + dy, ir.y, sc.y + sc.h - 20);
          h = sc.y + sc.h - ny;
          y = ny;
        }
        setCrop({ x, y, w, h });
      }
    },
    [imgRect]
  );

  const onMouseUp = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const applyCrop = () => {
    if (!crop || crop.w < 4 || crop.h < 4 || !imgRect) return;
    const img = imgRef.current;
    const scaleX = img.naturalWidth / imgRect.w;
    const scaleY = img.naturalHeight / imgRect.h;
    const sx = (crop.x - imgRect.x) * scaleX;
    const sy = (crop.y - imgRect.y) * scaleY;
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    onDone(canvas.toDataURL("image/jpeg", 0.95));
  };

  const handles = [
    { id: "nw", style: { top: -5, left: -5, cursor: "nw-resize" } },
    { id: "ne", style: { top: -5, right: -5, cursor: "ne-resize" } },
    { id: "sw", style: { bottom: -5, left: -5, cursor: "sw-resize" } },
    { id: "se", style: { bottom: -5, right: -5, cursor: "se-resize" } },
    { id: "n", style: { top: -5, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" } },
    { id: "s", style: { bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" } },
    { id: "w", style: { top: "50%", left: -5, transform: "translateY(-50%)", cursor: "w-resize" } },
    { id: "e", style: { top: "50%", right: -5, transform: "translateY(-50%)", cursor: "e-resize" } },
  ];

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        className="h-[420px] relative bg-black overflow-hidden select-none"
        style={{ cursor: "crosshair" }}
        onMouseDown={onMouseDown}
      >
        <img
          ref={imgRef}
          src={src}
          alt="crop"
          className="absolute inset-0 m-auto max-w-full max-h-full"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          draggable={false}
        />

        {crop && crop.w > 4 && crop.h > 4 && (
          <>
            {imgRect && (
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                <defs>
                  <mask id="cropMask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#cropMask)" />
              </svg>
            )}

            <div
              className="absolute border border-white"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.w,
                height: crop.h,
                pointerEvents: "none",
              }}
            >
              {[1, 2].map((i) => (
                <div
                  key={`v${i}`}
                  className="absolute top-0 bottom-0 border-l border-white/30"
                  style={{ left: `${(i / 3) * 100}%` }}
                />
              ))}
              {[1, 2].map((i) => (
                <div
                  key={`h${i}`}
                  className="absolute left-0 right-0 border-t border-white/30"
                  style={{ top: `${(i / 3) * 100}%` }}
                />
              ))}

              {handles.map((h) => (
                <div
                  key={h.id}
                  data-handle={h.id}
                  className="absolute w-3 h-3 bg-white rounded-sm"
                  style={{ ...h.style, pointerEvents: "all" }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-[#363636]">
        <button
          className="text-[#a8a8a8] hover:text-white text-sm transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <span className="text-[#a8a8a8] text-xs">Drag to select • Drag corners to resize</span>
        <button
          className="text-[#0095f6] hover:text-[#1aa3ff] text-sm font-medium transition-colors disabled:opacity-40"
          onClick={applyCrop}
          disabled={!crop || crop.w < 4 || crop.h < 4}
        >
          Apply crop
        </button>
      </div>
    </div>
  );
}
