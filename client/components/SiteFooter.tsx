import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EBMLogo } from "@/components/EBMLogo";
import { AdminToggleButton } from "@/components/AdminToggleButton";
import { siteAPI } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { LoginModal } from "@/components/LoginModal";
import ReferencePdfModal from "@/components/ReferencePdfModal";

export default function SiteFooter() {
  const [referenceHref, setReferenceHref] = useState<string | undefined>(
    undefined,
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const { isAuthenticated } = useAdmin();

  useEffect(() => {
    let ignore = false;
    (async () => {
      const cfg = await siteAPI.getAbout();
      if (ignore) return;
      setReferenceHref(
        cfg?.referenceCard?.url || cfg?.referenceCard?.signedUrl || undefined,
      );
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <footer className="py-12 mt-16 relative bg-ucla-blue text-white dark:bg-card dark:text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <EBMLogo size="sm" />
              <span className="text-xl font-bold">EBM Quick Hits</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-blue-200 dark:text-muted-foreground">
              <li>
                <Link
                  to="/presentations"
                  className="hover:text-white dark:hover:text-foreground transition-colors"
                >
                  All Presentations
                </Link>
              </li>
              <li>
                {referenceHref ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowReferenceModal(true);
                    }}
                    className="hover:text-white dark:hover:text-foreground transition-colors"
                    aria-label="Open EBM Reference Card"
                  >
                    EBM Reference Card
                  </button>
                ) : (
                  <span className="opacity-70">EBM Reference Card</span>
                )}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-blue-200 dark:text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white dark:hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              {!isAuthenticated && (
                <li>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="hover:text-white dark:hover:text-foreground transition-colors"
                    aria-label="Admin Login"
                  >
                    Admin
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-600 dark:border-border mt-8 pt-8 text-center text-blue-200 dark:text-muted-foreground">
          <p>&copy; 2025 EBM Quick Hits. All rights reserved.</p>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      {referenceHref && (
        <ReferencePdfModal
          isOpen={showReferenceModal}
          onClose={() => setShowReferenceModal(false)}
          url={referenceHref}
          title="EBM Reference Card"
        />
      )}
      <AdminToggleButton />
    </footer>
  );
}
