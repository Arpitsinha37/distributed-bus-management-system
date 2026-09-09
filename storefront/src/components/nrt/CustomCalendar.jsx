import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay, addDays } from 'date-fns';

const CustomCalendar = ({ selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef(null);
    const today = startOfDay(new Date());

    useEffect(() => {
        function handleClickOutside(event) {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarRef]);

    // Notify ChatWidget to hide/show when calendar opens/closes
    useEffect(() => {
        window.dispatchEvent(new CustomEvent(isOpen ? 'calendar-open' : 'calendar-close'));
        return () => {
            // Ensure chat widget reappears when calendar unmounts
            window.dispatchEvent(new CustomEvent('calendar-close'));
        };
    }, [isOpen]);

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        const result = addMonths(currentMonth, -1);
        if (!isBefore(startOfMonth(result), startOfMonth(today))) {
            setCurrentMonth(result);
        }
    };

    const renderHeader = (date) => {
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

    const renderCells = (monthDate) => {
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
                        key={day}
                        className={`
                            relative h-10 w-10 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all
                            ${!isCurrentMonth ? 'text-slate-200 pointer-events-none' : ''}
                            ${isDisabled ? 'text-slate-300 pointer-events-none bg-slate-50' : 'cursor-pointer hover:bg-rose-50 hover:text-rose-600'}
                            ${isSelected ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:text-white' : ''}
                            ${!isDisabled && !isSelected && isCurrentMonth ? 'text-slate-700' : ''}
                        `}
                        onClick={() => !isDisabled && onChange(cloneDay) & setIsOpen(false)}
                    >
                        <span>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7 gap-1 mb-1">
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    const handleDateSelect = (date) => {
        onChange(date);
        setIsOpen(false);
    };

    const selectToday = (e) => {
        e.stopPropagation();
        handleDateSelect(today);
    };

    const selectTomorrow = (e) => {
        e.stopPropagation();
        handleDateSelect(addDays(today, 1));
    };

    return (
        <div className="relative w-full h-full" ref={calendarRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full bg-transparent flex flex-col justify-center cursor-pointer focus:outline-none pl-12 pr-4 relative group"
            >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-nepal-red transition-colors">
                    <CalendarIcon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            Date of Journey
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </span>
                        {selectedDate ? (
                            <span className="text-base sm:text-xl font-bold text-slate-800">
                                {format(selectedDate, 'dd MMM yyyy')}
                            </span>
                        ) : (
                            <span className="text-base sm:text-xl font-bold text-slate-800">
                                Onward Date
                            </span>
                        )}
                    </div>

                    {/* Quick Select Chips (Desktop Only) */}
                    <div className="hidden xl:flex items-center gap-2 ml-4">
                        <button
                            onClick={selectToday}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedDate && isSameDay(selectedDate, today) ? 'bg-nepal-red text-white shadow-md' : 'bg-red-50 text-nepal-red border border-red-100 hover:bg-red-100'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={selectTomorrow}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedDate && isSameDay(selectedDate, addDays(today, 1)) ? 'bg-nepal-red text-white shadow-md' : 'bg-red-50 text-nepal-red border border-red-100 hover:bg-red-100'}`}
                        >
                            Tomorrow
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDateSelect(addDays(today, 2)); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedDate && isSameDay(selectedDate, addDays(today, 2)) ? 'bg-nepal-red text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                        >
                            {format(addDays(today, 2), 'MMM dd')}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDateSelect(addDays(today, 3)); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedDate && isSameDay(selectedDate, addDays(today, 3)) ? 'bg-nepal-red text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                        >
                            {format(addDays(today, 3), 'MMM dd')}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDateSelect(addDays(today, 4)); }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedDate && isSameDay(selectedDate, addDays(today, 4)) ? 'bg-nepal-red text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                        >
                            {format(addDays(today, 4), 'MMM dd')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile bottom sheet */}
                    <div 
                        className="fixed inset-0 bg-black/60 z-[9998] sm:hidden animate-in fade-in duration-300 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    />
                    <div className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-auto sm:top-full sm:right-0 mt-0 sm:mt-4 bg-white p-4 sm:p-6 pb-8 sm:pb-6 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 z-[9999] w-full sm:w-[350px] md:w-[700px] flex flex-col md:flex-row gap-4 sm:gap-8 animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300 max-h-[85vh] sm:max-h-none overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 20px))' }}>
                    {/* Month 1 */}
                    <div className="flex-1">
                        <div className="relative">
                            <button onClick={prevMonth} className="absolute left-0 top-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
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
                            <button onClick={nextMonth} className="absolute right-0 top-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                            </button>
                            {renderHeader(addMonths(currentMonth, 1))}
                        </div>
                        {renderDays()}
                        {renderCells(addMonths(currentMonth, 1))}
                    </div>

                    {/* Mobile Navigation for Next Month */}
                    <div className="md:hidden flex justify-end">
                        <button onClick={nextMonth} className="flex items-center text-sm font-bold text-rose-600">
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

