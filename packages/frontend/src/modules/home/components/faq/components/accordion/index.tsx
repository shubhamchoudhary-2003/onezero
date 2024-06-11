"use client"

import { useState, useEffect } from "react"

function pad(num: number, size: number) {
  var s = "000000000" + num
  return s.substr(s.length - size)
}

type AccordionpProps = {
  children: React.ReactNode
  title: string
  id: string
  active?: boolean
  isOrder?: boolean
  index?: number
  onChange?: any
}

export default function Accordion({
  children,
  title,
  id,
  active = false,
  isOrder,
  index,
  onChange,
}: AccordionpProps) {
  const [accordionOpen, setAccordionOpen] = useState<boolean>(active)

  useEffect(() => {
    setAccordionOpen(active)
  }, [active])

  return (
    <div className="py-2">
      <h2 className="text-3xl max-sm:text-2xl max-sm:font-extralight">
        <button
          className="flex items-center justify-between w-full text-left font-semibold py-2 gap-6"
          onClick={(e) => {
            e.preventDefault()
            setAccordionOpen(!accordionOpen)
            if (onChange) onChange(index)
          }}
          // aria-expanded={accordionOpen}
          // aria-controls={`accordion-text-${id}`}
        >
          <div className="flex-1 flex">
            {isOrder && (
              <span
                className={`min-w-[80px] max-md:min-w-[40px] ${
                  accordionOpen && "text-yellow-400"
                }`}
              >
                {pad((index === undefined ? 0 : index) + 1, 2)}
              </span>
            )}
            <span>{title}</span>
          </div>
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            fontSize={24}
            xmlns="http://www.w3.org/2000/svg"
            className={`transform origin-center rotate-0 transition duration-200 ease-out ${
              accordionOpen && "!rotate-180"
            }`}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.7071 9.79289C16.3166 9.40237 15.6834 9.40237 15.2929 9.79289L12.5 12.5858L9.70711 9.79289C9.31658 9.40237 8.68342 9.40237 8.29289 9.79289C7.90237 10.1834 7.90237 10.8166 8.29289 11.2071L11.7929 14.7071C12.1834 15.0976 12.8166 15.0976 13.2071 14.7071L16.7071 11.2071C17.0976 10.8166 17.0976 10.1834 16.7071 9.79289Z"
              fill="#ECECEC"
            />
          </svg>
        </button>
      </h2>
      <div
        id={`accordion-text-${id}`}
        role="region"
        // aria-labelledby={`accordion-title-${id}`}
        className={`grid text-sm text-slate-600 overflow-hidden transition-all duration-300 ease-in-out ${
          accordionOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`pb-3 text-[#ECECEC]/80 text-xl ${
              isOrder && "pl-[80px] max-md:pl-[40px]"
            }`}
          >
            {children}
          </p>
        </div>
      </div>
    </div>
  )
}
