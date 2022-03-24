import { Spinner } from "react-bootstrap";
import i18n from './i18n';

function Loading() {
    return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">{i18n.t("Loading")}...</span>
        </Spinner>
    )
}

export default Loading;