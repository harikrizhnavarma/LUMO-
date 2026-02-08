
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

/**
 * Basic HTML formatter to add indentation and newlines to a flat HTML string.
 */
export const formatHtml = (html: string): string => {
    let formatted = '';
    let indent = '';
    const tab = '  '; // 2 spaces for indentation
    
    // Remove existing extra whitespace between tags
    const cleanHtml = html.replace(/>\s+</g, '><').trim();

    cleanHtml.split(/>(?=<)/).forEach((node) => {
        // Tag closure
        if (node.match(/^\/<\/\w/)) {
            indent = indent.substring(tab.length);
        } else if (node.match(/^<\/\w/)) {
            indent = indent.substring(tab.length);
        }

        formatted += indent + node + '>\n';

        // Tag opening (not a closing tag, not a self-closing tag, and not a void element)
        if (node.match(/^<\w[^>]*[^\/]$/) && !node.match(/^<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/i)) {
            indent += tab;
        }
    });

    return formatted.trim();
};
