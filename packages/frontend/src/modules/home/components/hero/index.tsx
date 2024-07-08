import { Heading } from "@medusajs/ui"
import Link from "next/link"
import { BsCaretDown } from "react-icons/bs"
import Herobg from "../../../../../public/static/image/hero-bg.png";
const Hero = () => {
  return (
    <section className="relative h-[100vh] bg-cover bg-center"
      style={{ backgroundImage: `url(${Herobg.src})` }}>
      <div className="absolute z-10 w-full h-full bg-gradient-to-b from-zinc-950 from-0% via-zinc-950/60 via-[percentage:15%_80%] to-zinc-950 to-100%"></div>
      <div className="absolute z-20 left-[50%] top-[60%] translate-x-[-50%] translate-y-[-50%] w-[725px] max-md:w-full">
        <div className="flex flex-col items-center max-sm:px-10 max-xl:pt-20 max-xl:px-5">
          <Heading
            className="text-8xl tracking-wider text-center mb-3 font-['Bebas_Neue'] max-md:text-7xl"
            level={"h1"}
          >
            Everything you need in one place
          </Heading>
          <p className="mb-16 text-2xl text-center tracking-wider font-['Bebas_Neue'] max-md:mb-6 max-md:text-xl max-xl:mb-6">
            Experience premium profiles & software solutions
          </p>
          <Link href="/store">
            <button className="mb-16 text-yellow-400 font-bold border-yellow-400 border-2 rounded-md px-10 py-4 bg-yellow-400/20 transition-all duration-200 ease-in-out hover:bg-yellow-400/30">
              Purchase Now
            </button>
          </Link>
          <a href="#" className="flex flex-col items-center gap-1">
            <span className="uppercase">Discover more</span>
            <i className="text-3xl">
              <BsCaretDown />
            </i>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
