import { useNavigate } from 'react-router-dom';

export default function EnterButton() {
    const navigate = useNavigate();

    const playClickSound = () => {
        const audio = new Audio('/sounds/click-mainpage-button.mp3');
        audio.play().catch((error) => {
            console.log('Erro ao reproduzir o som:', error);
        });
    };

    const handleClick = () => {
        playClickSound();
        navigate('/individual');
    };

    return (
        <button
            onClick={handleClick}
            className="retro-button retro-button--cta"
            aria-label="Entrar na aplicacao"
        >
            Entrar
        </button>
    );
}


