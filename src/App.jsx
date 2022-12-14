import React from 'react';
import Controls from './component/Controls';
import Dropbox from './component/Dropbox';
import Popup from './component/Popup';
import Header from './component/Header';
import Preview from './component/Preview';
import './css/App.css';
import './css/Popup.css';

const previewRows = 9;
const changeValueMultiplier = 1000;
const getTimingRegex = /(\d\d:\d\d:\d\d,\d\d\d)\s+-->\s+(\d\d:\d\d:\d\d,\d\d\d)/g;			// 00:00:27,749 --> 00:00:29,708
const serverUrl = "https://ten-responsible-bayberry.glitch.me";

export default class App extends React.Component{
	constructor(props){
		super(props);

		this.handleFileChange = this.handleFileChange.bind(this);
		this.setupPopup = this.setupPopup.bind(this);
		this.hidePopup = this.hidePopup.bind(this);
		this.generate = this.generate.bind(this);
		this.generatePreview = this.generatePreview.bind(this);
		this.changeTimer = this.changeTimer.bind(this);

		this.state = {
			filename: "",
			fileContent: "",
			preview: "",
			timer: "0.000",
			lastUpload: "",
			lastLink: "",
			popup: {
				visible: false,
				type: "",
				text: ""
			},
			popupTimeout: 0
		}
	}

	componentDidMount(){
		// Download file if it's shared link
		if(window.location.search.match(/\?id=/)){
			fetch(serverUrl + "/download" + window.location.search, {method: "POST"})
				.then(response => response.text())
				.then(text => {
					if(text == "error"){
						this.setupPopup({type: "error", text: "File not found"});
						return;
					}

					let filename = decodeURI(window.location.search.replace("?id=", "").replace(/\.[^.]+$/, ""));

					let link = document.createElement("a");
					let blob = new Blob([text], {type: "text/plain"});
					
					link.download = filename;
					link.href = window.URL.createObjectURL(blob);
					link.click();
				});
		}
	}

	handleFileChange(filename, content){
		this.setState({
				filename: filename,
				fileContent: content
			},
			this.generatePreview
		);
	}

	changeTimer(timer){
		this.setState({
				timer: timer
			},
			this.generatePreview
		);
	}

	setupPopup(popup){
		const popupTimeout = 6000;

		this.setState({
			popup: {
				visible: true,
				type: popup.type,
				text: popup.text
			}
		});

		clearTimeout(this.state.popupTimeout);

		this.setState({
			popupTimeout: setTimeout(() => {
				this.hidePopup();
			}, popupTimeout)
		});
	}

	hidePopup(){
		this.setState(prevState => ({
			popup: {
				...prevState.popup,
				visible:false
			}
		}));
	}

	generate(upload = false){
		let changeValue = this.state.timer * changeValueMultiplier;

		let newContent = this.state.fileContent.replaceAll(getTimingRegex, function(match, time1, time2){
			return milisecondsToTime(timeToMiliseconds(time1) + changeValue) + " --> " + milisecondsToTime(timeToMiliseconds(time2) + changeValue);
		});

		if(!upload){
			let link = document.createElement("a");
			let blob = new Blob([newContent], {type: "text/plain"});

			link.download = this.state.filename;
			link.href = window.URL.createObjectURL(blob);
	
			link.click();
		} else {
			let filename = this.state.filename.replaceAll(/&|\/|\\|\?/g, "");

			// If file already exists copy link
			if(this.state.lastUpload == filename + this.state.timer){				
				navigator.clipboard.writeText(this.state.lastLink);
				return;
			}

			let formData = new FormData();
			formData.append("content", newContent);
			formData.append("filename", filename);
			
			fetch(serverUrl + "/upload", {method: "POST", body: formData})
				.then(response => response.text())
				.then(text => {
					try{
						navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?id=" + text);

						this.setupPopup({type: "success", text: "Link copied"});
						this.setState({
							lastUpload: filename + this.state.timer,
							lastLink: window.location.origin + window.location.pathname + "?id=" + text
						});
					} catch(err){
						this.setupPopup({type: "error", text: "I just don't know what went wrong"});
					}
				})
				.catch((err) => {
					this.setupPopup({type: "error", text: "I just don't know what went wrong"});
				});
		}
	}

	generatePreview(){
		if(!this.state.fileContent)
			return;

		let changeValue = this.state.timer * changeValueMultiplier;
		let previewContent = this.state.fileContent;

		previewContent = previewContent.slice(0, getNthIndexOf(previewContent, "\r\n", previewRows));

		previewContent = previewContent.replaceAll(getTimingRegex, function(match, time1, time2){
			return milisecondsToTime(timeToMiliseconds(time1) + changeValue) + " --> " + milisecondsToTime(timeToMiliseconds(time2) + changeValue);
		});

		this.setState({
			preview: previewContent
		});
	}

	render(){
		return (
			<div id="app">
				<Header/>
				<Dropbox onFileChange={this.handleFileChange} filename={this.state.filename} setupPopup={this.setupPopup}/>
				<Controls filename={this.state.filename} changeTimer={this.changeTimer} timerValue={this.state.timer} generate={this.generate}/>
				<Preview previewText={this.state.preview}/>
				<Popup data={this.state.popup} hidePopup={this.hidePopup}/>
			</div>
		);
	}
}

function timeToMiliseconds(time){
	let temp = time.split(":");
	let miliseconds = temp[0] * 3_600_000 + temp[1] * 60_000 + parseInt(temp[2].replace(/,|\./, ""));
	return miliseconds;
}

function milisecondsToTime(miliseconds){
	let hours = parseInt(miliseconds / 3_600_000);
	miliseconds = miliseconds % 3_600_000;

	let minutes = parseInt(miliseconds / 60_000);
	miliseconds = miliseconds % 60_000;

	miliseconds = miliseconds.toString().padStart(5, "0");

	let time = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + miliseconds.substring(0, 2) + "," + miliseconds.substring(2);

	return time;
}

function getNthIndexOf(str, search, count){
	let index;

	do {
		index = str.indexOf(search, index);
		if(index == -1)
			return -1;
		
		count--;
		if(count == 0)
			return index;
		
		index++;
	} while(count)

	return index;
}
