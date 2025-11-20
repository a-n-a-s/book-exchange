import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './Components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <div className="app min-h-screen bg-slate-50 font-sans text-slate-900">
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
      </div>
    </Router>
  );
}


const LandingPage = () => {
  return (
    <div className="landing-page min-h-screen flex flex-col">
      <Header />
   
      {/* Hero Section */}
      <section className="hero-section relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217121-9e93c8ddd37f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <span className="text-blue-400 font-semibold text-sm tracking-wide uppercase">The #1 Student Book Exchange</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Your Academic Library, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Reimagined.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-slate-300 leading-relaxed font-light">
            Connect with fellow students to share textbooks, reduce costs, and build your academic library efficiently.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="bg-white text-slate-900 font-bold py-4 px-10 rounded-xl text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
              Join Now - It's Free
            </Link>
            <Link to="/login" className="bg-slate-800/50 backdrop-blur-md border border-slate-700 text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              A seamless process designed for students, by students. Simple, fast, and secure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Catalog Your Books",
                desc: "Add your textbooks with detailed information including subject, semester, and branch.",
                color: "blue"
              },
              {
                step: "02",
                title: "Discover & Request",
                desc: "Browse through thousands of available books. Request the ones you need instantly.",
                color: "indigo"
              },
              {
                step: "03",
                title: "Exchange & Connect",
                desc: "Connect with book owners to arrange exchanges. Build your academic network.",
                color: "violet"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-slate-50 p-10 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`text-2xl font-bold text-${feature.color}-600`}>{feature.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Books Available", value: "1000+" },
              { label: "Active Students", value: "500+" },
              { label: "Branches", value: "50+" },
              { label: "Semesters", value: "8" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{stat.value}</div>
                <div className="text-sm md:text-base text-slate-400 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-20 blur-lg"></div>
                <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl aspect-square flex items-center justify-center">
                  <img src="/main.jpg" alt="Students studying" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 leading-tight">Empowering Students Through <span className="text-blue-600">Shared Resources</span></h2>
              <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                Our platform connects students across branches and semesters, creating a sustainable ecosystem for academic resources.
              </p>
              
              <div className="space-y-8">
                {[
                  { title: "Cost Effective", desc: "Save significantly on textbook costs by exchanging with fellow students." },
                  { title: "Academic Organization", desc: "Keep track of your books, borrowed items, and exchange history." },
                  { title: "Community Building", desc: "Connect with peers in your branch and semester, fostering collaboration." }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mr-5 mt-1">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-slate-600">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-indigo-600 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to Transform Your Academic Experience?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-slate-300">
            Join thousands of students who are already saving money and building knowledge through shared resources.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="bg-white text-slate-900 font-bold py-4 px-12 rounded-xl text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Get Started Today
            </Link>
            <Link to="/login" className="bg-transparent border border-slate-600 text-white font-bold py-4 px-12 rounded-xl text-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;