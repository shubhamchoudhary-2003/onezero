import Image from "next/image"
import whyus from "../../../../../public/static/image/why-us-bg.png";
const WhyUs = () => {
  return (
    <section className="relative overflow-hidden">
      {/* <div className="absolute z-20 left-0 w-[5%] h-full bg-[#000000] max-sm:invisible"></div> */}
      <div className="absolute top-0 left-0 z-10 w-full h-full flex">
        <div className="min-w-[100vh] max-lg:w-[750px] h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/0 from-0% to-black to-[percentage:70%_75%] max-sm:invisible"></div>
        <div className="flex-1 h-full bg-[#000000]"></div>
      </div>
      <div className="absolute top-0 left-0 z-10 w-[100vh] h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/0 from-0% to-black to-[percentage:70%_75%] max-sm:invisible"></div>
      {/* <div className="absolute z-20 w-[40%] h-full bg-[#000000] max-sm:invisible"></div> */}
      <Image
        width={1980}
        height={1080}
        className="w-full object-cover max-md:h-[700px] max-md:object-cover max-sm:ml-auto max-sm:object-left max-sm:min-w-[1200px] max-sm:translate-x-[-17%]"
        src={whyus}
        alt=""
      />
      <div className="bg-black h-60 hidden max-lg:block max-md:hidden"></div>
      <div className="absolute top-[50%] right-[8%] translate-y-[-50%] z-30 max-sm:w-full max-sm:px-4 max-lg:right-[20px] max-md:right-0">
        <h2 className="font-['Bebas_Neue'] text-8xl mb-10 max-sm:text-7xl max-sm:mb-6">
          Why Us?
        </h2>
        <div className="flex flex-col gap-4 w-[420px] max-sm:w-full">
          <div className="border-transparent border-2 rounded-lg p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer hover:border-yellow-400 max-sm:bg-opacity-60">
            <h4 className="text-2xl mb-4">Always Up to Date</h4>
            <p>
              All OneZero Profiles are tested and continually improved to match
              the highest possible standards.
            </p>
          </div>
          <div className="border-transparent border-2 rounded-lg p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer hover:border-yellow-400 max-sm:bg-opacity-60">
            <h4 className="text-2xl mb-4">Premium Profiles</h4>
            <p>
              With over five years of experience OneZero Profiles got voted as
              the best profiles on the market.
            </p>
          </div>
          <div className="border-transparent border-2 rounded-lg p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer hover:border-yellow-400 max-sm:bg-opacity-60">
            <h4 className="text-2xl mb-4">Exceptional Support</h4>
            <p>
              We love our Customers. That is why we always aim to offer the best
              and fastest possible support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyUs
