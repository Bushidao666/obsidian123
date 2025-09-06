import React, { useState, useRef } from 'react';
import { TextNodeData, NodeData } from '../../types';

interface TextNodeProps {
    node: TextNodeData;
    onUpdate: (updates: Partial<NodeData>) => void;
    connectedNodes: NodeData[];
}

/**
 * TextNode - Componente para nós de texto
 */
export const TextNode: React.FC<TextNodeProps> = ({ node, onUpdate }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleContentChange = (content: string) => {
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        const charCount = content.length;
        
        onUpdate({
            content,
            wordCount,
            charCount
        });
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 10);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            textareaRef.current?.blur();
        }
        e.stopPropagation(); // Prevent canvas shortcuts when editing
    };

    const handleClear = () => {
        handleContentChange('');
        if (textareaRef.current) {
            textareaRef.current.value = '';
        }
    };

    return (
        <div className="text-node">
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #FF007F, #E91E63)', // Bushido Magenta gradient
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px 6px 0 0',
                fontWeight: 700,
                fontSize: '14px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                boxShadow: '0 2px 8px rgba(255, 0, 127, 0.4)'
            }}>
                📝 Text Note
            </div>
            
            {/* Content */}
            <div style={{ padding: '12px' }}>
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={node.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your text..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '8px',
                            border: '1px solid var(--background-modifier-border)',
                            borderRadius: '4px',
                            background: 'var(--background-primary)',
                            color: 'var(--text-normal)',
                            fontFamily: 'var(--font-interface)',
                            fontSize: '13px',
                            resize: 'vertical',
                            outline: 'none'
                        }}
                    />
                ) : (
                    <div
                        onDoubleClick={handleDoubleClick}
                        style={{
                            minHeight: '100px',
                            padding: '8px',
                            background: 'var(--background-secondary)',
                            borderRadius: '4px',
                            fontSize: '13px',
                            lineHeight: 1.4,
                            cursor: 'text',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            color: node.content ? 'var(--text-normal)' : 'var(--text-muted)',
                            fontStyle: node.content ? 'normal' : 'italic'
                        }}
                    >
                        {node.content || 'Double-click to edit...'}
                    </div>
                )}
                
                {/* Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                }}>
                    <span><strong>{node.charCount || 0}</strong> chars</span>
                    <span><strong>{node.wordCount || 0}</strong> words</span>
                </div>
                
                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px'
                }}>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            padding: '4px 8px',
                            background: 'var(--interactive-accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        Edit
                    </button>
                    {node.content && (
                        <button
                            onClick={handleClear}
                            style={{
                                padding: '4px 8px',
                                background: 'var(--color-red)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
