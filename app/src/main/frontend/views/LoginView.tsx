import {useAuth} from "Frontend/util/auth";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Button, Card, CardBody, CardHeader, Link, useDisclosure} from "@heroui/react";
import {Form, Formik} from "formik";
import Input from "Frontend/components/general/input/Input";
import PasswordResetModal from "Frontend/components/general/modals/PasswordResetModal";
import SignUpModal from "Frontend/components/general/modals/SignUpModal";
import {RegistrationEndpoint} from "Frontend/generated/endpoints";

export default function LoginView() {
    const {t} = useTranslation();
    const {state, login} = useAuth();

    const passwordResetModal = useDisclosure();
    const signUpModal = useDisclosure();

    const [signUpAllowed, setSignUpAllowed] = useState<boolean>(false);

    useEffect(() => {
        if (state.user) {
            redirectAfterLogin();
        } else {
            RegistrationEndpoint.isSelfRegistrationAllowed().then(setSignUpAllowed);
        }
    }, [state.user]);

    async function tryLogin(values: any, formik: any) {
        const {defaultUrl, error, redirectUrl} = await login(values.username, values.password);
        if (error) {
            formik.setFieldError("username", " "); // Mark the field red, but don't show an error message
            formik.setFieldError("password", t('login.invalidCredentials'));
        } else {
            redirectAfterLogin(redirectUrl, defaultUrl);
        }
    }

    function redirectAfterLogin(redirectUrl?: string, defaultUrl?: string) {
        window.location.href = redirectUrl ?? defaultUrl ?? '/';
    }

    return (
        <div className="flex size-full gradient-primary">
            <Card className="m-auto p-12">
                <CardHeader>
                    <img
                        className="h-28 w-full content-center"
                        src="/images/Logo.svg"
                        alt="Gameyfin Logo"
                    />
                </CardHeader>
                <CardBody className="mt-8 mb-2 w-80 max-w-(--breakpoint-lg) sm:w-96">
                    <Formik
                        initialValues={{}}
                        onSubmit={tryLogin}>
                        {(formik: { isSubmitting: any; }) => (
                            <Form className="mb-1 flex flex-col gap-6">
                                <Input
                                    name="username"
                                    label={t('login.username')}
                                    autoComplete="username"
                                />
                                <Input
                                    name="password"
                                    label={t('login.password')}
                                    autoComplete="current-password"
                                    type="password"
                                />
                                <div className="flex justify-between items-center">
                                    <Link color="foreground" underline="always" href="#"
                                          onPress={passwordResetModal.onOpen}>
                                        {t('login.forgotPassword')}
                                    </Link>
                                    <div className="flex flex-row gap-2">
                                        {signUpAllowed &&
                                            <Button color="default" variant="light"
                                                    onPress={signUpModal.onOpen}>
                                                {t('login.signUp')}
                                            </Button>
                                        }
                                        <Button color="primary" type="submit" isLoading={formik.isSubmitting}>
                                            {formik.isSubmitting ? "" : t('login.logIn')}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </CardBody>
            </Card>

            <PasswordResetModal isOpen={passwordResetModal.isOpen} onOpenChange={passwordResetModal.onOpenChange}/>
            <SignUpModal isOpen={signUpModal.isOpen} onOpenChange={signUpModal.onOpenChange}/>
        </div>
    );
}