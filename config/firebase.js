const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

try {
  if (privateKey && privateKey !== 'your_private_key') {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.warn('Firebase Admin initialization skipped: Invalid or missing FIREBASE_PRIVATE_KEY in .env');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

module.exports = admin;
