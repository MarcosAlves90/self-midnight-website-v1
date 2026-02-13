import PropTypes from 'prop-types';
import VitalResource from './VitalResource';
import { RetroPanel } from '../../assets/components/RetroUI.jsx';

export default function VitalResourcesSection({
    userData,
    localLife,
    localEnergy,
    onResourceChange,
    onInputChange,
}) {
    const vitalResources = [
        { label: 'Vida', icon: '[HP]', currentKey: 'vidaGasta', maxValue: localLife, color: '#f59e0b', lightColor: '#fde68a' },
        { label: 'Estresse', icon: '[STR]', currentKey: 'estresseGasto', maxValue: ((userData['pericia-Foco'] || 0) / 2) * 10, color: '#84cc16', lightColor: '#d9f99d' },
        { label: 'Energia (NRG)', icon: '[NRG]', currentKey: 'energiaGasta', maxValue: localEnergy, color: '#22c55e', lightColor: '#86efac' },
        { label: 'Sanidade', icon: '[SAN]', currentKey: 'sanidadeGasta', maxValue: ((userData['pericia-Foco'] || 0) / 2) * 10, color: '#38bdf8', lightColor: '#7dd3fc' },
    ];

    return (
        <RetroPanel title="Recursos Vitais">
            <div>
                {vitalResources.map((resource) => (
                    <VitalResource
                        key={resource.currentKey}
                        label={resource.label}
                        icon={resource.icon}
                        currentKey={resource.currentKey}
                        currentValue={userData[resource.currentKey] || 0}
                        maxValue={resource.maxValue}
                        color={resource.color}
                        lightColor={resource.lightColor}
                        onResourceChange={onResourceChange}
                        onInputChange={onInputChange}
                    />
                ))}
            </div>
        </RetroPanel>
    );
}

VitalResourcesSection.propTypes = {
    userData: PropTypes.object.isRequired,
    localLife: PropTypes.number.isRequired,
    localEnergy: PropTypes.number.isRequired,
    onResourceChange: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
};


