import { useState } from "react";
import Modal from "@shared/ui/modal/Modal";
import Input from "@shared/ui/input/Input";
import Button from "@shared/ui/button/Button";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  onConfirm: (newName: string) => void;
}

const EditNameModal = ({
  isOpen,
  onClose,
  initialName,
  onConfirm,
}: EditNameModalProps) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length === 0) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (name.length > 20) {
      setError("이름은 20자 이내로 입력해주세요.");
      return;
    }

    onConfirm(name.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="별칭 수정">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="favorite-name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            즐겨찾기 이름
          </label>
          <Input
            id="favorite-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="예: 우리집, 회사"
            maxLength={20}
            error={error}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary">
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNameModal;
