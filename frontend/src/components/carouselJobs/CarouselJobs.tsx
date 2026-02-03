import { CarouselServices } from "../../data/carouselJobsData"

export const CarouselJobs = () => {
    return (
        <div className="carousel" id="home">
            <div className="carousel-track">
                {[...CarouselServices, ...CarouselServices].map((service, index) => (
                    <img className="item" key={index} src={service.img} alt={service.name} />
                ))}
            </div>
        </div>
    )
}