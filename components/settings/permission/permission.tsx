'use client'

import {
  getAllPermissions,
  getAllRoles,
  updateRolePermissions,
} from '@/api/common-shared-api'

import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Shield,
  Users,
  Lock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
} from 'lucide-react'
import type { Permission } from '@/utils/type'

const Permission = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const [roles, setRoles] = useState<
    { roleId: number; roleName: string; permission: number[] }[]
  >([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<{
    roleId: number
    roleName: string
    permission: number[]
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Fetch all roles
  const fetchAllRoles = useCallback(async () => {
    if (!token) return

    const result = await getAllRoles(token)

    if (result?.data) {
      const mappedRoles = result.data.map((role: any) => {
        const permArray = role.permissions || role.permission || []

        return {
          roleId: role.roleId,
          roleName: role.roleName,
          permission: Array.isArray(permArray)
            ? permArray
            : typeof permArray === 'string'
              ? permArray
                  .split(',')
                  .map((p: string) => parseInt(p.trim()))
                  .filter(Boolean)
              : [],
        }
      })

      setRoles(mappedRoles)
    } else {
      setRoles([])
    }
  }, [token])

  // Fetch all permissions
  const fetchAllPermissions = useCallback(async () => {
    if (!token) return

    const result = await getAllPermissions(token)

    if (result?.data) {
      const mappedPermissions = result.data.map(
        (item: { permissionId: number; permissionName: string }) => ({
          permissionId: item.permissionId,
          permissionName: item.permissionName,
        })
      )

      setPermissions(mappedPermissions)
    } else {
      setPermissions([])
    }
  }, [token])

  // Load APIs on mount
  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAllRoles(), fetchAllPermissions()])
      setLoading(false)
    }

    loadData()
  }, [token, fetchAllRoles, fetchAllPermissions])

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // Check if role has permission
  const hasPermission = (permissionId: number) => {
    if (!selectedRole) return false
    return selectedRole.permission.includes(permissionId)
  }

  // Toggle permission
  const togglePermission = (permissionId: number) => {
    if (!selectedRole || !editMode) return

    setSelectedRole((prev) => {
      if (!prev) return prev

      const hasIt = prev.permission.includes(permissionId)
      const newPermissions = hasIt
        ? prev.permission.filter((id) => id !== permissionId)
        : [...prev.permission, permissionId]

      return {
        ...prev,
        permission: newPermissions,
      }
    })

    setHasChanges(true)
  }

  // Save changes
  const handleSave = async () => {
    if (!selectedRole || !token) return

    setSaving(true)
    try {
      const result = await updateRolePermissions(
        selectedRole.roleId,
        selectedRole.permission, // ← Pass numbers directly
        token
      )

      if ( result?.data) {
        showNotification('success', 'Permissions updated successfully!')

        // Update the roles state
        setRoles((prev) =>
          prev.map((role) =>
            role.roleId === selectedRole.roleId
              ? { ...role, permission: selectedRole.permission }
              : role
          )
        )

        setHasChanges(false)
        setEditMode(false)
      } else {
        showNotification('error', 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      showNotification('error', 'An error occurred while updating permissions')
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    if (!selectedRole) return

    // Reset to original permissions
    const originalRole = roles.find((r) => r.roleId === selectedRole.roleId)
    if (originalRole) {
      setSelectedRole(originalRole)
    }

    setHasChanges(false)
    setEditMode(false)
  }

  // Filter permissions based on edit mode
 const filteredPermissions = editMode
   ? permissions.filter(
       (p) =>
         p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.permissionId.toString().includes(searchTerm)
     )
   : selectedRole
     ? permissions.filter((p) => {
         const hasPermission = selectedRole.permission.includes(p.permissionId)
         return (
           hasPermission &&
           (p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.permissionId.toString().includes(searchTerm))
         )
       })
     : []

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce(
    (acc, perm) => {
      const parts = perm.permissionName.split('.')
      const category = parts.length > 1 ? parts[0] : 'general'
      if (!acc[category]) acc[category] = []
      acc[category].push(perm)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Role & Permission Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage access control and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">
                    Roles ({roles.length})
                  </h2>
                </div>
              </div>
              <div className="p-2">
                {roles.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No roles found
                  </p>
                ) : (
                  <div className="space-y-1">
                    {roles.map((role) => (
                      <button
                        key={role.roleId}
                        onClick={() => {
                          if (hasChanges) {
                            if (
                              confirm(
                                'You have unsaved changes. Do you want to discard them?'
                              )
                            ) {
                              setSelectedRole(role)
                              setHasChanges(false)
                              setEditMode(false)
                            }
                          } else {
                            setSelectedRole(role)
                            setEditMode(false)
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${
                          selectedRole?.roleId === role.roleId
                            ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedRole?.roleId === role.roleId
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}
                          ></div>
                          <div>
                            <div className="font-medium">{role.roleName}</div>
                            <div className="text-xs text-gray-500">
                              {role.permission.length} permissions
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            selectedRole?.roleId === role.roleId
                              ? 'rotate-90'
                              : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <h2 className="font-semibold text-gray-900">
                      {selectedRole
                        ? `${selectedRole.roleName} Permissions`
                        : 'Select a Role'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedRole && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          {selectedRole.permission.length}
                        </span>{' '}
                        / {permissions.length} assigned
                      </div>
                    )}
                    {selectedRole && !editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit Permissions
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {editMode && hasChanges && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {!selectedRole ? (
                  <div className="text-center py-16">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a role to view its permissions
                    </p>
                  </div>
                ) : filteredPermissions.length === 0 ? (
                  <div className="text-center py-16">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'No permissions found matching your search'
                        : 'No permissions assigned to this role'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(
                      ([category, perms]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-500 rounded"></div>
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {perms.map((perm) => {
                              const isActive = hasPermission(perm.permissionId)
                              return (
                                <button
                                  key={perm.permissionId}
                                  onClick={() =>
                                    togglePermission(perm.permissionId)
                                  }
                                  disabled={!editMode}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    isActive
                                      ? 'bg-green-50 border-green-400'
                                      : 'bg-red-50 border-red-400'
                                  } ${
                                    editMode
                                      ? 'cursor-pointer hover:shadow-md'
                                      : 'cursor-default'
                                  }`}
                                >
                                  {isActive ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-sm font-medium ${
                                      isActive
                                        ? 'text-green-900'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                          {perm.permissionId}.{perm.permissionName}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roles.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {permissions.length}
                </p>
              </div>
              <Lock className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assigned Permissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedRole ? selectedRole.permission.length : '-'}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Permission


// 'use client'

// import { getAllPermissions, getAllRoles } from '@/api/common-shared-api'

// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import React, { useCallback, useEffect, useState } from 'react'
// import {
//   Shield,
//   Users,
//   Lock,
//   ChevronRight,
//   CheckCircle2,
//   XCircle,
// } from 'lucide-react'
// import type { Permission } from '@/utils/type'

// const Permission = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const [roles, setRoles] = useState<
//     { roleId: number; roleName: string; permission: number[] }[]
//   >([])
//   const [permissions, setPermissions] = useState<Permission[]>([])
//   const [selectedRole, setSelectedRole] = useState<{
//     roleId: number
//     roleName: string
//     permission: number[]
//   } | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loading, setLoading] = useState(true)

//   // Fetch all roles
//   const fetchAllRoles = useCallback(async () => {
//     if (!token) return

//       const result = await getAllRoles(token)

//     if (result?.data) {
//       const mappedRoles = result.data.map((role: any) => {
//         // Handle both 'permissions' and 'permission' field names
//         const permArray = role.permissions || role.permission || []

//         return {
//           roleId: role.roleId,
//           roleName: role.roleName,
//           permission: Array.isArray(permArray)
//             ? permArray
//             : typeof permArray === 'string'
//               ? permArray
//                   .split(',')
//                   .map((p: string) => parseInt(p.trim()))
//                   .filter(Boolean)
//               : [],
//         }
//       })

//       console.log('Mapped Roles:', mappedRoles)
//       setRoles(mappedRoles)
//     } else {
//       setRoles([])
//     }
//   }, [token])

//   // Fetch all permissions
//   const fetchAllPermissions = useCallback(async () => {
//     if (!token) return

//     const result = await getAllPermissions(token)

//     if (result?.data) {
//       const mappedPermissions = result.data.map(
//         (item: { permissionId: number; permissionName: string }) => ({
//           permissionId: item.permissionId,
//           permissionName: item.permissionName,
//         })
//       )

//       setPermissions(mappedPermissions)
//     } else {
//       setPermissions([])
//     }
//   }, [token])

//   // Load APIs on mount
//   useEffect(() => {
//     if (!token) return

//     const loadData = async () => {
//       setLoading(true)
//       await Promise.all([fetchAllRoles(), fetchAllPermissions()])
//       setLoading(false)
//     }

//     loadData()
//   }, [token, fetchAllRoles, fetchAllPermissions])

//   // Check if role has permission
//   const hasPermission = (permissionId: number) => {
//     if (!selectedRole) return false
//     return selectedRole.permission.includes(permissionId)
//   }

//   // Filter permissions - show only assigned permissions for selected role
//   const filteredPermissions = selectedRole
//     ? permissions.filter((p) => {
//         const hasPermission = selectedRole.permission.includes(p.permissionId)
//         return (
//           hasPermission &&
//           p.permissionName.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       })
//     : []

//   console.log('Selected Role:', selectedRole)
//   console.log('Filtered Permissions:', filteredPermissions)

//   // Group permissions by category (assuming format like "user.create", "product.view")
//   const groupedPermissions = filteredPermissions.reduce(
//     (acc, perm) => {
//       const parts = perm.permissionName.split('.')
//       const category = parts.length > 1 ? parts[0] : 'general'
//       if (!acc[category]) acc[category] = []
//       acc[category].push(perm)
//       return acc
//     },
//     {} as Record<string, Permission[]>
//   )

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center gap-3">
//             <Shield className="w-8 h-8 text-blue-600" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Role & Permission Management
//               </h1>
//               <p className="text-sm text-gray-500">
//                 Manage access control and permissions
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Roles Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-sm border">
//               <div className="p-4 border-b bg-gray-50">
//                 <div className="flex items-center gap-2">
//                   <Users className="w-5 h-5 text-gray-600" />
//                   <h2 className="font-semibold text-gray-900">
//                     Roles ({roles.length})
//                   </h2>
//                 </div>
//               </div>
//               <div className="p-2">
//                 {roles.length === 0 ? (
//                   <p className="text-center text-gray-500 py-8">
//                     No roles found
//                   </p>
//                 ) : (
//                   <div className="space-y-1">
//                     {roles.map((role) => (
//                       <button
//                         key={role.roleId}
//                         onClick={() => setSelectedRole(role)}
//                         className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${
//                           selectedRole?.roleId === role.roleId
//                             ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
//                             : 'hover:bg-gray-50 border-2 border-transparent'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`w-2 h-2 rounded-full ${
//                               selectedRole?.roleId === role.roleId
//                                 ? 'bg-blue-500'
//                                 : 'bg-gray-300'
//                             }`}
//                           ></div>
//                           <div>
//                             <div className="font-medium">{role.roleName}</div>
//                             <div className="text-xs text-gray-500">
//                               {role.permission.length} permissions
//                             </div>
//                           </div>
//                         </div>
//                         <ChevronRight
//                           className={`w-4 h-4 transition-transform ${
//                             selectedRole?.roleId === role.roleId
//                               ? 'rotate-90'
//                               : ''
//                           }`}
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Permissions Panel */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-sm border">
//               <div className="p-4 border-b bg-gray-50">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <Lock className="w-5 h-5 text-gray-600" />
//                     <h2 className="font-semibold text-gray-900">
//                       {selectedRole
//                         ? `${selectedRole.roleName} Permissions`
//                         : 'Select a Role'}
//                     </h2>
//                   </div>
//                   {selectedRole && (
//                     <div className="text-sm text-gray-600">
//                       <span className="font-medium text-green-600">
//                         {selectedRole.permission.length}
//                       </span>{' '}
//                       / {permissions.length} assigned
//                     </div>
//                   )}
//                 </div>

//                 {/* Search Bar */}
//                 <input
//                   type="text"
//                   placeholder="Search permissions..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
//                 {!selectedRole ? (
//                   <div className="text-center py-16">
//                     <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-500">
//                       Select a role to view its permissions
//                     </p>
//                   </div>
//                 ) : filteredPermissions.length === 0 ? (
//                   <div className="text-center py-16">
//                     <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-500">
//                       {searchTerm
//                         ? 'No permissions found matching your search'
//                         : 'No permissions assigned to this role'}
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {Object.entries(groupedPermissions).map(
//                       ([category, perms]) => (
//                         <div key={category}>
//                           <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center gap-2">
//                             <div className="w-1 h-4 bg-blue-500 rounded"></div>
//                             {category}
//                           </h3>
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                             {perms.map((perm) => (
//                               <div
//                                 key={perm.permissionId}
//                                 className="flex items-center gap-3 p-3 rounded-lg border-2 bg-green-50 border-green-200 transition-all"
//                               >
//                                 <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
//                                 <span className="text-sm font-medium text-green-900">
//                                   {perm.permissionName}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//           <div className="bg-white rounded-lg shadow-sm border p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Roles</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {roles.length}
//                 </p>
//               </div>
//               <Users className="w-10 h-10 text-blue-500 opacity-20" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Permissions</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {permissions.length}
//                 </p>
//               </div>
//               <Lock className="w-10 h-10 text-green-500 opacity-20" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Assigned Permissions</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {selectedRole ? selectedRole.permission.length : '-'}
//                 </p>
//               </div>
//               <Shield className="w-10 h-10 text-purple-500 opacity-20" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Permission
