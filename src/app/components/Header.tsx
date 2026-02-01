import Link from "next/link";
import Image from "next/image";
import Logo from "./Logo";

export default function Header() {
    return (
        <nav className="flex w-full justify-center py-4 items-center
        border-b border-gray-800 bg-black/50 backdrop-blur-xl font-mono text-sm px-4 lg:px-0">
            <div className="max-w-5xl flex w-full items-center justify-between">
                <div className="font-medium text-xl text-purple-400 flex items-center gap-2">
                    <Logo className="w-5 h-5" />
                    <Link href='/' className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-bold">
                        Suno AI Music
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm font-light text-gray-300">
                    <p className="p-2 lg:px-6 lg:py-3 rounded-full flex justify-center items-center
                hover:bg-purple-900/30 hover:text-purple-300 duration-200
                ">
                        <Link href="/">
                            Home
                        </Link>
                    </p>
                    <p className="p-2 lg:px-6 lg:py-3 rounded-full flex justify-center items-center
                hover:bg-purple-900/30 hover:text-purple-300 duration-200
                ">
                        <Link href="/docs">
                            API Docs
                        </Link>
                    </p>
                    <p className="p-2 lg:px-6 lg:py-3 rounded-full flex justify-center items-center
                hover:bg-purple-900/30 hover:text-purple-300 duration-200
                ">
                        <a href="https://github.com/gcui-art/suno-api/"
                            target="_blank"
                            className="flex items-center justify-center gap-1">
                            <span className="">
                                <Image src="/github-mark.png" alt="GitHub Logo" width={20} height={20} className="invert" />
                            </span>
                            <span>Github</span>
                        </a>
                    </p>
                </div>
            </div>
        </nav>
    );
}
