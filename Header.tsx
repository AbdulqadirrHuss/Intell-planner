import React from 'react';

interface HeaderProps {
  completionPercentage: number;
  selectedDate: string;
}

const Header: React.FC<HeaderProps> = ({ completionPercentage, selectedDate }) => {
  // Use the selectedDate prop to format the display date
  // new Date('YYYY-MM-DD') can be off by a day due to timezone.
  // We parse it manually to ensure it's treated as local date.
  const [y, m, d] = selectedDate.split('-').map(Number);
  const displayDate = new Date(y, m - 1, d);
  const dateString = displayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isToday = new Date().toISOString().split('T')[0] === selectedDate;

  return (
    <header className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold text-white">IntelliDay Planner</h1>
          <p className="text-indigo-300 flex items-center gap-2">
            {dateString}
            {!isToday && <span className="text-xs uppercase bg-gray-700 px-2 py-1 rounded-full">Viewing another day</span>}
          </p>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-indigo-200">Progress for this Day</span>
          <span className="text-sm font-medium text-indigo-200">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
