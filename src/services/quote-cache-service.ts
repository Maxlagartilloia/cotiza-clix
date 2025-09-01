/**
 * @fileOverview A service for caching quotes in Firestore and storing files in Firebase Storage.
 */

import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { NormalizeAndMatchSchoolSuppliesOutput } from '@/ai/flows/normalize-and-match-school-supplies';

const QUOTES_COLLECTION = 'cachedQuotes';
const FILES_FOLDER = 'uploadedLists';

/**
 * Retrieves a cached quote from Firestore.
 * @param fileHash The SHA256 hash of the file content.
 * @returns The cached quote data, or null if not found.
 */
export async function getCachedQuote(fileHash: string): Promise<NormalizeAndMatchSchoolSuppliesOutput | null> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, fileHash);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // The document exists, return its data.
      // The data includes the fileURL, which we don't need here but is stored.
      return docSnap.data().quoteData as NormalizeAndMatchSchoolSuppliesOutput;
    } else {
      // The document does not exist.
      return null;
    }
  } catch (error) {
    console.error('Error getting cached quote:', error);
    // In case of error, we proceed as if there's no cache.
    return null;
  }
}

/**
 * Saves a new quote to the Firestore cache and uploads the file to Firebase Storage.
 * @param fileHash The SHA256 hash of the file content.
 * @param file The file object to upload.
 * @param quoteData The quote data to cache.
 */
export async function saveQuoteToCache(fileHash: string, file: File, quoteData: NormalizeAndMatchSchoolSuppliesOutput): Promise<void> {
  try {
    // 1. Upload the file to Firebase Storage
    const storageRef = ref(storage, `${FILES_FOLDER}/${fileHash}-${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const fileURL = await getDownloadURL(uploadResult.ref);
    
    console.log('File uploaded to:', fileURL);

    // 2. Save the quote data and the file URL to Firestore
    const docRef = doc(db, QUOTES_COLLECTION, fileHash);
    await setDoc(docRef, {
      fileURL,
      quoteData,
      createdAt: new Date(),
    });

    console.log(`Quote saved to cache with hash: ${fileHash}`);

  } catch (error) {
    console.error('Error saving quote to cache:', error);
    // We don't re-throw the error, as failing to cache shouldn't break the user's flow.
  }
}
