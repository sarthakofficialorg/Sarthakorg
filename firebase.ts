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
  serverTimestamp
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
    category: "Food Relief",
    date: "2026-06-28",
    location: "Slum Clusters & Metro Suburbs",
    goalReached: "15,000+ meals served",
    details: "Our community kitchen prepares balanced meals of rice, lentils, and vegetables. We have a robust volunteer network that helps package and distribute food with dignity and hygiene. We also counsel families on affordable nutrition practices."
  },
  {
    title: "Project Swabalamban: Women's Skill Training",
    description: "Empowering women means empowering entire families. We offer vocational training courses in sewing, stitching, embroidery, and basic digital skills to help women from marginalized backgrounds achieve financial independence.",
    imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    category: "Livelihood",
    date: "2026-07-02",
    location: "SARTHAK Skill Hub",
    goalReached: "120+ women self-employed",
    details: "Swabalamban provides a 3-month certified training curriculum. Upon completion, we assist trainees in securing sewing machines on a subsidized basis and connect them with local garment boutiques and home-business networks to start earning immediately."
  },
  {
    title: "Arogya: Community Health & Wellness Camp",
    description: "Bridging the gap in primary healthcare. We organize free medical check-up camps, eye screening, dental care, and essential medicine distribution in remote rural areas and urban settlements lacking medical access.",
    imageUrl: "https://images.unsplash.com/photo-1504813184591-015578f1c3f5?auto=format&fit=crop&w=800&q=80",
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
  email: string;
  phone: string;
  skills: string;
  message: string;
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

// Seed Database if Empty (Checks and seeds Cloud Firestore if it has 0 items)
export async function seedDatabaseIfEmpty() {
  const path = COLLECTIONS.ACTIVITIES;
  try {
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
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
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
      submittedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
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
