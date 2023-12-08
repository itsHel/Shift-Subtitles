interface PreviewProps {
    previewText: string;
}

export default function Preview(props: PreviewProps) {
    return (
        <div className={"preview" + (props.previewText ? " show-preview" : "")}>
            <pre className="preview-text">{props.previewText}</pre>
        </div>
    );
}
