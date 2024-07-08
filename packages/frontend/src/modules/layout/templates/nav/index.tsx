"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FaDiscord } from "react-icons/fa6"
import { FaYoutube } from "react-icons/fa6"
import  logo from "../../../../../public/static/image/logo.png"
const Nav = () => {
  const [isExpand, setIsExpand] = useState(false)

  const toggleExpand = async () => {
    setIsExpand(!isExpand)
  }

  return (
    <header className="absolute top-8 z-50 w-full px-[150px] max-md:px-[10px] max-xl:px-[20px] max-xl:top-4">
      <nav className="border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="relative inline-block">
            <Image
              className="w-auto h-[70px] max-lg:h-[50px] max-md:h-[42px]"
              width={120}
              height={70}
              src={logo}
              alt="Logo"
            />
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <div className="flex aligns-center gap-5">
              <Link
                href={"https://discord.gg/onezero"}
                className="flex items-center hover:opacity-60 transition-all ease-in-out duration-200"
              >
                <FaDiscord size={24} />
              </Link>
              <a
                href={"https://www.youtube.com/@onezero3397"}
                className="flex items-center hover:opacity-60 transition-all ease-in-out duration-200"
              >
                <FaYoutube size={24} />
              </a>
            </div>
            <button
              data-collapse-toggle="navbar-cta"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-cta"
              aria-expanded="false"
              onClick={toggleExpand}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className={`items-center justify-between w-full md:flex md:w-auto md:order-1 md:visible md:opacity-100 transition-all ease-in-out ${
              !isExpand ? "invisible opacity-0" : "visible opacity-100"
            }`}
            id="navbar-cta"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 max-md:bg-zinc-950 max-md:bg-opacity-85">
              <li>
                <Link
                  href="/"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                >
                  Try now
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="block uppercase font-bold py-2 px-3 md:p-0 rounded hover:bg-gray-900 md:hover:bg-transparent md:hover:text-yellow-400 transition-all duration-200 ease-in-out"
                >
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Nav
