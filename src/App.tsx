import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './api/client'
import type { Health } from './api/types'

export default function App() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<Health>('/api/health'),
    retry: false,
  })

  const status = health.isPending
    ? 'checking…'
    : health.isError
      ? 'not connected'
      : 'connected'

  return (
    <div className="starter">
      <header className="starter-header">
        <strong>Meridian</strong>
        <span>Take-home starter</span>
      </header>

      <main className="starter-main">
        <h1>Build the dashboard and transfer flow</h1>
        <p>
          Read <code>brief/candidate-brief.md</code> first, then replace this
          screen.
        </p>

        <p className="status" role="status">
          Mock API: {status}
        </p>

        <ul>
          <li>MSW starts before the app renders.</li>
          <li>
            TanStack Query, React Hook Form, Zod, and Vitest are already
            installed.
          </li>
          <li>
            Design tokens are imported in <code>src/index.css</code>.
          </li>
          <li>
            The API contract lives in <code>brief/api-contract.md</code>.
          </li>
        </ul>
      </main>
    </div>
  )
}
