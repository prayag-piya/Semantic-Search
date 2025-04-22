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
export default function SearchData({ dataQuery }: { dataQuery: SearchQuery[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {dataQuery.map((query, index) => (
            <div
            key={index}
            className="rounded-md bg-white dark:bg-slate-800 shadow p-3 border border-gray-200 dark:border-slate-700"
            >
            <h2 className="text-base font-semibold text-black dark:text-white mb-1">
                {query.file}
            </h2>
            <div className="flex flex-wrap gap-1">
                {query.keywords.map((keyword, i) => (
                <span
                    key={i}
                    className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-indigo-800 dark:text-white"
                >
                    {keyword}
                </span>
                ))}
            </div>
            </div>
        ))}
        </div>
    );
  }