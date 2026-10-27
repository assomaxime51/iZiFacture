"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsUpDown } from "@/components/icons";

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label }: DatePickerProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(value ?? today);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
    setOpen(false);
  }, [onChange]);

  const adjustDay = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    setSelectedDate(newDate);
    setViewYear(newDate.getFullYear());
    setViewMonth(newDate.getMonth());
    onChange?.(newDate);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);
  const leadingDays: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    leadingDays.push({ day: prevMonthDays - i, current: false });
  }

  // Current month days
  const currentDays: { day: number; current: boolean }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({ day: i, current: true });
  }

  // Next month trailing days
  const totalCells = leadingDays.length + currentDays.length;
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays: { day: number; current: boolean }[] = [];
  for (let i = 1; i <= trailingCount; i++) {
    trailingDays.push({ day: i, current: false });
  }

  const allDays = [...leadingDays, ...currentDays, ...trailingDays];

  return (
    <div ref={containerRef} className="date-picker-container relative">
      {label && <span className="date-picker-label">{label}</span>}
      <div className={`date-picker-trigger ${open ? "date-picker-trigger--open" : ""}`} onClick={() => setOpen(!open)}>
        <CalendarDays size={16} className="date-picker-icon" />
        <span className="date-picker-value">{formatDate(selectedDate)}</span>
        <div className="date-picker-arrows" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="date-picker-arrow-btn" onClick={() => adjustDay(1)} aria-label="Jour suivant">
            <ChevronsUpDown size={16} />
          </button>
        </div>
      </div>

      {open && (
        <div className="date-picker-popup animate-rise">
          <div className="date-picker-header">
            <button type="button" className="date-picker-nav-btn" onClick={prevMonth} aria-label="Mois précédent">
              <ChevronLeft size={18} />
            </button>
            <span className="date-picker-month-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className="date-picker-nav-btn" onClick={nextMonth} aria-label="Mois suivant">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="date-picker-weekdays">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="date-picker-weekday">{day}</span>
            ))}
          </div>

          <div className="date-picker-days">
            {allDays.map((item, index) => {
              const cellDate = item.current
                ? new Date(viewYear, viewMonth, item.day)
                : index < leadingDays.length
                  ? new Date(viewYear, viewMonth - 1, item.day)
                  : new Date(viewYear, viewMonth + 1, item.day);

              const isSelected = isSameDay(cellDate, selectedDate);
              const isToday = isSameDay(cellDate, today);

              return (
                <button
                  type="button"
                  key={index}
                  className={`date-picker-day ${!item.current ? "date-picker-day--outside" : ""} ${isSelected ? "date-picker-day--selected" : ""} ${isToday && !isSelected ? "date-picker-day--today" : ""}`}
                  onClick={() => selectDate(cellDate)}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
