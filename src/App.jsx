import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './Components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <style jsx>{`
          .app {
            min-height: 100vh;
          }
          .main-content {
            padding: 2rem;
            text-align: center;
          }
        `}</style>
      </div>
    </Router>
  );
}

// Protected Route Component
// Landing Page Component
const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Academic Book Exchange Platform
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Connect with fellow students to share textbooks, reduce costs, and build your academic library efficiently
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-700 font-bold py-4 px-10 rounded-lg text-lg hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl">
              Join Now - It's Free
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-white hover:text-blue-700 transition duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">How Our Platform Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A seamless process designed for students, by students
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-blue-700">01</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Catalog Your Books</h3>
              <p className="text-gray-600">
                Add your textbooks with detailed information including subject, semester, and branch to help other students find what they need.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-green-700">02</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Discover & Request</h3>
              <p className="text-gray-600">
                Browse through thousands of available books. Request the ones you need and get notified when owners respond.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-purple-700">03</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Exchange & Connect</h3>
              <p className="text-gray-600">
                Connect with book owners to arrange exchanges. Build your academic network while saving on textbook costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-lg">Books Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg">Active Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg">Branches</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">8</div>
              <div className="text-lg">Semesters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center text-gray-500">
                Student Collaboration Illustration
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Empowering Students Through Shared Resources</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Our platform connects students across branches and semesters, creating a sustainable ecosystem for academic resources.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 mt-1">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Cost Effective</h3>
                    <p className="text-gray-600">
                      Save significantly on textbook costs by exchanging with fellow students instead of purchasing new copies.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 mt-1">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Academic Organization</h3>
                    <p className="text-gray-600">
                      Keep track of your books, borrowed items, and exchange history in one organized dashboard.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 mt-1">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Building</h3>
                    <p className="text-gray-600">
                      Connect with peers in your branch and semester, fostering a collaborative learning environment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-gradient-to-r from-blue-800 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Academic Experience?</h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Join thousands of students who are already saving money and building knowledge through shared resources
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-700 font-bold py-4 px-10 rounded-lg text-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              Get Started Today
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-white hover:text-blue-700 transition duration-300">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero-section {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
        }
        .features-section, .stats-section, .benefits-section, .cta-section {
          padding: 4rem 1rem;
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  
  React.useEffect(() => {
    const checkAuth = async () => {
      const dbActions = await import('./db/db.action');
      const authStatus = await dbActions.isAuthenticated();
      setIsAuthenticated(authStatus);
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;