import Image from "next/image"

const JoinCommunity = () => {
  return (
    <div className="relative flex flex-col justify-center h-[100vh] bg-[url(https://upcdn.io/12a1yvj/raw/community-bg.png)] max-sm:h-[650px]">
      <div className="absolute z-10 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/0 from-61% to-zinc-950 to-100%"></div>
      <div className="absolute z-20 w-full h-full bg-[#0F0F0F]/90"></div>
      <div className="relative z-20 flex items-center justify-center">
        <div className="flex items-center justify-center w-[50%] max-md:absolute max-md:w-[100%] max-md:opacity-80">
          <Image
            className="w-[70%] h-auto max-lg:w-[100%]"
            width={120}
            height={70}
            src={"https://upcdn.io/12a1yvj/raw/community.svg"}
            alt="Logo"
          />
        </div>
        <div className="z-30 flex flex-col w-[50%] max-sm:w-full max-sm:px-10 max-sm:relative max-sm:z-30 max-lg:-ml-[10%]">
          <div className="flex flex-col items-start gap-6">
            <h2 className="font-['Bebas_Neue'] text-6xl">
              Join A Community <br />
              <span className="font-extralight font-[BebasNeue-Book]">
                of over 1500 people
              </span>
            </h2>
            <div className="border-yellow-400 border-2 w-[64px]"></div>
            <p className="w-[420px] text-[#BCCBD6] max-sm:w-full">
            Get involved in our Discord community , where you can connect, share ideas, exchange settings and participate in exciting events.
            Do not miss out! Become part of something bigger today!
            </p>
            <a href="https://discord.gg/onezero" target="_blank" rel="noopener noreferrer">
              <button className="border-yellow-400 text-yellow-400 font-bold border-2 rounded-md px-10 py-4 bg-gradient-to-t bg-yellow-400/20 transition-all duration-200 ease-in-out hover:bg-yellow-400/30">
                Connect Now
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinCommunity
