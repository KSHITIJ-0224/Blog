'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';


function FeatureCard({ title, description, icon, delay }: { title: string; description: string; icon: string; delay: number }) {
  return (
    <div
      className="flex flex-col items-center text-center space-y-4 opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards", opacity: 0, animationName: "fadeInUp", animationDuration: "0.75s" }}
    >
      <div className="text-5xl">{icon}</div>
      <h4 className="text-xl font-semibold text-white">{title}</h4>
      <p className="text-indigo-200 max-w-sm">{description}</p>
    </div>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [showModal, setShowModal] = useState(false);


  const { data: user } = trpc.auth.me.useQuery();


  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      setShowModal(false);
      router.push('/');
    },
  });


  const signup = trpc.auth.register.useMutation({
    onSuccess: () => {
      setShowModal(false);
      router.push('/');
    },
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      signup.mutate({ email, password, name });
    } else {
      login.mutate({ email, password });
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Blurred Background - FIXED */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"></div>
      )}

      {/* Main Content */}
      <div className={showModal ? 'pointer-events-none' : ''}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">BlogPlatform</h1>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsSignup(false);
                  setShowModal(true);
                }}
                className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignup(true);
                  setShowModal(true);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>


        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-32 text-center overflow-hidden">
          <h2 className="text-5xl font-extrabold mb-6 animate-fade-in-down">Welcome to BlogPlatform</h2>
          <p className="max-w-3xl mx-auto text-lg mb-8 animate-fade-in-up">
            Discover amazing stories, tutorials, and insights from our community. Share your ideas with the world.
          </p>
          <button
            onClick={() => {
              setIsSignup(true);
              setShowModal(true);
            }}
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </button>
          <div className="absolute top-10 left-10 w-24 h-24 bg-indigo-400 rounded-full opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 rounded-full opacity-20 animate-pulse-slower"></div>
        </section>


        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-16">
          <FeatureCard
            title="Create Posts"
            description="Easy-to-use editor supports advanced formatting and rich media uploads."
            icon="✍️"
            delay={100}
          />
          <FeatureCard
            title="Community Interaction"
            description="Engage with readers through comments, likes, and sharing."
            icon="💬"
            delay={300}
          />
          <FeatureCard
            title="Analytics & SEO"
            description="Track readers and optimize posts for search engines easily."
            icon="📈"
            delay={500}
          />
        </section>


        {/* CTA Section */}
        <section className="bg-indigo-50 dark:bg-gray-800 py-20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h3 className="text-3xl font-bold mb-4">Ready to share your story?</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of writers and readers on BlogPlatform today.
            </p>
            <button
              onClick={() => {
                setIsSignup(true);
                setShowModal(true);
              }}
              className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
            >
              Start Writing For Free
            </button>
          </div>
        </section>


        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-800 text-gray-400 dark:text-gray-500 py-16 px-6 text-center mt-auto">
          <p>© 2025 BlogPlatform. All rights reserved.</p>
        </footer>
      </div>


      {/* Login/Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center">{isSignup ? 'Sign Up' : 'Sign In'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="submit"
                disabled={login.isPending || signup.isPending}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSignup ? (signup.isPending ? 'Signing up...' : 'Sign Up') : (login.isPending ? 'Logging in...' : 'Sign In')}
              </button>
              {login.error && <p className="text-red-600 text-sm">{login.error.message}</p>}
              {signup.error && <p className="text-red-600 text-sm">{signup.error.message}</p>}
            </form>
            <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-indigo-600 hover:underline"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes pulseSlower {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in-down { animation: fadeInDown 1s ease forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease forwards; }
        .animate-pulse-slow { animation: pulseSlow 6s ease infinite; }
        .animate-pulse-slower { animation: pulseSlower 10s ease infinite; }
      `}</style>
    </div>
  );
}
