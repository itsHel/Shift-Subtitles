import React from "react";
import Loading from "./Loading";
import { PopupContext } from "./../PopupContext";

const updateStep = 0.25; // Seconds

interface ControlsProps {
    timerValue: string;
    changeTimer: Function;
    filename: string;
    generate: Function;
    lastLink: string;
    loading: boolean;
}

export default function Controls(props: ControlsProps) {
    const { open } = React.useContext(PopupContext);

    function updateTimer(direction: number) {
        let move = updateStep * direction;

        props.changeTimer((parseFloat(props.timerValue) + move).toFixed(3));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let newValue = e.currentTarget.value;
        if (isNaN(newValue as any)) return;

        props.changeTimer(newValue.toString());
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
        e.currentTarget.select();
    }

    function handleBlur() {
        let value = props.timerValue;
        if (!value) {
            value = "0";
        }

        props.changeTimer(parseFloat(value).toFixed(3));
    }

    function handleKeyUp(e: React.KeyboardEvent) {
        if (e.key == "Enter" && props.filename && props.timerValue != "" && parseFloat(props.timerValue)) {
            props.generate();
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(props.lastLink);
        open({ type: "success", text: "Copied to clipboard" });
    }

    const hideButton = !(props.filename && props.timerValue != "" && parseFloat(props.timerValue))
        ? " hide-button"
        : "";

    return (
        <div className="controls">
            <div className="controls-generate">
                <div className="timer-buttons">
                    <div id="change-input-wrapper">
                        <input
                            id="change-input"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
                            onKeyUp={(e: React.KeyboardEvent) => handleKeyUp(e)}
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => handleFocus(e)}
                            onBlur={handleBlur}
                            value={props.timerValue}
                        />
                        <div id="units">(s)</div>
                    </div>
                    <button
                        id="plus"
                        className="blue-button"
                        onClick={() => updateTimer(1)}
                        title={"+" + updateStep * 1000 + "ms"}
                    >
                        +
                    </button>
                    <button
                        id="minus"
                        className="blue-button"
                        onClick={() => updateTimer(-1)}
                        title={"-" + updateStep * 1000 + "ms"}
                    >
                        -
                    </button>
                </div>

                {props.filename && props.timerValue != "" && (
                    <button className={"blue-button" + hideButton} onClick={() => props.generate()} id="generate">
                        Download
                    </button>
                )}
                {props.filename && !props.lastLink && !props.loading && (
                    <button className={"blue-button"} onClick={() => props.generate(true)} id="share">
                        Share
                    </button>
                )}
                {props.loading && <Loading />}
                {props.lastLink && !props.loading && (
                    <button className={"blue-button"} onClick={copyLink} id="copy-link">
                        Copy Link
                    </button>
                )}
            </div>
        </div>
    );
}
