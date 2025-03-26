import { languageSelectionMap } from "@/lib/editorjs/custom-editorjs-code-block";
import { Check, Clipboard } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";

interface Props {
  code: string;
  language: string;
}

const BlockCode = ({ code, language }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="code-block">
      {/* Header: Language + Copy Button */}
      <div className="flex justify-between items-center px-3 py-0.5 bg-gray-800 text-gray-200 rounded-t-md text-sm">
        <span className="font-mono !text-sm">
          {languageSelectionMap[language]}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-700 transition !text-sm"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-400" /> Copied
            </>
          ) : (
            <>
              <Clipboard size={16} /> Copy
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <Highlight code={code} language={language} theme={themes.nightOwl}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-3 pl-5 overflow-x-auto rounded-b-md`}
            style={{ ...style }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default BlockCode;
