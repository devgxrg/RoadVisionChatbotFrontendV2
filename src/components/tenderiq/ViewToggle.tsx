import { Grid2X2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg p-1 transition-colors bg-secondary",
      className
    )}>
      <Button
        size="sm"
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        onClick={() => onViewChange('grid')}
        className="gap-2"
        title="Grid view"
      >
        <Grid2X2 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        size="sm"
        variant={currentView === 'list' ? 'default' : 'ghost'}
        onClick={() => onViewChange('list')}
        className="gap-2"
        title="List view"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
