import React, {useEffect, useState} from "react";
import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Input as NextInput} from "@heroui/input";
import { WarningCircleIcon } from "@phosphor-icons/react";
import {MessageEndpoint, PasswordResetEndpoint} from "Frontend/generated/endpoints";
import {useTranslation} from "react-i18next";

interface PasswordResetModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function PasswordResetModal({
                                               isOpen,
                                               onOpenChange
                                           }: PasswordResetModalProps) {
    const {t} = useTranslation();
    const [canResetPassword, setCanResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState<string>();

    useEffect(() => {
        MessageEndpoint.isEnabled().then(setCanResetPassword);
    }, []);

    async function resetPassword() {
        if (!resetEmail) return;

        await PasswordResetEndpoint.requestPasswordReset(resetEmail);
        addToast({
            title: t('modals.passwordReset.requested'),
            description: t('modals.passwordReset.checkEmail'),
            color: "success"
        });
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('modals.passwordReset.title')}</ModalHeader>
                        <ModalBody>
                            {canResetPassword ?
                                <NextInput
                                    onChange={(event: any) => {
                                        setResetEmail(event.target.value);
                                    }}
                                    type="email"
                                    placeholder={t('modals.passwordReset.emailPlaceholder')}
                                /> :
                                <div className="flex flex-row items-center gap-4 text-warning">
                                    <WarningCircleIcon size={40}/>
                                    <p>
                                        {t('modals.passwordReset.disabled')}
                                    </p>
                                </div>
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary"
                                    isDisabled={!canResetPassword}
                                    onPress={async () => {
                                        await resetPassword();
                                        onClose();
                                    }}>
                                {t('modals.passwordReset.sendRequest')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}