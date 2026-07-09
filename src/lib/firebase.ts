import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection Names
export const COLLECTIONS = {
  ACTIVITIES: 'activities',
  JOIN_SUBMISSIONS: 'join_submissions',
  CONTACT_SUBMISSIONS: 'contact_submissions',
};

// Default seed activities
const DEFAULT_ACTIVITIES = [
  {
    title: "Project Vidya: Education for All",
    description: "Our flagship education program focuses on providing quality tutoring, books, and educational supplies to children in underserved communities. We believe that education is the ultimate tool to break the cycle of poverty and empower the next generation.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Education",
    date: "2026-06-15",
    location: "Sarthak Learning Centers",
    goalReached: "500+ children educated",
    details: "Project Vidya has set up 5 learning centers that run after-school support classes. Our volunteers teach mathematics, sciences, and English. We also hold weekly computer literacy workshops. Thanks to our donors, we distributed 1,200 school bags and stationery kits this term."
  },
  {
    title: "Project Annapurna: Nutritious Meal Drives",
    description: "No one should go to bed hungry. Through Project Annapurna, we conduct weekly food distribution drives in slums and around public hospitals, providing freshly cooked, healthy, and hygienic meals to those in need.",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Food Relief",
    date: "2026-06-28",
    location: "Slum Clusters & Metro Suburbs",
    goalReached: "15,000+ meals served",
    details: "Our community kitchen prepares balanced meals of rice, lentils, and vegetables. We have a robust volunteer network that helps package and distribute food with dignity and hygiene. We also counsel families on affordable nutrition practices."
  },
  {
    title: "Project GreenBajali: Tree Plantation Drives",
    description: "Caring for nature starts with action. We bring students and neighbors together to plant trees in our local areas to keep our community green and healthy. To make it personal, we also encourage every member to plant a tree on their birthday as a meaningful gift to the Earth.",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Environment",
    date: "2026-07-02",
    location: "Bajali & Pathsala Sectors",
    goalReached: "2,000+ Saplings Planted",
    details: "Project GreenBajali organizes local plantation campaigns involving school students, community elders, and youth. We supply native saplings including mango, neem, and amla. Our birthday-plantation initiative urges everyone to celebrate with a gift of life to Mother Nature."
  },
  {
    title: "Arogya: Community Health & Wellness Camp",
    description: "Bridging the gap in primary healthcare. We organize free medical check-up camps, eye screening, dental care, and essential medicine distribution in remote rural areas and urban settlements lacking medical access.",
    imageUrl: "https://images.unsplash.com/photo-1504813184591-015578f1c3f5?auto=format&fit=crop&w=800&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1504813184591-015578f1c3f5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584515901107-d4644e545580?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Healthcare",
    date: "2026-07-05",
    location: "Rural Outskirts",
    goalReached: "2,500+ patients treated",
    details: "Partnering with voluntary doctors and specialists, our health camps provide pediatric care, general check-ups, sugar/BP monitoring, and eye screenings. We distribute free glasses to those with vision impairment and refer critical cases to partner charitable hospitals."
  }
];

export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  category: string;
  date: string;
  location: string;
  goalReached?: string;
  details?: string;
  createdAt?: any;
}

export interface JoinSubmission {
  id?: string;
  name: string;
  phone: string;
  email: string;
  recentImage?: string; // Base64 data URL
  address: string;
  dob: string;
  bloodGroup: string;
  agreeToDonateBlood: 'Yes' | 'No';
  educationalQualification: string;
  termsAccepted: boolean;
  status?: 'pending' | 'accepted' | 'rejected';
  submittedAt?: any;
}

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed Database if Empty (Checks and seeds Cloud Firestore if it has 0 items and hasn't been seeded before)
export async function seedDatabaseIfEmpty() {
  const path = COLLECTIONS.ACTIVITIES;
  try {
    const configDocRef = doc(db, 'system', 'config');
    const configSnap = await getDoc(configDocRef);
    if (configSnap.exists() && configSnap.data()?.seeded) {
      // Already seeded once, do not seed again even if activities collection is empty
      return;
    }

    const actCol = collection(db, path);
    const snapshot = await getDocs(actCol);
    if (snapshot.empty) {
      console.log("Seeding initial default activities to Firestore...");
      for (const act of DEFAULT_ACTIVITIES) {
        await addDoc(actCol, {
          ...act,
          createdAt: new Date().toISOString()
        });
      }
      // Save seed state so we don't re-seed if the user deletes all entries
      await setDoc(configDocRef, { seeded: true });
    }
  } catch (err) {
    console.error("Failed to seed database: ", err);
  }
}

// Subscribe to real-time changes in activities
export function subscribeActivities(onUpdate: (activities: Activity[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, COLLECTIONS.ACTIVITIES));
  return onSnapshot(q, (snapshot) => {
    const activities: Activity[] = [];
    snapshot.forEach((docSnap) => {
      activities.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Activity);
    });
    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(activities);
  }, (err) => {
    console.error("Error in subscribeActivities listener: ", err);
    if (onError) onError(err);
  });
}

// Fetch all activities
export async function getActivities(): Promise<Activity[]> {
  const path = COLLECTIONS.ACTIVITIES;
  try {
    const actCol = collection(db, path);
    const snapshot = await getDocs(actCol);
    const activities: Activity[] = [];
    snapshot.forEach((docSnap) => {
      activities.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Activity);
    });
    // Sort by date descending
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

// Create activity
export async function createActivity(activity: Omit<Activity, 'id'>): Promise<string> {
  const path = COLLECTIONS.ACTIVITIES;
  try {
    const actCol = collection(db, path);
    const docRef = await addDoc(actCol, {
      ...activity,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Update activity
export async function updateActivity(id: string, activity: Partial<Activity>): Promise<void> {
  const path = `${COLLECTIONS.ACTIVITIES}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.ACTIVITIES, id);
    await updateDoc(docRef, activity);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Delete activity
export async function deleteActivity(id: string): Promise<void> {
  const path = `${COLLECTIONS.ACTIVITIES}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.ACTIVITIES, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Submit Join Form
export async function submitJoinForm(submission: JoinSubmission): Promise<string> {
  const path = COLLECTIONS.JOIN_SUBMISSIONS;
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...submission,
      status: submission.status || 'pending',
      submittedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Update Join Submission (for status or edit)
export async function updateJoinSubmission(id: string, submission: Partial<JoinSubmission>): Promise<void> {
  const path = `${COLLECTIONS.JOIN_SUBMISSIONS}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.JOIN_SUBMISSIONS, id);
    await updateDoc(docRef, submission);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

// Delete Join Submission / Team Member
export async function deleteJoinSubmission(id: string): Promise<void> {
  const path = `${COLLECTIONS.JOIN_SUBMISSIONS}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.JOIN_SUBMISSIONS, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

// Submit Contact Form
export async function submitContactForm(submission: ContactSubmission): Promise<string> {
  const path = COLLECTIONS.CONTACT_SUBMISSIONS;
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...submission,
      submittedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Fetch all Join Submissions
export async function getJoinSubmissions(): Promise<JoinSubmission[]> {
  const path = COLLECTIONS.JOIN_SUBMISSIONS;
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    const submissions: JoinSubmission[] = [];
    snapshot.forEach((docSnap) => {
      submissions.push({
        id: docSnap.id,
        ...docSnap.data()
      } as JoinSubmission);
    });
    return submissions.sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

// Fetch all Contact Submissions
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const path = COLLECTIONS.CONTACT_SUBMISSIONS;
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    const submissions: ContactSubmission[] = [];
    snapshot.forEach((docSnap) => {
      submissions.push({
        id: docSnap.id,
        ...docSnap.data()
      } as ContactSubmission);
    });
    return submissions.sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}
