import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
  availableSpecialties: string[];
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedSpecialties,
  onSpecialtyToggle,
  availableSpecialties,
}: SearchAndFilterProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search presentations by title, author, or keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-12 px-6"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter by Specialty
              {selectedSpecialties.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2"
                >
                  {selectedSpecialties.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {availableSpecialties.map((specialty) => (
              <DropdownMenuCheckboxItem
                key={specialty}
                checked={selectedSpecialties.includes(specialty)}
                onCheckedChange={() => onSpecialtyToggle(specialty)}
                className="cursor-pointer"
              >
                {specialty}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedSpecialties.map((specialty) => (
            <Badge
              key={specialty}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20"
              onClick={() => onSpecialtyToggle(specialty)}
            >
              {specialty}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
