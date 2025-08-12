"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import PinButton from "../PinButton";
import Fuse from "fuse.js";
import NavDropdownButton from "../NavDropdownButton";
import { StoredSubjects } from "@/interface";
import FloatingControls from "./floating-controls";

function PinnedSearchBar({
  initialSubjects,
  filtersNotPulled,
}: {
  initialSubjects: string[];
  filtersNotPulled?: () => void;
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const fuzzy = new Fuse(initialSubjects);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    if (text.length > 1 && initialSubjects.length > 0) {
      const filteredSuggestions = fuzzy
        .search(text)
        .sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity))
        .map((item) => item.item)
        .slice(0, 10);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchText(suggestion);

    const currentPinnedSubjects = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as StoredSubjects;

    if (suggestion && Array.isArray(currentPinnedSubjects)) {
      setPinned(currentPinnedSubjects.includes(suggestion));
    }

    setShowControls(true);
    setSuggestions([]);
    filtersNotPulled?.();
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      floatingContainerRef.current &&
      !floatingContainerRef.current.contains(target)
    ) {
      setOpen(false);
    }

    if (suggestionsRef.current && !suggestionsRef.current.contains(target)) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handleAddClicked = () => {
      searchRef.current?.focus();
    };

    window.addEventListener("addButtonClicked", handleAddClicked);

    return () => {
      window.removeEventListener("addButtonClicked", handleAddClicked);
    };
  }, []);

  const handlePinToggle = () => {
    const current = !pinned;
    setPinned(current);

    if (searchText.trim() === "") {
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as string[];
    const updated = current
      ? [...new Set([...saved, searchText])]
      : saved.filter((s) => s !== searchText);

    if (updated.length === 0) {
      setShowControls(false);
    } else {
      setShowControls(true);
    }

    localStorage.setItem("userSubjects", JSON.stringify(updated));
    window.dispatchEvent(new Event("userSubjectsChanged"));

    setSearchText("");
    setPinned(false);
  };

  useEffect(() => {
    const handlePinsChange = () => {
      const saved = JSON.parse(
        localStorage.getItem("userSubjects") ?? "[]",
      ) as string[];

      if (saved.length === 0) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
    };

    window.addEventListener("userSubjectsChanged", handlePinsChange);

    return () => {
      window.removeEventListener("userSubjectsChanged", handlePinsChange);
    };
  }, []);

  const handleRemoveAll = () => {
    localStorage.setItem("userSubjects", JSON.stringify([]));
    window.dispatchEvent(new Event("userSubjectsChanged"));
    setOpen(false);
  };

  useEffect(() => {
    const storedSubjects = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as string[];

    if (storedSubjects.length > 0) {
      setShowControls(true);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full font-play">
      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchText}
                  ref={searchRef}
                  onChange={handleSearchChange}
                  placeholder="Search subject to pin..."
                  className={`text-md w-full rounded-lg bg-[#B2B8FF] px-4 py-6 pr-10 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white ${
                    suggestions.length > 0 ? "rounded-b-none" : ""
                  }`}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-3 flex items-center"
                  title="Search"
                >
                  <Search className="h-5 w-5 text-black dark:text-white" />
                </button>

                {suggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className={`absolute z-20 w-full max-w-xl overflow-y-scroll rounded-md rounded-t-none border border-t-0 bg-white text-center shadow-lg dark:bg-[#303771] md:mx-0 ${
                      suggestions.length > 6 ? "h-[250px]" : "h-auto"
                    } ${suggestions.length > 10 ? "md:h-[400px]" : "md:h-auto"}`}
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="cursor-pointer truncate p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="hidden md:block">
                <PinButton
                  isPinned={pinned}
                  onToggle={handlePinToggle}
                  disabled={!showControls && searchText.trim() === ""}
                />
              </div>

              <div
                ref={floatingContainerRef}
                className={`md:hidden ${showControls ? "block" : "hidden"}`}
              >
                <NavDropdownButton
                  isOpen={open}
                  onClick={() => setOpen((prev) => !prev)}
                  variant="pinned"
                />

                <div className={`${open ? "block" : "hidden"}`}>
                  <FloatingControls>
                    <PinButton
                      isPinned={pinned}
                      onToggle={() => {
                        handlePinToggle();
                        setOpen(false);
                      }}
                      disabled={!showControls && searchText.trim() === ""}
                    />
                    <button
                      onClick={() => {
                        handleRemoveAll();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-full border border-[#3A3745] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#1A1823]"
                    >
                      Remove All <X className="h-4 w-4" />
                    </button>
                  </FloatingControls>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-2 hidden w-full md:block">
        <div className="ml-auto w-fit">
          <button
            onClick={handleRemoveAll}
            className={`flex items-center gap-2 rounded-full border border-[#3A3745] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#1A1823] ${showControls ? "block" : "hidden"}`}
          >
            Remove All <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinnedSearchBar;
