import React, { createContext, useContext, useState, useEffect } from "react";
import { type Project, getProjects } from "../api/projects";

interface ProjectContextType {
    projects: Project[];
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const refreshProjects = async () => {
        try {
            const data = await getProjects();
            // Ensure data is always an array
            const projectsList = Array.isArray(data) ? data : [];
            setProjects(projectsList);
            if (projectsList.length > 0 && activeProjectId === null) {
                setActiveProjectId(projectsList[0].id);
            }
        } catch (e) {
            console.error("Failed to fetch projects", e);
            setProjects([]); // Ensure projects is always an array
        }
    };

    useEffect(() => {
        refreshProjects();
    }, []);

    return (
        <ProjectContext.Provider value={{ projects, activeProjectId, setActiveProjectId, refreshProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
