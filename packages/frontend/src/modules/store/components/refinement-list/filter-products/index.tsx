"use client"

import { useMemo } from "react"
// @ts-ignore
import { usePathname } from "next/navigation"
import { Kbd } from "@medusajs/ui"
import { IoSearch } from "react-icons/io5"
import "rc-tree/assets/index.css"
import Link from "next/link"

const FilterProducts = ({ categories }: { categories: any[] }) => {
  const pathname = usePathname()
  const index = pathname.split("/").findIndex((i: string) => i === "categories")

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (index === -1) {
        return !category.parent_category
      } else {
        const handle = pathname.split("/")[index + 1]
        return category.parent_category?.handle === handle
      }
    })
  }, [categories, usePathname])

  const selectedCategory = useMemo(() => {
    if (index === -1) {
      return null
    } else {
      const handle = pathname.split("/")[index + 1]
      return categories.find((i) => i.handle === handle)
    }
  }, [categories, usePathname])

  return (
    <div className="bg-[#111318] p-4">
      <div className="relative">
        <IoSearch className="absolute top-[50%] left-3 translate-y-[-50%] text-[#52525B]" />
        <input
          type="text"
          className="rounded-lg bg-[rgb(39,39,42)] placeholder:text-[#52525B] w-full p-2 outline-none pl-8"
          placeholder="Search"
        />
        <div className="absolute top-[50%] translate-y-[-50%] right-3">
          <Kbd className="bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46]">
            ⌘ K
          </Kbd>
        </div>
      </div>
      <div className="text-ui-fg-subtle overflow-auto mt-5 pb-3">
        <ul>
          <p className="font-normal font-sans txt-compact-small-plus text-ui-fg-muted mb-3">
            Category list{" "}
            {selectedCategory && <span>({selectedCategory.name})</span>}
          </p>
          {filteredCategories.map((item: any) => {
            return (
              <li key={item.id} className="w-full pl-4">
                <Link
                  href={`categories/${item.handle}`}
                  className="font-sans txt-compact-small-plus font-normal text-ui-fg-subtle flex w-full py-1 px-2 hover:bg-[#282A2E] transition-all duration-200 ease-in-out"
                >
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default FilterProducts
