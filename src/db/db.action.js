import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getFirestore, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "./firebase";

// Register user with additional data (name, sem, branch)
const registerUser = async (name, email, password, sem, branch) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    

    await setDoc(doc(getFirestore(), "users", user.uid), {
      name: name,
      email: email,
      sem: sem,
      branch: branch,
      createdAt: new Date()
    });
    
    console.log("User registered:", user);
    return user;
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions error - user created but profile not saved in Firestore. Please update your Firestore Security Rules.");
     
      const userCredential = error.user; 
      return userCredential || null;
    }
    return null;
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User logged in:", user);
    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

// Logout user
const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Get current user
const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Check if user is authenticated
const isAuthenticated = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user); 
    });
  });
};

// Return a book that was taken
const returnBook = async (bookId, userId) => {
  try {
    const db = getFirestore();
    const bookRef = doc(db, "books", bookId);
    
   
    const bookDoc = await getDoc(bookRef);
    if (!bookDoc.exists()) {
      throw new Error("Book not found");
    }
    
    const bookData = bookDoc.data();
    const requesterEmail = bookData.issuedToEmail || "-"; 
    
    // Update the book document to set it as available again and remove the issuedTo field
    await updateDoc(bookRef, {
      available: true,
      issuedTo: null,
      issuedToEmail: null
    });
    
    // Create a return notification for the book owner
    if (bookDoc.exists()) {
      await setDoc(doc(db, "notifications", `return_${Date.now()}_${bookId}`), {
        ownerId: bookData.ownerId,
        requesterId: userId,
        requesterEmail: requesterEmail,
        bookId: bookId,
        bookName: bookData.name,
        bookAuthor: bookData.author,
        status: "returned",
        requestedAt: serverTimestamp()
      });
    }
    
    console.log("Book returned successfully:", bookId);
    return true;
  } catch (error) {
    console.error("Error returning book:", error);
    return false;
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  returnBook
};



