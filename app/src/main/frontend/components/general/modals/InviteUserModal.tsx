import React, {useEffect, useState} from "react";
import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Snippet} from "@heroui/react";
import {MessageEndpoint, RegistrationEndpoint, UserEndpoint} from "Frontend/generated/endpoints";
import TokenDto from "Frontend/generated/org/gameyfin/app/core/token/TokenDto";
import {Form, Formik, FormikErrors} from "formik";
import Input from "Frontend/components/general/input/Input";
import * as Yup from "yup";
import {useTranslation} from "react-i18next";

interface InviteUserModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function InviteUserModal({isOpen, onOpenChange}: InviteUserModalProps) {
    const {t} = useTranslation();
    const [token, setToken] = useState<TokenDto | null>(null);
    const [isMessageServiceEnabled, setIsMessageServiceEnabled] = useState<boolean>(false);

    useEffect(() => {
        setToken(null);
        MessageEndpoint.isEnabled().then(enabled => {
            setIsMessageServiceEnabled(enabled);
        });
    }, [isOpen]);

    async function inviteUser(email: string, setErrors: (errors: FormikErrors<any>) => void, onClose: () => void) {
        if (!email) return;

        if (await UserEndpoint.existsByMail(email)) {
            setErrors({email: "User with this email already exists"});
            return;
        }

        if (!isMessageServiceEnabled) {
            let token = await RegistrationEndpoint.createInvitation(email);
            setToken(token);
            return;
        }

        await RegistrationEndpoint.createInvitation(email);
        addToast({
            title: t('modals.inviteUser.invitationSent'),
            description: t('modals.inviteUser.emailSent'),
            color: "success"
        });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque" size="4xl">
            <ModalContent>
                {(onClose) => (
                    <Formik
                        initialValues={{email: ""}}
                        isInitialValid={false}
                        validationSchema={Yup.object({
                            email: Yup.string()
                                .email("Invalid email address")
                                .required("Email is required")
                        })}
                        onSubmit={async (values: any, {setErrors}) => {
                            await inviteUser(values.email, setErrors, onClose);
                        }}
                    >
                        {(formik) => (
                            <Form>
                                <ModalHeader className="flex flex-col gap-1">{t('modals.inviteUser.title')}</ModalHeader>
                                <ModalBody>
                                    <p>{t('modals.inviteUser.enterEmail')}</p>
                                    <Input label={t('modals.inviteUser.emailLabel')} name="email" type="email"/>

                                    {token && (
                                        <div className="flex flex-col gap-2">
                                            <p>{t('modals.inviteUser.acceptLink')}</p>
                                            <Snippet symbol="">
                                                {`${document.baseURI}accept-invitation?token=${token.secret}`}
                                            </Snippet>
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="success"
                                            type="submit"
                                            isLoading={formik.isSubmitting}
                                            isDisabled={!formik.isValid || token !== null}>
                                        {isMessageServiceEnabled ?
                                            <p>{t('user.sendInvitation')}</p> :
                                            <p>{t('user.generateInvitationLink')}</p>
                                        }
                                    </Button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                )}
            </ModalContent>
        </Modal>
    );
}