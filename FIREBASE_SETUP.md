# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "MotivaPlay"
4. Follow the setup wizard

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method

## 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select your region
5. Click "Enable"

## 4. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web app" icon (</>)
4. Register app with name "MotivaPlay"
5. Copy the firebaseConfig object

## 5. Add Environment Variables

Create `.env.local` file in project root with:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
\`\`\`

## 6. Seed Demo Data

Run the seeding script to create demo users:

\`\`\`bash
npx tsx scripts/seed-firebase.ts
\`\`\`

This will create:
- Admin: admin@motivaplay.com / admin123
- Employee: empleado@motivaplay.com / empleado123
- Employee: amiga@motivaplay.com / amiga123

## 7. Firestore Security Rules (Optional)

In Firebase Console > Firestore > Rules, add:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // All authenticated users can read prizes
    match /prizes/{prizeId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Add more rules for other collections as needed
  }
}
\`\`\`

## Next Steps

Once Firebase is configured, the app will automatically use Firebase instead of localStorage for all data persistence.
