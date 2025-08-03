import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Trophy, ArrowRight } from "lucide-react";

export function TestYourself() {
  const handleQuizClick = () => {
    console.log("Quiz clicked");
  };

  const handleFlashcardsClick = () => {
    console.log("Flashcards clicked");
  };

  const handleChallengeClick = () => {
    console.log("Challenge clicked");
  };

  return (
    <div className="bg-gradient-to-br from-ucla-blue/5 to-ucla-gold/10 border-2 border-ucla-blue/20 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ucla-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-ucla-blue" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">Test Yourself</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Challenge your knowledge with interactive quizzes, flashcards, and clinical scenarios based on landmark trials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-red-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Quiz</h4>
          <p className="text-sm text-gray-600 mb-4">
            Test your understanding with multiple choice questions on key trial findings
          </p>
          <Button 
            onClick={handleQuizClick}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 group"
          >
            Start Quiz
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Flashcards</h4>
          <p className="text-sm text-gray-600 mb-4">
            Review key concepts and trial details with interactive flashcards
          </p>
          <Button 
            onClick={handleFlashcardsClick}
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 group"
          >
            Study Cards
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-12 h-12 bg-ucla-gold/20 rounded-lg flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-ucla-blue" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Clinical Challenge</h4>
          <p className="text-sm text-gray-600 mb-4">
            Apply trial knowledge to real clinical scenarios and case studies
          </p>
          <Button 
            onClick={handleChallengeClick}
            variant="outline"
            className="w-full border-ucla-gold/40 text-ucla-blue hover:bg-ucla-gold/10 group"
          >
            Take Challenge
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
