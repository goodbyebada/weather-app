import { useState } from "react";
import { createPortal } from "react-dom";
import EditNameModal from "./EditNameModal";
import { EditIcon } from "@shared/ui/icons";
import { useFavoriteStore } from "@entities/favorite/model/store";

interface EditNameButtonProps {
  favoriteId: string;
  initialName: string;
  onOpen?: () => void;
  onClose?: () => void;
}

const EditNameButton = ({
  favoriteId,
  initialName,
  onOpen,
  onClose,
}: EditNameButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { updateFavoriteName } = useFavoriteStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
        aria-label={`${initialName} 이름 수정`}
      >
        <EditIcon className="w-5 h-5" />
      </button>
      {isModalOpen &&
        createPortal(
          <EditNameModal
            isOpen={isModalOpen}
            onClose={handleClose}
            initialName={initialName}
            onConfirm={(newName) => updateFavoriteName(favoriteId, newName)}
          />,
          document.body,
        )}
    </>
  );
};

export default EditNameButton;
