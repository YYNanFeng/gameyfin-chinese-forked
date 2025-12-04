import React from "react";
import {SystemEndpoint} from "Frontend/generated/endpoints";
import withConfigPage from "Frontend/components/administration/withConfigPage";
import {addToast, Button} from "@heroui/react";
import Section from "Frontend/components/general/Section";
import {useTranslation} from "react-i18next";

function SystemManagementLayout() {
    const {t} = useTranslation();

    function restart() {
        SystemEndpoint.restart().then(() =>
            addToast({
                title: t('system.restarting'),
                description: t('system.restartingDescription'),
                color: "success"
            })
        );
    }

    return (
        <div className="flex flex-col mt-4">
            <Section title={t('system.restartGameyfin')}/>
            <Button onPress={restart}>{t('system.restart')}</Button>
        </div>
    );
}

import i18n from "Frontend/i18n";

export const SystemManagement = withConfigPage(SystemManagementLayout, () => i18n.t('admin.pages.system'));