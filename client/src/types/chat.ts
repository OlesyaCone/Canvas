export interface ChatSettings {
  primaryColor: string
  fontSize: number
  messageSpacing: number
  showAvatars: boolean
  showTimestamps: boolean
  enterToSend: boolean
}

export interface Message {
  id: string
  text: string
  time: string
  sender: 'user' | 'bot'
  avatar?: string
}