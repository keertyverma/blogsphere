import EditorJS from "@editorjs/editorjs";
import DOMPurify from "dompurify";

/**
 * Handles the paste event with a custom workflow for orphaned <li> elements (list items without a parent <ul>/<ol>)
 *
 * Workflow:
 * 1. Extract HTML content from clipboard.
 * 2. Sanitize the content to prevent XSS or invalid HTML.
 * 3. Check if the content contains only orphaned <li> elements (without <ul>/<ol>).
 *    - This handles a known limitation in EditorJS where such content creates multiple empty list blocks.
 * 4. If matched, bypass EditorJS's default paste handling.
 * 5. Manually insert a well-structured list block into the editor.
 * 6. If not matched, let EditorJS handle the paste normally.
 *
 * @param event - The ClipboardEvent triggered by paste.
 * @param editor - The EditorJS instance used to insert blocks.
 */
export const handleOrphanedListPaste = (
  event: ClipboardEvent,
  editor: EditorJS
) => {
  const htmlContent = event.clipboardData?.getData("text/html");
  if (!htmlContent) return;

  const sanitizedHTMLContent = sanitizeHTMLContent(htmlContent);

  // Check if pasted content contains unwrapped <li> elements (list items without <ul>/<ol> wrapper)
  const liElements = extractLiElementsIfUnwrapped(sanitizedHTMLContent);
  if (!liElements?.length) return;

  // Bypasses EditorJS's default paste handling
  event.preventDefault();
  event.stopImmediatePropagation();

  handleListPaste(liElements, editor);
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
