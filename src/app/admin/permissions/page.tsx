import { Metadata } from 'next'
import PermissionsManagement from '@/components/permissions/permissions-management'

export const metadata: Metadata = {
  title: 'Permission Management | DeFender X',
  description: 'Manage system permissions and access control',
}

export default function PermissionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Permission Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage system permissions for role-based access control
        </p>
      </div>
      <PermissionsManagement />
    </div>
  )
}
