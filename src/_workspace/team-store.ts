import type { WorkTeam } from '@/_workspace/team-types'

const teamStorageKey = 'template-test.teams.v1'

export const defaultTeams: WorkTeam[] = [
  { id: 'team-dx', code: 'DX', name: 'DX Team', description: 'Digital transformation, workflow, and business improvement projects.', leader: 'Poodit Suwanprateep', deputy: 'Emma Wilson', members: ['Poodit Suwanprateep', 'Alex Morgan', 'Emma Wilson', 'Noah Bennett', 'Mia Roberts'], color: '#4f46e5', active: true, createdAt: '2026-09-01T01:00:00.000Z', updatedAt: '2026-09-01T01:00:00.000Z' },
  { id: 'team-iot', code: 'IOT', name: 'IOT Team', description: 'Machine connectivity, sensor integration, and shop-floor monitoring.', leader: 'Alex Morgan', deputy: 'Ethan Collins', members: ['Alex Morgan', 'Sophia Turner', 'Ethan Collins', 'Noah Bennett'], color: '#0284c7', active: true, createdAt: '2026-09-01T01:00:00.000Z', updatedAt: '2026-09-01T01:00:00.000Z' },
  { id: 'team-dev', code: 'DEV', name: 'DEV Team', description: 'Application development, integration, testing, and software delivery.', leader: 'Emma Wilson', deputy: 'Poodit Suwanprateep', members: ['Poodit Suwanprateep', 'Alex Morgan', 'Emma Wilson', 'Olivia Parker', 'Mia Roberts', 'Lucas Gray'], color: '#7c3aed', active: true, createdAt: '2026-09-01T01:00:00.000Z', updatedAt: '2026-09-01T01:00:00.000Z' },
  { id: 'team-production', code: 'PROD', name: 'Production Team', description: 'Production process, quality, and operational system ownership.', leader: 'Liam Carter', deputy: 'Sophia Turner', members: ['Liam Carter', 'Sophia Turner', 'Ethan Collins', 'Lucas Gray'], color: '#059669', active: true, createdAt: '2026-09-01T01:00:00.000Z', updatedAt: '2026-09-01T01:00:00.000Z' },
]

export function loadTeams(): WorkTeam[] {
  try {
    const stored = window.localStorage.getItem(teamStorageKey)
    if (!stored) return defaultTeams
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as WorkTeam[] : defaultTeams
  } catch {
    return defaultTeams
  }
}

export function saveTeams(teams: WorkTeam[]) {
  window.localStorage.setItem(teamStorageKey, JSON.stringify(teams))
}

export function getTeamMemberNames(teamId: string, teams = loadTeams()) {
  return teamId === 'all' ? Array.from(new Set(teams.filter(team => team.active).flatMap(team => team.members))) : teams.find(team => team.id === teamId)?.members ?? []
}

