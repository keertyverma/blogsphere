import { Highlight, themes } from "prism-react-renderer";

interface Props {
  code: string;
  language: string;
}

const BlockCode = ({ code, language }: Props) => {
  return (
    <div className="code-block">
      <Highlight code={code} language={language} theme={themes.nightOwl}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-3 pl-5 overflow-x-auto rounded-md`}
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
