import { Project } from "@/constants/projects";

export const projectService = {
    async getAllProjects(): Promise<Project[]> {
        const res = await fetch("/api/admin/projects");
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load projects");
        }
        return res.json();
    },

    async saveProject(project: Project): Promise<void> {
        const res = await fetch("/api/admin/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to save project");
        }
    },

    async updateProject(projectId: string, data: Partial<Project>): Promise<void> {
        // Since POST has merge capability, we fetch, merge and save
        const projects = await this.getAllProjects();
        const existing = projects.find(p => p.id === projectId);
        if (!existing) throw new Error("Project not found");

        const updated = { ...existing, ...data };
        await this.saveProject(updated);
    },

    async deleteProject(projectId: string): Promise<void> {
        const res = await fetch(`/api/admin/projects?id=${projectId}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to delete project");
        }
    }
};
