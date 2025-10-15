import React, { useEffect, useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { auth, db } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'

const AuthPage = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered');
    if (isSignInWithEmailLink(auth, window.location.href)) {
      console.log('isSignInWithEmailLink is true');
      setLoading(true);
      // Additional state management logic here
      let email = window.localStorage.getItem('emailForSignIn');
      console.log('Email from local storage:', email);
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
        console.log('Email from prompt:', email);
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then(async (result) => {
          console.log('signInWithEmailLink successful', result);
          window.localStorage.removeItem('emailForSignIn');
          const user = result.user
          if (user) {
            // Save user data to firestore
            const userRef = doc(db, 'users', user.uid)
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
            })
          }


          alert('Successfully signed in with email link!');
          window.location.replace('/')
          // Clear email from local storage
          // ... (Additional UI/navigation logic)
        })
        .catch((error) => {
          console.error('Error signing in with email link', error);
          alert(`Error signing in with email link: ${error.message}`)
        }).finally(() => {
          setLoading(false);
          console.log('Loading set to false in finally block');
        });
    } else {
      console.log('isSignInWithEmailLink is false');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
};

export default AuthPage;
