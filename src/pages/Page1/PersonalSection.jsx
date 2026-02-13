import PropTypes from 'prop-types';
import CustomInput from '../../assets/components/CustomInput.jsx';
import { RetroPanel } from '../../assets/components/RetroUI.jsx';

export default function PersonalSection({userData, onInputChange}) {
    return (
        <RetroPanel title="Pessoal">
            <div>
                <CustomInput label="Nome" type="text" value={userData.nome || ''} onChange={onInputChange('nome')} placeholder="Digite seu nome completo" />
                <CustomInput label="Data de Nascimento" type="text" value={userData.idade || ''} onChange={onInputChange('idade')} placeholder="Ex: 01/01/2000" />
                <CustomInput label="Profissao" type="text" value={userData.profissao || ''} onChange={onInputChange('profissao')} placeholder="Ex: Detetive, Medico" />
                <CustomInput label="Titulo" type="text" value={userData.titulo || ''} onChange={onInputChange('titulo')} placeholder="Ex: Investigador Senior" />
                <CustomInput label="Altura" type="number" value={userData.altura || ''} onChange={onInputChange('altura')} min={0} step={0.01} endAdornment="m" placeholder="Ex: 1.75" />
                <CustomInput label="Peso" type="number" value={userData.peso || ''} onChange={onInputChange('peso')} min={0} step={0.1} endAdornment="kg" placeholder="Ex: 70.5" />
            </div>
        </RetroPanel>
    );
}

PersonalSection.propTypes = {
    userData: PropTypes.object.isRequired,
    onInputChange: PropTypes.func.isRequired,
};


