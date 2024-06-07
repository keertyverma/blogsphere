interface Props {
  code: string;
}

const BlockCode = ({ code }: Props) => {
  return (
    <div className="bg-muted p-3 pl-5 border-l-4 border-primary">
      <pre className="whitespace-pre-wrap">
        <code className="!text-base">{code}</code>
      </pre>
    </div>
  );
};

export default BlockCode;
