import React from 'react';
import * as Yup from 'yup';
import Wizard from "Frontend/components/wizard/Wizard";
import WizardStep from "Frontend/components/wizard/WizardStep";
import Input from "Frontend/components/general/input/Input";
import { HandWavingIcon, PaletteIcon, UserIcon } from "@phosphor-icons/react";
import {addToast, Card} from "@heroui/react";
import {SetupEndpoint} from "Frontend/generated/endpoints";
import {ThemeSelector} from "Frontend/components/theming/ThemeSelector";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";

function WelcomeStep() {
    const {t} = useTranslation();
    return (
        <div className="flex flex-col size-full items-center">
            <div className="flex flex-col w-1/2 min-w-[468px] gap-12 items-center">
                <h4>{t('setup.welcome')}</h4>
                <p className="place-content-center text-justify">
                    {t('setup.description1')} <br/><br/> {t('setup.description2')} <br/><br/> {t('setup.description3')}
                </p>
                <h5>{t('setup.letsGetStarted')}</h5>
            </div>
        </div>
    );
}

function ThemeStep() {
    const {t} = useTranslation();
    return (
        <div className="flex flex-col grow gap-6 items-center">
            <p className="text-2xl font-bold">{t('setup.chooseStyle')}</p>
            <ThemeSelector/>
        </div>
    );
}

function UserStep() {
    const {t} = useTranslation();
    return (
        <div className="flex flex-row grow justify-center">
            <div className="flex flex-col w-1/3 min-w-96 gap-6 items-center">
                <p className="text-2xl font-bold">{t('setup.createAccount')}</p>
                <p>{t('setup.initialAdminDesc')}</p>
                <div className="flex flex-col w-full">
                    <Input
                        label={t('profile.username')}
                        name="username"
                        type="text"
                    />
                    <Input
                        label={t('profile.email')}
                        name="email"
                        type="email"
                    />
                    <Input
                        label={t('login.password')}
                        name="password"
                        type="password"
                    />
                    <Input
                        label={t('invitation.passwordRepeat')}
                        name="passwordRepeat"
                        type="password"
                    />
                </div>
            </div>
        </div>
    );
}

function SetupView() {
    const {t} = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-row size-full items-center justify-center gradient-primary">
            <Card className="w-3/4 h-3/4 min-w-[500px] p-8">
                <Wizard
                    initialValues={{username: '', email: '', password: '', passwordRepeat: ''}}
                    onSubmit={
                        async (values: any) => {
                            try {
                                await SetupEndpoint.registerSuperAdmin({
                                    username: values.username,
                                    password: values.password,
                                    email: values.email
                                });
                                addToast({
                                    title: t('setup.setupFinished'),
                                    description: t('setup.haveFun'),
                                    color: "success"
                                });
                            } catch (e) {
                                addToast({
                                    title: t('setup.setupError'),
                                    description: t('setup.setupErrorDesc'),
                                    color: "warning"
                                });
                            } finally {
                                navigate('/login');
                            }
                        }
                    }
                >
                    <WizardStep icon={<HandWavingIcon/>}>
                        <WelcomeStep/>
                    </WizardStep>
                    <WizardStep icon={<PaletteIcon/>}>
                        <ThemeStep/>
                    </WizardStep>
                    <WizardStep
                        validationSchema={Yup.object({
                            username: Yup.string()
                                .required(t('common.validation.required')),
                            password: Yup.string()
                                .min(8, t('common.validation.minLength'))
                                .required(t('common.validation.required')),
                            email: Yup.string()
                                .email(t('common.validation.invalidEmail'))
                                .required(t('common.validation.required')),
                            passwordRepeat: Yup.string()
                                .equals([Yup.ref('password')], t('common.validation.passwordMismatch'))
                                .required(t('common.validation.required'))
                        })}
                        icon={<UserIcon/>}
                    >
                        <UserStep/>
                    </WizardStep>
                </Wizard>
            </Card>
        </div>
    );
}

export default SetupView;