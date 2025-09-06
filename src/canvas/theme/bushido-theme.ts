import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Bushido Academy color palette
const bushidoColors = {
  bushido: {
    50: '#FFE6F7',
    100: '#FFB3E6',
    200: '#FF80D5',
    300: '#FF4DC4',
    400: '#FF1AB3',
    500: '#FF007F', // Primary Magenta
    600: '#E6006B',
    700: '#CC0057',
    800: '#B30043',
    900: '#99002F',
  },
  gold: {
    50: '#FFFEF0',
    100: '#FFFACC',
    200: '#FFF599',
    300: '#FFF066',
    400: '#FFEB33',
    500: '#FFD700', // Primary Gold
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39900',
    900: '#998400',
  },
  dark: {
    50: '#F7F7F7',
    100: '#E1E1E1',
    200: '#CFCFCF',
    300: '#B1B1B1',
    400: '#9E9E9E',
    500: '#7E7E7E',
    600: '#626262',
    700: '#515151',
    800: '#3B3B3B',
    900: '#0A0A0A', // Primary Dark
  }
};

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
  disableTransitionOnChange: false,
};

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderRadius: 'md',
      transition: 'all 0.3s ease',
    },
    sizes: {
      sm: {
        fontSize: 'xs',
        px: 4,
        py: 2,
      },
      md: {
        fontSize: 'sm',
        px: 6,
        py: 3,
      },
      lg: {
        fontSize: 'md',
        px: 8,
        py: 4,
      },
    },
    variants: {
      bushido: {
        bg: 'bushido.500',
        color: 'white',
        _hover: {
          bg: 'gold.500',
          color: 'dark.900',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(255, 0, 127, 0.4)',
        },
        _active: {
          bg: 'bushido.600',
          transform: 'translateY(0)',
        },
      },
      bushidoGold: {
        bg: 'gold.500',
        color: 'dark.900',
        _hover: {
          bg: 'bushido.500',
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
        },
        _active: {
          bg: 'gold.600',
          transform: 'translateY(0)',
        },
      },
      bushidoOutline: {
        border: '2px solid',
        borderColor: 'bushido.500',
        color: 'bushido.500',
        bg: 'transparent',
        _hover: {
          bg: 'bushido.500',
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(255, 0, 127, 0.3)',
        },
      },
    },
    defaultProps: {
      variant: 'bushido',
      size: 'md',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          borderColor: 'gray.700',
        },
        transition: 'all 0.3s ease',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(255, 0, 127, 0.1)',
          borderColor: 'bushido.500',
        },
      },
      header: {
        bg: 'linear-gradient(135deg, var(--chakra-colors-bushido-500), var(--chakra-colors-gold-500))',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: 'lg lg 0 0',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      },
      body: {
        p: 4,
      },
      footer: {
        borderTop: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          borderColor: 'gray.700',
        },
      },
    },
  },
  Input: {
    variants: {
      bushido: {
        field: {
          border: '2px solid',
          borderColor: 'gray.300',
          _dark: {
            borderColor: 'gray.600',
          },
          _hover: {
            borderColor: 'bushido.500',
          },
          _focus: {
            borderColor: 'bushido.500',
            boxShadow: '0 0 0 3px rgba(255, 0, 127, 0.2)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'bushido',
    },
  },
  Badge: {
    variants: {
      bushido: {
        bg: 'bushido.500',
        color: 'white',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontSize: 'xs',
      },
      bushidoGold: {
        bg: 'gold.500',
        color: 'dark.900',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontSize: 'xs',
      },
    },
  },
  Tooltip: {
    baseStyle: {
      bg: 'gray.900',
      color: 'white',
      fontSize: 'sm',
      fontWeight: 'medium',
      borderRadius: 'md',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '1px solid',
      borderColor: 'bushido.500',
    },
  },
};

// Global styles
const styles = {
  global: {
    body: {
      fontFamily: 'var(--font-text-theme)',
      bg: 'var(--background-primary)',
      color: 'var(--text-normal)',
    },
    '*': {
      borderColor: 'var(--background-modifier-border)',
    },
    '*::placeholder': {
      color: 'var(--text-muted)',
    },
  },
};

// Fonts
const fonts = {
  heading: 'var(--font-text-theme)',
  body: 'var(--font-text-theme)',
  mono: 'var(--font-monospace-theme)',
};

// Breakpoints
const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

export const bushidoTheme = extendTheme({
  config,
  colors: bushidoColors,
  components,
  styles,
  fonts,
  breakpoints,
  shadows: {
    bushido: '0 8px 25px rgba(255, 0, 127, 0.3)',
    bushidoGold: '0 8px 25px rgba(255, 215, 0, 0.3)',
    bushidoLg: '0 12px 40px rgba(255, 0, 127, 0.2)',
  },
  radii: {
    bushido: '8px',
    bushidoLg: '12px',
  },
  space: {
    bushido: '16px',
  },
});
