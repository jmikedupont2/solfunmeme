"use client";

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [wallets, setWallets] = useState<string[]>([])
  const [newWallet, setNewWallet] = useState('')
  const [socials, setSocials] = useState({ twitter: '', telegram: '', discord: '' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setEmail(data.email || '')
      setWallets(data.wallets || [])
      setSocials(data.socials || { twitter: '', telegram: '', discord: '' })
    }
  }

  const saveProfile = async () => {
    if (!user) return

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email,
        wallets,
        socials,
        updated_at: new Date().toISOString()
      })

    alert('Profile saved!')
  }

  const addWallet = () => {
    if (newWallet && !wallets.includes(newWallet)) {
      setWallets([...wallets, newWallet])
      setNewWallet('')
    }
  }

  const removeWallet = (wallet: string) => {
    setWallets(wallets.filter(w => w !== wallet))
  }

  if (!user) {
    return (
      <section className="pt-16 md:pt-20 lg:pt-28">
        <div className="container max-w-md">
          <h1 className="mb-8 text-3xl font-bold">Sign In</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="pt-16 md:pt-20 lg:pt-28">
      <div className="container max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Profile</h1>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 dark:bg-gray-dark"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Social Links</label>
          <input
            type="text"
            placeholder="Twitter"
            value={socials.twitter}
            onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
            className="mb-2 w-full rounded border p-2 dark:bg-gray-dark"
          />
          <input
            type="text"
            placeholder="Telegram"
            value={socials.telegram}
            onChange={(e) => setSocials({ ...socials, telegram: e.target.value })}
            className="mb-2 w-full rounded border p-2 dark:bg-gray-dark"
          />
          <input
            type="text"
            placeholder="Discord"
            value={socials.discord}
            onChange={(e) => setSocials({ ...socials, discord: e.target.value })}
            className="w-full rounded border p-2 dark:bg-gray-dark"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Crypto Wallets (Public)</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              placeholder="Wallet address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="flex-1 rounded border p-2 dark:bg-gray-dark"
            />
            <button
              onClick={addWallet}
              className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div key={wallet} className="flex items-center justify-between rounded border p-2">
                <span className="font-mono text-sm">{wallet}</span>
                <button
                  onClick={() => removeWallet(wallet)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="w-full rounded bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          Save Profile
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 w-full rounded border px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-dark"
        >
          Sign Out
        </button>
      </div>
    </section>
  )
}
