import React from "react";
import { getFirestore, updateDoc, doc, query, collection, where, getDocs } from "firebase/firestore";

const NotificationDropdown = ({
  showNotifications,
  notifications,
  notificationsRef,
  handleApprove,
  handleReject
}) => {
  return (
    showNotifications && (
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
    )
  );
};

export default NotificationDropdown;