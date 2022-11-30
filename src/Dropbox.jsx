import React from "react";

export default class Dropbox extends React.Component{
	constructor(props){
		super(props);
		this.dropInputRef = React.createRef();

		this.state = {
			dragging: false
		}
	}

	handleDragEnter(e){
		this.preventBoth(e);
        
		this.setState({dragging: true});
	}

	handleDragOver(e){
		this.preventBoth(e);

		// this.setState({dragging: true});
	}

	handleDragLeave(e){
		this.preventBoth(e);

		this.setState({dragging: false});
	}

	handleDrop(e){
		this.preventBoth(e);

		this.setState({dragging: false});
		this.handleFile(e);
	}

	handleClick(){
		this.dropInputRef.current.click();
	}

	handleFile(e){
		const file = e.dataTransfer?.files[0];
		if(file){
            this.readFile(file);
		}
	}

	handleInput(e){
		const file = e.target.files[0];
        if(file){
            this.readFile(file);
		}
	}

	preventBoth(e){
		e.preventDefault();
		e.stopPropagation();
	}

	readFile(file){
        const validateRegex = /\d\d:\d\d:\d\d,\d\d\d\s+-->\s+\d\d:\d\d:\d\d,\d\d\d/;        // 00:00:27,749 --> 00:00:29,708
        const maxSize = 104857600;                                                          // 100 MB

        if(file.size > maxSize){
            this.props.setupPopup({type: "error", text: "Wrong file format"});
            return;
        }
        
		const reader = new FileReader();

		reader.addEventListener("load", (e) => {
			const content = e.target.result;

			if(!validateFile(content)){
                this.props.setupPopup({type: "error", text: "Wrong file format"});
				return;
			}

			this.props.onFileChange(file.name, content);
		});

		reader.readAsText(file);

		// TODO check if format ok
		function validateFile(content){
            if(!content.match(validateRegex))
                return false;

			return true;
		}
	}

	render(){
		const draggingClass = (this.state.dragging) ? "dragging" : "";

		return (
			<div 
				className={"drop " + draggingClass} 
				onDragEnter={(e) => this.handleDragEnter(e)}
				onDragLeave={(e) => this.handleDragLeave(e)}
				onDragOver={(e) => this.handleDragOver(e)}
				onDrop={(e) => this.handleDrop(e)}
				onClick={() => this.handleClick()}
			>
				<input 
					ref={this.dropInputRef} 
					className="drop-input" 
					type="file"
					onInput={(e) => this.handleInput(e)} 
				/>
				<Fileinfo filename={this.props.filename} />
			</div>
		)
	};
}

function Fileinfo(props){
	return (
		<div className="file-info">
			<svg id="drop-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm11.5-7.65V13.8l-6 6-2.15-2.15L24 8l9.65 9.65-2.15 2.15-6-6v18.55Z"/></svg>
			{props.filename && <div id="file-name">{props.filename}</div>}
			{!props.filename && <div id="file-name-alt">Drop here or click here</div>}
		</div>
	)
}