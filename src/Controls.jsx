import React from "react"

const updateStep = 0.25;                // Seconds

export default class Controls extends React.Component{
    constructor(props){
        super(props);
    }

    updateTimer(direction){
        let move = updateStep * direction;

        this.props.changeTimer((parseFloat(this.props.timerValue) + move).toFixed(3));
    }

    handleChange(e){
        let newValue = e.target.value;

        if(isNaN(newValue))
            return;

        this.props.changeTimer(newValue.toString());
    }

    showTimerValue(){
        return this.props.timerValue;
    }

    handleFocus(e){
        e.target.select();
    }

    handleBlur(){
        let value = this.props.timerValue;
        if(!value){
            value = 0;
        }

        this.props.changeTimer(parseFloat(value).toFixed(3));
    }

    handleKeyUp(e){
        if(e.keyCode == 13 && (this.props.filename && this.props.timerValue != 0)){
            this.props.generate();
        }
    }

    render(){
        let showButton = (this.props.filename && this.props.timerValue != 0) ? " show-button" : "";

        return (
            <div className="controls">
                <div className="controls-generate">
                    <div className="timer-buttons">
                        <div id="change-input-wrapper">
                            <input id="change-input" onChange={(e) => this.handleChange(e)} onKeyUp={(e) => this.handleKeyUp(e)} onFocus={(e) => this.handleFocus(e)} onBlur={() => this.handleBlur()} value={this.props.timerValue}/>
                            <div id="units">(s)</div>
                        </div>
                        <button id="plus" className="blue-button-hidden show-button" onClick={() => this.updateTimer(1)} title={"+" + (updateStep * 1000) + "ms"}>+</button>
                        <button id="minus" className="blue-button-hidden show-button" onClick={() => this.updateTimer(-1)} title={"-" + (updateStep * 1000) + "ms"}>-</button>
                    </div>
                    <button className={"blue-button-hidden" + showButton} onClick={() => this.props.generate(this.props.timerValue)} id="generate">Generate</button>
                    <button className={"blue-button-hidden" + showButton} onClick={() => this.props.share(this.props.timerValue)} id="share">Copy share link</button>
                </div>
            </div>
        )
    }
}