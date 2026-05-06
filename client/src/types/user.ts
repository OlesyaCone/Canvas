export interface User {
  displayName: string
  avatar: string
  email?: string
  id?: string
  status?: 'online' | 'offline'
}

export type Theme = 'light' | 'dark'

export interface AppSettings {
  theme: Theme
  language: string
  notifications: boolean
}