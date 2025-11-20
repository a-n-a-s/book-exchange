import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser, isAuthenticated, returnBook } from "../db/db.action";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import NotificationDropdown from "../Components/NotificationDropdown";
import AddBookModal from "../Components/AddBookModal";
import StatsOverview from "../Components/StatsOverview";
import BookList from "../Components/BookList";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [actionableNotifications, setActionableNotifications] = useState([]);
  const [takenBooks, setTakenBooks] = useState([]);
  const [bookData, setBookData] = useState({
    name: "",
    author: "",
    imageUrl: "",
    pages: "",
    subject: "",
    branch: "",
    sem: ""
  });
  const [myBooks, setMyBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  
  const refreshDataRef = useRef();
  
  
  const refreshData = React.useCallback(async () => {
    if (user) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchBooks(user.uid);
      await fetchNotifications(user.uid);
    }
  }, [user]);

  useEffect(() => {
    refreshDataRef.current = refreshData;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      if (!authStatus) {
        navigate("/login");
      } else {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await fetchBooks(currentUser.uid);
        await fetchNotifications(currentUser.uid);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        if (refreshDataRef.current) {
          await refreshDataRef.current();
        }
      }, 10000); 

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBooks = async (userId) => {
    try {
      const db = getFirestore();
      
      // Fetch user's books
      const myBooksQuery = query(collection(db, "books"), where("ownerId", "==", userId));
      const myBooksSnapshot = await getDocs(myBooksQuery);
      const myBooksList = [];
      myBooksSnapshot.forEach((doc) => {
        const bookData = { id: doc.id, ...doc.data() };
      
        if (bookData.available === undefined) {
          bookData.available = true;
        }
        myBooksList.push(bookData);
      });
      setMyBooks(myBooksList);
      
      // Fetch all available books (excluding user's own and only show available ones)
      const allBooksSnapshot = await getDocs(collection(db, "books"));
      const availableBooksList = [];
      const takenBooksList = [];
      allBooksSnapshot.forEach((doc) => {
        const bookData = { id: doc.id, ...doc.data() };
        
        if (bookData.available !== false && bookData.ownerId !== userId) {
          availableBooksList.push(bookData);
        }
        // Include books that are issued to this user
        if (bookData.issuedTo === userId) {
          takenBooksList.push(bookData);
        }
      });
      setAvailableBooks(availableBooksList);
      setTakenBooks(takenBooksList);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const db = getFirestore();
      
      // Fetch all notifications (both pending and returned) for display
      const allNotificationsQuery = query(
        collection(db, "notifications"), 
        where("ownerId", "==", userId),
        where("status", "in", ["pending", "returned"]) 
      );
      const allNotificationsSnapshot = await getDocs(allNotificationsQuery);
      const allNotificationsList = [];
      allNotificationsSnapshot.forEach((doc) => {
        allNotificationsList.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(allNotificationsList);
      
      // Fetch only actionable notifications (only pending) for the counter
      const actionableNotificationsQuery = query(
        collection(db, "notifications"), 
        where("ownerId", "==", userId),
        where("status", "==", "pending") 
      );
      const actionableNotificationsSnapshot = await getDocs(actionableNotificationsQuery);
      const actionableNotificationsList = [];
      actionableNotificationsSnapshot.forEach((doc) => {
        actionableNotificationsList.push({ id: doc.id, ...doc.data() });
      });
      setActionableNotifications(actionableNotificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const requestBook = async (book) => {
    try {
      const db = getFirestore();
      
      // Create a notification document
      const notification = {
        ownerId: book.ownerId, 
        requesterId: user.uid, 
        requesterEmail: user.email,
        bookId: book.id,
        bookName: book.name,
        bookAuthor: book.author,
        status: "pending", 
        requestedAt: new Date()
      };
      
      await addDoc(collection(db, "notifications"), notification);
      
      alert("Book request sent successfully!");
      
      if (refreshDataRef.current) {
        await refreshDataRef.current();
      }
    } catch (error) {
      console.error("Error requesting book:", error);
      alert("Error sending book request. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData({
      ...bookData,
      [name]: value
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    
    try {
      const db = getFirestore();
      const bookToAdd = {
        ...bookData,
        ownerId: user.uid,
        ownerEmail: user.email,
        available: true,
        addedAt: new Date()
      };
      
      await addDoc(collection(db, "books"), bookToAdd);
      
      // Reset form and close modal
      setBookData({
        name: "",
        author: "",
        imageUrl: "",
        pages: "",
        subject: "",
        branch: "",
        sem: ""
      });
      setShowAddBookForm(false);
      
      // Refresh books list
      await fetchBooks(user.uid);
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Error adding book. Please try again.");
    }
  };

  const handleApprove = async (notification) => {
    try {
      const db = getFirestore();
      
      
      await updateDoc(doc(db, "notifications", notification.id), {
        status: "approved"
      });
      
      // Update the book's status to show it's no longer available and who it's issued to
      await updateDoc(doc(db, "books", notification.bookId), {
        available: false,
        issuedTo: notification.requesterId,
        issuedToEmail: notification.requesterEmail
      });
      
      alert("Book request approved. The book is no longer available for other requests.");
    
      if (refreshDataRef.current) {
        await refreshDataRef.current();
      }
     
    } catch (error) {
      console.error("Error approving book request:", error);
      alert("Error approving book request. Please try again.");
    }
  };

  const handleReject = async (notification) => {
    try {
      const db = getFirestore();
      
      // Update the notification status to rejected
      await updateDoc(doc(db, "notifications", notification.id), {
        status: "rejected"
      });
      
      alert("Book request rejected.");
     
      if (refreshDataRef.current) {
        await refreshDataRef.current();
      }
    } catch (error) {
      console.error("Error rejecting book request:", error);
      alert("Error rejecting book request. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleReturnBook = async (book) => {
    if (window.confirm(`Are you sure you want to return "${book.name}"?`)) {
      try {
        const success = await returnBook(book.id, user.uid);
        if (success) {
          alert("Book returned successfully!");
          // Refresh the dashboard data
          await refreshData();
        } else {
          alert("Error returning book. Please try again.");
        }
      } catch (error) {
        console.error("Error in handleReturnBook:", error);
        alert("Error returning book. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
     
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {actionableNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                      {actionableNotifications.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <NotificationDropdown
        showNotifications={showNotifications}
        notifications={notifications}
        notificationsRef={notificationsRef}
        handleApprove={handleApprove}
        handleReject={handleReject}
      />

    
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome back, {user.displayName || 'Student'}</h2>
          <p className="text-slate-500 text-lg">Manage your library and discover new books.</p>
        </div>

        <div className="mb-12">
          <StatsOverview 
            myBooks={myBooks} 
            availableBooks={availableBooks} 
            takenBooks={takenBooks} 
          />
        </div>

        <div className="space-y-16">
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Your Books
                </h3>
              </div>
              <button 
                onClick={() => setShowAddBookForm(true)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add New Book
              </button>
            </div>
            <BookList
              books={myBooks}
              type="my"
              onAddBook={() => setShowAddBookForm(true)}
              showAddButton={false} 
              user={user}
              onRequest={requestBook}
              onReturn={handleReturnBook}
            />
          </section>

          <section>
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                Available for Exchange
              </h3>
            </div>
            <BookList
              books={availableBooks}
              type="available"
              user={user}
              onRequest={requestBook}
              onReturn={handleReturnBook}
            />
          </section>

          <section>
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                Books You've Borrowed
              </h3>
            </div>
            <BookList
              books={takenBooks}
              type="taken"
              user={user}
              onRequest={requestBook}
              onReturn={handleReturnBook}
            />
          </section>
        </div>
      </div>
      
      <AddBookModal
        showAddBookForm={showAddBookForm}
        setShowAddBookForm={setShowAddBookForm}
        bookData={bookData}
        handleInputChange={handleInputChange}
        handleAddBook={handleAddBook}
      />
    </div>
  );
};

export default Dashboard;