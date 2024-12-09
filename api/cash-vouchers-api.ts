const API_BASE_URL = 'http://localhost:4000'

export async function getAllGlAccounts() {
  console.log('Fetching all GL accounts')
  const response = await fetch(
    `${API_BASE_URL}/api/chart-of-accounts/get-all-coa`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch GL accounts')
  }
  console.log('Fetched GL accounts:', response)
  return response.json()
}
