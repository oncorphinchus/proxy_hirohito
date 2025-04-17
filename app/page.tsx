import ServerMonitor from '../components/ServerMonitor';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Linode Server
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent px-2">
              Monitor
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
            Real-time monitoring for your server resources and proxy status with detailed analytics
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-100">
          <ServerMonitor />
        </div>
        
        <footer className="mt-16 text-center text-gray-500 text-sm pb-8">
          <p className="flex items-center justify-center">
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            © {new Date().getFullYear()} Linode Server Monitor Dashboard
          </p>
        </footer>
      </div>
    </main>
  );
}
