'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfDay, addDays } from 'date-fns';

interface CustomCalendarProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);
    const today = startOfDay(new Date());

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        const result = addMonths(currentMonth, -1);
        if (!isBefore(startOfMonth(result), startOfMonth(today))) {
            setCurrentMonth(result);
        }
    };

    const renderHeader = (date: Date) => {
        return (
            <div className="flex justify-center mb-4">
                <span className="text-lg font-bold text-slate-800">
                    {format(date, 'MMMM yyyy')}
                </span>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isDisabled = isBefore(day, today);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={`
                            relative h-10 w-10 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all
                            ${!isCurrentMonth ? 'text-slate-200 pointer-events-none' : ''}
                            ${isDisabled ? 'text-slate-300 pointer-events-none bg-slate-50' : 'cursor-pointer hover:bg-rose-50 hover:text-rose-600'}
                            ${isSelected ? 'bg-nepal-red text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:text-white' : ''}
                            ${!isDisabled && !isSelected && isCurrentMonth ? 'text-slate-700' : ''}
                        `}
                        onClick={() => {
                            if (!isDisabled) {
                                onChange(cloneDay);
                                setIsOpen(false);
                            }
                        }}
                    >
                        <span>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    const prevMonthAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        prevMonth();
    };

    const nextMonthAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        nextMonth();
    };

    return (
        <div className="relative w-full h-full group" ref={calendarRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full flex items-center cursor-pointer focus:outline-none relative"
            >
                <div className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#E31837] transition-colors pointer-events-none">
                    <CalendarIcon className="w-5 h-5" />
                </div>

                <div className="w-full h-full bg-transparent text-base sm:text-xl font-bold text-slate-800 pl-14 md:pl-16 pr-6 pt-5 sm:pt-6 pb-1 flex items-center justify-between min-h-[4rem]">
                    <span className="truncate">
                        {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Onward Date'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                
                <label className="absolute left-14 md:left-16 transition-all duration-200 pointer-events-none truncate max-w-[calc(100%-4rem)] top-1 sm:top-2 text-[10px] sm:text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                    Date of Journey
                </label>
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile bottom sheet */}
                    <div 
                        className="fixed inset-0 bg-black/60 z-[9998] md:hidden animate-in fade-in duration-300 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    />
                    <div 
                        className="fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:top-full md:mt-4 md:-left-12 lg:-left-24 bg-white p-4 sm:p-6 pb-8 sm:pb-6 rounded-t-3xl md:rounded-3xl md:shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 z-[9999] w-full md:w-[600px] lg:w-[650px] flex flex-col md:flex-row gap-4 sm:gap-8 animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-300 max-h-[85vh] md:max-h-none overflow-y-auto overflow-x-hidden" 
                        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 20px))' }}
                    >
                    {/* Month 1 */}
                    <div className="flex-1">
                        <div className="relative">
                            <button onClick={prevMonthAction} type="button" className="absolute left-0 top-1 p-1 hover:bg-slate-100 rounded-full transition-colors z-10">
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            {renderHeader(currentMonth)}
                        </div>
                        {renderDays()}
                        {renderCells(currentMonth)}
                    </div>

                    {/* Divider for Desktop */}
                    <div className="hidden md:block w-px bg-slate-100"></div>

                    {/* Month 2 (Next Month) */}
                    <div className="hidden md:block flex-1">
                        <div className="relative">
                            <button onClick={nextMonthAction} type="button" className="absolute right-0 top-1 p-1 hover:bg-slate-100 rounded-full transition-colors z-10">
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                            {renderHeader(addMonths(currentMonth, 1))}
                        </div>
                        {renderDays()}
                        {renderCells(addMonths(currentMonth, 1))}
                    </div>

                    {/* Mobile Navigation for Next Month */}
                    <div className="md:hidden flex justify-end mt-4">
                        <button onClick={nextMonthAction} type="button" className="flex items-center text-sm font-bold text-nepal-red">
                            Next Month <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default CustomCalendar;
