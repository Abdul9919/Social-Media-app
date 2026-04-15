import { useState, useRef, forwardRef, useImperativeHandle } from "react";

const FILTERS = [
  { name: "Original", filter: "none" },
  { name: "Clarendon", filter: "contrast(1.2) saturate(1.35)" },
  { name: "Gingham", filter: "brightness(1.05) hue-rotate(-10deg)" },
  { name: "Moon", filter: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Lark", filter: "saturate(1.1) brightness(1.1) contrast(0.9)" },
  { name: "Juno", filter: "saturate(1.5) contrast(1.1) hue-rotate(-10deg)" },
  { name: "Aden", filter: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)" },
  { name: "Ludwig", filter: "saturate(1.1) brightness(1.1)" },
  { name: "Crema", filter: "saturate(0.9) contrast(0.95) sepia(0.15)" },
];

const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  fade: 0,
  saturation: 0,
  temperature: 0,
  vignette: 0,
};

const FilterEditor = forwardRef(function FilterEditor({ src, onDone, userName }, ref) {
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS);
  const imgRef = useRef();
  const canvasRef = useRef(document.createElement("canvas"));

  const handleAdjustmentChange = (key, val) => {
    setAdjustments((prev) => ({ ...prev, [key]: parseInt(val) }));
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, temperature, fade } = adjustments;
    let style = selectedFilter.filter === "none" ? "" : selectedFilter.filter;

    style += ` brightness(${100 + brightness + fade * 0.2}%)`;
    style += ` contrast(${100 + contrast - fade * 0.2}%)`;
    style += ` saturate(${100 + saturation}%)`;
    style += ` sepia(${temperature > 0 ? temperature / 2 : 0}%)`;
    style += ` hue-rotate(${temperature < 0 ? temperature : 0}deg)`;

    return style;
  };

  const applyFiltersToCanvas = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = getFilterStyle();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const compositeDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    onDone(compositeDataUrl);
  };

  useImperativeHandle(ref, () => ({
    applyFiltersToCanvas,
  }));

  return (
    <div className="flex h-[480px] w-full">
      {/* Left: Image Preview */}
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden border-r border-[#363636]">
        <img
          ref={imgRef}
          src={src}
          alt="Edit Preview"
          className="max-w-full max-h-full object-contain transition-all"
          style={{ filter: getFilterStyle() }}
        />
        {/* Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
              adjustments.vignette / 100
            }))`,
          }}
        />
      </div>

      {/* Right: Controls */}
      <div className="w-[320px] flex flex-col bg-[#262626]">
        <div className="flex border-b border-[#363636]">
          {["filters", "adjustments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-white border-b border-white"
                  : "text-[#a8a8a8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "filters" ? (
            <div className="grid grid-cols-3 gap-3">
              {FILTERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFilter(f)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-full aspect-square overflow-hidden rounded-sm border-2 ${
                      selectedFilter.name === f.name
                        ? "border-[#0095f6]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      style={{ filter: f.filter }}
                      alt={f.name}
                    />
                  </div>
                  <span
                    className={`text-[11px] ${
                      selectedFilter.name === f.name
                        ? "text-[#0095f6] font-bold"
                        : "text-[#a8a8a8]"
                    }`}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(DEFAULT_ADJUSTMENTS).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm text-[#f5f5f5]">
                    <span className="capitalize">{key}</span>
                    {adjustments[key] !== 0 && (
                      <span className="text-[#0095f6]">{adjustments[key]}</span>
                    )}
                  </div>
                  <input
                    type="range"
                    min={key === "vignette" || key === "fade" ? "0" : "-100"}
                    max="100"
                    value={adjustments[key]}
                    onChange={(e) =>
                      handleAdjustmentChange(key, e.target.value)
                    }
                    className="w-full h-1 bg-[#363636] rounded-lg appearance-none cursor-pointer accent-[#0095f6]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default FilterEditor;
