import React from "react";
import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {RegistrationEndpoint} from "Frontend/generated/endpoints";
import UserRegistrationDto from "Frontend/generated/org/gameyfin/app/users/dto/UserRegistrationDto";
import {Form, Formik} from "formik";
import * as Yup from "yup";
import Input from "Frontend/components/general/input/Input";
import {useTranslation} from "react-i18next";

interface SignUpModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function SignUpModal({
                                        isOpen,
                                        onOpenChange
                                    }: SignUpModalProps) {
    const {t} = useTranslation();

    async function signUp(registration: UserRegistrationDto, onClose: () => void) {
        try {
            await RegistrationEndpoint.registerUser({
                username: registration.username,
                password: registration.password,
                email: registration.email
            });

            onClose();

            addToast({
                title: t('modals.signUp.accountCreated'),
                description: t('modals.signUp.emailInstructions'),
                color: "success"
            });
        } catch (_) {
            addToast({
                title: t('modals.signUp.registrationFailed'),
                description: t('modals.signUp.registrationError'),
                color: "danger"
            });
            return;
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <Formik initialValues={{}}
                            onSubmit={async (values: any, {setFieldError}) => {
                                let usernameAvailable = await RegistrationEndpoint.isUsernameAvailable(values.username);
                                if (!usernameAvailable) {
                                    setFieldError('username', 'Username already taken');
                                    return;
                                } else {
                                    await signUp(values, onClose);
                                }
                            }}
                            validationSchema={Yup.object({
                                username: Yup.string()
                                    .required('Required'),
                                password: Yup.string()
                                    .min(8, 'Password must be at least 8 characters long')
                                    .required('Required'),
                                email: Yup.string()
                                    .email()
                                    .required('Required'),
                                passwordRepeat: Yup.string()
                                    .equals([Yup.ref('password')], 'Passwords do not match')
                                    .required('Required')
                            })}>
                        <Form>
                            <ModalHeader className="flex flex-col gap-1">{t('modals.signUp.title')}</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col">
                                    <Input
                                        label="Username"
                                        name="username"
                                        type="text"
                                    />
                                    <Input
                                        label="E-Mail"
                                        name="email"
                                        type="email"
                                    />
                                    <Input
                                        label="Password"
                                        name="password"
                                        type="password"
                                    />
                                    <Input
                                        label="Password (repeat)"
                                        name="passwordRepeat"
                                        type="password"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Create account
                                </Button>
                            </ModalFooter>
                        </Form>
                    </Formik>
                )}
            </ModalContent>
        </Modal>
    );
}