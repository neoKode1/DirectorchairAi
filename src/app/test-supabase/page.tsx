import { createClient } from '@/utils/supabase/server'

export default async function TestSupabase() {
  const supabase = await createClient()
  
  try {
    // Test the connection
    const { data, error } = await supabase.from('generations').select('count').limit(1)
    
    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-red-800 font-semibold">Connection Error:</h2>
            <pre className="text-red-700 mt-2">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h2 className="text-green-800 font-semibold">✅ Connection Successful!</h2>
          <p className="text-green-700 mt-2">
            Supabase is connected and working properly.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-green-700 font-medium">
              View Response Data
            </summary>
            <pre className="text-green-600 mt-2 bg-green-100 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold">Unexpected Error:</h2>
          <pre className="text-red-700 mt-2">{JSON.stringify(err, null, 2)}</pre>
        </div>
      </div>
    )
  }
}
