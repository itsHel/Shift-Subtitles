export default function Preview(props){
    return (
        <div className={"preview" + ((props.previewText) ? " show-preview" : "")}>
            <pre className="preview-text">
                {props.previewText}
            </pre>
        </div>
    )
}