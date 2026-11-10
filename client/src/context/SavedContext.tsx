import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'nyuad_eats_saved_restaurant_ids'

type SavedContextValue = {
  savedIds: number[]
  isSaved: (id: number) => boolean
  toggleSaved: (id: number) => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

function readStoredIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

/**
 * "Saved" restaurants, kept in this browser's localStorage only — there's no
 * backend endpoint for it (see CLAUDE.md). Doesn't sync across devices and
 * resets if the user clears site data.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<number[]>(() => readStoredIds())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
    } catch {
      // localStorage can throw (private browsing, quota) — saving is best-effort only.
    }
  }, [savedIds])

  function isSaved(id: number) {
    return savedIds.includes(id)
  }

  function toggleSaved(id: number) {
    setSavedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  return (
    <SavedContext.Provider value={{ savedIds, isSaved, toggleSaved }}>{children}</SavedContext.Provider>
  )
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within SavedProvider')
  return ctx
}
