'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client' // Corrected import path
import { Button } from '../../components/ui/button' // Corrected import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card' // Corrected import path
import { Input } from '../../components/ui/input' // Corrected import path
import { Label } from '../../components/ui/label' // Corrected import path

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Call the Supabase signUp function
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This is the URL the user will be sent to after clicking the verification link in their email.
        // It's a crucial step for the authentication flow to work correctly.
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      // Show a success message if the sign-up request was successful.
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="mx-auto max-w-sm w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800">Check your email!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We&apos;ve sent a verification link to your email address. Please click the link to confirm your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  minLength={6} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create an account'}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

