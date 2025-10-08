import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import { PublishProvider } from "@/contexts/PublishContext";
import Index from "./pages/Index";
import AllPresentations from "./pages/AllPresentations";
import Questions from "./pages/Questions";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditTrial from "./pages/AdminEditTrial";

const queryClient = new QueryClient();

import { ThemeProvider } from "@/contexts/ThemeContext";

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <PublishProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/presentations" element={<AllPresentations />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/coming-soon" element={<Questions />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/trials/:id" element={<AdminEditTrial />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PublishProvider>
      </AdminProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
