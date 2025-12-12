import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node } from '@tiptap/pm/model';

const NODE_COLORS: Record<string, { bg: string, text: string, border: string }> = {
    scene: { bg: '#1e293b', text: '#ffffff', border: '#1e293b' },      // slate-800
    dialogue: { bg: '#3b82f6', text: '#ffffff', border: '#3b82f6' },   // blue-500
    narration: { bg: '#94a3b8', text: '#ffffff', border: '#94a3b8' },  // slate-400
    branch: { bg: '#14b8a6', text: '#ffffff', border: '#14b8a6' },     // teal-500
    task: { bg: '#6366f1', text: '#ffffff', border: '#6366f1' },       // indigo-500
    choice: { bg: '#a855f7', text: '#ffffff', border: '#a855f7' },     // purple-500
    condition: { bg: '#f97316', text: '#ffffff', border: '#f97316' },  // orange-500
    setter: { bg: '#22c55e', text: '#ffffff', border: '#22c55e' },     // green-500
    reward: { bg: '#facc15', text: '#000000', border: '#facc15' },     // yellow-400
    punishment: { bg: '#ef4444', text: '#ffffff', border: '#ef4444' }, // red-500
    custom: { bg: '#64748b', text: '#ffffff', border: '#64748b' }      // slate-500
};

export const StoryScriptExtension = Extension.create({
    name: 'storyScriptHighlight',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('storyScriptHighlight'),
                props: {
                    decorations(state: EditorState) {
                        const decorations: Decoration[] = [];
                        const doc = state.doc;
                        
                        // Better approach: Iterate over the nodes in the document to find blocks
                        
                        const blocks: { start: number, end: number, type: string, headerPos?: { start: number, end: number } }[] = [];
                        
                        // First pass: identify blocks and their types
                        // A block is separated by "---"
                        // Inside a block, we look for "Type: <type>" and "# <Label>"
                        
                        let currentBlockStart = 0;
                        let currentBlockType = 'custom';
                        let currentHeaderPos: { start: number, end: number } | undefined = undefined;
                        
                        doc.descendants((node: Node, position: number) => {
                            if (!node.isText) return;
                            
                            const nodeText = node.text || '';
                            const absoluteStart = position;
                            
                            // Check for block separator
                            if (nodeText.trim() === '---') {
                                // End of current block
                                blocks.push({
                                    start: currentBlockStart,
                                    end: absoluteStart + node.nodeSize,
                                    type: currentBlockType,
                                    headerPos: currentHeaderPos
                                });
                                
                                // Reset for next block
                                currentBlockStart = absoluteStart + node.nodeSize;
                                currentBlockType = 'custom';
                                currentHeaderPos = undefined;
                                return;
                            }
                            
                            // Check for Type definition
                            const typeMatch = nodeText.match(/^Type:\s*(\w+)/);
                            if (typeMatch) {
                                currentBlockType = typeMatch[1].toLowerCase();
                                // Decorate the Type line
                                decorations.push(Decoration.inline(absoluteStart, absoluteStart + node.nodeSize, {
                                    style: `color: ${NODE_COLORS[currentBlockType]?.border || '#888'}; font-weight: bold;`
                                }));
                            }
                            
                            // Check for Header
                            const headerMatch = nodeText.match(/^#\s+(.+)/);
                            if (headerMatch) {
                                currentHeaderPos = { start: absoluteStart, end: absoluteStart + node.nodeSize };
                            }
                            
                            // Check for Metadata Keys
                            const keyMatch = nodeText.match(/^(ID|Speaker|Tags|Condition|Variable|Value|TaskStatus|RewardType|PunishmentType|Amount):/);
                            if (keyMatch) {
                                decorations.push(Decoration.inline(absoluteStart, absoluteStart + keyMatch[0].length, {
                                    class: 'font-bold text-slate-500'
                                }));
                            }

                            // Check for Links Section Header
                            if (nodeText.startsWith('### Links')) {
                                decorations.push(Decoration.inline(absoluteStart, absoluteStart + node.nodeSize, {
                                    class: 'font-bold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-200 inline-block w-full mt-2 mb-1'
                                }));
                            }

                            // Check for Links
                            const linkMatch = nodeText.match(/^- \[(.*?)\] -> \[\[(.*?)\]\]/);
                            if (linkMatch) {
                                // Whole line
                                // - [Label]
                                const labelStart = nodeText.indexOf('[') + 1;
                                const labelEnd = nodeText.indexOf(']');
                                decorations.push(Decoration.inline(absoluteStart + labelStart, absoluteStart + labelEnd, {
                                    class: 'text-blue-600 font-medium'
                                }));
                                
                                // [[Target]]
                                const targetStart = nodeText.indexOf('[[') + 2;
                                const targetEnd = nodeText.indexOf(']]');
                                decorations.push(Decoration.inline(absoluteStart + targetStart, absoluteStart + targetEnd, {
                                    class: 'text-purple-600 font-mono bg-purple-50 px-1 rounded'
                                }));
                            }
                        });
                        
                        // Push last block
                        blocks.push({
                            start: currentBlockStart,
                            end: doc.content.size,
                            type: currentBlockType,
                            headerPos: currentHeaderPos
                        });
                        
                        // Second pass: Apply block styles
                        blocks.forEach(block => {
                            const colors = NODE_COLORS[block.type] || NODE_COLORS.custom;
                            
                            // Decorate Header if found
                            if (block.headerPos) {
                                decorations.push(Decoration.inline(block.headerPos.start, block.headerPos.end, {
                                    style: `
                                        background-color: ${colors.bg}; 
                                        color: ${colors.text}; 
                                        padding: 4px 8px; 
                                        border-radius: 4px; 
                                        display: inline-block; 
                                        width: 100%;
                                        font-weight: bold;
                                        font-size: 1.1em;
                                        margin-top: 8px;
                                        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                                    `
                                }));
                            }
                        });
                        
                        return DecorationSet.create(doc, decorations);
                    }
                }
            })
        ];
    },
});
