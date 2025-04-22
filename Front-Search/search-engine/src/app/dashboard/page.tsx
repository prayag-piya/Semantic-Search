"use client"
import { useState, useEffect } from "react"
import Loader from "./loading"
import SearchData from "./searchquery"

interface Segment {
    text: string
    id: number
    start: number
    end: number
}
interface SearchQuery {
    text: string
    file: string
    cluster: number
    keywords: string[]
    segments: Segment[]
    similarity: number
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await fetch("http://192.168.250.53:8000/query")
                if(!response.ok) {
                    throw new Error(`Http error! status: ${response.status}`)
                }
                const json = await response.json();
                setData(json)
            } catch (error) {
                if (error instanceof Error) {
                    setError(error);
                } else {
                    setError(new Error("Unknown error occurred"));
                }
            } finally {
                setLoading(false);
              }
        };
        fetchData();
    }, [])
    
    async function query_search(query: string) {
        setLoading(true)
        try{
            const response = await fetch("http://192.168.250.53:8000/search/"+query)
            if(!response.ok) {
                throw new Error(`Http error! status: ${response.status}`)
            }
            const json = await response.json();
            setData(json)
        } catch (error) {
            if (error instanceof Error) {
                setError(error)
            } else {
                setError(new Error("Unknown error occured"))
            } 
        } finally {
            setLoading(false);
        }
    }
    return (
        <section>
            <div className="flex flex-row justify-center p-5 gap-4">
                <input 
                    className="border-4 border-gray-700 focus:border-b-indigo-500 bg-gray-700 rounded-sm text-lg w-90"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key == "Enter" && query_search(searchQuery)}
                />
                <button className="bg-gray-500/75 p-2 rounded-sm" onClick={() => query_search(searchQuery)}>Search</button>
            </div>
            <div className="h-fit">
                {loading && <Loader />}
                {!loading && error && <p className="text-red-500 text-center">{error.message}</p>}
                <div className="flex flex-col px-6">
                    {!loading && data && <SearchData dataQuery={data} />}
                </div>
            </div>
        </section>
    )
}