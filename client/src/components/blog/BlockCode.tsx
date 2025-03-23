interface Props {
  code: string;
}

const BlockCode = ({ code }: Props) => {
  return (
    <div className="bg-muted border-l-4 border-primary rounded-md">
      <pre className="p-3 pl-5 overflow-x-auto">
        <code className="!text-base">{code}</code>
      </pre>
    </div>
  );
};

export default BlockCode;
