import React, {useEffect, useState} from "react";
import {Button, Code, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {UserEndpoint} from "Frontend/generated/endpoints";
import UserInfoDto from "Frontend/generated/org/gameyfin/app/users/dto/UserInfoDto";
import {useTranslation} from "react-i18next";

interface ConfirmUserDeletionModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    user: UserInfoDto;
}

export default function ConfirmUserDeletionModal({isOpen, onOpenChange, user}: ConfirmUserDeletionModalProps) {
    const {t} = useTranslation();
    const [confirmUsername, setConfirmUsername] = useState<string>("");

    useEffect(() => {
        setConfirmUsername("");
    }, []);

    async function deleteUser() {
        await UserEndpoint.deleteUserByName(user.username);
        window.location.reload();
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque" isDismissable={false}
               hideCloseButton={true} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('modals.confirmDeletion.title')}</ModalHeader>
                        <ModalBody>
                            <p>
                                {t('modals.confirmDeletion.message', {username: user.username})}
                            </p>
                            <Input onChange={(e) => setConfirmUsername(e.target.value)}/>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="danger" onPress={deleteUser}
                                    isDisabled={confirmUsername != user.username}>
                                {t('modals.confirmDeletion.confirmButton')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}