'use client'

import { useState } from 'react'

export default function BudgetForm() {
  const [formData, setFormData] = useState({
    budgetId: 1,
    accountId: 32,
    amount: 2625,
    createdBy: 84,
    actual: 98,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:4000/api/budget/createBudgetItems',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5MjYxOTgxLCJleHAiOjE3MzkzNDgzODF9.Jix-dSEUgpknO7ghX8eLQ4iJSFWijFFBXLTy0VjkrDc',
          },
          body: JSON.stringify([formData]), // Send data as an array
        }
      )

      const result = await response.json()
      if (response.ok) {
        setMessage('Budget data submitted successfully!')
      } else {
        setMessage(result.error || 'Submission failed.')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Create Budget Item</h2>
      {message && <p className="text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="budgetId"
          value={formData.budgetId}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Budget ID"
          required
        />
        <input
          type="number"
          name="accountId"
          value={formData.accountId}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Account ID"
          required
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Amount"
          required
        />
        <input
          type="number"
          name="createdBy"
          value={formData.createdBy}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Created By"
          required
        />
        <input
          type="number"
          name="actual"
          value={formData.actual}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Actual"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Budget'}
        </button>
      </form>
    </div>
  )
}
