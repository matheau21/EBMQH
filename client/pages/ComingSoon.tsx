import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-ucla-blue to-blue-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Clock className="h-12 w-12 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Feature Coming Soon
        </h1>
        
        {/* Subheading */}
        <p className="text-lg text-gray-600 mb-8">
          Stay tuned! We're working hard to bring you this feature.
        </p>



        {/* Back Button */}
        <Link to="/">
          <Button className="bg-ucla-blue hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium border-2 border-ucla-gold/20 hover:border-ucla-gold/40 transition-all duration-300">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center text-gray-500">
            <div className="w-8 h-8 bg-ucla-blue/10 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-4 w-4 text-ucla-blue" />
            </div>
            <span className="text-sm">EBM Quick Hits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
