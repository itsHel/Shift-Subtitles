import {useRef, useState} from "react";
import Fileinfo from "./Fileinfo";

const validateRegex = /\d\d:\d\d:\d\d,\d\d\d\s+-->\s+\d\d:\d\d:\d\d,\d\d\d/;        	// 00:00:27,749 --> 00:00:29,708
const maxSize = 104857600;                                                          	// 100 MB

export default function Dropbox(props){
	const [userIsDragging, setUserIsDragging] = useState();
	const dropInputRef = useRef();

	function handleDragEnter(e){
		preventBoth(e);
		setUserIsDragging(true);
	}

	function handleDragOver(e){
		preventBoth(e);
	}

	function handleDragLeave(e){
		preventBoth(e);
		setUserIsDragging(false);
	}

	function handleDrop(e){
		preventBoth(e);
		setUserIsDragging(false);
		handleFile(e);
	}

	function handleClick(){
		dropInputRef.current.click();
	}

	function handleFile(e){
		const file = e.dataTransfer?.files[0];
		if(file){
			readFile(file);
		}
	}

	function handleInput(e){
		const file = e.target.files[0];
		if(file){
			readFile(file);
		}
	}

	function preventBoth(e){
		e.preventDefault();
		e.stopPropagation();
	}

	function readFile(file){
		if(file.size > maxSize){
			props.setupPopup({type: "error", text: "Wrong file format"});
			return;
		}
		
		const reader = new FileReader();

		reader.addEventListener("load", (e) => {
			const content = e.target.result;

			if(!validateFile(content)){
				props.setupPopup({type: "error", text: "Wrong file format"});
				return;
			}

			props.onFileChange(file.name, content);
		});

		reader.readAsText(file);

		// TODO check if format ok
		function validateFile(content){
			if(!content.match(validateRegex))
				return false;

			return true;
		}
	}

	const draggingClass = (userIsDragging) ? "dragging" : "";

	return (
		<div 
			className={"drop " + draggingClass} 
			onDragEnter={(e) => handleDragEnter(e)}
			onDragLeave={(e) => handleDragLeave(e)}
			onDragOver={(e) => handleDragOver(e)}
			onDrop={(e) => handleDrop(e)}
			onClick={handleClick}
		>
			<input 
				ref={dropInputRef} 
				className="drop-input" 
				type="file"
				onInput={(e) => handleInput(e)} 
			/>
			<Fileinfo filename={props.filename} />
		</div>
	)
}