import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TestYourself() {
  const navigate = useNavigate();

  const handleQuizClick = () => {
    navigate("/questions");
  };

  return (
    <div className="bg-gradient-to-br from-ucla-blue/5 to-ucla-gold/10 border-2 border-ucla-blue/20 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 bg-ucla-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F9bdda882ae1149629c4506f8adb8a8e1?format=webp&width=800"
          alt="Test Yourself"
          className="h-9 w-9 object-contain"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Test Yourself</h3>
      <p className="text-gray-600 mb-6 text-sm">
        Challenge your knowledge with multiple choice questions based on
        landmark trials
      </p>
      <Button
        onClick={handleQuizClick}
        className="bg-ucla-blue hover:bg-blue-700 text-white px-8 py-2 group"
      >
        Questions
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
