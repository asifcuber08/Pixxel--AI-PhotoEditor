"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import {
  Download,
  ImageIcon,
  Loader2,
  Palette,
  Search,
  Trash,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

const BackgroundControls = ({ project }) => {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const getMainImage = () => {
    if (!canvasEditor) return null;
    const objects = canvasEditor.getObjects();
    return objects.find((obj) => obj.type === "image") || null;
  };

  const handleBackgroundRemoval = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;

    setProcessingMessage("Removing background with AI...");

    try {
      const currentImageUrl =
        project.currentImageUrl || project.originalImageUrl;

      const bgRemovedUrl = currentImageUrl.includes("ik.imagekit.io")
        ? `${currentImageUrl.split("?")[0]}?tr=e-bgremove`
        : currentImageUrl;

      const processedImage = await FabricImage.fromURL(bgRemovedUrl, {
        crossOrigin: "anonymous",
      });

      const currentProps = {
        left: mainImage.left,
        top: mainImage.top,
        scaleX: mainImage.scaleX,
        scaleY: mainImage.scaleY,
        angle: mainImage.angle,
        originX: mainImage.originX,
        originY: mainImage.originY,
      };

      canvasEditor.remove(mainImage);
      processedImage.set(currentProps);
      canvasEditor.add(processedImage);

      processedImage.setCoords();

      canvasEditor.setActiveObject(processedImage);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();

      console.log("Background removed successfully");
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleColorBackground = () => {
    if (!canvasEditor) return;

    canvasEditor.backgroundImage = null;
    canvasEditor.backgroundColor = backgroundColor;
    canvasEditor.requestRenderAll();
  };

  const searchUnsplashImages = async () => {
    if (!searchQuery.trim() || !UNSPLASH_ACCESS_KEY) return;

    setIsSearching(true);

    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) toast.error("Failed to search images");

      const data = await response.json();
      setUnsplashImages(data.results || []);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
      toast.error("Failed to search images. Please try again");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUnsplashImages();
    }
  };

  const handleImageBackground = async (imageUrl, imageId) => {
    if (!canvasEditor) return;

    setSelectedImageId(imageId);

    try {
      if (UNSPLASH_ACCESS_KEY) {
        fetch(`${UNSPLASH_API_URL}/photos/${imageId}/download`, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }).catch(() => {}); // Silent fail for download tracking
      }

      const fabricImage = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      const canvasWidth = project.width; // Logical canvas width
      const canvasHeight = project.height; // Logical canvas height

      const scaleX = canvasWidth / fabricImage.width;
      const scaleY = canvasHeight / fabricImage.height;

      const scale = Math.max(scaleX, scaleY);

      fabricImage.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2, // Use project dimensions
        top: canvasHeight / 2, // Use project dimensions
      });

      canvasEditor.backgroundImage = fabricImage;
      canvasEditor.requestRenderAll();
      setSelectedImageId(null);
    } catch (error) {
      console.error("Error setting background image:", error);
      toast.error("Failed to set background image. Please try again.");
      setSelectedImageId(null);
    }
  };

  const handleRemoveBackground = () => {
    if (!canvasEditor) return;

    canvasEditor.backgroundColor = null;
    canvasEditor.backgroundImage = null;
    canvasEditor.requestRenderAll();
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="">
        <div className="">
          <h3 className="text-sm font-medium text-white mb-2">
            AI Background Removal
          </h3>
          <p className="text-xs text-white/70 mb-4">
            Automatically remove the background from your image using AI
          </p>
        </div>

        <Button
          className="w-full"
          variant="primary"
          onClick={handleBackgroundRemoval}
          disabled={processingMessage || !getMainImage}
        >
          <Trash className="h-4 w-4 mr-2" />
          Remove Image Background
        </Button>

        {/* Show warning if no image is available */}
        {!getMainImage() && (
          <p className="text-xs text-amber-400">
            Please add an image to the canvas first to remove its background
          </p>
        )}
      </div>

      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
          <TabsTrigger
            value="color"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4 mr-2" />
            Color
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>
        <TabsContent value="color" className="space-y-4 mt-6">
          <div className="">
            <h3 className="">
              <p className="text-xs text-white/70 mb-4">
                Chosse a solid color for your canvas background
              </p>
            </h3>
          </div>

          <div className="space-y-4">
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
              style={{ width: "100%" }}
            />

            <div className="flex items-center gap-2">
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 bg-slate-700 border-white/20 text-white"
              />
              {/* Color preview squear */}
              <div
                className="w-10 h-10 rounded border border-white/20"
                style={{ backgroundColor }}
              />
            </div>

            <Button
              onClick={handleColorBackground}
              className="w-full"
              variant="primary"
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Color
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="image" className="space-y-4 mt-6">
          <div className="">
            <h3 className="text-sm font-medium text-white mb-2">
              Image Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Search and use high-quality images from Unsplash
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search for backgrounds..."
              className="flex-1 bg-slate-700 border-white/20 text-white"
            />

            <Button
              onClick={searchUnsplashImages}
              disabled={isSearching || !searchQuery.trim()}
              variant="primary"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {unsplashImages?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">
                Search Result ({unsplashImages?.length})
              </h4>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {unsplashImages.map((image) => {
                  return (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-colors"
                      onClick={() =>
                        handleImageBackground(image.urls.regular, image.id)
                      }
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || "Background image"}
                        className="w-full h-24 object-cover"
                      />

                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Download className="h-5 w-5 text-white" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                        <p className="text-xs text-white/80 truncate">
                          by {image.user.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isSearching && unsplashImages?.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                No images found for "{searchQuery}"
              </p>
              <p className="text-white/50 text-xs">
                Try a different search term
              </p>
            </div>
          )}

          {!searchQuery && unsplashImages?.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                Search for background images
              </p>
              <p className="text-white/50 text-xs">Powered by Unsplash</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-white/10 bottom-0 w-full">
        <Button
          onClick={handleRemoveBackground}
          className="w-full"
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas Background
        </Button>
      </div>
    </div>
  );
};

export default BackgroundControls;
