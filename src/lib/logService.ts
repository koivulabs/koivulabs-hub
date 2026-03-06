import { db } from "./firebase";
import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
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
        const q = query(collection(db, LOGS_COLLECTION), orderBy("publishedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map(doc => doc.data() as DevLog);
        return includeDrafts ? logs : logs.filter(log => log.status === 'Published');
    },

    async saveLog(log: DevLog): Promise<void> {
        await setDoc(doc(db, LOGS_COLLECTION, log.id), {
            ...log,
            publishedAt: log.publishedAt || Timestamp.now()
        });
    },

    async getLog(logId: string): Promise<DevLog | null> {
        const docSnap = await getDoc(doc(db, LOGS_COLLECTION, logId));
        return docSnap.exists() ? docSnap.data() as DevLog : null;
    },

    async deleteLog(logId: string): Promise<void> {
        await deleteDoc(doc(db, LOGS_COLLECTION, logId));
    }
};
