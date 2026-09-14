export type TeamColor = '#4f46e5' | '#0284c7' | '#7c3aed' | '#059669' | '#ea580c' | '#db2777'

export type WorkTeam = {
  id: string
  code: string
  name: string
  description: string
  leader: string
  deputy?: string
  members: string[]
  color: TeamColor
  active: boolean
  createdAt: string
  updatedAt: string
}

