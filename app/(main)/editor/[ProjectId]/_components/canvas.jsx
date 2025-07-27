"use client";

import { useCanvas } from "@/context/context";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { Canvas, FabricImage } from "fabric";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const CanvasEditor = ({ project }) => {
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef();
  const containerRef = useRef();

  const { canvasEditor, setCanvasEditor, activeTool, onToolChange } =
    useCanvas();

  const { mutate: updateProject } = useConvexMutation(
    api.projects.updateProject
  );

  const calculateViewportScale = () => {
    if (!containerRef.current || !project) return 1;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // 40px padding
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / project.width;
    const scaleY = containerHeight / project.height;

    // Use the smaller scale to ensure the canvas fits completely
    // Cap at 1 to prevent upscaling beyond original size
    return Math.min(scaleX, scaleY, 1);
  };

  useEffect(() => {
    if (!canvasRef.current || !project || CanvasEditor) return;

    const initializeCanvas = async () => {
      setIsLoading(true);

      const viewportScale = calculateViewportScale();

      const canvas = new Canvas(canvasRef.current, {
        width: project.width, // Logical canvas width (design dimensions)
        height: project.height, // Logical canvas height (disign dimensions)

        backgroundColor: "#ffffff", // Default white background

        preserveObjectStacking: true, // Maintain object layer order
        controlsAboveOverlay: true, // Show selection controls above overlay
        selection: true, // Enable object selection

        hoverCursor: "move", // Cursor when hovering over objects
        moveCursor: "move", // Cursor when moving objects
        defaultCursor: "default", // Default cursor

        allowTouchScrolling: false, // Disable touch scrolling (prevent conflicts)
        renderOnAddRemove: true, // Auto render when objects are added/removed
        skipTargetFind: false, // Allow object targeting for interactions
      });

      canvas.setDimensions(
        {
          width: project.width * viewportScale, // Scaled display width
          height: project.height * viewportScale, // Scaled display height
        },
        { backstoreOnly: false }
      );

      // Apply zoom to scale the entire canvas content
      canvas.setZoom(viewportScale);

      const scaleFactor = window.devicePixelRatio || 1;
      if (scaleFactor > 1) {
        // Increase canvas resolution for high DPI displays
        canvas.getElement().width = project.width * scaleFactor;
        canvas.getElement().height = project.height * scaleFactor;
        // Scale the drawing context to match
        canvas.getContext().scale(scaleFactor, scaleFactor);
      }

      if (project.currentImageUrl || project.originalImageUrl) {
        try {
          // Use current image if available (may have transformations), fallback to orginal
          const imageUrl = project.currentImageUrl || project.originalImageUrl;

          const fabricImage = await FabricImage.fromURL(imageUrl, {
            crossOrigin: "anonymous", // Handle CORS for external images
          });

          // Calculate scaling to fit image within canvas while maintaining aspect ratio
          const imgAspectRatio = fabricImage.width / fabricImage.height;
          const canvasAspectRatio = project.width / project.height;

          let scaleX, scaleY;
          if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas - scale based on width
            scaleX = project.width / fabricImage.width;
            scaleY = scaleX; // Maintain aspect ratio
          } else {
            // Image is tailer than canvas - scale based on height
            scaleY = project.height / fabricImage.height;
            scaleX = scaleY; // Maintain aspect ratio
          }

          fabricImage.set({
            left: project.width / 2, // Center horizontally
            top: project.height / 2, //Center vertically
            originX: "center", // Tranform origin at center
            originY: "center", // Tranform origin at center
            scaleX, // Horizontal scale factor
            scaleY, // Vertical scale factor
            selectable: true, // Allow user to select/move image
            evented: true, // Enable mouse/touch events
          });

          // Add image to canvas and ensure it's centered
          canvas.add(fabricImage);
          canvas.centerObject(fabricImage);
        } catch (error) {
          console.error("Error loading project image:", error);
        }
      }

      if (project.canvasState) {
        try {
          // Load JSON state - this will restore all objects and their properties
          await canvas.loadFromJSON(project.canvasState);
          canvas.requestRenderAll();
        } catch (error) {
          console.error("Error loading canvas state:", error);
        }
      }

      canvas.calcOffset(); // Recalculate canvas position for event handling
      canvas.requestRenderAll(); // Trigger initial render
      setCanvasEditor(canvas); // Store canvas instance in context

      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 500);

      setIsLoading(false);
    };

    initializeCanvas();

    return () => {
      if (canvasEditor) {
        canvasEditor.dispose(); // Fabric.js cleanup method
        setCanvasEditor(null);
      }
    };
  }, [project]);

  const saveCanvasState = async () => {
    if (!canvasEditor || !project) return;

    try {
      // Export canvas to JSON format (includes all objects and properties)
      const canvasJSON = canvasEditor.toJSON();

      // Save to Conves database
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
      });
    } catch (error) {
      console.error("Error saving canvas state:", error);
    }
  };

  useEffect(() => {
    if (!canvasEditor) return;

    let saveTimeout;
    // Debounced save function - waits 2 seconds after last change
    const handleCanvasChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveCanvasState();
      }, 2000); // 2 seconds delay
    };

    // Listen for canvas modification events
    canvasEditor.on("object:modified", handleCanvasChange); // Object transformed/moved
    canvasEditor.on("object:added", handleCanvasChange); // New object added
    canvasEditor.on("object.removed", handleCanvasChange); // Object deleted

    return () => {
      clearTimeout(saveTimeout);
      canvasEditor.off("object:modified", handleCanvasChange);
      canvasEditor.off("object:added", handleCanvasChange);
      canvasEditor.off("object:removed", handleCanvasChange);
    };
  }, [canvasEditor]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasEditor || !project) return;

      // Recalculate optimal scale for new window size
      const newScale = calculateViewportScale();

      // Update canvas display dimensions
      canvasEditor.setDimensions(
        {
          width: project.width * newScale,
          height: project.height * newScale,
        },
        { backstorOnly: false }
      );

      canvasEditor.setZoom(newScale);
      canvasEditor.calcOffset(); // Update mouse event coordinates
      canvasEditor.requestRenderAll(); // Re-render with new dimensions
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasEditor, project]);

  useEffect(() => {
    if (!canvasEditor) return;

    switch (activeTool) {
      case "crop":
        // Crop tool shows crosshair cursor for presision selection
        canvasEditor.defaultCursor = "crosshair";
        canvasEditor.hoverCursor = "crosshair";
        break;
      default:
        // Default tools show standard cursor
        canvasEditor.defaultCursor = "default";
        canvasEditor.hoverCursor = "move";
    }
  }, [canvasEditor, activeTool]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center bg-secondary w-full h-full overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #64748b 25%, transparent 25%),
            linear-gradient(-45deg, #64748b 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #64748b 75%),
            linear-gradient(-45deg, transparent 75%, #64748b 75%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-8 h-8" />{" "}
            <p className="text-white/70 text-sm">Loading canvas...</p>
          </div>
        </div>
      )}

      <div className="px-5">
        <canvas id="canvas" className="border" ref={canvasRef} />
      </div>
    </div>
  );
};

export default CanvasEditor;
