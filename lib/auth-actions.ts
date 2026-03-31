'use client'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  type ConfirmationResult,
  type MultiFactorError,
  type MultiFactorResolver,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, githubProvider } from './firebase'

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use':      'An account with this email already exists.',
  'auth/invalid-email':             'Invalid email address.',
  'auth/weak-password':             'Password must be at least 6 characters.',
  'auth/user-not-found':            'No account found with this email.',
  'auth/wrong-password':            'Incorrect password.',
  'auth/invalid-credential':        'Incorrect email or password.',
  'auth/too-many-requests':         'Too many attempts. Try again later.',
  'auth/operation-not-allowed':     'This sign-in method is not enabled.',
  'auth/popup-closed-by-user':      'Sign-in popup was closed.',
  'auth/cancelled-popup-request':   'Sign-in cancelled.',
  'auth/network-request-failed':    'Network error. Check your connection.',
  'auth/invalid-verification-code': 'Invalid verification code.',
  'auth/missing-phone-number':      'Please enter a phone number.',
  'auth/invalid-phone-number':      'Invalid phone number. Use format: +63XXXXXXXXXX',
  'auth/code-expired':              'Code expired. Request a new one.',
  'auth/session-expired':           'Session expired. Please try again.',
  'auth/missing-verification-code': 'Please enter the verification code.',
}

function friendlyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code
    return AUTH_ERRORS[code] ?? `Error: ${code}`
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

async function saveUserToFirestore(uid: string, name: string, email: string) {
  try {
    await setDoc(doc(db, 'users', uid), { name, email, createdAt: serverTimestamp() }, { merge: true })
  } catch (e) {
    console.warn('Firestore save skipped:', e)
  }
}

export async function signInEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  } catch (err: unknown) {
    // Re-throw MFA errors as-is so the component can intercept them
    if (err && typeof err === 'object' && 'code' in err &&
        (err as { code: string }).code === 'auth/multi-factor-auth-required') {
      throw err
    }
    throw new Error(friendlyError(err))
  }
}

export async function signUpEmail(name: string, email: string, password: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await saveUserToFirestore(cred.user.uid, name, email)
    return cred.user
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function signInGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    await saveUserToFirestore(cred.user.uid, cred.user.displayName ?? '', cred.user.email ?? '')
    return cred.user
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function signInGithub() {
  try {
    const cred = await signInWithPopup(auth, githubProvider)
    await saveUserToFirestore(cred.user.uid, cred.user.displayName ?? '', cred.user.email ?? '')
    return cred.user
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function startPhoneSignIn(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function confirmPhoneOTP(confirmationResult: ConfirmationResult, otp: string) {
  try {
    const cred = await confirmationResult.confirm(otp)
    await saveUserToFirestore(cred.user.uid, cred.user.displayName ?? '', cred.user.phoneNumber ?? '')
    return cred.user
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function startMFAChallenge(
  mfaError: MultiFactorError,
  recaptchaVerifier: RecaptchaVerifier
): Promise<{ resolver: MultiFactorResolver; verificationId: string }> {
  try {
    const resolver = getMultiFactorResolver(auth, mfaError)
    const phoneInfoOptions = { multiFactorHint: resolver.hints[0], session: resolver.session }
    const phoneAuthProvider = new PhoneAuthProvider(auth)
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
    return { resolver, verificationId }
  } catch (err) { throw new Error(friendlyError(err)) }
}

export async function confirmMFAOTP(
  resolver: MultiFactorResolver,
  verificationId: string,
  otp: string
) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp)
    const assertion = PhoneMultiFactorGenerator.assertion(credential)
    await resolver.resolveSignIn(assertion)
  } catch (err) { throw new Error(friendlyError(err)) }
}
