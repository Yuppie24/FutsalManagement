import Modal from "react-modal";

declare module "react-modal" {
  export default Modal;
  export interface ModalProps {
    style?: {
      content?: React.CSSProperties;
      overlay?: React.CSSProperties;
    };
  }
}