import React from 'react';
import { CalendarIcon, ChevronDownIcon } from '../../../../components/icons';

const YEAR_PRESETS = [
  { label: 'До 1900 г.', from: '', to: '1900' },
  { label: '1901 – 1950', from: '1901', to: '1950' },
  { label: '1951 – 2000', from: '1951', to: '2000' },
  { label: '2001 – 2019', from: '2001', to: '2019' },
  { label: 'Новинки (2020+)', from: '2020', to: '' },
];

interface YearFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  yearFrom: string;
  onYearFromChange: (val: string) => void;
  yearTo: string;
  onYearToChange: (val: string) => void;
  onSetYearRange: (from: string, to: string) => void;
  onClearYears: () => void;
}

export const YearFilterPopover: React.FC<YearFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  yearFrom,
  onYearFromChange,
  yearTo,
  onYearToChange,
  onSetYearRange,
  onClearYears,
}) => {
  return (
    <div className="filter-popover-anchor">
      <button
        type="button"
        id="filter-years-button"
        className={`filter-trigger-btn ${yearFrom || yearTo ? 'active' : ''}`}
        onClick={onToggleOpen}
        title="Фильтр по году издания"
      >
        <CalendarIcon size={15} />
        <span className="filter-trigger-text">Год издания</span>
        <span className="filter-trigger-slot">
          {yearFrom || yearTo ? (
            <span className="filter-count-badge">1</span>
          ) : (
            <ChevronDownIcon size={14} className={`filter-chevron ${isOpen ? 'open' : ''}`} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="filter-popover-menu filter-popover-years" onClick={(e) => e.stopPropagation()}>
          <div className="popover-header">
            <div className="popover-header-title">
              <CalendarIcon size={15} />
              <span>Год издания</span>
            </div>
            {(yearFrom || yearTo) && (
              <button
                type="button"
                onClick={onClearYears}
                className="popover-clear-btn"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Range inputs */}
          <div className="year-inputs-row">
            <div className="year-input-col">
              <label htmlFor="year-from-input">От года</label>
              <input
                id="year-from-input"
                type="number"
                placeholder="1800"
                value={yearFrom}
                onChange={(e) => onYearFromChange(e.target.value)}
                className="year-number-input"
              />
            </div>
            <span className="year-separator">—</span>
            <div className="year-input-col">
              <label htmlFor="year-to-input">До года</label>
              <input
                id="year-to-input"
                type="number"
                placeholder="2026"
                value={yearTo}
                onChange={(e) => onYearToChange(e.target.value)}
                className="year-number-input"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="year-presets-section">
            <span className="year-presets-title">Быстрый период:</span>
            <div className="year-presets-chips">
              {YEAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onSetYearRange(preset.from, preset.to)}
                  className={`year-preset-btn ${
                    yearFrom === preset.from && yearTo === preset.to ? 'active' : ''
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
