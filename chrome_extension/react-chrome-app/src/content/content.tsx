import Button from "@mui/material/Button/Button";

import { messageFromPopup } from "./listener";


function App() {
    console.log(process.env)
    return (
        <div>
            <Button
                variant="outlined"
            >
                Sale Notification
            </Button>
        </div>
    );
}

chrome.runtime.onMessage.addListener(messageFromPopup);

export default App;
