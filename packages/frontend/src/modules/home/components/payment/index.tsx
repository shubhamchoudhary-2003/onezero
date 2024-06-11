import { BsFillPlusCircleFill } from "react-icons/bs"
import { IoCheckmarkOutline } from "react-icons/io5"
import { FaMinusCircle } from "react-icons/fa"

const Payment = () => {
  return (
    <div className="flex flex-col items-center mt-20 max-sm:px-5">
      <h4 className="font-['Bebas_Neue'] text-4xl mb-6 text-center">
        Looking for Flexible plans?
      </h4>
      <p className="font-['Bebas_Neue'] text-xl mb-12 text-center">
        EAsier then ever! Stick to one flat fee, month after month.
      </p>
      <div className="flex items-center justify-center max-lg:flex-col max-lg:gap-6 w-full max-lg:px-5 max-sm:px-0">
        <div
          className="w-[420px] max-xl:w-[340px] bg-gradient-to-b from-gray-200 to-transparent rounded-s-lg p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer text-[#ECECEC] text-sm max-lg:w-full max-lg:rounded-lg"
          style={{
            background:
              "radial-gradient(62.23% 62.23% at 60.43% 73.72%, rgba(255, 254, 254, 0.25) 0%, rgba(255, 255, 255, 0) 100%) /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */, linear-gradient(0deg, rgba(213, 213, 213, 0.3), rgba(213, 213, 213, 0.3)), rgba(172, 172, 172, 0.2)",
            backgroundBlendMode: "overlay, multiply, luminosity",
          }}
        >
          <div className="flex gap-3 items-center mb-3">
            <h4 className="text-4xl">Onezero – Pro</h4>
          </div>
          <p className="mb-5">Profiles for all Expansions included​</p>
          <div className="border-[#D9D9D9]/10 border-b-2 mb-5"></div>
          <div className="font-['Bebas_Neue'] text-4xl mb-2">
            <sup className="text-xl mr-2">€</sup>
            <span>29/mo</span>
          </div>
          <p className="font-['Bebas_Neue'] mb-10">Pause or cancel anytime.</p>
          <ul className="mb-10">
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Explore Northrend & Outland Achievement Profile</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Access to all Hidden Fishing Spots</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Access to all Dragon Glyphs Profiles</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Access to all Grinding, Gathering & Gold Profiles</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Access to all Swarm Fishing Profiles</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Access to Quality of Life Improvements</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p> Access to all future Updates</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Exclusivly made for Baneto</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Special Basic Subscription Role on Discord</p>
            </li>
            <li className="flex items-center mt-4">
              <FaMinusCircle className="text-[#ED4245] mr-2 text-lg" />
              <p>BBaneto or Unlocker are NOT included!</p>
            </li>
          </ul>
          <button className="mb-8 font-['Bebas_Neue'] text-xl border-[#BDBDBD] border-2 rounded-md px-6 py-2 text-[#BDBDBD] hover:bg-white/20 transition-all duration-200 ease-in-out">
            Get Started
          </button>
        </div>
        <div className="w-[420px] max-xl:w-[340px] rounded-lg p-px bg-gradient-to-b from-yellow-400 lg-transparent max-lg:w-full max-lg:rounded-lg">
          <div
            className="`rounded-[calc(0.25rem - 1px)]` bg-gradient-to-b from-gray-200 to-transparent p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer text-[#ECECEC] text-sm"
            style={{
              background:
                "radial-gradient(145.31% 96.49% at 50% 77.59%, rgba(34, 14, 17, 0.225) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #1f262b, #2e3b46), rgba(210, 210, 210, 0.12)",
              backgroundBlendMode: "soft-light, multiply, luminosity",
              borderRadius: "calc(0.5rem - 1px)",
            }}
          >
            <div className="flex gap-3 items-center mb-3">
              <h4 className="text-4xl">Onezero – Pro</h4>
              <span className="uppercase p-2 text-xs bg-[#8F00FF] rounded-lg">
                popular
              </span>
            </div>
            <p className="mb-5">Profiles for all Expansions included​</p>
            <div className="border-[#D9D9D9]/10 border-b-2 mb-5"></div>
            <div className="font-['Bebas_Neue'] text-4xl mb-2">
              <sup className="text-xl mr-2">€</sup>
              <span>39/mo</span>
            </div>
            <p className="font-['Bebas_Neue'] mb-10">
              Pause or cancel anytime.
            </p>
            <ul className="mb-10">
              <p className="flex items-center">
                <BsFillPlusCircleFill className="text-white/60 mr-2 text-lg" />
                All Features from Onezero - Basic Subscription
              </p>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>River Rapids Wrangler Achievement Profile</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to WotlK 70-80 Quester</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to SoD Quester</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to Exiles Reach Quester</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to Dragonriding Intro Quester</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to DK Starting Zone Quester</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to Dungeon Farm Profiles</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Access to 2 x 4 Farm Profiles</p>
              </li>
              <li className="flex items-center mt-4">
                <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
                <p>Special Basic Subscription Role on Discord</p>
              </li>
              <li className="flex items-center mt-4">
                <FaMinusCircle className="text-[#ED4245] mr-2 text-lg" />
                <p>Baneto or Unlocker are NOT included!</p>
              </li>
            </ul>
            <button className="mb-16 font-['Bebas_Neue'] text-yellow-400 text-xl border-yellow-400 border-2 rounded-md px-6 py-2 bg-yellow-400/20 transition-all duration-200 ease-in-out hover:bg-yellow-400/30">
              Get Started
            </button>
          </div>
        </div>
        <div
          className="w-[420px] max-xl:w-[340px] bg-gradient-to-b from-gray-200 to-transparent rounded-e-xl p-6 bg-stone-900 transition-all ease-in-out duration-300 cursor-pointer text-[#ECECEC] text-sm max-lg:w-full max-lg:rounded-lg"
          style={{
            background:
              "radial-gradient(62.23% 62.23% at 60.43% 73.72%, rgba(255, 254, 254, 0.25) 0%, rgba(255, 255, 255, 0) 100%) /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */, linear-gradient(0deg, rgba(213, 213, 213, 0.3), rgba(213, 213, 213, 0.3)), rgba(172, 172, 172, 0.2)",
            backgroundBlendMode: "overlay, multiply, luminosity",
          }}
        >
          <div className="flex gap-3 items-center mb-3">
            <h4 className="text-4xl">Onezero – Pro</h4>
          </div>
          <p className="mb-5">Profiles for all Expansions included​</p>
          <div className="border-[#D9D9D9]/10 border-b-2 mb-5"></div>
          <div className="font-['Bebas_Neue'] text-4xl mb-2">
            <sup className="text-xl mr-2">€</sup>
            <span>39/mo</span>
          </div>
          <p className="font-['Bebas_Neue'] mb-10">Pause or cancel anytime.</p>
          <ul className="mb-10">
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Lifetime access to all our Profiles</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Lifetime access to all future Updates</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Special Lifetime Role on Discord</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Exclusivly made for Baneto</p>
            </li>
            <li className="flex items-center mt-4">
              <IoCheckmarkOutline className="text-yellow-400 mr-2 text-lg" />
              <p>Baneto or Unlocker are NOT included!</p>
            </li>
          </ul>
          <button className="mb-8 font-['Bebas_Neue'] text-xl border-[#BDBDBD] border-2 rounded-md px-6 py-2 text-[#BDBDBD] hover:bg-white/20 transition-all duration-200 ease-in-out">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment
