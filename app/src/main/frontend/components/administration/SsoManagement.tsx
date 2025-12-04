import React, {useEffect} from "react";
import withConfigPage from "Frontend/components/administration/withConfigPage";
import * as Yup from 'yup';
import ConfigFormField from "Frontend/components/administration/ConfigFormField";
import Section from "Frontend/components/general/Section";
import {addToast, Button, Checkbox, CheckboxGroup, Tooltip} from "@heroui/react";
import { MagicWandIcon, WarningIcon } from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";

function SsoManagementLayout({getConfig, formik, setSaveMessage}: any) {
    const {t} = useTranslation();

    useEffect(() => {
        if (formik.dirty) {
            setSaveMessage(t('sso.restartRequired'));
        } else {
            setSaveMessage(null);
        }
    }, [formik.dirty]);

    function isAutoPopulateDisabled() {
        return !formik.values.sso.oidc.enabled || !formik.values.sso.oidc["issuer-url"];
    }

    async function autoPopulate() {
        let issuerUrl: string = formik.values.sso.oidc["issuer-url"];
        if (issuerUrl.endsWith("/")) issuerUrl = issuerUrl.slice(0, -1);

        try {
            const response = await fetch(issuerUrl + "/.well-known/openid-configuration");
            const data = await response.json();

            formik.setFieldValue("sso.oidc.authorize-url", data.authorization_endpoint);
            formik.setFieldValue("sso.oidc.token-url", data.token_endpoint);
            formik.setFieldValue("sso.oidc.userinfo-url", data.userinfo_endpoint);
            formik.setFieldValue("sso.oidc.logout-url", data.end_session_endpoint);
            formik.setFieldValue("sso.oidc.jwks-url", data.jwks_uri);
        } catch (e) {
            addToast({
                title: t('sso.autoPopulateFailed'),
                color: "warning"
            });
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <div className="flex flex-col flex-1">
                    <Section title={t('sso.configuration')}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.enabled")}/>

                    <Section title={t('sso.userHandling')}/>
                    <div className="flex flex-row items-baseline mb-4">
                        <CheckboxGroup className="flex flex-col flex-1 items-baseline gap-2"
                                       value={["auto-register-new-users"]}>
                            <div className="flex flex-row gap-2">
                                <Checkbox className="items-baseline" value="auto-register-new-users" isDisabled>
                                    {t('sso.autoRegisterUsers')}
                                </Checkbox>
                                <Tooltip content={t('sso.notConfigurable')} placement="right">
                                    <WarningIcon weight="fill"/>
                                </Tooltip>
                            </div>
                        </CheckboxGroup>
                        {/*TODO: enable when the issues with unregistered SSO users are sorted

                            <ConfigFormField configElement={getConfig("sso.oidc.auto-register-new-users")} isDisabled={!formik.values.sso.oidc.enabled}/>
                        */}
                        <ConfigFormField configElement={getConfig("sso.oidc.match-existing-users-by")}
                                         isDisabled={!formik.values.sso.oidc.enabled ||
                                             !formik.values.sso.oidc["auto-register-new-users"]}/>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <ConfigFormField configElement={getConfig("sso.oidc.roles-claim")}
                                         isDisabled={!formik.values.sso.oidc.enabled}/>
                        <ConfigFormField configElement={getConfig("sso.oidc.oauth-scopes")}
                                         isDisabled={!formik.values.sso.oidc.enabled}/>
                    </div>

                    <Section title={t('sso.providerConfiguration')}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.client-id")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.client-secret")}
                                     type="password"
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <div className="flex flex-row gap-2">
                        <ConfigFormField configElement={getConfig("sso.oidc.issuer-url")}
                                         isDisabled={!formik.values.sso.oidc.enabled}/>
                        <Button
                            isDisabled={isAutoPopulateDisabled()}
                            onPress={autoPopulate}
                            className="h-14"><MagicWandIcon className="min-w-5"/>{t('sso.autoPopulate')}</Button>
                    </div>
                    <ConfigFormField configElement={getConfig("sso.oidc.authorize-url")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.token-url")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.userinfo-url")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.logout-url")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                    <ConfigFormField configElement={getConfig("sso.oidc.jwks-url")}
                                     isDisabled={!formik.values.sso.oidc.enabled}/>
                </div>
            </div>
        </div>
    );
}

const validationSchema = Yup.object({
    sso: Yup.object({
        oidc: Yup.object({
            enabled: Yup.boolean(),
            "auto-register-new-users": Yup.boolean().required(),
            "match-existing-users-by": Yup.string().required(),
            "client-id": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.clientIdRequired')) : schema
            ),
            "client-secret": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.clientSecretRequired')) : schema
            ),
            "issuer-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.issuerUrlRequired')) : schema
            ),
            "authorize-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.authorizeUrlRequired')) : schema
            ),
            "token-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.tokenUrlRequired')) : schema
            ),
            "userinfo-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.userinfoUrlRequired')) : schema
            ),
            "logout-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.logoutUrlRequired')) : schema
            ),
            "jwks-url": Yup.string().when("enabled", ([enabled], schema) =>
                enabled ? schema.required(i18n.t('sso.validation.jwksUrlRequired')) : schema
            )
        })
    })
});

import i18n from "Frontend/i18n";

export const SsoManagement = withConfigPage(SsoManagementLayout, () => i18n.t('admin.pages.sso'), validationSchema);