import Image from "next/image"
import Link from "next/link"
import { FaDiscord, FaYoutube } from "react-icons/fa6"

export default async function Footer() {
  return (
    <footer className="mb-4 px-[150px] max-xl:px-[20px]">
      <div className="flex justify-between items-end px-[80px] py-[20px] border-yellow-400 border-b-2 max-sm:flex-col max-sm:items-center max-sm:gap-10 max-lg:items-start">
        <Link href="/" className="relative inline-block">
          <Image
            className="w-auto h-[70px] max-lg:h-[50px] max-md:h-[42px]"
            width={120}
            height={70}
            src={"https://upcdn.io/12a1yvj/raw/logo.png"}
            alt="Logo"
            quality={50}
          />
        </Link>
        <ul className="flex-1 flex items-center justify-center gap-10 font-bold uppercase text-sm max-sm:flex-col max-sm:gap-6 max-lg:flex-col">
          <li>
            <Link
              href={"/"}
              className="md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href={"/store"}
              className="md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
            >
              Shop
            </Link>
          </li>
          <li>
            <Link
              href={"/"}
              className="md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
            >
              Support
            </Link>
          </li>
          <li>
            <Link
              href={"/"}
              className="md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
            >
              Try now
            </Link>
          </li>
          <li>
            <Link
              href={"/"}
              className="md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
            >
              Login
            </Link>
          </li>
        </ul>
        <div className="flex aligns-center gap-6">
          <a
            href={"https://discord.gg/onezero"}
            className="flex items-center hover:opacity-60 transition-all ease-in-out duration-200"
          >
            <FaDiscord size={24} />
          </a>
          <a
            href={"https://www.youtube.com/@onezero3397"}
            className="flex items-center hover:opacity-60 transition-all ease-in-out duration-200"
          >
            <FaYoutube size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}
