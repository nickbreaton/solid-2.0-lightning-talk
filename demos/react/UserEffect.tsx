import { useEffect, useState } from 'react'
import { fetchUser, type User as UserData } from '../api'

// Slide 2, step 1: state → effect → fetch → set state → loading branch.
export default function Demo() {
  return <App userId={1} />
}

function App({ userId }: { userId: number }) {
  const [user, setUser] = useState<UserData>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchUser(userId).then(user => {
      setUser(user)
      setIsLoading(false)
    })
  }, [userId])

  if (isLoading) return <p>Loading...</p>

  return <p>{user!.name}</p>
}
