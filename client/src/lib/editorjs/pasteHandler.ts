import EditorJS from "@editorjs/editorjs";
import DOMPurify from "dompurify";

/**
 * Handles paste events inside the editor.
 *
 * Why this is needed:
 * EditorJS has inconsistent behavior when pasting list content:
 * - If the HTML contains orphaned <li> elements (no <ul>/<ol> parent), EditorJS creates separate empty list blocks.
 * - If the HTML contains a structured <ul>/<ol>, EditorJS parses it correctly,
 *   but the resulting list block becomes non-editable (e.g., list type switching is broken) until re-rendered.
 *
 * Workflow:
 * - Extract and sanitize HTML content from clipboard.
 * - Detects if pasted content is a structured list or orphaned list items.
 * - Delegates handling accordingly:
 *   - Structured list: Let EditorJS parse and then re-render to fix list type behavior.
 *   - Orphaned list items: Prevent default behavior and insert a clean list block manually.
 *
 * @param event - The paste event triggered by user action.
 * @param editor - The EditorJS instance to interact with.
 */
export const onEditorPaste = (event: ClipboardEvent, editor: EditorJS) => {
  const html = event.clipboardData?.getData("text/html");
  if (!html) return;

  const sanitizedHTML = sanitizeHTMLContent(html);

  if (isStructuredListPaste(sanitizedHTML)) {
    // Let EditorJS do its default block generation then re-render to enable list type conversion
    scheduleEditorRerender(editor);
  } else if (containsOrphanedListItems(sanitizedHTML)) {
    handleOrphanedListPaste(event, sanitizedHTML, editor);
  }
};

/**
 * Sanitizes the HTML content to ensure safe and clean input.
 * Uses DOMPurify to remove any malicious content or unwanted elements.
 *
 * @param htmlContent - Raw HTML content to sanitize
 * @returns {string} sanitized HTML content
 */
const sanitizeHTMLContent = (htmlContent: string): string => {
  return DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
  });
};

/**
 * Forces the editor to save and immediately re-render its content.
 * - Useful in cases where EditorJS creates a correct structure but doesn't allow some interactions (like changing list type).
 * - Called after pasting structured content to ensure list blocks behave correctly.
 * @param editor - The EditorJS instance whose content needs re-rendering.
 */
const scheduleEditorRerender = (editor: EditorJS) => {
  setTimeout(async () => {
    const content = await editor.save();
    await editor.render(content);
  }, 50); // Delay to allow default block parsing
};

const isStructuredListPaste = (html: string): boolean => {
  // Checks if the HTML content contains a valid structured list (<ul> or <ol>).
  return /<(ul|ol)(\s[^>]*)?>/.test(html);
};

const containsOrphanedListItems = (html: string): boolean => {
  // Checks if HTML contains orphaned <li> tags that are not wrapped in <ul> or <ol>.
  return /<li(\s[^>]*)?>/.test(html) && !isStructuredListPaste(html);
};

/**
 * Handles the paste of orphaned <li> elements (list items not wrapped inside <ul>/<ol>)
 * by preventing EditorJS's default behavior, which creates multiple empty list blocks,
 * and manually inserts a properly structured list block instead.
 * @param event - The ClipboardEvent triggered by paste.
 * @param sanitizedHTML - Already sanitized HTML string from clipboard.
 * @param editor - The EditorJS instance used to insert blocks.
 */
export const handleOrphanedListPaste = (
  event: ClipboardEvent,
  sanitizedHTML: string,
  editor: EditorJS
) => {
  // Check if pasted content contains unwrapped <li> elements (list items without <ul>/<ol> wrapper)
  const liElements = extractLiElementsIfUnwrapped(sanitizedHTML);
  if (!liElements?.length) return;

  // Bypasses EditorJS's default paste handling
  event.preventDefault();
  event.stopImmediatePropagation();

  handleListPaste(liElements, editor);
};

/**
 * Detects orphaned <li> elements (not wrapped in <ul> or <ol>) and returns them.
 * This handles edge cases where users paste lists without their parent container.
 * EditorJS fails to group such <li> elements correctly and creates broken list blocks.
 *
 * @param htmlContent - Sanitized HTML content to check
 * @returns {HTMLElement[] | null} Array of <li> elements if unwrapped list detected, otherwise null
 */
const extractLiElementsIfUnwrapped = (
  htmlContent: string
): HTMLElement[] | null => {
  const htmlDoc = new DOMParser().parseFromString(htmlContent, "text/html");

  // Extract all top-level child elements under the body and verify if they are all <li> elements with non-empty content
  const childElements = Array.from(htmlDoc.body.childNodes).filter(
    (node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE
  );
  const validLiElements = childElements.filter((el) => {
    return el.tagName.toLowerCase() === "li" && el.textContent?.trim();
  });

  return validLiElements.length > 0 ? validLiElements : null;
};

/**
 * Converts the list of <li> elements into an EditorJS-compatible list block.
 * This function maps the <li> elements into EditorJS block format and inserts them into the editor.
 *
 * @param listElements - List of <li> elements to convert
 * @param editor - The EditorJS instance to insert the list block
 */
const handleListPaste = async (
  listElements: HTMLElement[],
  editor: EditorJS
) => {
  const listBlock = {
    type: "list",
    data: {
      style: "unordered",
      items: listElements.map((li) => {
        return {
          content: li.textContent?.trim() ?? "",
          meta: {},
          items: [],
        };
      }),
      meta: {},
    },
  };

  // Insert the list block into EditorJS
  await editor.blocks.insert(listBlock.type, listBlock.data);
};
