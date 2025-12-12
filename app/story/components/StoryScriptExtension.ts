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
                        
                        let activeBlockColor: string | null = null;

                        doc.descendants((node: Node, position: number) => {
                            if (!node.isText) return;
                            
                            const nodeText = node.text || '';
                            const absoluteStart = position;
                            
                            // Regex for new syntax: [ Type: Content ]
                            // [ 场景：xxx ]
                            const tagMatch = Array.from(nodeText.matchAll(/\[\s*(场景|对话|旁白|支线|任务|选项|判断|变量|奖励|惩罚)(?:-.*?)?[：:]/g));
                            
                            // Determine line color based on the first tag found
                            let lineColor = null;
                            if (tagMatch.length > 0) {
                                const firstMatch = tagMatch[0];
                                const typeMap: Record<string, string> = {
                                    '场景': 'scene',
                                    '对话': 'dialogue',
                                    '旁白': 'narration',
                                    '支线': 'branch',
                                    '任务': 'task',
                                    '选项': 'choice',
                                    '判断': 'condition',
                                    '变量': 'setter',
                                    '奖励': 'reward',
                                    '惩罚': 'punishment'
                                };
                                const type = typeMap[firstMatch[1]] || 'custom';
                                lineColor = NODE_COLORS[type]?.bg;
                                
                                // Set active block color
                                // If we are already in a block, should we overwrite?
                                // If it's a nested node (e.g. dialogue inside condition), we should probably use the nested node's color for this line?
                                // But if we overwrite activeBlockColor, the rest of the parent block might get wrong color?
                                // We need a stack?
                                // For simplicity: If we find a start tag, we set activeBlockColor to this new node.
                                // If it closes, do we return to parent?
                                // The current regex-based parser is line-by-line.
                                
                                // Let's support nested coloring by checking indentation or just resetting for new nodes.
                                // If we find a new node start, we set activeBlockColor to that node.
                                activeBlockColor = lineColor;
                            } else if (activeBlockColor) {
                                // Continue using active color
                                lineColor = activeBlockColor;
                            }

                            // If we found a start tag, highlight the WHOLE LINE with a class
                            if (lineColor) {
                                // Find end of node (]) or end of line
                                let endPos = nodeText.length;
                                
                                // FIX: endMatch was only matching ] at very end of string ($)
                                // But if there is whitespace after ], or if we are typing inside, it might fail?
                                // Actually, user issue: "after inserting ID, right ] becomes black".
                                // ID insertion adds "[[id]]" at end of line, so the line ends with "[[id]]"
                                // The node's closing "]" is BEFORE that, or AFTER that?
                                // If it's a simple node: [ 场景: xxx ]
                                // If it's a choice option:
                                // [ 选项:
                                //   - text -> [[id]]
                                // ]
                                
                                // If it's a block closing bracket, it's just a line with "]".
                                // If activeBlockColor is set, we are inside a block.
                                // The closing bracket line should be colored.
                                
                                // If we insert ID inside a block line: "- text -> [[id]]"
                                // This line is part of the block, so it inherits activeBlockColor.
                                // But why would "]" become black?
                                // Ah, maybe they mean the closing bracket of the ID itself? "]]"
                                // Or the closing bracket of the whole node?
                                
                                // User says: "when inserting id, right ] becomes black".
                                // If they mean the Node's closing bracket:
                                // [ ... ] -> insert ID inside -> [ ... [[id]] ] ?
                                // No, ID is for options usually.
                                // Option line: "- text -> [[id]]"
                                // This line doesn't have a closing ]. The block closing ] is on a new line.
                                
                                // If user means:
                                // [ 场景: xxx [[id]] ] ?? No, Scene doesn't have ID usually.
                                
                                // Maybe they mean the closing bracket of the ID: "[[id]]"
                                // The "]]" is black?
                                // Our link highlighter handles "[[...]]".
                                
                                // Let's look at link highlighter:
                                // const linkMatch = nodeText.match(/->\s*\[\[(.*?)\]\]/);
                                // This highlights "-> [[id]]" in blue.
                                // This decoration is pushed later.
                                // ProseMirror merges decorations.
                                
                                // If user means the Node Closing Bracket "]" on the last line of a block.
                                // [ 选项: ... ]
                                // If the last line is just "]", it matches /\]\s*$/.
                                // It sets endPos = match.index + 1.
                                // It highlights from 0 to endPos.
                                // And resets activeBlockColor.
                                
                                // Wait, if there is content AFTER the closing bracket (e.g. whitespace or newlines in same text node?), it might be issue.
                                // But usually ] is end of line.
                                
                                // If the issue is that "[[id]]" makes the line NOT end with "]"?
                                // If I have: [ 场景: xxx ]
                                // And I insert ID? [ 场景: xxx [[id]] ] ?
                                // Then the regex /\]\s*$/ still matches the last ].
                                
                                // Let's look at the regex again: /\]\s*$/
                                // It matches a ] followed by optional whitespace at end of string.
                                // If I have [ ... [[id]] ], the string ends with ]].
                                // The regex matches the last ].
                                
                                // BUT, if the text node contains multiple lines?
                                // doc.descendants iterates text nodes. 
                                // If we have hard breaks, it might be one text node.
                                // If we have paragraphs, it's separate text nodes.
                                // Tiptap usually uses paragraphs <p>.
                                
                                // If user says "right ] becomes black", maybe they mean the highlighting stops early?
                                
                                // Let's try to match the *last* closing bracket that closes the node.
                                // If we are in a block, any line ending in ] might be the closer.
                                // But if we have ID: [[id]], that also ends in ].
                                
                                // We need to distinguish between Node Closer ] and Link Closer ]].
                                // Link closer is ]]. Node closer is ].
                                
                                // If line ends with ]], it's likely a link or ID.
                                // If line ends with single ], it's likely node closer.
                                
                                // Let's adjust the logic:
                                // If we find a ] that is NOT preceded by [ (to avoid [[...]] or [...]), 
                                // OR if we match the specific block closing pattern.
                                
                                // Block closer is usually on its own line: "]" or "  ]"
                                const isBlockCloser = /^\s*\]\s*$/.test(nodeText);
                                
                                // Single line node: [ Type: Content ]
                                const isSingleLineNode = /^\s*\[.*\]\s*$/.test(nodeText);
                                
                                let foundCloser = false;
                                
                                if (isBlockCloser) {
                                    endPos = nodeText.lastIndexOf(']') + 1;
                                    foundCloser = true;
                                } else if (isSingleLineNode) {
                                    // It ends with ]. 
                                    // Be careful not to match ]] from an ID at the end.
                                    // e.g. [ ... [[id]] ]
                                    // The last char is ]. The char before is ].
                                    // If it ends with ]], we might be inside the node (if node allows ID?)
                                    // Or maybe the node ITSELF ends with ].
                                    
                                    // If the regex matched a start tag, we assume it's a node line.
                                    // We want to color the whole line.
                                    endPos = nodeText.length;
                                    
                                    // Check if this line effectively closes the block (even if single line)
                                    // Yes, single line node opens and closes in same line.
                                    foundCloser = true;
                                } else if (activeBlockColor) {
                                    // We are inside a block.
                                    // If we see "]", is it the closer?
                                    // If it's not a block closer line, maybe it's just content?
                                    // But we should color the whole line anyway if we are in block.
                                    endPos = nodeText.length;
                                }

                                // Apply class decoration for toggleable color
                                decorations.push(Decoration.inline(
                                    absoluteStart,
                                    absoluteStart + endPos,
                                    {
                                        class: 'story-node-highlight',
                                        style: `--node-color: ${lineColor};`
                                    }
                                ));
                                
                                if (foundCloser) {
                                    // If we close a nested node, we should ideally pop from stack.
                                    // But we don't have a stack yet.
                                    // If we close a node, we just reset activeBlockColor.
                                    // This means subsequent lines in parent block might lose color until next node.
                                    // But indentation usually implies structure.
                                    // For now, resetting is better than bleeding color everywhere.
                                    activeBlockColor = null;
                                }
                            }

                            for (const match of tagMatch) {
                                if (match.index !== undefined) {
                                    const typeMap: Record<string, string> = {
                                        '场景': 'scene',
                                        '对话': 'dialogue',
                                        '旁白': 'narration',
                                        '支线': 'branch',
                                        '任务': 'task',
                                        '选项': 'choice',
                                        '判断': 'condition',
                                        '变量': 'setter',
                                        '奖励': 'reward',
                                        '惩罚': 'punishment'
                                    };
                                    
                                    const chineseType = match[1];
                                    const type = typeMap[chineseType] || 'custom';
                                    const colors = NODE_COLORS[type];
                                    
                                    // Highlight the tag start [ Type: (Bold + Color)
                                    // This is separate to ensure the tag is always bold and colored even if global toggle is off? 
                                    // Or should this also obey the toggle?
                                    // User said "Text mode, add different color display for EACH NODE, and provide ON/OFF button"
                                    // Assuming the ON/OFF controls ALL coloring.
                                    
                                    decorations.push(Decoration.inline(
                                        absoluteStart + match.index, 
                                        absoluteStart + match.index + match[0].length, 
                                        {
                                            class: 'story-node-tag', // Helper class
                                            style: `
                                                color: ${colors.bg}; 
                                                font-weight: bold;
                                            `
                                        }
                                    ));
                                }
                            }
                            
                            // Highlight Options inside blocks (- Option)
                            // ISSUE: This matches ANY line starting with "- " as purple (option color).
                            // But inside a Condition block, "- [[id]]:" is a branch, not an option.
                            // We need to differentiate.
                            // Option format: "- text -> [[id]]" or "- text"
                            // Condition branch format: "- [[id]]:" or "- :" (default/else)
                            
                            // Let's modify the regex to be more specific or check context.
                            // If it starts with "- [[", it's likely a condition branch (if inside condition).
                            // Or if it ends with ":", it's a condition branch.
                            
                            const optionMatch = nodeText.match(/^\s*-\s*(.+?)(?:[：:]|$)/);
                            if (optionMatch) {
                                // Check if it looks like a condition branch
                                const isConditionBranch = /^\s*-\s*(\[\[.*?\]\]|:|：)\s*[：:]?/.test(nodeText);
                                
                                if (isConditionBranch) {
                                    // Use orange for condition branches
                                    decorations.push(Decoration.inline(
                                        absoluteStart,
                                        absoluteStart + optionMatch[0].length,
                                        { 
                                            class: 'story-node-condition-branch',
                                            style: 'color: #f97316; font-weight: bold;' // orange-500
                                        }
                                    ));
                                } else {
                                    // Use purple for standard options
                                    decorations.push(Decoration.inline(
                                        absoluteStart,
                                        absoluteStart + optionMatch[0].length,
                                        { class: 'text-purple-600 font-medium story-node-option' }
                                    ));
                                }
                            }
                            
                            // Highlight Links
                            const linkMatch = nodeText.match(/->\s*\[\[(.*?)\]\]/);
                            if (linkMatch && linkMatch.index !== undefined) {
                                decorations.push(Decoration.inline(
                                    absoluteStart + linkMatch.index,
                                    absoluteStart + linkMatch.index + linkMatch[0].length,
                                    { class: 'text-blue-500 font-bold underline story-node-link' }
                                ));
                            }

                            // Highlight Prefab Bindings {{...}}
                            const prefabMatches = Array.from(nodeText.matchAll(/\{\{(.*?)\}\}/g));
                            for (const match of prefabMatches) {
                                if (match.index !== undefined) {
                                    decorations.push(Decoration.inline(
                                        absoluteStart + match.index,
                                        absoluteStart + match.index + match[0].length,
                                        {
                                            class: 'story-prefab-binding',
                                            style: 'color: #06b6d4; font-weight: bold; background: rgba(6, 182, 212, 0.1); padding: 0 4px; border-radius: 4px;' // cyan-500
                                        }
                                    ));
                                }
                            }
                        });
                        
                        return DecorationSet.create(doc, decorations);
                    }
                }
            })
        ];
    },

    addKeyboardShortcuts() {
        return {
            '[': () => {
                this.editor.commands.insertContent('[]');
                this.editor.commands.setTextSelection(this.editor.state.selection.from - 1);
                return true;
            },
            '【': () => {
                this.editor.commands.insertContent('【】');
                this.editor.commands.setTextSelection(this.editor.state.selection.from - 1);
                return true;
            }
        };
    },
});
