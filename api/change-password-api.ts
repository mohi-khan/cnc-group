import { fetchApi } from '@/utils/http'
import { z } from 'zod'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z
      .string()
      .min(8, 'Confirm new password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  })

interface ChangePasswordResponse {
  status: string
  message: string
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
  token: string
) {
  const validatedData = changePasswordSchema.parse({
    currentPassword,
    newPassword,
    confirmNewPassword,
  })

  
  return fetchApi<ChangePasswordResponse>({
    url: `api/auth/change-password/${userId}`,
    method: 'PATCH',
    body: validatedData,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

// password chaange without old password for admin reset


const changeNewPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z
      .string()
      .min(8, "Confirm new password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  })

interface ChangeNewPasswordResponse {
  status: string
  message: string
}

export async function changeNewPassword(
  userId: number,
  newPassword: string,
  confirmNewPassword: string,
  token: string
) {
  const validatedData = changeNewPasswordSchema.parse({
    newPassword,
    confirmNewPassword,
  })

  return fetchApi<ChangeNewPasswordResponse>({
    url: `api/auth/change-new-password/${userId}`,
    method: "PATCH",
    body: validatedData,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  })
}
