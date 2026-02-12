"use client"

import { supabase } from "@/lib/supabaseClient"
import { useEffect } from "react"

export default function Home() {

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {

      if (data.session) {
        window.location.href = "/dashboard"
      }

    })

  }, [])

  const login = async () => {

    await supabase.auth.signInWithOAuth({
      provider: "google"
    })

  }

  return (

    <div className="flex items-center justify-center h-screen">

      <button
        onClick={login}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Login with Google
      </button>

    </div>

  )
}
