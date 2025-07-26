import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UpgradeModal from "@/components/upgrade-modal";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { Crown, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const NewPorjectModal = ({ isOpen, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [seletedFile, setSeletedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setSeletedFile(null);
    setPreviewUrl(null);
    setProjectTitle("");
    setIsUploading(false);
    onClose();
  };

  const { isFree, canCreateProject } = usePlanAccess();
  const { data: projects } = useConvexQuery(api.projects.getUserProjects);
  const { mutate: createProject } = useConvexMutation(api.projects.create);

  const currentProjectCount = projects?.length || 0;
  const canCreate = canCreateProject(currentProjectCount);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      setSeletedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setProjectTitle(nameWithoutExt || "Untitled Project");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB limit
  });

  const handleCreateProject = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true);
      return;
    }

    if (!seletedFile || !projectTitle.trim()) {
      toast.error("Please select an image and enter a project title");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", seletedFile);
      formData.append("filename", seletedFile.name);

      const uploadResponse = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      const projectId = await createProject({
        title: projectTitle.trim(),
        originalImageUrl: uploadData.url,
        currentImageUrl: uploadData.url,
        thumbnailUrl: uploadData.thumbnailUrl,
        width: uploadData.width || 800,
        height: uploadData.height || 600,
        canvasState: null,
      });

      toast.success("Project created successfully!");

      router.push(`/editor/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Create New Project
            </DialogTitle>

            {isFree && (
              <Badge variant="Secondary" className="bg-slate-700 text-white/70">
                {currentProjectCount}/3 projects
              </Badge>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {isFree && currentProjectCount >= 2 && (
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <Crown className="h-5 w-5 text-amber-400" />
                <AlertDescription className="text-amber-300/80">
                  <div className="font-semibold text-amber-400 mb-1">
                    {currentProjectCount === 2
                      ? "Last Free Project"
                      : "Project Limit Reached"}

                    {currentProjectCount === 2
                      ? "This will be your last free project. Upgrade to Pixxel Pro for unlimited projects."
                      : "Free Plan is limited to 3 projects. Upgrade to Pixxel Pro to create more projects."}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Area */}
            {!seletedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-cyan-400 bg-cyan-400/40"
                    : "border-white/20 hover:border-white/40"
                } ${!canCreate ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? "Drop your image here" : "Upload an Image"}
                </h3>
                <p className="text-white/70 mb-4">
                  {canCreate
                    ? "Drag and drop your image, or click to browse"
                    : "upgrade to Pro to create more projects"}
                </p>{" "}
                <p className="text-sm text-white/50">
                  Support PNG, JPG, WEBP up to 20MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border border-white/10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSeletedFile(null);
                      setPreviewUrl(null);
                      setProjectTitle("");
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-title" className="text-white">
                    Project Title
                  </Label>
                  <Input
                    id="project-title"
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project name..."
                    className="bg-slate-700 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">
                        {seletedFile.name}
                      </p>
                      <p className="text-white/70 text-sm">
                        {(seletedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className={"gap-3"}>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading}
              className="text-white/70 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateProject}
              disabled={!seletedFile || !projectTitle.trim() || isUploading}
              variant="primary"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool="projects"
        reason="Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects and access to all AI editing tools."
      />
    </>
  );
};

export default NewPorjectModal;
