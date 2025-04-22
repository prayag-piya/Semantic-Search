export default function Navbar() {
    return (
        <header>
            <nav className="bg-gray-500/75 w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4">
                    <div className="text-white text-lg">
                        <h1>Semantic Search</h1>
                    </div>

                    <div className="mx-auto flex flex-col sm:flex-row flex-wrap gap-4 items-center">
                        <div className="text-white">
                            <a href="/dashboard">Dashboard</a>
                        </div>
                        <div className="text-white">
                            <a href="/upload">Upload</a>
                        </div>
                        <div className="text-white">
                            <a href="#">Analysis</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}