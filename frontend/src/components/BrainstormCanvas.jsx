import React, { useRef, useEffect, useState } from "react";
import api from "../api";

export default function BrainstormCanvas({ projectId } = {}) {
  // projectId (optional) - used when saving the canvas and naming the file

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, rectangle, circle, text, eraser
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [shapeSize, setShapeSize] = useState(50);
  const [context, setContext] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);
  }, []);

  const startDrawing = (e) => {
    if (!context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "text") {
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);
    context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    context.lineWidth = lineWidth;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen" || tool === "eraser") {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (!context || !isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "rectangle") {
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(x - shapeSize / 2, y - shapeSize / 2, shapeSize, shapeSize);
    } else if (tool === "circle") {
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, y, shapeSize / 2, 0, Math.PI * 2);
      context.stroke();
    }

    setIsDrawing(false);
    context.closePath();
  };

  const handleAddText = () => {
    if (!context || !textPosition || !textInput.trim()) return;
    context.fillStyle = color;
    context.font = `${fontSize}px Arial`;
    context.fillText(textInput, textPosition.x, textPosition.y);
    setTextInput("");
    setTextPosition(null);
  };

  const handleClear = () => {
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "brainstorm.png";
    link.click();
  };

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveCanvas = async () => {
    if (!canvasRef.current) return;
    try {
      setSaving(true);
      setSaveMessage("");

      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to get image blob");

      const form = new FormData();
      const filename = `brainstorm-${projectId || 'unspecified'}-${Date.now()}.png`;
      form.append('file', blob, filename);

      // Upload using existing api helper (which adds auth header)
      const response = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileData = response.data?.data;

      // If we have a projectId, attach the uploaded file metadata to the project
      if (projectId && fileData) {
        try {
          await api.post(`/projects/${projectId}/files`, { file: fileData });
          setSaveMessage('Canvas uploaded and linked to project');
        } catch (attachErr) {
          console.warn('Uploaded but failed to attach to project', attachErr);
          setSaveMessage('Uploaded but failed to link to project');
        }
      } else if (fileData) {
        setSaveMessage('Canvas uploaded (not linked: missing project id)');
      } else {
        setSaveMessage('Canvas uploaded');
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save canvas', err);
      setSaveMessage('Failed to save canvas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg p-4">
      {/* Toolbar */}
      <div className="flex gap-2 mb-4 p-3 bg-gray-100 rounded-lg flex-wrap items-center">
        {/* Tool buttons */}
        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-2 rounded ${tool === "pen" ? "bg-blue-500 text-white" : "bg-white border"}`}
          title="Pen tool"
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool("rectangle")}
          className={`px-3 py-2 rounded ${tool === "rectangle" ? "bg-blue-500 text-white" : "bg-white border"}`}
          title="Rectangle tool"
        >
          ▭ Rectangle
        </button>
        <button
          onClick={() => setTool("circle")}
          className={`px-3 py-2 rounded ${tool === "circle" ? "bg-blue-500 text-white" : "bg-white border"}`}
          title="Circle tool"
        >
          ● Circle
        </button>
        <button
          onClick={() => setTool("text")}
          className={`px-3 py-2 rounded ${tool === "text" ? "bg-blue-500 text-white" : "bg-white border"}`}
          title="Text tool"
        >
          T Text
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`px-3 py-2 rounded ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-white border"}`}
          title="Eraser tool"
        >
          🗑️ Erase
        </button>

        {/* Divider */}
        <div className="h-6 border-l border-gray-400 mx-2"></div>

        {/* Color & line width */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Line:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-gray-600">{lineWidth}px</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Shape Size:</label>
          <input
            type="range"
            min="10"
            max="400"
            value={shapeSize}
            onChange={(e) => setShapeSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-gray-600">{shapeSize}px</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Font Size:</label>
          <input
            type="range"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-gray-600">{fontSize}px</span>
        </div>

        {/* Divider */}
        <div className="h-6 border-l border-gray-400 mx-2"></div>

        {/* Clear & Download */}
        <button
          onClick={handleClear}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          title="Clear canvas"
        >
          🗑️ Clear
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          title="Download as PNG"
        >
          ⬇️ Download
        </button>
        <button
          onClick={handleSaveCanvas}
          disabled={saving}
          className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-60"
          title="Save canvas to backend"
        >
          {saving ? 'Saving...' : '💾 Save'}
        </button>
        {saveMessage && (
          <span className="text-sm text-gray-700 ml-2">{saveMessage}</span>
        )}
      </div>

      {/* Text input modal (if adding text) */}
      {textPosition && (
        <div className="fixed bg-white p-4 border-2 border-blue-500 rounded-lg shadow-lg z-50">
          <input
            type="text"
            placeholder="Enter text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddText()}
            autoFocus
            className="px-2 py-1 border rounded mb-2 w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddText}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setTextPosition(null);
                setTextInput("");
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
      />
    </div>
  );
}
