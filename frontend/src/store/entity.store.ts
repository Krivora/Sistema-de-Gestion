import { create } from "zustand"
import { sileo } from "sileo"

interface EntityCache<T> {
  data: T[]
  loading: boolean
  lastFetched: number | null
}

interface EntityStoreState {
  entities: Record<string, EntityCache<unknown>>
  load: <T>(key: string, fetcher: () => Promise<T[]>, force?: boolean) => Promise<void>
  set: <T>(key: string, data: T[]) => void
  optimisticUpdate: <T extends { id: number }>(key: string, id: number, patch: Partial<T>) => void
  optimisticRemove: (key: string, id: number) => void
  reset: () => void
}

const CACHE_TTL = 5_000

const defaultCache = (): EntityCache<unknown> => ({
  data: [], loading: false, lastFetched: null,
})

export const useEntityStore = create<EntityStoreState>((set, get) => ({
  entities: {},

  load: async (key, fetcher, force = false) => {
    const cache = get().entities[key] ?? defaultCache()
    const isFresh = cache.lastFetched && Date.now() - cache.lastFetched < CACHE_TTL
    if (isFresh && !force) return
    if (cache.loading) return

    const hasData = cache.data.length > 0
    if (!hasData) {
      set((s) => ({
        entities: { ...s.entities, [key]: { ...cache, loading: true } },
      }))
    }

    try {
      const data = await fetcher()
      set((s) => ({
        entities: {
          ...s.entities,
          [key]: { data, loading: false, lastFetched: Date.now() },
        },
      }))
    } catch {
      set((s) => ({
        entities: { ...s.entities, [key]: { ...s.entities[key], loading: false } },
      }))
      if (!hasData) sileo.error({ title: `Error al cargar datos` })
    }
  },

  set: (key, data) =>
    set((s) => ({
      entities: {
        ...s.entities,
        [key]: { ...s.entities[key], data, lastFetched: Date.now() },
      },
    })),

  optimisticUpdate: (key, id, patch) =>
    set((s) => ({
      entities: {
        ...s.entities,
        [key]: {
          ...s.entities[key],
          data: (s.entities[key]?.data ?? []).map((item) =>
            (item as { id: number }).id === id ? { ...item, ...patch } : item
          ),
        },
      },
    })),

  optimisticRemove: (key, id) =>
    set((s) => ({
      entities: {
        ...s.entities,
        [key]: {
          ...s.entities[key],
          data: (s.entities[key]?.data ?? []).filter(
            (item) => (item as { id: number }).id !== id
          ),
        },
      },
    })),

  reset: () => set({ entities: {} }),
}))

// Helper tipado para usar en cada hook
export function useEntity<T>(key: string) {
  const store = useEntityStore()
  const cache = store.entities[key] as EntityCache<T> | undefined

  return {
    data: (cache?.data ?? []) as T[],
    loading: cache?.loading ?? false,
    load: (fetcher: () => Promise<T[]>, force?: boolean) =>
      store.load(key, fetcher as () => Promise<unknown[]>, force),
    optimisticUpdate: (id: number, patch: Partial<T>) =>
      store.optimisticUpdate(key, id, patch),
    optimisticRemove: (id: number) =>
      store.optimisticRemove(key, id),
  }
}