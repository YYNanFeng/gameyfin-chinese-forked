import {addToast, Button, Card, CardBody, CardHeader} from "@heroui/react";
import {useNavigate, useSearchParams} from "react-router";
import {Form, Formik} from "formik";
import Input from "Frontend/components/general/input/Input";
import * as Yup from "yup";
import {PasswordResetEndpoint} from "Frontend/generated/endpoints";
import React, {useEffect, useState} from "react";
import {WarningIcon} from "@phosphor-icons/react";
import TokenValidationResult from "Frontend/generated/org/gameyfin/app/core/token/TokenValidationResult";
import {useTranslation} from "react-i18next";

export default function PasswordResetView() {
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        let token = searchParams.get("token");
        if (token) setToken(token);
    }, [searchParams]);

    async function resetPassword(values: any) {
        let token = searchParams.get("token") as string;
        let result = await PasswordResetEndpoint.resetPassword(token, values.password) as TokenValidationResult;

        switch (result) {
            case TokenValidationResult.VALID:
                addToast({
                    title: t('passwordReset.success'),
                    description: t('passwordReset.successDesc'),
                    color: "success"
                });
                navigate("/", {replace: true});
                break;
            case TokenValidationResult.EXPIRED:
                addToast({
                    title: t('passwordReset.tokenExpired'),
                    description: t('passwordReset.tokenExpiredDesc'),
                    color: "warning"
                });
                break;
            case TokenValidationResult.INVALID:
            default:
                addToast({
                    title: t('passwordReset.invalidToken'),
                    description: t('passwordReset.invalidTokenDesc'),
                    color: "danger"
                });
                break
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
                            initialValues={{
                                password: "",
                                passwordRepeat: ""
                            }}
                            validationSchema={Yup.object({
                                password: Yup.string()
                                    .min(8, 'Password must be at least 8 characters long')
                                    .required('Required'),
                                passwordRepeat: Yup.string()
                                    .equals([Yup.ref('password')], 'Passwords do not match')
                                    .required('Required')
                            })}
                            onSubmit={resetPassword}>
                            {(formik: { values: any; isSubmitting: any; isValid: boolean; }) => (
                                <Form>
                                    <p className="text-xl text-center mb-8">{t('passwordReset.title')}</p>
                                    <Input label={t('passwordReset.newPassword')} name="password" type="password"
                                           autoComplete="new-password"/>
                                    <Input label={t('invitation.passwordRepeat')} name="passwordRepeat" type="password"
                                           autoComplete="new-password"/>
                                    <Button type="submit" className="w-full mt-4" color="primary"
                                            isDisabled={!formik.isValid || formik.isSubmitting}
                                            isLoading={formik.isSubmitting}>
                                        {formik.isSubmitting ? "" : t('passwordReset.resetButton')}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                        :
                        <p className="flex flex-row grow justify-center items-center gap-2 text-danger text-2xl font-bold">
                            <WarningIcon weight="fill"/>
                            {t('passwordReset.invalidToken')}
                        </p>
                    }
                </CardBody>
            </Card>
        </div>
    );
}