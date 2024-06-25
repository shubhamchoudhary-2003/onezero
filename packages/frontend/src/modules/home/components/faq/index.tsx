/* eslint-disable react/no-unescaped-entities */
"use client"

import React, { useState } from "react"
import Accordion from "./components/accordion"

const faqs = [
  {
    title: "What sort of design services do y'all provide in here??",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title:
      "Is there a cap on the amount of design requests I can throw your way?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "When can I expect my designs to be completed?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "When can I expect my designs to be completed?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: true,
  },
  {
    title: "What software do you use for design?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "How do I get started with DIVADSGN?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "What if I don’t like my design?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "What if I only need one design request?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
  {
    title: "Can I get a refund if I’m not satisfied with the service?",
    text: "Absolutely not! there's no limit at all! Feel free to send in as many design requests as your heart desires.",
    active: false,
  },
]

const FAQ = () => {
  const [activedKey, setActivedKey] = useState<number>(-1)

  const setActive = (index: number) => {
    if (activedKey === index) {
      setActivedKey(-1)
    } else {
      setActivedKey(index)
    }
  }

  return (
    <div className="flex flex-col items-center mt-36 mb-40 max-sm:px-6 max-sm:mb-20">
      <h4 className="font-['Bebas_Neue'] text-4xl mb-6 text-center">
        Frequently Asked Questions
      </h4>
      <p className="text-lg mb-12 max-w-md text-center max-sm:px-10 max-sm:mb-6">
        These questions might not be on everyone's FAQ list, but we've got your
        back in case you were curious.
      </p>
      <div className="max-w-[80%] max-sm:max-w-none">
        {faqs.map((faq, index) => {
          const actived = activedKey === index
          return (
            <Accordion
              key={index}
              title={faq.title}
              id={`faqs-${index}`}
              active={actived}
              index={index}
              isOrder
              onChange={setActive}
            >
              {faq.text}
            </Accordion>
          )
        })}
      </div>
    </div>
  )
}

export default FAQ
