
// 'use client'
// import React from 'react'

// interface Props {
//   date: string
//   setDate: (date: string) => void
// }

// const LoanSanctionReportHeading: React.FC<Props> = ({ date, setDate }) => {
//   return (
//     <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg shadow">
//       <h2 className="text-lg font-semibold">Loan Sanction Report</h2>
//       <div>
//         <label className="mr-2 font-medium">Select Date:</label>
//         <input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>
//     </div>
//   )
// }

// export default LoanSanctionReportHeading


'use client'
import React from 'react'

interface Props {
  date: string
  setDate: (date: string) => void
}

const LoanSanctionReportHeading: React.FC<Props> = ({ date, setDate }) => {
  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg shadow">
      <h2 className="text-lg font-semibold">Loan Sanction Report</h2>
      <div>
        <label className="mr-2 font-medium">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
    </div>
  )
}

export default LoanSanctionReportHeading
