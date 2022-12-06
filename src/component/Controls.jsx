const updateStep = 0.25;                // Seconds

export default function Controls(props){
    function updateTimer(direction){
        let move = updateStep * direction;

        props.changeTimer((parseFloat(props.timerValue) + move).toFixed(3));
    }

    function handleChange(e){
        let newValue = e.target.value;
        if(isNaN(newValue))
            return;

        props.changeTimer(newValue.toString());
    }

    function handleFocus(e){
        e.target.select();
    }

    function handleBlur(){
        let value = props.timerValue;
        if(!value){
            value = 0;
        }

        props.changeTimer(parseFloat(value).toFixed(3));
    }

    function handleKeyUp(e){
        if(e.keyCode == 13 && (props.filename && props.timerValue != 0)){
            props.generate();
        }
    }

    const showButton = (props.filename && props.timerValue != 0) ? " show-button" : "";

    return (
        <div className="controls">
            <div className="controls-generate">
                <div className="timer-buttons">
                    <div id="change-input-wrapper">
                        <input id="change-input" 
                            onChange={(e) => handleChange(e)} 
                            onKeyUp={(e) => handleKeyUp(e)} 
                            onFocus={(e) => handleFocus(e)} 
                            onBlur={handleBlur} 
                            value={props.timerValue}
                        />
                        <div id="units">(s)</div>
                    </div>
                    <button id="plus" className="blue-button-hidden show-button" onClick={() => updateTimer(1)} title={"+" + (updateStep * 1000) + "ms"}>+</button>
                    <button id="minus" className="blue-button-hidden show-button" onClick={() => updateTimer(-1)} title={"-" + (updateStep * 1000) + "ms"}>-</button>
                </div>
                <button className={"blue-button-hidden" + showButton} onClick={() => props.generate()} id="generate">Generate</button>
                <button className={"blue-button-hidden" + showButton} onClick={() => props.generate(true)} id="share">Copy share link</button>
            </div>
        </div>
    )
}