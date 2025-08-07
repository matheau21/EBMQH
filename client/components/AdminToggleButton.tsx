import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, UserCheck, LogIn, LogOut } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { LoginModal } from "./LoginModal";

export function AdminToggleButton() {
  const { isAdminMode, isAuthenticated, user, logout } = useAdmin();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
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
              <span className="hidden sm:inline">
                {isAdminMode ? "Admin" : user?.username || "User"}
              </span>
              <span className="sm:hidden">
                {isAdminMode ? "Admin" : "User"}
              </span>
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
