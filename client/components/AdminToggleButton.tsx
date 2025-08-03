import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export function AdminToggleButton() {
  const { isAdminMode, toggleAdminMode } = useAdmin();

  return (
    <Button
      onClick={toggleAdminMode}
      className={`
        fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg z-50 transition-all duration-300
        ${isAdminMode 
          ? 'bg-ucla-gold hover:bg-yellow-500 text-gray-900' 
          : 'bg-gray-600 hover:bg-gray-700 text-white'
        }
      `}
      title={isAdminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
    >
      {isAdminMode ? (
        <Settings className="h-5 w-5" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  );
}
