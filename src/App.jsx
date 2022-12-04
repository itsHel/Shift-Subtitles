import React from 'react';
import Controls from './Controls';
import Dropbox from './Dropbox';
import Popup from './Popup';
import Header from './Header';
import Preview from './Preview';
import './App.css';
import './Popup.css';

const previewRows = 9;
const changeValueMultiplier = 1000;
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
			popup: {
				visible: false,
				type: "",
				text: ""
			}
		}
	}

	componentDidMount(){
		// Download file if shared link
		if(window.location.search.match(/\?id=/)){
			fetch(serverUrl + "/download" + window.location.search, {method: "POST"})
				.then(response => response.text())
				.then(text => {
					if(text == "error"){
						this.setupPopup({type: "error", text: "File not found"});
						return;
					}

					let filename = window.location.search.replace("?id=", "").replace(/\.[^.]+$/, "");

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
		const popupTimeout = 5000;

		this.setState({
			popup: {
				visible: true,
				type: popup.type,
				text: popup.text
			}
		});

		setTimeout(() => {
			this.hidePopup();
		}, popupTimeout);
	}

	hidePopup(){
		let tempPopup = this.state.popup;
		tempPopup.visible = false;

		this.setState({
			popup: tempPopup
		});
	}

	generate(upload = false){
		let changeValue = this.state.timer * changeValueMultiplier;

		let newContent = this.state.fileContent.replaceAll(/(\d\d:\d\d:\d\d,\d\d\d)\s+-->\s+(\d\d:\d\d:\d\d,\d\d\d)/g, function(match, time1, time2){
			return milisecondsToTime(timeToMiliseconds(time1) + changeValue) + " --> " + milisecondsToTime(timeToMiliseconds(time2) + changeValue);
		});

		if(upload){
			let filename = this.state.filename.replaceAll(/&|\/|\\|\?/g, "");
			let formData = new FormData();

			formData.append("content", newContent);
			formData.append("filename", filename);
			
			fetch(serverUrl + "/upload", {method: "POST", body: formData})
				.then(response => response.text())
				.then(text => {
					try{
						navigator.clipboard.writeText(window.location.origin + "?id=" + text);
						this.setupPopup({type: "success", text: "Link copied"});
					} catch(err){
						this.setupPopup({type: "error", text: "I just don't know what went wrong"});
					}
				});
		} else {
			let link = document.createElement("a");
			let blob = new Blob([newContent], {type: "text/plain"});
	
			link.download = this.state.filename;
			link.href = window.URL.createObjectURL(blob);
			link.click();
		}
    }

	generatePreview(){
		if(!this.state.fileContent)
			return;

		let changeValue = this.state.timer * changeValueMultiplier;
		let previewContent = this.state.fileContent;

		previewContent = previewContent.slice(0, getNthIndexOf(previewContent, "\r\n", previewRows));

		previewContent = previewContent.replaceAll(/(\d\d:\d\d:\d\d,\d\d\d)\s+-->\s+(\d\d:\d\d:\d\d,\d\d\d)/g, function(match, time1, time2){
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
