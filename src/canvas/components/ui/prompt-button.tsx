import React from 'react';
import { Box, Button, Icon } from '@chakra-ui/react';

interface PromptButtonProps {
    icon: React.ReactElement;
    onClick: () => void;
    children: React.ReactNode;
}

/**
 * PromptButton - Baseado no exemplo do Chakra UI Pro
 */
export const PromptButton: React.FC<PromptButtonProps> = ({ icon, onClick, children }) => {
    return (
        <Button
            variant="outline"
            minH={{ base: '80px', md: '120px' }}
            alignItems="flex-start"
            p={3}
            fontSize="sm"
            fontWeight="medium"
            whiteSpace="normal"
            textAlign="start"
            onClick={onClick}
            position="relative"
            _hover={{
                bg: 'pink.50',
                _dark: { bg: 'pink.900' },
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 0, 127, 0.3)'
            }}
        >
            {children}
            <Box pos="absolute" bottom="2" insetEnd="2">
                <Box color="pink.500" opacity={0.5} fontSize="lg">
                    {icon}
                </Box>
            </Box>
        </Button>
    );
};
