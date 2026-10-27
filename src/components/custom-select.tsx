"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "@/components/icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Sélectionner", label, searchable = false }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value ?? "");
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const select = useCallback((optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setOpen(false);
    setSearch("");
  }, [onChange]);

  const selectedOption = options.find((option) => option.value === selectedValue);
  const hasValue = !!selectedValue;

  const filteredOptions = searchable && search
    ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="custom-select-container relative">
      <button
        type="button"
        className={`custom-select-trigger ${open ? "custom-select-trigger--open" : ""} ${hasValue ? "custom-select-trigger--filled" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {label && (
          <span className={`custom-select-label ${hasValue || open ? "custom-select-label--float" : ""}`}>
            {label}
          </span>
        )}
        <span className={`custom-select-value ${!hasValue ? "custom-select-value--placeholder" : ""}`}>
          {hasValue ? selectedOption?.label : (label ? "" : placeholder)}
        </span>
        <ChevronDown size={18} className={`custom-select-chevron ${open ? "custom-select-chevron--open" : ""}`} />
      </button>

      {open && (
        <div className="custom-select-dropdown animate-rise">
          {searchable && (
            <div className="custom-select-search-wrap">
              <input
                ref={inputRef}
                type="text"
                className="custom-select-search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <ul className="custom-select-list">
            {filteredOptions.map((option) => {
              const isSelected = option.value === selectedValue;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`custom-select-option ${isSelected ? "custom-select-option--selected" : ""}`}
                    onClick={() => select(option.value)}
                  >
                    <span className="custom-select-option-label">{option.label}</span>
                    {isSelected && <Check size={16} className="custom-select-option-check" />}
                  </button>
                </li>
              );
            })}
            {filteredOptions.length === 0 && (
              <li className="custom-select-empty">Aucun résultat</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
