# 🏷️ Patch Documentation: `PATCH-001-STABILITY-SAFEGUARDS`

* **Patch Code:** `PATCH-001-STABILITY-SAFEGUARDS` (or shorthand **`P001`**)
* **Date:** 2026-10-14
* **Purpose:** Fixes Next.js Node 24 webpack font crash, TypeScript strict inference, and client-side white-screen crashes before API keys are supplied.

Agar aapko in changes ko kabhi bhi **revert (wapas pehle jaisa)** karna ho, toh har change ka code aur revert karne ka exact snippet niche diya gaya hai.

---

## 📌 Sub-Code 1: `CODE-01-FONT`
* **Files:** `frontend/src/app/layout.tsx` & `frontend/src/styles/globals.css`
* **Reason:** Node 24 me `@next/font/google` compilation crash fix kiya.

### How to Revert `CODE-01-FONT`:
1. In `frontend/src/app/layout.tsx`, replace the `<head>` link tags with:
```tsx
import { Fredoka, Nunito } from 'next/font/google';

const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', weight: ['400', '600', '700'] });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['400', '600', '700', '900'] });

// In RootLayout:
<html lang="en" className={`${fredoka.variable} ${nunito.variable} scroll-smooth`}>
```
2. In `frontend/src/styles/globals.css`, remove the first line:
```css
/* DELETE THIS LINE: */
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap');
```

---

## 📌 Sub-Code 2: `CODE-02-FIREBASE-GUARD`
* **File:** `frontend/src/config/firebase.ts`
* **Reason:** Blank keys ke sath Firebase crash ko roka taaki preview smoothly chale.

### Current Code:
```typescript
const hasValidConfig = !!clientEnv.FIREBASE_CONFIG?.apiKey;
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (hasValidConfig) {
  app = !getApps().length ? initializeApp(clientEnv.FIREBASE_CONFIG) : getApp();
  authInstance = getAuth(app);
}

export const auth = authInstance;
```

### How to Revert `CODE-02-FIREBASE-GUARD`:
Replace `frontend/src/config/firebase.ts` with original unconditional initialization:
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { clientEnv } from './env';

const app = !getApps().length ? initializeApp(clientEnv.FIREBASE_CONFIG) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'kiet.edu',
});
```

---

## 📌 Sub-Code 3: `CODE-03-AUTH-GUARD`
* **Files:** `frontend/src/hooks/useAuth.ts` & `frontend/src/services/api.ts`
* **Reason:** `auth is null` runtime TypeErrors ko roka.

### How to Revert `CODE-03-AUTH-GUARD`:
1. In `frontend/src/services/api.ts`, change line 14 back to:
```typescript
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
2. In `frontend/src/hooks/useAuth.ts`, remove the `if (!auth)` guards in `useEffect`, `loginWithGoogle`, and `logout`.

---

## 📌 Sub-Code 4: `CODE-04-BRANCH-TYPE`
* **File:** `frontend/src/app/admin/manual-entry/page.tsx`
* **Reason:** Dropdown change par TypeScript error `TS2322` ("Type 'string' is not assignable to 'CSE ai'") ko fix kiya.

### Current Code:
```typescript
const [formData, setFormData] = useState<{
  name: string;
  collegeId: string;
  year: string;
  branch: string;
  section: string;
  phone: string;
  email: string;
  notes: string;
}>({ ... });
```

### How to Revert `CODE-04-BRANCH-TYPE`:
Remove the explicit generic type:
```typescript
const [formData, setFormData] = useState({
  name: '',
  collegeId: '',
  year: '1',
  branch: ALLOWED_BRANCHES[0],
  section: 'A',
  phone: '',
  email: '',
  notes: 'Paid via cash at offline desk',
});
```

---

## ⚡ One-Click Revert All Command

Agar aapko yeh saari changes ek hi baar me wapas pehle jaisi karni hon via Git:

```powershell
cd "c:\Users\Ankit Singh Tomar\AmongU"
git checkout frontend/src/app/layout.tsx frontend/src/config/firebase.ts frontend/src/hooks/useAuth.ts frontend/src/services/api.ts frontend/src/styles/globals.css
```
*(Yeh command in sabhi files ko turant unke initial state me revert kar dega.)*
