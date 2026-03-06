import { db } from "./firebase";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";
import { Project } from "@/constants/projects";

const PROJECTS_COLLECTION = "projects";

export const projectService = {
    async getAllProjects(): Promise<Project[]> {
        const q = query(collection(db, PROJECTS_COLLECTION), orderBy("name"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Project);
    },

    async saveProject(project: Project): Promise<void> {
        await setDoc(doc(db, PROJECTS_COLLECTION, project.id), project);
    },

    async updateProject(projectId: string, data: Partial<Project>): Promise<void> {
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
        await updateDoc(projectRef, data);
    },

    async deleteProject(projectId: string): Promise<void> {
        await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    }
};
