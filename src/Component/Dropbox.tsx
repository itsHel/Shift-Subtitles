import React from "react";
import Fileinfo from "./Fileinfo";
import { PopupContext } from "./../PopupContext";

const validateRegex = /\d\d:\d\d:\d\d,\d\d\d\s+-->\s+\d\d:\d\d:\d\d,\d\d\d/; // 00:00:27,749 --> 00:00:29,708
const maxSize = 104857600; // 100 MB

interface DropboxProps {
    onFileChange: Function;
    filename: string;
    loading: boolean;
}

export default function Dropbox(props: DropboxProps) {
    const [userIsDragging, setUserIsDragging] = React.useState(false);
    const dropInputRef = React.useRef<HTMLInputElement>(null);
    const { open } = React.useContext(PopupContext);

    function handleDragEnter(e: React.DragEvent) {
        preventBoth(e);
        setUserIsDragging(true);
    }

    function handleDragOver(e: React.DragEvent) {
        preventBoth(e);
    }

    function handleDragLeave(e: React.DragEvent) {
        preventBoth(e);
        setUserIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        preventBoth(e);
        setUserIsDragging(false);
        handleFile(e);
    }

    function handleClick() {
        dropInputRef.current!.click();
    }

    function handleFile(e: React.DragEvent) {
        const file = e.dataTransfer?.files[0];
        if (file) {
            readFile(file);
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.currentTarget.files) return;

        const file = e.currentTarget.files[0];
        if (file) {
            readFile(file);
        }
    }

    function preventBoth(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    function readFile(file: File) {
        if (file.size > maxSize) {
            open({ type: "error", text: "Wrong file format" });
            return;
        }

        const reader = new FileReader();

        reader.addEventListener("load", (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result as string;

            if (!validateFile(content)) {
                open({ type: "error", text: "Wrong file format" });
                return;
            }

            props.onFileChange(file.name, content);
        });

        reader.readAsText(file);

        // TODO check if format ok
        function validateFile(content: string) {
            if (!content.match(validateRegex)) return false;

            return true;
        }
    }

    const disabledClass = props.loading ? "disabled" : "";
    const draggingClass = userIsDragging ? "dragging" : "";

    return (
        <div
            className={"drop " + disabledClass + draggingClass}
            onDragEnter={(e: React.DragEvent) => handleDragEnter(e)}
            onDragLeave={(e: React.DragEvent) => handleDragLeave(e)}
            onDragOver={(e: React.DragEvent) => handleDragOver(e)}
            onDrop={(e: React.DragEvent) => handleDrop(e)}
            onClick={handleClick}
        >
            <input
                ref={dropInputRef}
                className="drop-input"
                type="file"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInput(e)
                }
            />
            <Fileinfo filename={props.filename} />
        </div>
    );
}
