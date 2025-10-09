import { Link } from "react-router-dom";
import { EBMLogo } from "@/components/EBMLogo";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

export default function SiteHeader({ showQuickLinks = true }: { showQuickLinks?: boolean }) {
  const { isAuthenticated, user } = useAdmin();
  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <EBMLogo size="md" className="shadow-lg flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-bold text-foreground truncate">EBM Quick Hits</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Evidence-Based Medicine Made Simple</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {showQuickLinks && (
                <nav className="hidden sm:flex items-center gap-2">
                  <Link to="/">
                    <Button variant="ghost">Home</Button>
                  </Link>
                  <Link to="/questions">
                    <Button variant="ghost">Questions</Button>
                  </Link>
                  <Link to="/presentations">
                    <Button variant="ghost">All Trials<br /></Button>
                  </Link>
                </nav>
              )}
              <ThemeToggle />
              {isAuthenticated && (
                <div className="hidden sm:flex flex-col items-end text-sm text-foreground ml-2">
                  <div>
                    Signed in as <span className="ml-1 font-medium">{user?.username}</span>
                  </div>
                  <div className="text-xs text-muted-foreground -mt-0.5">{user?.role || "user"}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
