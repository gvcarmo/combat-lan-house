import { CarouselServices } from "../../data/carouselJobsData"

export const CarouselJobs = () => {
    return (
        <>
            <div className="carousel" id="home">
                <div className="carousel-track">
                    {[...CarouselServices, ...CarouselServices].map((service, index) => (
                        <img className="item" key={index} src={service.img} alt={service.name} />
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="min-[1139px]:w-280 min-[1139px]:h-75 min-[610px]:w-139 min-[610px]:h-[240px] min-[320px]:w-71 min-[320px]:h-[150px] mt-2.5 flex items-center justify-center bg-black">

                    <picture>
                        <source srcSet='./propaganda/promo-25off.gif' media='(min-width: 1139px)' />
                        <source srcSet='./propaganda/promo-25off-tablet.gif' media='(min-width: 610px)' />
                        <img src='./propaganda/promo-25off-cel.gif' alt='Responsive image' />
                    </picture>

                </div>
            </div>
        </>
    )
}