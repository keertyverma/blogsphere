import editorJsCodeCup from "@calumk/editorjs-codecup";
import { BlockToolData } from "@editorjs/editorjs";

export class CustomEditorJsCodeBlock extends editorJsCodeCup {
  static get toolbox() {
    return {
      title: "Code",
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 8L3 11.6923L7 16M17 8L21 11.6923L17 16M14 4L10 20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`,
    };
  }

  save(blockContent: HTMLElement): BlockToolData {
    return super.save(blockContent);
  }

  render(): HTMLElement {
    return super.render();
  }

  _renderLanguageDropdown(languageSelectContainer: HTMLElement) {
    const dropdown = document.createElement("div");
    dropdown.classList.add("editorjs-codeCup_languageDropdown");

    // Sort languages alphabetically by their display names, ensuring case-insensitive ordering
    const sortedLanguages = Object.entries(this._languages).sort((a, b) =>
      (a[1] as string).localeCompare(b[1] as string, undefined, {
        sensitivity: "base",
      })
    );

    // Generate language options
    const fragment = document.createDocumentFragment(); // Using DocumentFragment to minimize DOM reflows
    sortedLanguages.forEach(([key, label]) => {
      const langOption = document.createElement("div");
      langOption.classList.add("editorjs-codeCup_languageOption");
      langOption.innerText = label as string;

      // Handle selection
      langOption.addEventListener("click", (event) => {
        event.stopPropagation();
        const isUpdated = this._updateLanguage(key, label);
        if (isUpdated) dropdown.style.display = "none"; // close the dropdown
      });
      fragment.appendChild(langOption);
    });
    dropdown.appendChild(fragment); // Append all language options to DOM in a single operation to improve performance
    languageSelectContainer.appendChild(dropdown);
  }
}

/**
 * Maps language identifiers (Prism.js compatible) to their display names.
 * Used for language selection in the code block tool.
 */
export const languageSelectionMap: { [key: string]: string } = {
  bash: "Bash",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  dart: "Dart",
  go: "Go",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  kotlin: "Kotlin",
  markdown: "Markdown",
  none: "Plain Text",
  objectivec: "Objective-C",
  php: "PHP",
  powershell: "PowerShell",
  python: "Python",
  ruby: "Ruby",
  rust: "Rust",
  sql: "SQL",
  swift: "Swift",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
};
