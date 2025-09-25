import React from 'react'

interface Props {
  date: string
  onDateChange: (newDate: string) => void
}

const IouReportHeading: React.FC<Props> = ({ date, onDateChange }) => {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      {/* Heading */}
      <h2 className="text-xl font-semibold mb-4">
        IOU Report for : <span className="text-blue-600">{date}</span>
      </h2>

      {/* Centered Date Input */}
      <div className="flex items-center space-x-3">
        <label htmlFor="dateInput" className="font-medium">
          Date
        </label>
        <input
          id="dateInput"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="border rounded px-3 py-2 text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  )
}

export default IouReportHeading
