import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ServerMonitor from '../components/ServerMonitor'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <ServerMonitor />
    </main>
  )
} 