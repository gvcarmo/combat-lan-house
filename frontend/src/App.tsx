import { BrowserRouter } from 'react-router-dom'
import { CarouselJobs } from "./components/carouselJobs/CarouselJobs"
import { Footer } from "./components/footer/Footer"
import { Jobs } from "./components/jobs/Jobs"
import { Menu } from "./components/menu/Menu"
import { News } from "./components/news/News"
import { Reviews } from "./components/review/Review"
import { ReviewUs } from "./components/review/ReviewUs"
import { AuthProvider } from './contexts/AuthContext'

function App() {

  return (
    <section className="relative min-h-screen w-full bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
      <AuthProvider>
        <BrowserRouter>
          <Menu />
          <CarouselJobs />
          <News />
          <Jobs />
          <ReviewUs />
          <Reviews />
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </section>
  )
}

export default App
