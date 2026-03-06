import { db } from "./firebase";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp
} from "firebase/firestore";

export interface DevLog {
    id: string;
    title: string;
    content: string;
    tags: string[];
    status: 'Draft' | 'Published';
    publishedAt: any; // Firestore Timestamp
}

const LOGS_COLLECTION = "logs";

export const logService = {
    async getAllLogs(includeDrafts = false): Promise<DevLog[]> {
        let q = query(collection(db, LOGS_COLLECTION), orderBy("publishedAt", "desc"));

        if (!includeDrafts) {
            q = query(q, where("status", "==", "Published"));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as DevLog);
    },

    async saveLog(log: DevLog): Promise<void> {
        await setDoc(doc(db, LOGS_COLLECTION, log.id), {
            ...log,
            publishedAt: log.publishedAt || Timestamp.now()
        });
    },

    async deleteLog(logId: string): Promise<void> {
        await deleteDoc(doc(db, LOGS_COLLECTION, logId));
    }
};
