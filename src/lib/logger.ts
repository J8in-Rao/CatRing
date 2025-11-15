'use client';
import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export type LogType = 
    | 'LOGIN' 
    | 'REGISTER' 
    | 'CREATE_PRODUCT' 
    | 'UPDATE_PRODUCT' 
    | 'DELETE_PRODUCT' 
    | 'CREATE_ORDER' 
    | 'UPDATE_ORDER_STATUS';

export function logAction(
    firestore: Firestore, 
    type: LogType, 
    details: { userId: string; description: string }
) {
    if (!firestore) return;

    const logData = {
        type,
        userId: details.userId,
        description: details.description,
        timestamp: serverTimestamp(),
    };

    const logsRef = collection(firestore, 'logs');
    addDocumentNonBlocking(logsRef, logData);
}
