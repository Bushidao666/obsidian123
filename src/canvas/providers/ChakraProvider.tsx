import React from 'react';
import { ChakraProvider as BaseChakraProvider, defaultSystem } from '@chakra-ui/react';

interface ChakraProviderProps {
    children: React.ReactNode;
}

/**
 * ChakraProvider configurado para Chakra UI v3 com defaultSystem
 */
export const ChakraProvider: React.FC<ChakraProviderProps> = ({ children }) => {
    return (
        <BaseChakraProvider value={defaultSystem}>
            {children}
        </BaseChakraProvider>
    );
};
