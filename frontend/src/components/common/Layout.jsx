import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
// import PageBackground from './PageBackground'; // Temporarily disabled for testing

const Layout = ({ userType }) => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-leaf-50/30 to-sky-50/20">
      {/* Background with subtle theme gradient - Enhanced for better aesthetics */}
      {/* <PageBackground /> */}
      
      {/* Desktop Sidebar */}
      <Sidebar userType={userType} />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header userType={userType} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav userType={userType} />
    </div>
  );
};

export default Layout;
