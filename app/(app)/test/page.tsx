'use client'

const TestingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Bank Check Design */}
        <div className="relative p-6 border border-gray-300 bg-white">
          {/* Bank Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-900 rounded-md">
                  <span className="text-white font-bold text-lg">SB</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Southeast Bank PLC.
                </h2>
                <p className="text-sm text-gray-700 mt-1">Downtown Branch</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1">
                <span className="text-sm text-gray-600">CD</span>
                <span className="ml-4 text-sm font-medium">1234567</span>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-600 mr-2">DATE</span>
                <div className="grid grid-cols-8 gap-1">
                  {['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'].map(
                    (label, index) => (
                      <div key={index} className="relative">
                        <div className="w-6 h-6 border border-gray-400 flex items-center justify-center text-sm">
                          {index === 0 && '1'}
                          {index === 1 && '5'}
                          {index === 2 && '0'}
                          {index === 3 && '3'}
                          {index === 4 && '2'}
                          {index === 5 && '0'}
                          {index === 6 && '2'}
                          {index === 7 && '3'}
                        </div>
                        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-500">
                          {label}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payee Section */}
          <div className="mb-6">
            <div className="flex items-center mb-1">
              <span className="text-sm text-gray-700 font-medium w-16">
                Pay To
              </span>
              <div className="flex-1 border-b border-gray-300 pb-1 ml-2 pt-2"></div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="flex mb-6">
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
              The Sum of Taka
            </span>
            <div className="flex-1">
              <div className="border-b border-gray-300 pb-1 ml-4 pt-4"></div>
              <div className="border-b border-gray-300 pb-1 ml-4 pt-9"></div>
            </div>
            <div className="border border-gray-400 px-2 py-1 flex items-center whitespace-nowrap ml-5">
              <span className="font-medium">TK.</span>
              <span className="font-medium">120,000</span>
              <span className="font-medium">/-</span>
            </div>
          </div>

          {/* Company Details & Signature */}
          <div className="flex justify-between items-end mt-10">
            <div>
              <div className="font-medium">SAMPLE COMPANY LTD</div>
              <div className="text-sm text-gray-600">000123456789</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="border-t border-gray-400 pt-1 w-48 text-center">
                <div className="text-sm text-gray-600">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>

          {/* Check Number at bottom */}
          <div className="mt-8 pt-2 border-t border-gray-200 text-center font-mono text-sm text-gray-700">
            ⋆1234567⋆ 20512345⋆ 987654321⋆
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestingPage
