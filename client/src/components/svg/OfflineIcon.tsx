interface OfflineIconProps {
    height?: string;
    width?: string;
}

function OfflineIcon({ height, width }: OfflineIconProps) {
    return (
        <svg style={(height && width) ? { height, width } : {}} viewBox="-51.2 -51.2 614.40 614.40" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0" transform="translate(153.6,153.6), scale(0.4)"><rect x="-51.2" y="-51.2" width="614.40" height="614.40" rx="307.2" fill="#36363d" strokeWidth="0"></rect></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="drop" fill="#8f8f8f" transform="translate(42.666667, 42.666667)"> <path d="M213.333333,3.55271368e-14 C331.15408,3.55271368e-14 426.666667,95.5125867 426.666667,213.333333 C426.666667,331.15408 331.15408,426.666667 213.333333,426.666667 C95.5125867,426.666667 3.55271368e-14,331.15408 3.55271368e-14,213.333333 C3.55271368e-14,95.5125867 95.5125867,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,106.666667 C154.42296,106.666667 106.666667,154.42296 106.666667,213.333333 C106.666667,272.243707 154.42296,320 213.333333,320 C272.243707,320 320,272.243707 320,213.333333 C320,154.42296 272.243707,106.666667 213.333333,106.666667 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>
    )
}

export default OfflineIcon