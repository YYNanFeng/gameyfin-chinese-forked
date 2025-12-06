import React from "react";
import {Form, Formik} from "formik";
import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import Input from "Frontend/components/general/input/Input";
import {MessageEndpoint} from "Frontend/generated/endpoints";
import * as Yup from "yup";
import MessageTemplateDto from "Frontend/generated/org/gameyfin/app/messages/templates/MessageTemplateDto";
import {useTranslation} from "react-i18next";

interface SendTestNotificationModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    selectedTemplate: MessageTemplateDto;
}

export default function SendTestNotificationModal({
                                                      isOpen,
                                                      onOpenChange,
                                                      selectedTemplate
                                                  }: SendTestNotificationModalProps) {
    const {t} = useTranslation();

    function generateValidationSchema(placeholders: string[]) {
        const shape: { [key: string]: Yup.StringSchema } = {};
        placeholders.forEach(placeholder => {
            shape[placeholder] = Yup.string().required(`Placeholder ${placeholder} is required`);
        });
        return Yup.object().shape(shape);
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <Formik
                            initialValues={{}}
                            isInitialValid={false}
                            onSubmit={async (values) => {
                                await MessageEndpoint.sendTestNotification(selectedTemplate.key, values);
                                addToast({
                                    title: "Notification sent",
                                    description: "Test notification to you has been sent",
                                    color: "success"
                                });
                                onClose();
                            }}
                            validationSchema={generateValidationSchema(selectedTemplate.availablePlaceholders)}
                        >
                            {(formik) => (
                                <Form>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {t('modals.sendTestNotification.title', {template: selectedTemplate?.name})}
                                    </ModalHeader>
                                    <ModalBody>
                                        <p className="text-ls font-semibold mb-4">{t('modals.sendTestNotification.fillPlaceholders')}</p>
                                        {selectedTemplate.availablePlaceholders.map((placeholder) =>
                                            <Input key={placeholder} label={placeholder} name={placeholder}/>
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Close
                                        </Button>
                                        <Button color="primary" type="submit" isDisabled={!formik.isValid}>
                                            Send
                                        </Button>
                                    </ModalFooter>
                                </Form>
                            )}
                        </Formik>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}