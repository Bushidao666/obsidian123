import React, { useState } from 'react';
import {
    Button,
    Center,
    Container,
    HStack,
    Spacer,
    Box,
    Icon
} from '@chakra-ui/react';
import { 
    HiDownload, 
    HiUpload, 
    HiSave,
    HiFolderOpen
} from 'react-icons/hi';
import { 
    DialogRoot, 
    DialogContent, 
    DialogHeader, 
    DialogBody, 
    DialogFooter, 
    DialogBackdrop, 
    DialogTitle, 
    DialogCloseTrigger 
} from '../../../components/ui/dialog';
import { BushidoLogo } from './BushidoLogo';
import { BushidoNavbarLinks } from './BushidoNavbarLinks';
import { BushidoCollapsibleTrigger } from './BushidoCollapsibleTrigger';
import { useApp } from '../../context/AppContext';
import { CanvasSerializer } from '../../persistence/canvas-serializer';

interface VercelToolbarProps {
    canvas: any;
}

/**
 * Toolbar profissional estilo Chakra UI Pro com design Bushido
 */
export const VercelToolbar: React.FC<VercelToolbarProps> = ({ canvas }) => {
    const { plugin } = useApp();
    const [serializer] = useState(() => new CanvasSerializer({ plugin }));
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [flowName, setFlowName] = useState('');

    const handleSave = async () => {
        if (!flowName.trim()) return;

        try {
            const serialized = await serializer.serializeCanvas(canvas.canvasState, { name: flowName });
            await serializer.saveToFile(serialized);
            alert(`Flow "${flowName}" salvo com sucesso!`);
            setFlowName('');
            setSaveDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Erro ao salvar flow');
        }
    };

    const handleLoad = async () => {
        try {
            const savedFlows = await serializer.listSavedCanvas();
            
            if (savedFlows.length === 0) {
                alert('Nenhum flow salvo encontrado');
                return;
            }

            const flowNames = savedFlows.map((f, i) => `${i + 1}. ${f.metadata.name}`).join('\n');
            const selection = prompt(`Selecione o flow:\n\n${flowNames}\n\nDigite o número:`);
            
            const index = parseInt(selection || '') - 1;
            if (index >= 0 && index < savedFlows.length) {
                const flowData = await serializer.loadFromFile(savedFlows[index].file);
                const restoredState = await serializer.deserializeCanvas(flowData);
                
                canvas.clearAll();
                
                for (const [nodeId, nodeData] of restoredState.nodes) {
                    canvas.canvasState.nodes.set(nodeId, nodeData);
                }
                
                for (const [connId, connData] of restoredState.connections) {
                    canvas.canvasState.connections.set(connId, connData);
                }
                
                canvas.updateViewport(restoredState.viewport);
                alert(`Flow "${flowData.metadata.name}" carregado!`);
            }
        } catch (error) {
            console.error('Load error:', error);
            alert('Erro ao carregar flow');
        }
    };

    return (
        <>
            <Center position="absolute" zIndex="docked" top="6" left="4" right="4">
                <Container
                    bg="rgba(0, 0, 0, 0.95)"
                    borderRadius="xl"
                    boxShadow="0 8px 32px rgba(255, 0, 127, 0.3)"
                    maxW={{ base: 'full', md: 'fit-content' }}
                    px="6"
                    py="4"
                    border="1px solid"
                    borderColor="gray.800"
                    backdropFilter="blur(16px)"
                >
                    <HStack gap={{ base: '3', md: '8' }}>
                        <BushidoLogo size={32} />
                        
                        <Spacer hideFrom="md" />
                        
                        <BushidoNavbarLinks canvas={canvas} hideBelow="md" />
                        
                        <button 
                            onClick={() => setSaveDialogOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #FF007F, #FFD700)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(255, 0, 127, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 0, 127, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 127, 0.3)';
                            }}
                        >
                            <Icon as={HiSave} size="16" />
                            Save Flow
                        </button>
                        
                        <button 
                            onClick={handleLoad}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #4A5568',
                                background: 'transparent',
                                color: '#E2E8F0',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#FFD700';
                                e.currentTarget.style.color = '#FFD700';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#4A5568';
                                e.currentTarget.style.color = '#E2E8F0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Icon as={HiFolderOpen} size="16" />
                            Load Flow
                        </button>
                        
                        <BushidoCollapsibleTrigger 
                            isOpen={mobileMenuOpen}
                            onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />
                    </HStack>
                    
                    {mobileMenuOpen && (
                        <Box hideFrom="md" pt="5" pb="2">
                            <BushidoNavbarLinks canvas={canvas} alignItems="center" />
                        </Box>
                    )}
                </Container>
            </Center>

            <DialogRoot open={saveDialogOpen} onOpenChange={(e) => setSaveDialogOpen(e.open)}>
                <DialogBackdrop bg="blackAlpha.800" backdropFilter="blur(12px)" />
                <DialogContent 
                    bg="#0a0a0a" 
                    borderColor="#FF007F" 
                    borderWidth="2px"
                    borderRadius="xl"
                    boxShadow="0 20px 60px rgba(255, 0, 127, 0.4)"
                >
                    <DialogHeader 
                        bg="linear-gradient(135deg, #FF007F, #FFD700)" 
                        color="white"
                        borderRadius="xl xl 0 0"
                        display="flex"
                        alignItems="center"
                        gap="3"
                    >
                        <Icon as={HiSave} size="lg" />
                        <DialogTitle fontWeight="bold" fontSize="lg">Save Bushido Flow</DialogTitle>
                        <DialogCloseTrigger color="white" />
                    </DialogHeader>
                    <DialogBody p={8}>
                        <Box>
                            <Box mb={4} color="white" fontSize="sm">
                                Enter a name for your flow:
                            </Box>
                            <input
                                type="text"
                                placeholder="My awesome flow..."
                                value={flowName}
                                onChange={(e) => setFlowName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSave();
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #333',
                                    background: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FF007F';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#333';
                                }}
                            />
                        </Box>
                    </DialogBody>
                    <DialogFooter bg="#0a0a0a" borderRadius="0 0 xl xl">
                        <HStack gap={3} w="full" justify="flex-end">
                            <Button 
                                variant="ghost" 
                                color="gray.400"
                                _hover={{ color: 'white' }}
                                onClick={() => setSaveDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="linear-gradient(135deg, #FF007F, #FFD700)"
                                color="white"
                                fontWeight="bold"
                                leftIcon={<Icon as={HiDownload} />}
                                _hover={{ 
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(255, 0, 127, 0.4)'
                                }}
                                onClick={handleSave}
                                disabled={!flowName.trim()}
                                transition="all 0.2s ease"
                            >
                                Save Flow
                            </Button>
                        </HStack>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>
        </>
    );
};