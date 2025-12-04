import Section from "Frontend/components/general/Section";
import Input from "Frontend/components/general/input/Input";
import {addToast, Button, Input as NextUiInput, Tooltip} from "@heroui/react";
import {Form, Formik} from "formik";
import { ArrowCounterClockwiseIcon, CheckIcon, InfoIcon, TrashIcon } from "@phosphor-icons/react";
import React, {useEffect, useState} from "react";
import {useAuth} from "Frontend/util/auth";
import * as Yup from "yup";
import UserUpdateDto from "Frontend/generated/org/gameyfin/app/users/dto/UserUpdateDto";
import {EmailConfirmationEndpoint, MessageEndpoint, UserEndpoint} from "Frontend/generated/endpoints";
import {SmallInfoField} from "Frontend/components/general/SmallInfoField";
import {removeAvatar, uploadAvatar} from "Frontend/endpoints/AvatarEndpoint";
import Avatar from "Frontend/components/general/Avatar";
import {useTranslation} from "react-i18next";

export default function ProfileManagement() {
    const {t} = useTranslation();
    const auth = useAuth();
    const [avatar, setAvatar] = useState<any>();
    const [configSaved, setConfigSaved] = useState(false);
    const [messagesEnabled, setMessagesEnabled] = useState(false);

    useEffect(() => {
        MessageEndpoint.isEnabled().then(setMessagesEnabled);
    }, []);

    useEffect(() => {
        if (configSaved) {
            setTimeout(() => setConfigSaved(false), 2000);
        }
    }, [configSaved])


    function onFileSelected(event: any) {
        setAvatar(event.target.files[0]);
    }

    async function handleSubmit(values: any) {
        const userUpdate: UserUpdateDto = {
            username: values.username,
            email: values.email
        }

        if (values.newPassword.length > 0) {
            userUpdate.password = values.newPassword;
        }

        await UserEndpoint.updateUser(userUpdate);
        setConfigSaved(true);

        if (values.newPassword.length > 0) {
            addToast({
                title: t('profile.passwordChanged'),
                description: t('profile.pleaseLoginAgain'),
                color: "success"
            });
            setTimeout(() => {
                auth.logout();
            }, 500);
        }
    }

    return (
        <>
            <Formik
                initialValues={{
                    username: auth.state.user?.username,
                    email: auth.state.user?.email,
                    newPassword: "",
                    passwordRepeat: ""
                }}
                onSubmit={handleSubmit}
                validationSchema={Yup.object({
                    username: Yup.string()
                        .required(t('common.validation.required')),
                    newPassword: Yup.string()
                        .min(8, t('profile.validation.passwordMinLength')),
                    email: Yup.string()
                        .email()
                        .required(t('common.validation.required')),
                    passwordRepeat: Yup.string()
                        .equals([Yup.ref('newPassword')], t('profile.validation.passwordsNoMatch'))
                })}
            >
                {(formik: { values: any; isSubmitting: any; dirty: boolean; }) => (
                    <Form>
                        <div className="flex flex-row grow justify-between mb-8">
                            <h2 className="text-2xl font-bold">{t('profile.myProfile')}</h2>
                            {auth.state.user?.managedBySso &&
                                <p className="text-warning">{t('profile.managedExternally')}</p>}

                            <div className="flex flex-row items-center gap-4">
                                {formik.values.newPassword.length > 0 &&
                                    <SmallInfoField icon={InfoIcon}
                                                    message={t('profile.logoutAllSessions')}
                                                    className="text-default-500"
                                    />
                                }
                                <Button
                                    color="primary"
                                    isLoading={formik.isSubmitting}
                                    isDisabled={!formik.dirty || formik.isSubmitting || configSaved || auth.state.user?.managedBySso}
                                    type="submit"
                                >
                                    {formik.isSubmitting ? "" : configSaved ? <CheckIcon/> : t('common.save')}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-row flex-1 justify-between gap-16">
                            <div className="flex flex-col basis-1/4 mt-8 gap-4">
                                <div className="flex flex-row justify-center">
                                    <Avatar className="size-40 m-4 flex flex-row"/>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <NextUiInput type="file" accept="image/*" onChange={onFileSelected}
                                                 isDisabled={auth.state.user?.managedBySso}/>
                                    <Button onPress={() => uploadAvatar(avatar)} isDisabled={avatar == null}
                                            color="success">{t('profile.upload')}</Button>
                                    <Tooltip content={t('profile.removeAvatar')}>
                                        <Button onPress={removeAvatar} isIconOnly color="danger"
                                                isDisabled={auth.state.user?.managedBySso}><TrashIcon/></Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="flex flex-col grow">
                                <Section title={t('profile.personalInformation')}/>
                                <Input name="username" label={t('profile.username')} type="text" autocomplete="username"
                                       isDisabled={auth.state.user?.managedBySso}/>
                                <div className="flex flex-row gap-4">
                                    <Input name="email" label={t('profile.email')} type="email" autocomplete="email"
                                           isDisabled={auth.state.user?.managedBySso || !messagesEnabled}/>
                                    {(auth.state.user?.emailConfirmed === false && !auth.state.user.managedBySso) &&
                                        <Tooltip content={t('profile.resendEmailConfirmation')}>
                                            <Button isIconOnly
                                                    onPress={() => {
                                                        EmailConfirmationEndpoint.resendEmailConfirmation().then(
                                                            () => addToast({
                                                                title: t('profile.emailConfirmationSent'),
                                                                description: t('profile.checkInbox'),
                                                                color: "success"
                                                            })
                                                        )
                                                    }}
                                                    isDisabled={!messagesEnabled}
                                                    variant="ghost"
                                                    className="size-14"
                                            >
                                                <ArrowCounterClockwiseIcon size={26}/>
                                            </Button>
                                        </Tooltip>
                                    }
                                </div>
                                {!messagesEnabled &&
                                    <div className="flex flex-row gap-2 text-warning -mt-5">
                                        <InfoIcon/>
                                        <small>
                                            {t('profile.emailServicesDisabled')}
                                        </small>
                                    </div>
                                }
                                <Section title={t('profile.security')}/>
                                <Input name="newPassword" label={t('profile.newPassword')} type="password"
                                       autocomplete="new-password" isDisabled={auth.state.user?.managedBySso}/>
                                <Input name="passwordRepeat" label={t('profile.repeatPassword')} type="password"
                                       autocomplete="new-password" isDisabled={auth.state.user?.managedBySso}/>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
}