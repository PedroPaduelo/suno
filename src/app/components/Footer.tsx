import Link from "next/link";

export default function Footer() {
    return (
        <footer className="flex w-full justify-center py-4 items-center
        bg-black/80 border-t border-gray-800 text-gray-500 backdrop-blur-xl font-mono text-sm px-4 lg:px-0
      ">
            <p className="px-6 py-3 rounded-full flex justify-center items-center gap-2
             hover:text-purple-400 duration-200
                ">
                <span>© 2024</span>
                <Link href="https://github.com/gcui-art/suno-api/" className="text-purple-500 hover:text-purple-400">
                    gcui-art/suno-api
                </Link>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">Powered by Suno AI V5</span>
            </p>
        </footer>
    );
}
