import PropTypes from 'prop-types';
import CustomInput from '../../assets/components/CustomInput.jsx';
import CustomSelect from '../../assets/components/CustomSelect.jsx';
import { RetroPanel } from '../../assets/components/RetroUI.jsx';

export default function MentalWorldSection({userData, onInputChange}) {
    return (
        <RetroPanel title="Mundo Mental">
            <div>
                <CustomInput label="Nome da Forma" type="text" value={userData.nomeF || ''} onChange={onInputChange('nomeF')} placeholder="Ex: Aracnofobia" />
                <CustomSelect
                    label="Categoria da Forma"
                    value={userData.forma || ''}
                    onChange={onInputChange('forma')}
                    options={[
                        { value: '', label: 'Nenhum' },
                        { value: 1, label: 'Medo' },
                        { value: 2, label: 'Fobia' },
                        { value: 3, label: 'Trauma' },
                    ]}
                />
                <CustomInput label="Tipo da Forma" type="text" value={userData.tipoF || ''} onChange={onInputChange('tipoF')} placeholder="Ex: Medo de aranhas" />
            </div>
        </RetroPanel>
    );
}

MentalWorldSection.propTypes = {
    userData: PropTypes.object.isRequired,
    onInputChange: PropTypes.func.isRequired,
};


