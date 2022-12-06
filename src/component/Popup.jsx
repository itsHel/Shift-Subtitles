export default function Popup(props){
    return (
        <div className="popup-wrapper">
            <div onClick={() => props.hidePopup()} className={"popup popup-" + props.data.type + " " + ((props.data.visible) ? "popup-visible" : "")}>
                <div className="popup-header">
                    <span className="popup-icons">{pickIco(props.data.type)}</span>
                    <span className="popup-text">{props.data.type}</span>
                </div>
                <div className="popup-text">{props.data.text}</div>
            </div>
        </div>
    )
}

function pickIco(type){
    let ico = "";

    switch(type){
        case "error":
            ico = <svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="19" r="2"/><path d="M10 3h4v12h-4z"/></svg>;
            break;
        case "success":
            ico = <svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
            break;
    }

    return ico;
}