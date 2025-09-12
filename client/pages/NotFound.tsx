import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader showQuickLinks />
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm">
          <Link to="/" className="text-ucla-blue hover:underline">Home</Link>
          <span className="mx-2 text-blue-600">/</span>
          <span className="text-blue-800">Not Found</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <Link to="/" className="text-ucla-blue hover:underline">Return to Home</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
