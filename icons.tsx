
import React from 'react';

export const PlusIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const TrashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export const EditIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const SettingsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.542.057.955.543.955 1.096v.058c0 .416-.217.788-.568.995l-.346.207a11.952 11.952 0 0 0-1.63.945c-.345.24-.626.544-.827.895l-.345.606a11.952 11.952 0 0 0-.256 2.395V12M13.5 3.94a11.952 11.952 0 0 1-1.63.945c-.345.24-.626.544-.827.895l-.345.606a11.952 11.952 0 0 1-.256 2.395V12m0-8.06h.008v.008H13.5zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM12 19.5h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zM18.375 12.739l.346.207c.351.207.568.579.568.995v.058c0 .553-.413 1.04-.955 1.096-.55.058-1.02-.392-1.11-.95l-.09-.542m-1.63.945c.345.24.626.544.827.895l.345.606c.256.448.256.966 0 1.414l-.345.606c-.201.351-.482.655-.827.895m-5.63-1.84c-.345-.24-.626-.544-.827-.895l-.345-.606c-.256-.448-.256-.966 0-1.414l.345-.606c.201-.351.482-.655.827-.895m1.63-.945l.09-.542c.09-.553.56-1.04 1.11-1.096.55-.058 1.02.392 1.11.95l.09.542" />
    </svg>
);

export const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);
