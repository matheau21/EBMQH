import { Button } from "@/components/ui/button";
import { LogOut, Plus, LayoutDashboard } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate, useLocation } from "react-router-dom";

export function AdminToggleButton() {
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const inDashboard = location.pathname.startsWith("/admin");

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {!inDashboard && (
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
        onClick={logout}
        variant="outline"
        size="lg"
        className="bg-white text-ucla-blue border-ucla-blue hover:bg-blue-50 shadow-lg"
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>Logout</span>
      </Button>
    </div>
  );
}
