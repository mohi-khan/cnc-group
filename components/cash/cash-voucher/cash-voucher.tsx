'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  type AccountsHead,
  type CompanyFromLocalstorage,
  type CostCenter,
  type FormData,
  type GetDepartment,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type ResPartner,
  type User,
  type Voucher,
  VoucherTypes,
} from '@/utils/type'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import CashVoucherMaster from './cash-voucher-master'
import CashVoucherDetails from './cash-voucher-details'
import VoucherList from '@/components/voucher-list/voucher-list'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getAllResPartners,
} from '@/api/common-shared-api'

export default function CashVoucher() {
  //getting userData from jotai atom component
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    company: '',
    location: '',
    currency: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(true)
  //linkGenerator is used to generate the link for the voucher details page
  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

  //Function to get user data from localStorage and set it to state
  useEffect(() => {
    setIsLoadingCompanies(true)
    setIsLoadingLocations(true)
    if (userData) {
      console.log('🚀 ~ useEffect ~ userData:', userData)
      setUser(userData)
      if (userData?.userCompanies?.length > 0) {
        setCompanies(userData.userCompanies)
      }
      if (userData?.userLocations?.length > 0) {
        setLocations(userData.userLocations)
      }
      if (!userData.voucherTypes.includes('Cash Voucher')) {
        router.push('/unauthorized-access')
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
      })
    }
  }, [router, userData])

  //Function to get company IDs from localStorage data
  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }
  //Function to get location IDs from localStorage data
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  //Function to get all vouchers based on company and location IDs
  const getallVoucher = useCallback(
    async (company: number[], location: number[]) => {
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.CashVoucher,
        }
        //sending the voucherQuery to the API to get all vouchers
        const response = await getAllVoucher(voucherQuery, token)
        // Check for errors in the response. if no errors, set the voucher grid data
        if (!response.data) {
          throw new Error('No data received from server')
        }
        setVoucherGrid(Array.isArray(response.data) ? response.data : [])
        console.log('Voucher data:', response.data)
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token, setVoucherGrid]
  )
  //Function to fetch all vouchers when companies and locations change
  // useEffect is used to fetch all vouchers when companies and locations change
  const fetchVoucherData = React.useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const mycompanies = getCompanyIds(companies)
      const mylocations = getLocationIds(locations)
      await getallVoucher(mycompanies, mylocations)
    } catch (error) {
      console.error('Error fetching voucher data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load voucher data. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, companies, locations, getallVoucher])

  React.useEffect(() => {
    if (companies.length > 0 && locations.length > 0) {
      fetchVoucherData()
    }
  }, [companies, locations, fetchVoucherData])
  //Function to filter chart of accounts based on isGroup and isCash properties
  //useEffect is used to filter the chart of accounts when it changes
  React.useEffect(() => {
    const filteredCoa = chartOfAccounts?.filter((account) => {
      return account.isGroup === false
    })

    const isCashCoa = chartOfAccounts?.filter((account) => {
      return account.isCash === true
    })
    setFilteredChartOfAccounts(filteredCoa || [])
    setCashCoa(isCashCoa || [])
    console.log('Filtered Chart of Accounts:', filteredCoa)
    console.log('cash Chart of Accounts:', isCashCoa)
  }, [chartOfAccounts])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'company') {
      // Reset location when company changes
      setFormData((prev) => ({ ...prev, location: '' }))
      // Find the selected company and update locations
      const selectedCompany = companies.find(
        (c: any) => c.companyName === value
      )
      if (selectedCompany) {
        setLocations(
          locations.filter(
            (l) => l.location.companyId === selectedCompany.company.companyId
          )
        )
      }
    }
  }

  //Function to fetch chart of accounts from the API
  const fetchChartOfAccounts = useCallback(async () => {
    setIsLoadingAccounts(true)
    if (!token) return
    try {
      const response = await getAllChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting chart of accounts:', response.error)
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to load chart of accounts',
        })
        setChartOfAccounts([])
        return
      } else {
        console.log('Fetched Chart of Accounts:', response.data)
        setChartOfAccounts(response.data)
      }
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
      })
      setChartOfAccounts([])
    } finally {
      setIsLoadingAccounts(false)
    }
  }, [token, router])

  //Function to fetch departments from the API
  const fetchDepartments = useCallback(async () => {
    if (!token) return
    setIsLoadingAccounts(true)
    try {
      const response = await getAllDepartments(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting chart of accounts:', response.error)
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to load chart of accounts',
        })
        setDepartments([])
        return
      } else {
        setDepartments(response.data)
      }
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
      })
      setDepartments([])
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  //Function to fetch cost centers from the API
  const fetchgetAllCostCenters = useCallback(async () => {
    setIsLoadingCostCenters(true)
    if (!token) return
    try {
      const response = await getAllCostCenters(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting cost centers:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load cost centers',
        })
        setCostCenters([])
        return
      } else {
        setCostCenters(response.data)
      }
    } catch (error) {
      console.error('Error getting cost centers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCostCenters([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }, [token, router, setCostCenters])

  //Function to fetch partners from the API
  const fetchgetResPartner = useCallback(async () => {
    setIsLoadingPartners(true)
    if (!token) return
    try {
      const response = await getAllResPartners(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting partners:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load partners',
        })
        setPartners([])
        return
      } else {
        console.log('Fetched Partners:', response.data)
        setPartners(response.data)
      }
    } catch (error) {
      console.error('Error getting partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load partners',
      })
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }, [token, router, setPartners])
  useEffect(() => {
    fetchChartOfAccounts()
    fetchgetAllCostCenters()
    fetchgetResPartner()
    fetchDepartments()
  }, [
    fetchChartOfAccounts,
    fetchgetAllCostCenters,
    fetchgetResPartner,
    fetchDepartments,
  ])

  //Function to handle form submission. It takes the form data and a reset function as arguments
  const form = useForm<JournalEntryWithDetails>({
    //zodResolver is used to validate the form data against the JournalEntryWithDetailsSchema
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: '',
        companyId: 0,
        locationId: 0,
        currencyId: 0,
        amountTotal: 0,
        exchangeRate: 1,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: undefined,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: '',
          type: 'Payment',
          createdBy: 0,
        },
      ],
    },
  })

  //Function to handle form submission. It takes the form data and a reset function as arguments
  const onSubmit = async (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => {
    console.log('Before Any edit', values)
    if (userData) {
      console.log('Current userId from localStorage:', userData.userId)
      setUser(userData)
    }
    // Calculate the total amount
    const totalAmount = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || 0) + (detail.credit || 0),
      0
    )
    // Update the total Amount
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1, // 0 for Draft, 1 for Posted
        notes: values.journalEntry.notes || '', // Ensure notes is always a string
        journalType: 'Cash Voucher',
        amountTotal: totalAmount, // Set the calculated total amount
        exchangeRate: values.journalEntry.exchangeRate || 1,
        createdBy: user?.userId || 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,

        notes: detail.notes || '', // Ensure notes is always a string for each detail
        createdBy: user?.userId || 0,
      })),
    }
    console.log('After Adding created by', updatedValues)
    /// To add new row for Bank Transaction on JournalDetails
    const updateValueswithCash = {
      ...updatedValues,
      journalDetails: [
        ...updatedValues.journalDetails, // Spread existing journalDetails
        {
          accountId: filteredChartOfAccounts[0]?.accountId , // Ensure accountId is always a number (default to 0 if undefined)
          departmentId: null,
          debit: updatedValues.journalDetails.reduce(
            (sum, detail) =>
              sum + (detail.type === 'Receipt' ? detail.credit : 0),
            0
          ),
          credit: updatedValues.journalDetails.reduce(
            (sum, detail) =>
              sum + (detail.type === 'Payment' ? detail.debit : 0),
            0
          ),
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: null,
          notes: updatedValues.journalEntry.notes || '', // Ensure notes is always a string
          createdBy: user?.userId || 0,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithCash, null, 2)
    )
    // Call the API to create the journal entry with details
    const response = await createJournalEntryWithDetails(
      updateValueswithCash,
      token
    )
    // Check for errors in the response. if no error, show success message
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Journal',
      })
    } else {
      const mycompanies = getCompanyIds(companies)
      const mylocations = getLocationIds(locations)
      getallVoucher(mycompanies, mylocations)
      console.log('Voucher is created successfully', response.data)
      toast({
        title: 'Success',
        description: 'Voucher is created successfully',
      })
      // Reset the form after successful submission
      form.reset({
        journalEntry: {
          date: new Date().toISOString().split('T')[0],
          journalType: '',
          companyId: 0,
          locationId: 0,
          currencyId: 0,
          amountTotal: 0,
          notes: '',
          createdBy: 0,
        },
        journalDetails: [
          {
            accountId: filteredChartOfAccounts[0]?.accountId, // Ensure accountId is always a number (default to 0 if undefined)
            costCenterId: null,
            departmentId: null,
            debit: 0,
            credit: 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            notes: '',
            type: 'Payment',
            createdBy: 0,
          },
        ],
      })
      // remove all the rows from journalDetails
      remove()
      // set the default value for journalDetails to the first row
      append({
        accountId: filteredChartOfAccounts[0]?.accountId, // Ensure accountId is always a number (default to 0 if undefined)
        costCenterId: null,
        departmentId: null,
        debit: 0,
        credit: 0,
        analyticTags: null,
        taxId: null,
        resPartnerId: null,
        notes: '',
        type: 'Payment',
        createdBy: 0,
      })
    }
  }
  //useFieldArray is used to manage the dynamic fields in the form. it allows adding and removing fields in the journalDetails array.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'journalDetails',
  })

  //Function to add a new row to the journalDetails array
  //append is used to add a new entry to the journalDetails array in the form state
  const addDetailRow = () => {
    append({
      accountId: cashCoa[0]?.accountId,
      costCenterId: null,
      departmentId: null,
      debit: 0,
      credit: 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: null,
      notes: '',
      type: 'Payment',
      createdBy: 0,
    })
  }

  const handleDelete = (voucherNo: string) => {
    setVoucherList(voucherList.filter((v) => v.voucherno !== voucherNo))
  }

  const handleReverse = (voucherno: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherno === voucherno ? { ...v, status: 'Draft' } : v
      )
    )
  }

  const handlePost = (voucherno: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherno === voucherno ? { ...v, status: 'Posted' } : v
      )
    )
  }

  //columns is used to define the columns for the voucher list table
  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'location' as const, label: 'Location' },
    { key: 'date' as const, label: 'Date' },
    { key: 'notes' as const, label: 'Remarks' },
    { key: 'totalamount' as const, label: 'Total Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  return (
    <div className="w-full mx-auto">
      <div className="w-full mb-10 p-8">
        <h1 className="text-2xl font-bold mb-6">Cash Vouchers</h1>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <CashVoucherMaster
              form={form}
              companies={companies}
              locations={locations}
            />

            <CashVoucherDetails
              form={form}
              fields={fields}
              filteredChartOfAccounts={filteredChartOfAccounts}
              costCenters={costCenters}
              departments={departments}
              partners={partners}
              addDetailRow={addDetailRow}
              onSubmit={onSubmit}
            />

            <div className="mb-6">
              <VoucherList
                vouchers={voucherGrid}
                columns={columns}
                isLoading={isLoading}
                linkGenerator={linkGenerator}
                itemsPerPage={10}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
