const DEMO_AUTH_STORAGE_KEY = "sundry_demo_user";

export function isAuthProviderDisabled(error) {
  return error?.code === "auth/operation-not-allowed";
}

export function toAuthMessage(error, action = "authenticate") {
  const code = error?.code;

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }

  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }

  if (code === "auth/email-already-in-use") {
    return "An account already exists for this email.";
  }

  if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
    return "Email or password is incorrect.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Email/password auth is disabled in Firebase. Enable it in Authentication > Sign-in method, or use demo mode.";
  }

  const fallbackMessage = error?.message || "Authentication failed.";
  return `Could not ${action}. ${fallbackMessage}`;
}

export function createDemoUser(email) {
  return {
    uid: `demo-${Date.now()}`,
    email: email || "demo@email.com",
    isDemo: true,
  };
}

export function saveDemoUser(user) {
  localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getDemoUser() {
  const raw = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isDemo && typeof parsed.uid === "string") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function clearDemoUser() {
  localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
}
