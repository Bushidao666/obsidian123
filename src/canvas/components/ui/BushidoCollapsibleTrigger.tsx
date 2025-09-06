import React from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { HiMenu, HiX } from 'react-icons/hi';

interface BushidoCollapsibleTriggerProps {
    isOpen: boolean;
    onToggle: () => void;
}

/**
 * Trigger para menu colapsável estilo Chakra UI Pro
 */
export const BushidoCollapsibleTrigger: React.FC<BushidoCollapsibleTriggerProps> = ({ isOpen, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#A0AEC0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF007F';
                e.currentTarget.style.background = 'rgba(255, 0, 127, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#A0AEC0';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <Icon as={isOpen ? HiX : HiMenu} size="18" />
        </button>
    );
};
