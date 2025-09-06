import React from 'react';
import { Button, Stack, type StackProps, Icon, HStack, Text } from '@chakra-ui/react';
import { 
    HiDocumentText, 
    HiPencilAlt, 
    HiChatAlt2, 
    HiChartBar,
    HiZoomIn,
    HiZoomOut,
    HiViewGrid
} from 'react-icons/hi';

interface BushidoNavbarLinksProps extends StackProps {
    canvas: any;
}

/**
 * Navigation Links estilo Chakra UI Pro para Bushido Canvas
 */
export const BushidoNavbarLinks: React.FC<BushidoNavbarLinksProps> = ({ canvas, ...props }) => {
    const navItems = [
        { 
            label: 'Notes', 
            icon: HiDocumentText, 
            action: () => canvas.addNode('note'),
            colorScheme: 'yellow',
            variant: 'subtle' as const
        },
        { 
            label: 'Text', 
            icon: HiPencilAlt, 
            action: () => canvas.addNode('text'),
            colorScheme: 'pink',
            variant: 'subtle' as const
        },
        { 
            label: 'AI Chat', 
            icon: HiChatAlt2, 
            action: () => canvas.addNode('ai-chat'),
            colorScheme: 'purple',
            variant: 'solid' as const
        },
        { 
            label: 'Stats', 
            icon: HiChartBar, 
            action: () => {
                const stats = canvas.getStats();
                alert(`⚡ BUSHIDO CANVAS STATS\n\n📊 Total Nodes: ${stats.nodeCount}\n📄 Notes: ${stats.noteNodeCount}\n📝 Text: ${stats.textNodeCount}\n🤖 AI Chat: ${stats.aiNodeCount}\n🔗 Connections: ${stats.connectionCount}\n\n🚀 Engine: React + Chakra UI v3\n⚡ Performance: Enterprise Grade\n🎨 Theme: Bushido Academy Dark`);
            },
            colorScheme: 'gray',
            variant: 'ghost' as const
        }
    ];

    return (
        <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: '3', md: '4' }} {...props}>
            {navItems.map((item) => (
                <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: item.variant === 'solid' ? 
                            (item.colorScheme === 'purple' ? 'linear-gradient(135deg, #9F7AEA, #805AD5)' : 
                             item.colorScheme === 'yellow' ? 'linear-gradient(135deg, #FFD700, #FFC700)' :
                             item.colorScheme === 'pink' ? 'linear-gradient(135deg, #FF007F, #FF1493)' :
                             'linear-gradient(135deg, #4A5568, #2D3748)') :
                            item.variant === 'subtle' ?
                            (item.colorScheme === 'yellow' ? 'rgba(255, 215, 0, 0.1)' :
                             item.colorScheme === 'pink' ? 'rgba(255, 0, 127, 0.1)' :
                             item.colorScheme === 'purple' ? 'rgba(159, 122, 234, 0.1)' :
                             'rgba(74, 85, 104, 0.1)') :
                            'transparent',
                        color: item.variant === 'solid' ? 'white' :
                               item.colorScheme === 'yellow' ? '#FFD700' :
                               item.colorScheme === 'pink' ? '#FF007F' :
                               item.colorScheme === 'purple' ? '#9F7AEA' :
                               '#A0AEC0',
                        boxShadow: item.variant === 'solid' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = item.variant === 'solid' ? 
                            '0 4px 12px rgba(0, 0, 0, 0.3)' : 
                            `0 4px 12px ${item.colorScheme === 'yellow' ? 'rgba(255, 215, 0, 0.3)' :
                                          item.colorScheme === 'pink' ? 'rgba(255, 0, 127, 0.3)' :
                                          item.colorScheme === 'purple' ? 'rgba(159, 122, 234, 0.3)' :
                                          'rgba(74, 85, 104, 0.3)'}`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = item.variant === 'solid' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none';
                    }}
                >
                    <Icon as={item.icon} size="16" />
                    {item.label}
                </button>
            ))}
            
            <div style={{ display: 'flex', gap: '4px' }}>
                <button
                    onClick={canvas.zoomOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#A0AEC0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFD700';
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#A0AEC0';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={HiZoomOut} size="16" />
                </button>
                <button
                    onClick={canvas.zoomToFit}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#A0AEC0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFD700';
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#A0AEC0';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={HiViewGrid} size="16" />
                </button>
                <button
                    onClick={canvas.zoomIn}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#A0AEC0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFD700';
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#A0AEC0';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={HiZoomIn} size="16" />
                </button>
            </div>
        </Stack>
    );
};
