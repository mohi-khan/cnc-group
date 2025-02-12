import type React from 'react'
import type { GetPaymentOrder } from '@/utils/type'

interface PaymentRequisitionListProps {
  requisitions: GetPaymentOrder[]
}

const PaymentRequisitionList: React.FC<PaymentRequisitionListProps> = ({
  requisitions,
}) => {
  if (!requisitions || requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-xl font-light">
        No payment requisitions available
      </div>
    )
  }

  return (
    <div className="space-y-6 border rounded-md p-6">
      {requisitions.map((req, index) => (
        <div className="p-6" key={req.id}>
          <h2 className="text-3xl font-bold text-center pb-10">
            {req.companyName}
          </h2>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{req.poNo}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                req.status === 'Approved'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {req.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="font-medium">{req.vendorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">${req.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="font-medium">
                {new Date(req.PurDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Req No</p>
              <p className="font-medium">{req.reqNo}</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>Prepared by: {req.preparedBy}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentRequisitionList
