import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@chakra-ui/react';
import { HiBookOpen, HiLightBulb, HiMap, HiOutlineTrash, HiOutlineRefresh, HiOutlineExclamationCircle } from 'react-icons/hi';
import { LuImagePlus, LuMic, LuSendHorizontal, LuBrain, LuFileText, LuDownload, LuUser, LuTrash2, LuRefreshCw } from 'react-icons/lu';
import { AIChatNodeData, NodeData, ChatMessage } from '../../types';
import { useApp } from '../../context/AppContext';
import { ContextCollector } from '../../../context/collector';
import { PromptButton } from '../ui/prompt-button';

interface ChakraAIChatNodeSimpleProps {
    node: AIChatNodeData;
    onUpdate: (updates: Partial<NodeData>) => void;
    connectedNodes: NodeData[];
}

/**
 * AIChatNode usando Chakra UI básico - baseado no exemplo Pro que você deu
 */
export const ChakraAIChatNodeSimple: React.FC<ChakraAIChatNodeSimpleProps> = ({ 
    node, 
    onUpdate, 
    connectedNodes 
}) => {
    const { app, plugin } = useApp();
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const contextCollector = useRef(new ContextCollector(plugin));

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [node.messages]);

    // Build context from connected nodes
    const buildContext = async (): Promise<string> => {
        try {
            const files = connectedNodes
                .filter(n => n.type === 'note' && (n as any).file)
                .map(n => (n as any).file);
                
            const texts = connectedNodes
                .filter(n => n.type === 'text' && (n as any).content)
                .map(n => (n as any).content);

            let context = '';
            
            if (files.length > 0) {
                context += await contextCollector.current.processNotes(files);
            }
            
            if (texts.length > 0) {
                if (context) context += '\n\n---\n\n';
                context += texts.map((text, i) => `## Text Note ${i + 1}\n\n${text}`).join('\n\n---\n\n');
            }

            return contextCollector.current.truncateToTokenLimit(context, plugin.settings.contextLimit);
        } catch (error) {
            console.error('Error building context:', error);
            return '';
        }
    };

    const sendMessage = async (message: string) => {
        if (!message.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: message.trim(),
            timestamp: new Date()
        };

        // Add user message
        const newMessages = [...node.messages, userMessage];
        onUpdate({ messages: newMessages });
        
        setInputValue('');
        setIsProcessing(true);

        try {
            // Build context and chat messages
            const context = await buildContext();
            
            // Build messages for AI
            const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
            
            // System prompt with context
            let systemPrompt = plugin.settings.systemPrompt;
            if (context) {
                systemPrompt += `\n\nContext from connected notes:\n${context}`;
            }
            chatMessages.push({ role: 'system', content: systemPrompt });
            
            // Add conversation history
            newMessages.forEach(msg => {
                if (msg.role !== 'system') {
                    chatMessages.push({ role: msg.role, content: msg.content });
                }
            });

            // Get AI response
            const response = await plugin.aiProvider.chat(chatMessages, {
                temperature: plugin.settings.temperature,
                maxTokens: plugin.settings.maxTokens
            });

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            // Add assistant message
            onUpdate({ 
                messages: [...newMessages, assistantMessage]
            });

        } catch (error: any) {
            console.error('Chat error:', error);
            
            const errorMessage: ChatMessage = {
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: new Date()
            };

            onUpdate({ 
                messages: [...newMessages, errorMessage]
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        sendMessage(prompt);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
        e.stopPropagation();
    };

    const clearChat = () => {
        onUpdate({ messages: [] });
    };

    const exportChat = () => {
        const exportData = {
            timestamp: new Date().toISOString(),
            messages: node.messages,
            messageCount: node.messages.length,
            connectedCount: node.connectedCount
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bushido-ai-chat-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 0, 127, 0.2)',
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
                            background: 'linear-gradient(135deg, #FF007F, #FF1493)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Icon as={LuBrain} size="14" />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '14px',
                                color: 'white',
                                marginBottom: '2px'
                            }}>
                                Bushido AI
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#888888'
                            }}>
                                Enterprise Assistant
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <div style={{
                            background: node.connectedCount > 0 ? 'rgba(255, 0, 127, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: node.connectedCount > 0 ? '1px solid rgba(255, 0, 127, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: node.connectedCount > 0 ? '#FF007F' : '#666666',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Icon as={LuFileText} size="12" />
                            {node.connectedCount}
                        </div>
                        <div style={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            color: '#FFD700',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {node.messages.length} msgs
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: '1', overflow: 'auto' }}>
                {node.messages.length === 0 ? (
                    /* Vercel-like Empty State */
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        padding: '32px 24px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '32px'
                        }}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#FF007F',
                                marginBottom: '8px',
                                letterSpacing: '-0.5px'
                            }}>
                                Hello, Bushido
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#888888',
                                fontWeight: '400'
                            }}>
                                How can I help you today?
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px',
                            width: '100%',
                            maxWidth: '400px'
                        }}>
                            <button
                                onClick={() => handleQuickPrompt("Explain this concept in simple terms")}
                                style={{
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    minHeight: '80px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FF007F';
                                    e.currentTarget.style.background = 'rgba(255, 0, 127, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#1a1a1a';
                                    e.currentTarget.style.background = '#0a0a0a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Explain this concept simply
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    opacity: '0.4',
                                    color: '#FF007F'
                                }}>
                                    <Icon as={HiLightBulb} size="18" />
                                </div>
                            </button>
                            
                            <button
                                onClick={() => handleQuickPrompt("Create a summary of connected notes")}
                                style={{
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    minHeight: '80px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FF007F';
                                    e.currentTarget.style.background = 'rgba(255, 0, 127, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#1a1a1a';
                                    e.currentTarget.style.background = '#0a0a0a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Summarize connected notes
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    opacity: '0.4',
                                    color: '#FF007F'
                                }}>
                                    <Icon as={HiMap} size="18" />
                                </div>
                            </button>
                            
                            <button
                                onClick={() => handleQuickPrompt("Generate insights from the content")}
                                style={{
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    minHeight: '80px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FF007F';
                                    e.currentTarget.style.background = 'rgba(255, 0, 127, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#1a1a1a';
                                    e.currentTarget.style.background = '#0a0a0a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Generate insights
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    opacity: '0.4',
                                    color: '#FF007F'
                                }}>
                                    <Icon as={LuBrain} size="18" />
                                </div>
                            </button>
                            
                            <button
                                onClick={() => handleQuickPrompt("Ask questions about the context")}
                                style={{
                                    background: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    minHeight: '80px',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FF007F';
                                    e.currentTarget.style.background = 'rgba(255, 0, 127, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#1a1a1a';
                                    e.currentTarget.style.background = '#0a0a0a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Ask about context
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    opacity: '0.4',
                                    color: '#FF007F'
                                }}>
                                    <Icon as={HiBookOpen} size="18" />
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Vercel-like Messages */
                    <div style={{ padding: '16px' }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {node.messages.map((message, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '85%',
                                        background: message.role === 'user' ? '#FF007F' : 
                                                   message.role === 'system' ? '#FF6B6B' : 
                                                   '#1a1a1a',
                                        color: message.role === 'user' || message.role === 'system' ? 'white' : '#e5e5e5',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                        border: message.role === 'assistant' ? '1px solid #333333' : 'none'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            opacity: '0.8'
                                        }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <span>
                                                    {message.role === 'user' ? <Icon as={LuUser} size="12" /> : 
                                                     message.role === 'assistant' ? <Icon as={LuBrain} size="12" /> : <Icon as={HiOutlineExclamationCircle} size="12" />}
                                                </span>
                                                {message.role.toUpperCase()}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                opacity: '0.6'
                                            }}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Vercel-like Input Area */}
            <div style={{ padding: '16px' }}>
                <div style={{
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                }}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        disabled={isProcessing}
                        style={{
                            flex: '1',
                            resize: 'none',
                            border: 'none',
                            background: 'transparent',
                            color: 'white',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            outline: 'none',
                            minHeight: '24px',
                            maxHeight: '120px',
                            lineHeight: '1.5'
                        }}
                        onFocus={(e) => {
                            const parent = e.target.parentElement;
                            if (parent) {
                                parent.style.borderColor = '#FF007F';
                                parent.style.boxShadow = '0 0 0 3px rgba(255, 0, 127, 0.1)';
                            }
                        }}
                        onBlur={(e) => {
                            const parent = e.target.parentElement;
                            if (parent) {
                                parent.style.borderColor = '#1a1a1a';
                                parent.style.boxShadow = 'none';
                            }
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={true}
                            style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                background: 'transparent',
                                color: '#666666',
                                borderRadius: '6px',
                                cursor: 'not-allowed',
                                opacity: '0.4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}
                        >
                            <Icon as={LuImagePlus} size="16" />
                        </button>
                        <button
                            disabled={true}
                            style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                background: 'transparent',
                                color: '#666666',
                                borderRadius: '6px',
                                cursor: 'not-allowed',
                                opacity: '0.4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}
                        >
                            <Icon as={LuMic} size="16" />
                        </button>
                        <button
                            onClick={() => sendMessage(inputValue)}
                            disabled={!inputValue.trim() || isProcessing}
                            style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                background: !inputValue.trim() || isProcessing ? '#333333' : '#FF007F',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: !inputValue.trim() || isProcessing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                transition: 'all 0.2s ease',
                                opacity: !inputValue.trim() || isProcessing ? '0.5' : '1'
                            }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.background = '#FF1493';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.background = '#FF007F';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {isProcessing ? <Icon as={LuRefreshCw} size="16" className="animate-spin" /> : <Icon as={LuSendHorizontal} size="16" />}
                        </button>
                    </div>
                </div>
                
                <div style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#666666'
                }}>
                    Bushido AI can make mistakes. Please verify important information.
                </div>
            </div>

            {/* Vercel-like Footer */}
            <div style={{
                padding: '12px',
                borderTop: '1px solid #1a1a1a',
                background: '#0a0a0a',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <button
                    onClick={clearChat}
                    disabled={node.messages.length === 0}
                    style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'transparent',
                        color: node.messages.length === 0 ? '#333333' : '#FF6B6B',
                        borderRadius: '6px',
                        cursor: node.messages.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        opacity: node.messages.length === 0 ? '0.3' : '1'
                    }}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={LuTrash2} size="16" />
                </button>
                <button
                    onClick={exportChat}
                    disabled={node.messages.length === 0}
                    style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'transparent',
                        color: node.messages.length === 0 ? '#333333' : '#4DABF7',
                        borderRadius: '6px',
                        cursor: node.messages.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        opacity: node.messages.length === 0 ? '0.3' : '1'
                    }}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = 'rgba(77, 171, 247, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={LuDownload} size="16" />
                </button>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'transparent',
                        color: '#FFD700',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Icon as={LuRefreshCw} size="16" />
                </button>
            </div>
        </div>
    );
};
