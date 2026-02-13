import Background from './Page0/Background.jsx';
import HeroSection from './Page0/HeroSection.jsx';

export default function Page0() {
    return (
        <>
            <Background />
            <main className="retro-home">
                <HeroSection
                    category="THE MENTAL WORLD: ANO 1"
                    title="HighNoon"
                    subtitle="Clearance Nivel OMEGA. Terminal de acesso classificado Sevastopol."
                />
            </main>
        </>
    );
}
