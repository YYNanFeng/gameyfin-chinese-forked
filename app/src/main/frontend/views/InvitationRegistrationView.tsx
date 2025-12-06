import {addToast, Button, Card, CardBody, CardHeader} from "@heroui/react";
import {useNavigate, useSearchParams} from "react-router";
import {Form, Formik} from "formik";
import Input from "Frontend/components/general/input/Input";
import * as Yup from "yup";
import {RegistrationEndpoint} from "Frontend/generated/endpoints";
import React, {useEffect, useState} from "react";
import { WarningIcon } from "@phosphor-icons/react";
import UserInvitationAcceptanceResult
    from "Frontend/generated/org/gameyfin/app/users/enums/UserInvitationAcceptanceResult";
import {useTranslation} from "react-i18next";

export default function InvitationRegistrationView() {
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>();
    const [email, setEmail] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        let token = searchParams.get("token");
        if (token) {
            setToken(token);
            RegistrationEndpoint.getInvitationRecipientEmail(token).then(setEmail);
        }
    }, [searchParams]);

    async function register(values: any, formik: any) {
        if (!token || !email) return;

        let result = await RegistrationEndpoint.acceptInvitation(token, {
            email: email,
            username: values.username,
            password: values.password
        });

        switch (result) {
            case UserInvitationAcceptanceResult.SUCCESS:
                addToast({
                    title: t('invitation.success'),
                    description: t('invitation.successDesc'),
                    color: "success"
                });
                navigate("/", {replace: true});
                break;
            case UserInvitationAcceptanceResult.USERNAME_TAKEN:
                formik.setFieldError("username", t('invitation.usernameTaken'));
                break;
            case UserInvitationAcceptanceResult.TOKEN_EXPIRED:
                addToast({
                    title: t('invitation.tokenExpired'),
                    description: t('invitation.tokenExpiredDesc'),
                    color: "warning"
                });
                break;
            case UserInvitationAcceptanceResult.TOKEN_INVALID:
            default:
                addToast({
                    title: t('invitation.invalidToken'),
                    description: t('invitation.invalidTokenDesc'),
                    color: "danger"
                });
                break;
        }
    }

    return (
        <div className="flex flex-row grow items-center justify-center size-full gradient-primary">
            <Card className="p-4 min-w-[468px]">
                <CardHeader className="mb-4">
                    <img
                        className="h-28 w-full content-center"
                        src="/images/Logo.svg"
                        alt="Gameyfin Logo"
                    />
                </CardHeader>
                <CardBody>
                    {token ?
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                username: "",
                                email: email,
                                password: "",
                                passwordRepeat: ""
                            }}
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
                            onSubmit={register}>
                            {(formik: { values: any; isSubmitting: any; isValid: boolean; }) => (
                                <Form>
                                    <p className="text-xl text-center mb-8">{t('invitation.title')}</p>
                                    <Input label={t('profile.email')} name="email" type="email" value={email} disabled/>
                                    <Input label={t('profile.username')} name="username" autoComplete="username"/>
                                    <Input label={t('login.password')} name="password" type="password"
                                           autoComplete="new-password"/>
                                    <Input label={t('invitation.passwordRepeat')} name="passwordRepeat" type="password"
                                           autoComplete="new-password"/>
                                    <Button type="submit" className="w-full mt-4" color="primary"
                                            isDisabled={!formik.isValid || formik.isSubmitting}
                                            isLoading={formik.isSubmitting}>
                                        {formik.isSubmitting ? "" : t('invitation.createAccount')}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                        :
                        <p className="flex flex-row grow justify-center items-center gap-2 text-danger text-2xl font-bold">
                            <WarningIcon weight="fill"/>
                            {t('invitation.invalidToken')}
                        </p>
                    }
                </CardBody>
            </Card>
        </div>
    );
}