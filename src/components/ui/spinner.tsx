import {LoaderCircle} from "lucide-react";

function Spinner() {
    return (
        <>
            <LoaderCircle width={30} height={30} className={"animate-spin"} />
        </>
    )
}

export default Spinner;