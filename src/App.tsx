import React from "react";
import Controls from "./Component/Controls";
import Dropbox from "./Component/Dropbox";
import Header from "./Component/Header";
import Preview from "./Component/Preview";
import ThemeButton from "./Component/ThemeButton";
import type { Theme } from "./Component/ThemeButton";
import ParticlesBackground from "./Component/particles/ParticlesBackground";
import { Popup } from "./Component/Popup";
import { PopupContext } from "./PopupContext";
import "./css/App.css";
import "./css/Popup.css";

const previewRows = 9;
const changeValueMultiplier = 1000;
const getTimingRegex = /(\d\d:\d\d:\d\d,\d\d\d)\s+-->\s+(\d\d:\d\d:\d\d,\d\d\d)/g; // 00:00:27,749 --> 00:00:29,708
const serverUrl = "https://ten-responsible-bayberry.glitch.me";

interface History {
    lastTime: string;
    lastLink: string;
}

export default function App() {
    const [filename, setFilename] = React.useState<string>("");
    const [preview, setPreview] = React.useState<string>("");
    const [timer, setTimer] = React.useState<string>("0.000");
    const [theme, setTheme] = React.useState<Theme>("light");
    const [history, setHistory] = React.useState<History>({
        lastTime: "",
        lastLink: "",
    });
    const [loading, setLoading] = React.useState<boolean>(false);
    const fileContent = React.useRef("");
    const { open } = React.useContext(PopupContext);

    React.useEffect(() => {
        if (window.location.search.match(/\?id=/)) {
            fetch(serverUrl + "/download" + window.location.search, {
                method: "POST",
            })
                .then((response) => response.text())
                .then((text) => {
                    if (text == "error") {
                        open({ type: "error", text: "File not found" });
                        return;
                    }

                    let filename = decodeURI(window.location.search.replace("?id=", "").replace(/\.[^.]+$/, ""));

                    let link = document.createElement("a");
                    let blob = new Blob([text], { type: "text/plain" });

                    link.download = filename;
                    link.href = window.URL.createObjectURL(blob);
                    link.click();
                })
                .catch((err) => {
                    open({ type: "error", text: "Unknown Error" });
                    return;
                });
        }
    }, []);

    React.useEffect(() => {
        if (filename) {
            generatePreview();
        }
    }, [timer]);

    function handleFileChange(filename: string, content: string) {
        setFilename(filename);
        fileContent.current = content;
        setHistory({ lastTime: "", lastLink: "" });
        generatePreview();
    }

    function changeTimer(timer: string) {
        setTimer(timer);
    }

    function generate(upload = false) {
        const thisTimer = timer;
        const changeValue = parseFloat(timer) * changeValueMultiplier;

        const newContent = fileContent.current.replaceAll(getTimingRegex, function (match, time1, time2) {
            return (
                milisecondsToTime(timeToMiliseconds(time1) + changeValue) +
                " --> " +
                milisecondsToTime(timeToMiliseconds(time2) + changeValue)
            );
        });

        if (!upload) {
            let link = document.createElement("a");
            let blob = new Blob([newContent], { type: "text/plain" });

            link.download = filename;
            link.href = window.URL.createObjectURL(blob);

            link.click();
        } else {
            let thisFilename = filename.replaceAll(/&|\/|\\|\?/g, "");

            setLoading(true);

            let formData = new FormData();
            formData.append("content", newContent);
            formData.append("filename", thisFilename);

            fetch(serverUrl + "/upload", { method: "POST", body: formData })
                .then((response) => response.text())
                .then((text) => {
                    try {
                        setLoading(false);
                        setHistory({
                            lastTime: thisTimer,
                            lastLink: window.location.origin + window.location.pathname + "?id=" + text,
                        });
                    } catch (err) {
                        open({
                            type: "error",
                            text: "I just don't know what went wrong",
                        });
                    }
                })
                .catch((err) => {
                    setLoading(false);
                    open({
                        type: "error",
                        text: "I just don't know what went wrong",
                    });
                });
        }
    }

    function generatePreview() {
        if (!fileContent.current) return;

        let previewLength = getNthIndexOf(fileContent.current, "\n", previewRows);
        if (previewLength == -1) return;

        let changeValue = parseFloat(timer) * changeValueMultiplier;
        let previewContent = fileContent.current.slice(0, previewLength);

        previewContent = previewContent.replaceAll(getTimingRegex, function (match, time1, time2) {
            return (
                milisecondsToTime(timeToMiliseconds(time1) + changeValue) +
                " --> " +
                milisecondsToTime(timeToMiliseconds(time2) + changeValue)
            );
        });

        setPreview(previewContent);
    }

    return (
        <div id="app">
            <ThemeButton setTheme={setTheme} />
            <Header />
            <Dropbox onFileChange={handleFileChange} filename={filename} loading={loading} />
            <Controls
                filename={filename}
                changeTimer={changeTimer}
                timerValue={timer}
                generate={generate}
                lastLink={timer == history.lastTime ? history.lastLink : ""}
                loading={loading}
            />
            <Preview previewText={preview} />
            <Popup />
            {!isNotComputer() && <ParticlesBackground theme={theme} />}
        </div>
    );
}

function isNotComputer() {
    const phones = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    return navigator.maxTouchPoints > 0 || navigator.userAgent.match(phones);
}

function timeToMiliseconds(time: string): number {
    let temp = time.split(":");
    let miliseconds =
        parseInt(temp[0]) * 3_600_000 + parseInt(temp[1]) * 60_000 + parseInt(temp[2].replace(/,|\./, ""));
    return miliseconds;
}

function milisecondsToTime(miliseconds: number): string {
    let hours = Math.floor(miliseconds / 3_600_000);
    miliseconds = miliseconds % 3_600_000;

    let minutes = Math.floor(miliseconds / 60_000);
    miliseconds = miliseconds % 60_000;

    let milisecondsString = miliseconds.toString().padStart(5, "0");

    let time =
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        milisecondsString.substring(0, 2) +
        "," +
        milisecondsString.substring(2);

    return time;
}

function getNthIndexOf(str: string, search: string, count: number) {
    let index;

    do {
        index = str.indexOf(search, index);
        if (index == -1) return -1;

        count--;
        if (count == 0) return index;

        index++;
    } while (count);

    return index;
}
