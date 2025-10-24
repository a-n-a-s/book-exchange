import React from "react";

const BookCard = ({ 
  book, 
  type = "available", // 'available', 'my', 'taken'
  onRequest = null, 
  onReturn = null,
  user = null
}) => {
  const handleRequest = () => {
    if (onRequest) {
      onRequest(book);
    }
  };

  const handleReturn = () => {
    if (onReturn) {
      onReturn(book);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
      type === 'my' && !book.available ? 'opacity-80 grayscale' : ''
    }`}>
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
              <p className="text-gray-600 text-sm">{book.author}</p>
            </div>
            {type === 'my' && !book.available && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Issued
              </span>
            )}
            {type === 'available' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            )}
            {type === 'taken' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Taken
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
          
          {type === 'my' && !book.available && book.issuedToEmail && (
            <div className="flex items-center pt-3 border-t border-gray-100">
              <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span className="text-xs text-red-600">To: {book.issuedToEmail}</span>
            </div>
          )}
          
          {type === 'my' && book.available && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-green-600">Available for exchange</span>
            </div>
          )}
          
          {type === 'taken' && book.ownerEmail && (
            <div className="flex items-center pt-3 border-t border-gray-100">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="text-xs text-green-600">From: {book.ownerEmail}</span>
            </div>
          )}
          
          {type === 'available' && book.ownerId !== user?.uid && (
            <button 
              onClick={handleRequest}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300 flex items-center justify-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              Request Exchange
            </button>
          )}
          
          {type === 'available' && book.ownerId === user?.uid && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-blue-600">Your book</span>
            </div>
          )}
          
          {type === 'taken' && (
            <button 
              onClick={handleReturn}
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-300 flex items-center justify-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Return Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;