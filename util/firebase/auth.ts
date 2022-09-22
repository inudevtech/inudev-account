import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { Dispatch, SetStateAction } from "react";
import {
  getAdditionalUserInfo,
  GithubAuthProvider,
  sendPasswordResetEmail,
  TwitterAuthProvider,
  User,
} from "@firebase/auth";
import auth from "./firebase";

const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

export const resetPassword = async (email?: string) => {
  if(email) {
  await sendPasswordResetEmail(auth, email);
  } else {
  await sendPasswordResetEmail(auth, <string>auth.currentUser?.email);
  }
};

export function login(
  type: number,
  email?: string,
  password?: string
): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    const persistence = setPersistence(auth, browserSessionPersistence);
    switch (type) {
      // メアド認証
      case 0:
        persistence
          .then(() =>
            resolve(signInWithEmailAndPassword(auth, email!, password!))
          )
          .catch((e) => reject(e));
        break;
      // Google認証
      case 1:
        persistence
          .then(() => resolve(signInWithPopup(auth, googleProvider)))
          .catch((e) => reject(e));
        break;
      // Twitter認証
      case 2:
        persistence
          .then(async () => {
            const user = await signInWithPopup(auth, twitterProvider);
            await updateProfile(user.user, {
              displayName: getAdditionalUserInfo(user)?.username!,
            });
            resolve(user);
          })
          .catch((e) => reject(e));
        break;
      // Github認証
      case 3:
        persistence
          .then(async () => {
            const user = await signInWithPopup(auth, githubProvider);
            await updateProfile(user.user, {
              displayName: getAdditionalUserInfo(user)?.username!,
            });
            resolve(user);
          })
          .catch((e) => reject(e));
        break;
      default:
        reject(new Error("認証方法が不正です"));
    }
  });
}

export function logout(reload?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    signOut(auth)
      .then(() => {
        if (reload) {
          window.location.reload();
        }
        resolve();
      })
      .catch((error) => reject(error));
  });
}

export async function signUp(
  type: number,
  email?: string,
  password?: string,
  displayName?: string
) {
  if (type === 0) {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email!,
      password!
    );
    await updateProfile(user, {
      displayName,
    });
    await sendEmailVerification(user);
  } else if (type > 0) {
    await login(type);
  }
}

export const onAuthStateChanged = (
  callback: Dispatch<SetStateAction<User | null>>
) => {
  onFirebaseAuthStateChanged(auth, async (user) => {
    if (
      user?.emailVerified ||
      user?.providerData[0].providerId !== "password"
    ) {
      callback(user);
    } else {
      await logout();
      callback(null);
    }
  });
};
