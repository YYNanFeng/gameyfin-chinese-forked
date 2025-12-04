import React from "react";
import {PluginManagementSection} from "Frontend/components/general/plugin/PluginManagementSection";
import {pluginState} from "Frontend/state/PluginState";
import {useSnapshot} from "valtio/react";
import {useTranslation} from "react-i18next";

export default function PluginManagement() {
    const {t} = useTranslation();

    // Defined manually for now to control the layout (order of categories)
    const pluginTypes = ["GameMetadataProvider", "DownloadProvider"];

    const state = useSnapshot(pluginState);

    return state.isLoaded && (
        <div className="flex flex-col">
            <div className="flex flex-row grow justify-between mb-8">
                <h2 className="text-2xl font-bold">{t('admin.pages.plugins')}</h2>
            </div>

            <div className="flex flex-col gap-8">
                {pluginTypes.map(type =>
                    // @ts-ignore
                    <PluginManagementSection key={type} type={type} plugins={state.pluginsByType[type]}/>
                )}
            </div>
        </div>
    );
}