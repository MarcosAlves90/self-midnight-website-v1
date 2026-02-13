import PropTypes from 'prop-types';
import CustomInput from '../../assets/components/CustomInput.jsx';
import { RetroPanel } from '../../assets/components/RetroUI.jsx';

export default function ProgressionSection({userData, onInputChange}) {
    return (
        <RetroPanel title="Progressao e Potencial">
            <div>
                <CustomInput label="Defesa" type="number" value={15 + (userData['atributo-DES'] || 0) + (userData['atributo-DES-bonus'] || 0)} disabled startAdornment="[DEF]" />
                <CustomInput label="DT" type="number" value={10 + (userData['atributo-PRE'] || 0) + (userData['atributo-PRE-bonus'] || 0) + userData.nivel} disabled startAdornment="[DT]" />
                <CustomInput label="Deslocamento" type="number" value={9} disabled startAdornment="[MOV]" />
                <CustomInput label="Nivel" type="number" value={userData.nivel || ''} onChange={onInputChange('nivel')} min={0} placeholder="Ex: 1" />
            </div>
        </RetroPanel>
    );
}

ProgressionSection.propTypes = {
    userData: PropTypes.object.isRequired,
    onInputChange: PropTypes.func.isRequired,
};


