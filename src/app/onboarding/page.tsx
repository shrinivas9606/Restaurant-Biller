'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [restaurantName, setRestaurantName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Get the currently logged-in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a restaurant.')
      setLoading(false)
      // Optional: redirect to login if no user is found
      router.push('/login')
      return
    }

    // Insert the new restaurant details into the 'restaurants' table
    const { error: insertError } = await supabase
      .from('restaurants')
      .insert({
        owner_id: user.id,
        name: restaurantName,
        address: address,
        contact: contact,
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      // On success, redirect the user to their main dashboard
      router.push('/dashboard')
      router.refresh() // Refresh to ensure server-side components re-fetch data
    }
    
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="mx-auto max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Tell us about your restaurant to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOnboardingSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input 
                id="restaurant-name" 
                type="text" 
                placeholder="e.g., The Corner Bistro" 
                required 
                value={restaurantName} 
                onChange={(e) => setRestaurantName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                type="text" 
                placeholder="123 Main Street, Anytown" 
                required 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input 
                id="contact" 
                type="tel" 
                placeholder="123-456-7890" 
                required 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

