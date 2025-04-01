
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleGetCurrentLocation: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleGetCurrentLocation
}) => {
  return (
    <form onSubmit={handleSearch} className="flex space-x-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search for a place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button type="submit" variant="default" size="icon" className="h-10 w-10">
        <Search size={16} />
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-10 w-10"
        onClick={handleGetCurrentLocation}
      >
        <Navigation size={16} />
      </Button>
    </form>
  );
};

export default SearchBar;
