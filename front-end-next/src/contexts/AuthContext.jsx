"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { logOut } from "../firebase/auth";

// Create the auth context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      const { error: logoutError } = await logOut();
      if (logoutError) {
        setError(logoutError);
        return { error: logoutError };
      }
      setCurrentUser(null);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    }
  };

  // Get the current user's ID token (for API calls)
  const getIdToken = async (forceRefresh = false) => {
    if (!currentUser) {
      return { token: null, error: "No user is currently signed in" };
    }

    try {
      const token = await currentUser.getIdToken(forceRefresh);
      return { token, error: null };
    } catch (err) {
      setError(err.message);
      return { token: null, error: err.message };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Get user display information
  const getUserInfo = () => {
    if (!currentUser) return null;

    return {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      metadata: {
        creationTime: currentUser.metadata.creationTime,
        lastSignInTime: currentUser.metadata.lastSignInTime,
      },
    };
  };

  const value = {
    // User state
    currentUser,
    loading,
    error,

    // Helper functions
    signOut,
    getIdToken,
    isAuthenticated,
    getUserInfo,

    // Direct access to auth for advanced use cases
    auth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * USAGE EXAMPLES:
 *
 * 1. Check if user is logged in on any page:
 * ------------------------------------------
 * import { useAuth } from "@/contexts/AuthContext";
 *
 * export default function MyPage() {
 *   const { currentUser, loading, isAuthenticated } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!isAuthenticated()) return <div>Please sign in</div>;
 *
 *   return <div>Welcome, {currentUser.email}!</div>;
 * }
 *
 *
 * 2. Get user information:
 * ------------------------
 * const { getUserInfo } = useAuth();
 * const userInfo = getUserInfo();
 *
 * if (userInfo) {
 *   console.log(userInfo.email);
 *   console.log(userInfo.uid);
 *   console.log(userInfo.emailVerified);
 * }
 *
 *
 * 3. Sign out the user:
 * ---------------------
 * const { signOut } = useAuth();
 *
 * const handleSignOut = async () => {
 *   const { error } = await signOut();
 *   if (error) {
 *     console.error("Failed to sign out:", error);
 *   } else {
 *     router.push("/signin");
 *   }
 * };
 *
 *
 * 4. Get ID token for API calls:
 * ------------------------------
 * const { getIdToken } = useAuth();
 *
 * const callProtectedAPI = async () => {
 *   const { token, error } = await getIdToken();
 *
 *   if (error) {
 *     console.error("Failed to get token:", error);
 *     return;
 *   }
 *
 *   const response = await fetch("/api/protected-endpoint", {
 *     headers: {
 *       "Authorization": `Bearer ${token}`,
 *       "Content-Type": "application/json",
 *     },
 *   });
 *
 *   const data = await response.json();
 *   return data;
 * };
 *
 *
 * 5. Use with ProtectedRoute component:
 * -------------------------------------
 * import ProtectedRoute from "@/components/ProtectedRoute";
 *
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>This content is only visible to authenticated users</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
