import { mockPeople } from '@/_workspace/data/mock-people'

const personThemes = [
  { avatar: 'bg-indigo-100 text-indigo-700', chip: 'border-indigo-200 bg-indigo-50 text-indigo-700', bar: 'bg-indigo-500' },
  { avatar: 'bg-sky-100 text-sky-700', chip: 'border-sky-200 bg-sky-50 text-sky-700', bar: 'bg-sky-500' },
  { avatar: 'bg-violet-100 text-violet-700', chip: 'border-violet-200 bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
  { avatar: 'bg-amber-100 text-amber-700', chip: 'border-amber-200 bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  { avatar: 'bg-teal-100 text-teal-700', chip: 'border-teal-200 bg-teal-50 text-teal-700', bar: 'bg-teal-500' },
  { avatar: 'bg-rose-100 text-rose-700', chip: 'border-rose-200 bg-rose-50 text-rose-700', bar: 'bg-rose-500' },
  { avatar: 'bg-lime-100 text-lime-700', chip: 'border-lime-200 bg-lime-50 text-lime-700', bar: 'bg-lime-500' },
  { avatar: 'bg-cyan-100 text-cyan-700', chip: 'border-cyan-200 bg-cyan-50 text-cyan-700', bar: 'bg-cyan-500' },
  { avatar: 'bg-fuchsia-100 text-fuchsia-700', chip: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700', bar: 'bg-fuchsia-500' },
  { avatar: 'bg-orange-100 text-orange-700', chip: 'border-orange-200 bg-orange-50 text-orange-700', bar: 'bg-orange-500' },
]

export function getPersonTheme(name: string) {
  const index = Math.max(0, mockPeople.findIndex(person => person.name === name))
  return personThemes[index % personThemes.length]
}
