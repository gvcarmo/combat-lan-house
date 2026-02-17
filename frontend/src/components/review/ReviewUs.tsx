import { Link } from "react-router-dom"

export const ReviewUs = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 h-35 max-[1140px]:h-70 max-[610px]:h-100 mb-2.5 bg-neutral-grayish border border-neutral-very-light-grayish flex max-[1140px]:flex-col items-center justify-between max-[610px]:justify-center max-[610px]:gap-0">
                <div className="flex flex-col max-[1140px]:items-center gap-2.5 max-[610px]:gap-0 text-white text-[20px]">

                    <Link to="/" className="flex items-center gap-2 mb-3">
                        <img className="pl-10 max-[1140px]:pl-0 max-[1140px]:w-60 max-[610px]:px-5 w-67.25 hover:scale-103 transition-all duration-300 ease-in-out" src="./logo.svg" alt="Logo Combat Lan House" />
                    </Link>

                    <div className="flex gap-1 ml-12 max-[1140px]:ml-0 max-[610px]:ml-0 max-[610px]:p-5 max-[1140px]:flex-col max-[1140px]:items-center max-[1140px]:text-center">
                        <p>4,8</p>
                        <div className="flex gap-1.5">
                            <img className="ml-2.5 w-6 h-6" src="./icons/star.png" alt="Star" />
                            <img className="w-6 h-6" src="./icons/star.png" alt="Star" />
                            <img className="w-6 h-6" src="./icons/star.png" alt="Star" />
                            <img className="w-6 h-6" src="./icons/star.png" alt="Star" />
                            <img className="w-6 h-6 mr-2.5" src="./icons/star.png" alt="Star" />
                        </div>
                        <p>36 avaliações no Google</p>
                    </div>
                </div>
                <a href="https://g.page/r/CfQRv300e4KLEAE/review" target="_blank" className="hover:bg-white hover:text-orange-combat duration-300 ease-in-out transition-all cursor-pointer text-white mr-10 max-[1140px]:ml-10 bg-orange-combat border border-neutral-dark-grayish hover:border-neutral-grayish px-10 py-5 font-bold text-[20px] hover:scale-103 max-[1140px]:my-5">Avalie-nos no Google!</a>
            </div>
        </div>
    )
}