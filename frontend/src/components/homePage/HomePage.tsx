import { CarouselJobs } from "../carouselJobs/CarouselJobs"
import { Footer } from "../footer/Footer"
import { Jobs } from "../jobs/Jobs"
import { Menu } from "../menu/Menu"
import { News } from "../news/News"
import { Reviews } from "../review/Review"
import { ReviewUs } from "../review/ReviewUs"

export const HomePage = () => {
    return (
        <section className="relative min-h-screen w-full bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            <Menu />
            <CarouselJobs />
            <News />
            <Jobs />
            <ReviewUs />
            <Reviews />
            <Footer />
        </section>
    )
}