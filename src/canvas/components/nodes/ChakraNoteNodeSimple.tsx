import React, { useState, useEffect } from 'react';
import { Icon } from '@chakra-ui/react';
import { LuFileText, LuExternalLink, LuRefreshCw, LuSearch, LuCalendar, LuFolder } from 'react-icons/lu';
import { TFile } from 'obsidian';
import { NoteNodeData, NodeData } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChakraNoteNodeSimpleProps {
    node: NoteNodeData;
    onUpdate: (updates: Partial<NodeData>) => void;
    connectedNodes: NodeData[];
}

/**
 * NoteNode moderno com preview completo do conteúdo
 */
export const ChakraNoteNodeSimple: React.FC<ChakraNoteNodeSimpleProps> = ({ node, onUpdate }) => {
    const { app } = useApp();
    const [isSelectingFile, setIsSelectingFile] = useState(false);
    const [fullContent, setFullContent] = useState<string>('');
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // Load full content when file changes
    useEffect(() => {
        const loadContent = async () => {
            if (node.file) {
                setIsLoadingContent(true);
                try {
                    const content = await app.vault.read(node.file);
                    setFullContent(content);
                } catch (error) {
                    console.error('Error reading file:', error);
                    setFullContent('Error loading file content');
                }
                setIsLoadingContent(false);
            }
        };
        
        loadContent();
    }, [node.file, app.vault]);

    const handleSelectNote = async () => {
        const files = app.vault.getMarkdownFiles();
        
        // Create simple file selector
        const fileNames = files.map((f, i) => `${i + 1}. ${f.basename}`).join('\n');
        const selection = prompt(`Selecione uma nota:\n\n${fileNames}\n\nDigite o número:`);
        
        const index = parseInt(selection || '') - 1;
        if (index >= 0 && index < files.length) {
            const file = files[index];
            onUpdate({ file });
        }
    };

    const handleOpenNote = () => {
        if (node.file) {
            app.workspace.openLinkText(node.file.path, '', false);
        }
    };

    const handleRefreshContent = async () => {
        if (node.file) {
            setIsLoadingContent(true);
            try {
                const content = await app.vault.read(node.file);
                setFullContent(content);
                onUpdate({ content: content.substring(0, 500) });
            } catch (error) {
                console.error('Error refreshing content:', error);
            }
            setIsLoadingContent(false);
        }
    };

    return (
        <div style={{
            height: '100%',
            background: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.2)',
            border: '1px solid #1a1a1a'
        }}>
            {/* Vercel-like Header */}
            <div style={{
                background: '#000000',
                borderBottom: '1px solid #1a1a1a',
                color: 'white',
                padding: '16px',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            background: 'linear-gradient(135deg, #FFD700, #FFC700)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000000'
                        }}>
                            <Icon as={LuFileText} size="14" />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '14px',
                                color: 'white',
                                marginBottom: '2px'
                            }}>
                                {node.file ? node.file.basename : 'Select Note'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#888888'
                            }}>
                                {node.file ? 'Obsidian Note' : 'No note selected'}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px'
                    }}>
                        {node.file && (
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                color: '#FFD700',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Icon as={LuFolder} size="12" />
                                LINKED
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div style={{ 
                padding: '16px', 
                background: '#000000', 
                color: 'white',
                height: 'calc(100% - 73px)',
                overflow: 'auto'
            }}>
                {node.file ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        height: '100%'
                    }}>
                        {/* File Info */}
                        <div style={{
                            padding: '12px',
                            background: '#0a0a0a',
                            border: '1px solid #1a1a1a',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <Icon as={LuFolder} size="14" color="#FFD700" />
                                <div style={{
                                    fontSize: '12px',
                                    color: '#888888',
                                    fontFamily: 'monospace'
                                }}>
                                    {node.file.path}
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Icon as={LuCalendar} size="14" color="#888888" />
                                <div style={{
                                    fontSize: '12px',
                                    color: '#888888'
                                }}>
                                    Modified: {new Date(node.file.stat.mtime).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        
                        {/* Content Preview */}
                        <div style={{ flex: '1', overflow: 'hidden' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    Content Preview
                                </div>
                                <button
                                    onClick={handleRefreshContent}
                                    disabled={isLoadingContent}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #333333',
                                        color: '#FFD700',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: isLoadingContent ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        opacity: isLoadingContent ? '0.5' : '1'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoadingContent) {
                                            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <Icon as={LuRefreshCw} size="12" />
                                    Refresh
                                </button>
                            </div>
                            
                            <div style={{
                                background: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                height: '100%',
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: '#e5e5e5'
                            }}>
                                {isLoadingContent ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100px',
                                        color: '#888888'
                                    }}>
                                        <Icon as={LuRefreshCw} size="20" className="animate-spin" />
                                        <span style={{ marginLeft: '8px' }}>Loading content...</span>
                                    </div>
                                ) : fullContent ? (
                                    fullContent
                                ) : (
                                    <div style={{
                                        color: '#888888',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}>
                                        No content available
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: 'auto',
                            paddingTop: '16px'
                        }}>
                            <button
                                onClick={handleSelectNote}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #FFD700',
                                    color: '#FFD700',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Icon as={LuSearch} size="14" />
                                Change Note
                            </button>
                            <button
                                onClick={handleOpenNote}
                                style={{
                                    background: '#FFD700',
                                    border: 'none',
                                    color: '#000000',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FFC700';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFD700';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Icon as={LuExternalLink} size="14" />
                                Open Note
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: '24px'
                    }}>
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px',
                                opacity: '0.3'
                            }}>
                                📄
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#888888',
                                marginBottom: '8px'
                            }}>
                                No note selected
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#666666'
                            }}>
                                Click below to select a note from your vault
                            </div>
                        </div>
                        <button
                            onClick={handleSelectNote}
                            style={{
                                background: '#FFD700',
                                border: 'none',
                                color: '#000000',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '160px',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FFC700';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FFD700';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Icon as={LuSearch} size="16" />
                            Select Note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
