import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
