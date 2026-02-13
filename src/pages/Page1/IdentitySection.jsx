import PropTypes from 'prop-types';
import ProfilePicUploader from '../../assets/components/ProfilePicUploader.jsx';
import { RetroPanel } from '../../assets/components/RetroUI.jsx';

export default function IdentitySection({userData}) {
    return (
        <RetroPanel title="Identificador">
            <div>
                <ProfilePicUploader />
                <div>
                    <p><strong>Nome:</strong> {`${userData.nome || ''}`}</p>
                    <p><strong>Nascimento:</strong> {`${userData.idade || ''}`}</p>
                    <p><strong>Titulo:</strong> {`${userData.titulo || ''}`}</p>
                    <p><strong>Categoria:</strong> operador</p>
                </div>
            </div>
        </RetroPanel>
    );
}

IdentitySection.propTypes = {
    userData: PropTypes.object.isRequired,
};


