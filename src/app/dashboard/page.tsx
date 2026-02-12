"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {

  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let channel: any

    const initialize = async () => {

      // get logged in user
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error("User not found")
        return
      }

      const currentUser = data.user
      setUser(currentUser)

      // fetch bookmarks initially
      await fetchBookmarks(currentUser.id)

      // realtime subscription (filtered by user)
      channel = supabase
        .channel(`user-bookmarks-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${currentUser.id}`
          },
          () => {
            fetchBookmarks(currentUser.id)
          }
        )
        .subscribe()

      setLoading(false)
    }

    initialize()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }

  }, [])

  async function fetchBookmarks(userId: string) {

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error) {
      setBookmarks(data || [])
    }
  }

  async function addBookmark() {

    if (!title || !url || !user) return

    const { error } = await supabase
      .from("bookmarks")
      .insert({
        title: title,
        url: url,
        user_id: user.id
      })

    if (!error) {
      setTitle("")
      setUrl("")
    }
  }

  async function deleteBookmark(id: string) {

    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">

        <h1 className="text-3xl font-bold">
          Smart Bookmark Manager
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>

      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto mt-10">

        {/* Add Bookmark Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">

          <h2 className="text-xl font-semibold mb-4">
            Add New Bookmark
          </h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter bookmark title"
            className="w-full p-3 mb-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-green-500 outline-none"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter bookmark URL"
            className="w-full p-3 mb-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-green-500 outline-none"
          />

          <button
            onClick={addBookmark}
            disabled={!user}
            className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Add Bookmark
          </button>

        </div>

        {/* Bookmarks List */}

        {bookmarks.length === 0 ? (

          <div className="text-center text-gray-400">
            No bookmarks yet. Add your first bookmark.
          </div>

        ) : (

          bookmarks.map((bookmark) => (

            <div
              key={bookmark.id}
              className="bg-gray-800 p-4 rounded-xl shadow-md mb-4 flex justify-between items-center hover:bg-gray-700 transition"
            >

              <div>

                <div className="font-semibold text-lg">
                  {bookmark.title}
                </div>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline"
                >
                  {bookmark.url}
                </a>

              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition"
              >
                Delete
              </button>

            </div>

          ))

        )}

      </div>

    </div>
  )
}
