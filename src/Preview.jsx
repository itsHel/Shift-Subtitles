import React from "react"

export default class Preview extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        let show = (this.props.previewText) ? " show-preview" : "";

        return (
            <div className={"preview" + show}>
                <pre className="preview-text">
                    {this.props.previewText}
                </pre>
            </div>
        )
    }
}