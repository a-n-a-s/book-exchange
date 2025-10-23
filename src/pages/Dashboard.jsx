import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser, isAuthenticated, returnBook } from "../db/db.action";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

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

  // Initialize refreshData ref to store the latest function
  const refreshDataRef = useRef();
  
  // Create refreshData function and update the ref
  const refreshData = React.useCallback(async () => {
    if (user) {
      // Add a small delay to ensure Firestore updates have propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchBooks(user.uid);
      await fetchNotifications(user.uid);
    }
  }, [user]);

  // Store the latest refreshData function in the ref
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

  // Refresh data periodically to catch new notifications
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        if (refreshDataRef.current) {
          await refreshDataRef.current();
        }
      }, 10000); // Refresh every 10 seconds

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
        // Set default availability to true if not set
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
        // Include only books that are available AND not owned by the current user
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
        where("status", "in", ["pending", "returned"]) // Include both pending and returned notifications
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
        where("status", "==", "pending") // Only count pending notifications in counter
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
        ownerId: book.ownerId, // The owner of the book
        requesterId: user.uid, // The person requesting the book
        requesterEmail: user.email,
        bookId: book.id,
        bookName: book.name,
        bookAuthor: book.author,
        status: "pending", // pending, approved, rejected
        requestedAt: new Date()
      };
      
      await addDoc(collection(db, "notifications"), notification);
      
      alert("Book request sent successfully!");
      // Refresh the data to update the UI for the requesting user
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
      
      // Update the notification status to approved
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
      // Refresh data to update the UI for both the owner and requester
      if (refreshDataRef.current) {
        await refreshDataRef.current();
      }
      
      // Optionally, send a push notification to the requester if using real-time updates
      // For now, we'll ensure both users see the updated state on their next refresh
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
      // Refresh data to update the UI
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
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation */}
      <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <h1 className="text-xl font-bold">Book Exchange Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition duration-300 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  Notifications
                  {actionableNotifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {actionableNotifications.length}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div ref={notificationsRef} className="absolute right-6 top-20 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <h3 className="font-bold text-lg text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              Notifications
            </h3>
          </div>
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-5 hover:bg-blue-50 transition duration-150 border-l-4 ${
                  notification.status === 'returned' ? 'border-green-500' : 'border-indigo-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {notification.status === 'returned' ? (
                        <p className="text-gray-800 font-medium">
                          <span className="font-semibold text-green-700">{notification.requesterEmail}</span> returned 
                          <span className="font-semibold text-gray-900"> {notification.bookName}</span> by {notification.bookAuthor}
                        </p>
                      ) : (
                        <p className="text-gray-800 font-medium">
                          <span className="font-semibold text-blue-700">{notification.requesterEmail}</span> requested 
                          <span className="font-semibold text-gray-900"> {notification.bookName}</span> by {notification.bookAuthor}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {new Date(notification.requestedAt?.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        notification.status === 'returned' ? 'bg-green-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                  
                  {notification.status === 'pending' && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleApprove(notification)}
                        className="flex-1 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300 text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(notification)}
                        className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition duration-300 text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {notification.status === 'returned' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Returned
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                You'll see all your book requests here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-800">{myBooks.length}</h3>
                <p className="text-gray-600">Your Books</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-800">{availableBooks.length}</h3>
                <p className="text-gray-600">Available Books</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-800">{takenBooks.length}</h3>
                <p className="text-gray-600">Taken Books</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Books Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Your Books
            </h2>
            <button
              onClick={() => setShowAddBookForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 flex items-center shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Book
            </button>
          </div>
          
          {myBooks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-dashed border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Added Yet</h3>
              <p className="text-gray-600 mb-4">Start building your collection by adding your textbooks.</p>
              <button
                onClick={() => setShowAddBookForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300"
              >
                Add Your First Book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book) => (
                <div key={book.id} className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${!book.available ? 'opacity-80 grayscale' : ''}`}>
                  <div className="flex">
                    <div className="w-2/5">
                      <img 
                        src={book.imageUrl || "https://placehold.co/150x200/e2e8f0/64748b?text=No+Image"} 
                        alt={book.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/5 p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{book.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                        </div>
                        {!book.available && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Issued
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600 mb-4">
                        <p className="flex justify-between">
                          <span className="font-medium">Pages:</span>
                          <span>{book.pages}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Subject:</span>
                          <span>{book.subject}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Branch:</span>
                          <span>{book.branch}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Sem:</span>
                          <span>{book.sem}</span>
                        </p>
                      </div>
                      
                      {!book.available && book.issuedToEmail && (
                        <div className="flex items-center pt-3 border-t border-gray-100">
                          <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                          </svg>
                          <span className="text-xs text-red-600">To: {book.issuedToEmail}</span>
                        </div>
                      )}
                      {book.available && (
                        <div className="pt-3 border-t border-gray-100">
                          <span className="text-xs text-green-600">Available for exchange</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Available Books Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Available Books
          </h2>
          
          {availableBooks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-dashed border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Available</h3>
              <p className="text-gray-600">Check back later or add your own books to see more options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="flex">
                    <div className="w-2/5">
                      <img 
                        src={book.imageUrl || "https://placehold.co/150x200/e2e8f0/64748b?text=No+Image"} 
                        alt={book.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/5 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{book.name}</h3>
                          <p className="text-gray-600 text-sm">by {book.author}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600 mb-4">
                        <p className="flex justify-between">
                          <span className="font-medium">Pages:</span>
                          <span>{book.pages}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Subject:</span>
                          <span>{book.subject}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Branch:</span>
                          <span>{book.branch}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Sem:</span>
                          <span>{book.sem}</span>
                        </p>
                      </div>
                      
                      {book.ownerId !== user.uid && (
                        <button 
                          onClick={() => requestBook(book)}
                          className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300 flex items-center justify-center text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                          </svg>
                          Request Exchange
                        </button>
                      )}
                      {book.ownerId === user.uid && (
                        <div className="pt-3 border-t border-gray-100">
                          <span className="text-xs text-blue-600">Your book</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Taken Books Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Taken Books
          </h2>
          
          {takenBooks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-dashed border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Taken</h3>
              <p className="text-gray-600">Request books from other users to start building your academic library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {takenBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="flex">
                    <div className="w-2/5">
                      <img 
                        src={book.imageUrl || "https://placehold.co/150x200/e2e8f0/64748b?text=No+Image"} 
                        alt={book.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/5 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{book.name}</h3>
                          <p className="text-gray-600 text-sm">by {book.author}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Taken
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600 mb-4">
                        <p className="flex justify-between">
                          <span className="font-medium">Pages:</span>
                          <span>{book.pages}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Subject:</span>
                          <span>{book.subject}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Branch:</span>
                          <span>{book.branch}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Sem:</span>
                          <span>{book.sem}</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center pt-3 border-t border-gray-100">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <span className="text-xs text-green-600">From: {book.ownerEmail}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleReturnBook(book)}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-300 flex items-center justify-center text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Return Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Book Modal */}
      {showAddBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Add New Book</h3>
                <button
                  onClick={() => setShowAddBookForm(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddBook}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Book Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter book name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Author Name</label>
                    <input
                      type="text"
                      name="author"
                      value={bookData.author}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter author name"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Book Image URL</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={bookData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Pages</label>
                    <input
                      type="number"
                      name="pages"
                      value={bookData.pages}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Number of pages"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={bookData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Subject name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Branch</label>
                    <select
                      name="branch"
                      value={bookData.branch}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Branch</option>
                      {['CSE', 'CSM', 'CIC', 'IT', 'AIDS', 'AIML', 'ECE', 'EVL', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'BIOTECH'].map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Semester (1-8)</label>
                    <select
                      name="sem"
                      value={bookData.sem}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Semester</option>
                      {[...Array(8)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBookForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;