import React from "react";
import DiscordIcon from "./svg/DiscordIcon";

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-screen__content">
                <DiscordIcon />
                <p>Loading...</p>
            </div>
        </div>
    )
}

export default LoadingScreen;