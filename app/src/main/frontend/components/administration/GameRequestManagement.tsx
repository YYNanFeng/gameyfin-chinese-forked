import React from "react";
import withConfigPage from "Frontend/components/administration/withConfigPage";
import * as Yup from 'yup';
import ConfigFormField from "Frontend/components/administration/ConfigFormField";
import Section from "Frontend/components/general/Section";
import {Button} from "@heroui/react";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";

function GameRequestManagementLayout({getConfig, formik}: any) {
    const {t} = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <div className="flex flex-col flex-1">
                    <Section title={t('gameRequests.configuration')}/>
                    <ConfigFormField configElement={getConfig("requests.games.enabled")}/>

                    <Section title={t('gameRequests.permissions')}/>
                    <div className="flex flex-row items-center gap-4">
                        <ConfigFormField
                            configElement={getConfig("requests.games.allow-guests-to-request-games")}
                            isDisabled={!formik.values.library["allow-public-access"]}/>
                        <ConfigFormField configElement={getConfig("requests.games.max-open-requests-per-user")}/>
                    </div>

                    <Button onPress={() => navigate("/requests")}>
                        {t('gameRequests.manageButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

const validationSchema = Yup.object({
    requests: Yup.object({
        games: Yup.object({
            enabled: Yup.boolean().required("Required"),
            "allow-guests-to-request-games": Yup.boolean().required("Required"),
            "max-open-requests-per-user": Yup.number()
                .min(0, "Must be at least 0")
                .max(Number.MAX_SAFE_INTEGER, `Must be lower than ${Number.MAX_SAFE_INTEGER}`)
                .required("Required"),
        }).required("Required"),
    }).required("Required"),
});

import i18n from "Frontend/i18n";

export const GameRequestManagement = withConfigPage(GameRequestManagementLayout, () => i18n.t('admin.pages.gameRequests'), validationSchema);