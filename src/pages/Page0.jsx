import Background from './Page0/Background.jsx';
import HeroSection from './Page0/HeroSection.jsx';
import Seo from '../assets/components/Seo.jsx';

export default function Page0() {
    return (
        <>
            <Seo
                title="Inicio"
                description="Pagina inicial do HighNoon com acesso rápido as fichas e funções principais."
            />
            <Background />
            <main className="retro-home">
                <HeroSection
                    category="THE MENTAL WORLD: ANO 1"
                    title="HighNoon"
                    subtitle="Clearance Nível OMEGA. Terminal de acesso classificado Sevastopol."
                />
            </main>
        </>
    );
}
