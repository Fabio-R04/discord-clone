interface SpinnerProps {
    absolute?: boolean;
    height?: string;
    width?: string;
}

function Spinner({ absolute, height, width }: SpinnerProps) {
    return (
        <span style={{
            ...(absolute === false) && { position: "static" },
            ...(height && width) && { height, width }
        }} className="loader"></span>
    )
}

export default Spinner;