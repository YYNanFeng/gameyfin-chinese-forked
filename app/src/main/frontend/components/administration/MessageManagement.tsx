import React, {useEffect, useState} from "react";
import withConfigPage from "Frontend/components/administration/withConfigPage";
import ConfigFormField from "Frontend/components/administration/ConfigFormField";
import Section from "Frontend/components/general/Section";
import {addToast, Button, Card, Tooltip, useDisclosure} from "@heroui/react";
import {MessageEndpoint, MessageTemplateEndpoint} from "Frontend/generated/endpoints";
import {PaperPlaneRightIcon, PencilIcon} from "@phosphor-icons/react";
import MessageTemplateDto from "Frontend/generated/org/gameyfin/app/messages/templates/MessageTemplateDto";
import SendTestNotificationModal from "Frontend/components/administration/messages/SendTestNotificationModal";
import EditTemplateModal from "Frontend/components/administration/messages/EditTemplateModel";
import * as Yup from "yup";
import {useTranslation} from "react-i18next";

function MessageManagementLayout({getConfig, formik}: any) {
    const {t} = useTranslation();

    const editorModal = useDisclosure();
    const testNotificationModal = useDisclosure();
    const [availableTemplates, setAvailableTemplates] = useState<MessageTemplateDto[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateDto>();

    useEffect(() => {
        MessageTemplateEndpoint.getAll().then((response: any) => {
            setAvailableTemplates(response as MessageTemplateDto[]);
        });
    }, []);

    async function verifyCredentials(provider: string) {
        const credentials: Record<string, any> = {
            host: formik.values.messages.providers.email.host,
            port: formik.values.messages.providers.email.port,
            username: formik.values.messages.providers.email.username,
            password: formik.values.messages.providers.email.password
        }

        let areCredentialsValid: boolean;

        try {
            areCredentialsValid = await MessageEndpoint.verifyCredentials(provider, credentials);
        } catch (error) {
            areCredentialsValid = false;
        }

        if (areCredentialsValid) {
            addToast({
                title: t('messages.credentialsValid'),
                color: "success"
            });
        } else {
            addToast({
                title: t('messages.credentialsInvalid'),
                color: "warning"
            });
        }
    }

    async function openEditor(template: MessageTemplateDto) {
        setSelectedTemplate(template);
        editorModal.onOpen();
    }

    function openTestNotification(template: MessageTemplateDto) {
        setSelectedTemplate(template);
        testNotificationModal.onOpen();
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <div className="flex flex-col flex-1">
                    <div className="flex flex-row gap-8">
                        <div className="flex flex-col flex-1 h-fit">
                            <Section title={t('messages.email')}/>
                            <ConfigFormField configElement={getConfig("messages.providers.email.enabled")}
                                             className="mb-2"/>
                            <ConfigFormField configElement={getConfig("messages.providers.email.host")}
                                             isDisabled={!formik.values.messages.providers.email.enabled}/>
                            <ConfigFormField configElement={getConfig("messages.providers.email.port")}
                                             isDisabled={!formik.values.messages.providers.email.enabled}/>
                            <ConfigFormField configElement={getConfig("messages.providers.email.username")}
                                             isDisabled={!formik.values.messages.providers.email.enabled}/>
                            <ConfigFormField configElement={getConfig("messages.providers.email.password")}
                                             type="password"
                                             isDisabled={!formik.values.messages.providers.email.enabled}/>
                            <Button onPress={() => verifyCredentials("email")}
                                    isDisabled={!(
                                        formik.values.messages.providers.email.enabled &&
                                        formik.values.messages.providers.email.host &&
                                        formik.values.messages.providers.email.port &&
                                        formik.values.messages.providers.email.username)}>{t('common.test')}</Button>
                        </div>
                        <div className="flex flex-col flex-1 h-fit">
                            <Section title={t('messages.messageTemplates')}/>
                            <div className="flex flex-col gap-4">
                                {availableTemplates.map((template: MessageTemplateDto) =>
                                    <Card className="flex flex-row items-center gap-2 p-4" key={template.key}>
                                        <Tooltip content={t('messages.editTemplate')}>
                                            <Button isIconOnly
                                                    size="sm"
                                                    onPress={() => openEditor(template)}
                                            >
                                                <PencilIcon/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content={t('messages.sendTestNotification')}>
                                            <Button isIconOnly
                                                    size="sm"
                                                    onPress={() => openTestNotification(template)}
                                                    isDisabled={!formik.values.messages.providers.email.enabled}
                                            >
                                                <PaperPlaneRightIcon/>
                                            </Button>
                                        </Tooltip>
                                        <p className="text-lg">{template.description}</p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditTemplateModal
                isOpen={editorModal.isOpen}
                onOpenChange={editorModal.onOpenChange}
                selectedTemplate={selectedTemplate!!}
            />

            <SendTestNotificationModal
                isOpen={testNotificationModal.isOpen}
                onOpenChange={testNotificationModal.onOpenChange}
                selectedTemplate={selectedTemplate!!}
            />
        </div>
    );
}

const validationSchema = Yup.object({
    messages: Yup.object({
        providers: Yup.object({
            email: Yup.object({
                enabled: Yup.boolean().required(i18n.t('common.validation.required')),
                host: Yup.string().required(i18n.t('messages.validation.hostRequired')),
                port: Yup.number().required(i18n.t('messages.validation.portRequired'))
                    .min(0, i18n.t('messages.validation.portRange'))
                    .max(65535, i18n.t('messages.validation.portRange')),
                username: Yup.string()
                    .required(i18n.t('messages.validation.usernameRequired')),
            })
        })
    })
});

import i18n from "Frontend/i18n";

export const MessageManagement = withConfigPage(MessageManagementLayout, () => i18n.t('admin.pages.messages'), validationSchema);