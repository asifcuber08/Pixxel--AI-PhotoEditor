"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { Plus, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { BarLoader } from "react-spinners";
import NewPorjectModal from "./_components/new-project-modal";
import ProjectGrid from "./_components/project-grid";

const Dashboard = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const { data: projects, isLoading } = useConvexQuery(
    api.projects.getUserProjects
  );

  console.log(projects);

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="">
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Projects
            </h1>
            <p className="text-white/70">
              Create and manage your AI-powered image designs
            </p>
          </div>

          <Button
            onClick={() => setShowNewProjectModal(true)}
            variant="primary"
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <BarLoader width={"100%"} color="white" />
        ) : projects && projects.length > 0 ? (
          <ProjectGrid projects={projects}/>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-2xl font-semibold text-white mb-3">
              Create Your First Project
            </h3>

            <p className="text-white/70 mb-8 max-w-md">
              Upload an Image to start editing with our powerful AI tools
            </p>

            <Button
              onClick={() => setShowNewProjectModal(true)}
              variant="primary"
              size="xl"
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Start Creating
            </Button>
          </div>
        )}

        <NewPorjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
