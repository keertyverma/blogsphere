import { useEffect } from "react";

/**
 * Custom hook to hide specific items in the EditorJS popover menu.
 *
 * This hook monitors DOM changes to detect when the EditorJS popover is opened.
 * If the popover contains an item titled "Ordered," it hides the menu items
 * labeled "Start with" and "Counter type."
 */
const useHidePopoverItems = () => {
  useEffect(() => {
    const popoverObserver = new MutationObserver(() => {
      const popover = document.querySelector(
        "#text-editor .ce-popover--opened"
      );
      if (!popover) return;

      // Check if the popover contains "Ordered"
      const hasOrderedTitle = Array.from(
        popover.querySelectorAll(".ce-popover-item .ce-popover-item__title")
      ).some((el) => el.textContent?.trim() === "Ordered");
      if (!hasOrderedTitle) return;

      // Hide specific items
      popover.querySelectorAll(".ce-popover-item").forEach((item) => {
        const titleElement = item.querySelector(
          ".ce-popover-item__title"
        ) as HTMLElement | null;
        const titleText = titleElement?.textContent?.trim();
        if (
          !titleText ||
          titleText === "Start with" ||
          titleText === "Counter type"
        ) {
          (item as HTMLElement).style.display = "none";
        }
      });
    });

    // Observe the document for any popover being added/removed
    popoverObserver.observe(document.body, { childList: true, subtree: true });

    return () => popoverObserver.disconnect();
  }, []);
};

export default useHidePopoverItems;
