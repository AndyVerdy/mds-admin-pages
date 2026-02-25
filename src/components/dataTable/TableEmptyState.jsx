import { Button } from "../ui/button";

const TableEmptyState = ({ onClearFilters }) => {
  return (
    <div className="flex !flex-col !items-center !justify-center !gap-4 !p-20 !w-full !flex-grow">
      <div className="flex !flex-col !items-center !justify-center !gap-2">
        <h3 className="text-xl font-semibold">Oops! No results this time</h3>
        <p className="text-sm text-muted-foreground">
          Please adjust your searching filters and give it another go!
        </p>
      </div>
      <Button onClick={onClearFilters} variant="outline">
        Clear all filters
      </Button>
    </div>
  );
};

export default TableEmptyState;
