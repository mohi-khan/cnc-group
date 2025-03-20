'use client'

const TestingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Bank Check Design */}
        <div className="relative p-6 border border-gray-300 bg-white">
          {/* Bank Header */}
          <div className="flex justify-end items-start mb-8">
            <div className="text-right">
              <div className="flex items-center justify-end">
                <span className="text-sm mr-2">19/03/25</span>
              </div>
            </div>
          </div>

          {/* Payee Section */}
          <div className="mb-6">
            <div className="flex items-center mb-1">
              <p className="flex-1 pb-1 pt-2 ">
                Akil Tajwar Chowdhury
              </p>
            </div>
          </div>

          {/* Amount Section */}
          <div className="flex mb-6">
            <div className="flex-1">
              <p className="flex-1 pb-1 pt-2 ">
                Twenty Thousand Taka Only
              </p>
            </div>
            <div className="px-2 py-1 flex items-center whitespace-nowrap ml-5">
              <span className="font-medium">20,000/-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestingPage
