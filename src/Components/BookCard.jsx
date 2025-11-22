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
    <div className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full ${
      type === 'my' && !book.available ? 'opacity-75 grayscale-[0.5]' : ''
    }`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <img 
          src={book.imageUrl || "https://placehold.co/300x400/e2e8f0/64748b?text=No+Image"} 
          alt={book.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          {type === 'my' && !book.available && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shadow-sm">
              Issued
            </span>
          )}
          {type === 'available' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              Available
            </span>
          )}
          {type === 'taken' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
              Taken
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-4 flex-grow">
          <h3 className="font-bold text-base text-slate-800 mb-1 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{book.name}</h3>
          <p className="text-slate-500 text-sm font-medium">{book.author}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Pages</span>
            <span className="font-medium text-slate-700">{book.pages}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Subject</span>
            <span className="font-medium text-slate-700 truncate">{book.subject}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Branch</span>
            <span className="font-medium text-slate-700">{book.branch}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Sem</span>
            <span className="font-medium text-slate-700">{book.sem}</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-3">
          {type === 'my' && !book.available && book.issuedToEmail && (
            <div className="flex items-center p-2 bg-red-50 rounded-lg border border-red-100">
              <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="text-xs text-red-700 font-medium truncate">To: {book.issuedToEmail}</span>
            </div>
          )}
          
          {type === 'taken' && book.ownerEmail && (
            <div className="flex items-center p-2 bg-purple-50 rounded-lg border border-purple-100">
              <svg className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="text-xs text-purple-700 font-medium truncate">From: {book.ownerEmail}</span>
            </div>
          )}
          
          {type === 'available' && book.ownerId !== user?.uid && (
            <button 
              onClick={handleRequest}
              className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium group-hover:translate-y-[-2px]"
            >
              Request Exchange
            </button>
          )}
          
          {type === 'available' && book.ownerId === user?.uid && (
            <div className="text-center py-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Listing</span>
            </div>
          )}
          
          {type === 'taken' && (
            <button 
              onClick={handleReturn}
              className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 flex items-center justify-center text-sm font-medium"
            >
              Return Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;