import React from 'react';
import { Box, Image } from '@chakra-ui/react';

interface BushidoLogoProps {
    size?: number;
}

/**
 * Logo Bushido usando o GIF fornecido
 */
export const BushidoLogo: React.FC<BushidoLogoProps> = ({ size = 28 }) => {
    return (
        <Box 
            width={`${size}px`} 
            height={`${size}px`}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
        >
            <Image
                src="./gif.gif" // Caminho relativo para o GIF
                alt="Bushido Academy"
                width={`${size}px`}
                height={`${size}px`}
                fallback={
                    // Fallback SVG baseado no exemplo do Chakra
                    <svg 
                        height={size} 
                        viewBox="0 0 50 50" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Bushido Academy</title>
                        {/* Adaptação do logo para tema Bushido */}
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M20.127 0C15.466 0 11.2287 1.69492 7.83887 4.23729L30.9321 31.9915L49.788 17.7966C48.9406 7.83898 40.466 0 30.0846 0"
                            fill="#FF007F" // Bushido Magenta
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M30.0847 50C41.1017 50 50 41.1017 50 30.0847V29.0254L32.839 41.7373C30.9322 43.2203 28.178 42.7966 26.6949 41.1017L2.11864 11.4407C0.847458 13.983 0 16.9491 0 19.9152V29.8729C0 40.8898 8.89831 49.7881 19.9153 49.7881"
                            fill="#FFD700" // Bushido Gold
                        />
                    </svg>
                }
            />
        </Box>
    );
};
