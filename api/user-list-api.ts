// import { z } from 'zod';

// const UserSchema = z.object({
//     id: z.number(),
//     username: z.string(),
//     VoucherTypes: z.array(z.string()).optional(),
//     roleId: z.number().nullable().optional(),
//     active: z.boolean(),
//     roleName: z.string().optional()
// });

// const UpdateUserSchema = z.object({
//     username: z.string().optional(),
//     voucherTypes: z.array(z.string()).optional(),
//     active: z.boolean().optional()
// });

// export type User = z.infer<typeof UserSchema>;
// export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

// const API_BASE_URL = 'http://localhost:4000/api/auth';

// export async function fetchUsers(): Promise<User[]> {
//     const response = await fetch(`${API_BASE_URL}/users-by-roles`);
//     if (!response.ok) {
//         throw new Error('Failed to fetch users');
//     }
//     const data = await response.json();
//     if (data.status === 'success' && Array.isArray(data.data.users)) {
//         return z.array(UserSchema).parse(data.data.users);
//     }
//     throw new Error('Unexpected data format');
// }

// export async function updateUser(editingUser: number, updateData: UpdateUserData): Promise<User> {
//     const validatedData = UpdateUserSchema.parse(updateData);
//     const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(validatedData),
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update user');
//     }

//     const result = await response.json();
//     if (result.status === "success") {
//         return UserSchema.parse(result.data.user);
//     }
//     throw new Error(result.message || 'Failed to update user');
// }

// export async function toggleUserActive(userId: number, active: boolean): Promise<User> {
//     const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ active }),
//     });

//     if (!response.ok) {
//         throw new Error('Failed to toggle user active state');
//     }

//     const result = await response.json();
//     if (result.status === "success") {
//         return UserSchema.parse(result.data.user);
//     }
//     throw new Error(result.message || 'Failed to toggle user active state');
// }

// import { z } from 'zod';

// const UserSchema = z.object({
//     id: z.number(),
//     username: z.string(),
//     VoucherTypes: z.array(z.string()).optional(),
//     roleId: z.number().nullable(),
//     active: z.boolean(),
//     roleName: z.string().optional()
// });

// const UpdateUserSchema = z.object({
//     username: z.string().optional(),
//     voucherTypes: z.array(z.string()).optional(),
//     active: z.boolean().optional(),
//     roleId: z.number().nullable().optional()
// });

// export type User = z.infer<typeof UserSchema>;
// export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

// const API_BASE_URL = 'http://localhost:4000/api/auth';

// export async function fetchUsers(): Promise<User[]> {
//     const response = await fetch(`${API_BASE_URL}/users-by-roles`);
//     if (!response.ok) {
//         throw new Error('Failed to fetch users');
//     }
//     const data = await response.json();
//     if (data.status === 'success' && Array.isArray(data.data.users)) {
//         return z.array(UserSchema).parse(data.data.users);
//     }
//     throw new Error('Unexpected data format');
// }

// export async function updateUser(userId: number, updateData: UpdateUserData): Promise<User> {
//     const validatedData = UpdateUserSchema.parse(updateData);
//     const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(validatedData),
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update user');
//     }

//     const result = await response.json();
//     if (result.status === "success") {
//         return UserSchema.parse(result.data.user);
//     }
//     throw new Error(result.message || 'Failed to update user');
// }

// export async function toggleUserActive(userId: number, active: boolean): Promise<User> {
//     const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ active }),
//     });

//     if (!response.ok) {
//         throw new Error('Failed to toggle user active state');
//     }

//     const result = await response.json();
//     if (result.status === "success") {
//         return UserSchema.parse(result.data.user);
//     }
//     throw new Error(result.message || 'Failed to toggle user active state');
// }

// export async function fetchRoles(): Promise<{ id: number; roleName: string }[]> {
//     const response = await fetch(`${API_BASE_URL}/roles`);
//     if (!response.ok) {
//         throw new Error('Failed to fetch roles');
//     }
//     const data = await response.json();
//     if (data.status === 'success' && Array.isArray(data.data.roles)) {
//         return z.array(z.object({ id: z.number(), roleName: z.string() })).parse(data.data.roles);
//     }
//     throw new Error('Unexpected data format for roles');
// }
