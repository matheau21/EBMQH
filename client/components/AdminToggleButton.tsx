import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Plus, LayoutDashboard } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { LoginModal } from "./LoginModal";
import { useNavigate } from "react-router-dom";

export function AdminToggleButton() {
  const { isAuthenticated, logout } = useAdmin();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {isAuthenticated && (
          <>
            <Button
              variant="outline"
              className="bg-white text-ucla-blue border-ucla-blue hover:bg-blue-50 shadow-lg"
              onClick={() => window.dispatchEvent(new Event("open-upload-modal"))}
            >
              <Plus className="h-4 w-4 mr-2" /> Upload
            </Button>
            <Button
              variant="outline"
              className="bg-white text-ucla-blue border-ucla-blue hover:bg-blue-50 shadow-lg"
              onClick={() => navigate("/admin/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </>
        )}
        <Button
          onClick={handleClick}
          variant={isAuthenticated ? "default" : "outline"}
          size="lg"
          className={`
            shadow-lg hover:shadow-xl transition-all duration-300 border-2
            ${
              isAuthenticated
                ? "bg-ucla-blue text-white border-ucla-gold hover:bg-blue-700 hover:border-ucla-gold/80"
                : "bg-white text-ucla-blue border-ucla-blue hover:bg-blue-50"
            }
          `}
        >
          {isAuthenticated ? (
            <>
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Login</span>
            </>
          )}
        </Button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
