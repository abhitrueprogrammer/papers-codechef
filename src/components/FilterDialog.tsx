import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Filters } from "@/interface";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export const FilterDialog = ({
  subject,
  filterOptions,
  initialExams,
  initialSlots,
  initialYears,
  onReset,
  onApplyFilters,
}: {
  subject: string;
  filterOptions: Filters;
  initialExams: string[] | undefined;
  initialSlots: string[] | undefined;
  initialYears: string[] | undefined;
  onReset: () => void;
  onApplyFilters: (exams: string[], slots: string[], years: string[]) => void;
}) => {
  const [selectedExams, setSelectedExams] = useState<string[]>(
    initialExams ?? [],
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>(
    initialSlots ?? [],
  );
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialYears ?? [],
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedExams(initialExams ?? []);
    setSelectedSlots(initialSlots ?? []);
    setSelectedYears(initialYears ?? []);
  }, [initialExams, initialSlots, initialYears]);

  const exams = filterOptions.uniqueExams.map((exam) => ({
    label: exam,
    value: exam,
  }));
  const slots = filterOptions.uniqueSlots.map((slot) => ({
    label: slot,
    value: slot,
  }));
  const years = filterOptions.uniqueYears.map((year) => ({
    label: year,
    value: year,
  }));

  const handleFilterClick = () => {
    onApplyFilters(selectedExams, selectedSlots, selectedYears);
  };

  const handleResetClick = () => {
    setSelectedExams([]);
    setSelectedSlots([]);
    setSelectedYears([]);
    setOpen(false);
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="py-6 rounded-xl">
          <span>
            <SlidersHorizontal />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[650px] overflow-y-hidden">
        <DialogHeader>
          <DialogTitle>{subject}</DialogTitle>
        </DialogHeader>
        <div className="mx-4 my-6 flex flex-col space-y-6">
          <MultiSelect
            options={exams}
            onValueChange={setSelectedExams}
            placeholder="Exams"
            defaultValue={selectedExams}
          />
          <MultiSelect
            options={slots}
            onValueChange={setSelectedSlots}
            placeholder="Slots"
            defaultValue={selectedSlots}
          />
          <MultiSelect
            options={years}
            onValueChange={setSelectedYears}
            placeholder="Years"
            defaultValue={selectedYears}
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleFilterClick}>
            Apply Filter
          </Button>
          <Button variant="outline" onClick={handleResetClick}>
            Reset Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
