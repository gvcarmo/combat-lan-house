import { BrowserRouter } from 'react-router-dom'
import { CarouselJobs } from "./components/carouselJobs/CarouselJobs"
import { Footer } from "./components/footer/Footer"
import { Jobs } from "./components/jobs/Jobs"
import { Menu } from "./components/menu/Menu"
import { News } from "./components/news/News"
import { Reviews } from "./components/review/Review"
import { ReviewUs } from "./components/review/ReviewUs"
import { AuthContext, AuthProvider } from './contexts/AuthContext'
import api from './services/api';
import { useContext, useEffect } from 'react'

function App() {

  const { setGlobalLoading } = useContext(AuthContext);

  useEffect(() => {
    const acordarServidor = async () => {
      setGlobalLoading(true);

      try {
        await api.get('/posts');
        await api.get('/jobs');
        await api.get('/reviews');

        console.log("Servidor acordado e pronto!")
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
      } finally {
        setGlobalLoading(false);
      }
    };

    acordarServidor();
  }, [setGlobalLoading]);

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
