import {Button, Card, Chip, Tooltip, useDisclosure} from "@heroui/react";
import { CheckCircleIcon, IconContext, PauseCircleIcon, PlayCircleIcon, PowerIcon, QuestionIcon, QuestionMarkIcon, SealCheckIcon, SealQuestionIcon, SealWarningIcon, SlidersHorizontalIcon, StopCircleIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import PluginState from "Frontend/generated/org/pf4j/PluginState";
import React, {ReactNode} from "react";
import PluginDetailsModal from "Frontend/components/general/modals/PluginDetailsModal";
import PluginLogo from "Frontend/components/general/plugin/PluginLogo";
import PluginTrustLevel from "Frontend/generated/org/gameyfin/app/core/plugins/management/PluginTrustLevel";
import {PluginEndpoint} from "Frontend/generated/endpoints";
import PluginDto from "Frontend/generated/org/gameyfin/app/core/plugins/dto/PluginDto";
import PluginConfigValidationResult
    from "Frontend/generated/org/gameyfin/pluginapi/core/config/PluginConfigValidationResult";
import PluginConfigValidationResultType
    from "Frontend/generated/org/gameyfin/pluginapi/core/config/PluginConfigValidationResultType";
import {useTranslation} from "react-i18next";

export function PluginManagementCard({plugin}: { plugin: PluginDto }) {
    const {t} = useTranslation();
    const pluginDetailsModal = useDisclosure();

    function borderColor(state: PluginState | undefined, trustLevel: PluginTrustLevel | undefined): "success" | "warning" | "danger" | "default" {
        if (trustLevel === PluginTrustLevel.UNTRUSTED) return "danger";

        if (isDisabled(state)) return "warning";
        return stateToColor(state);
    }

    function stateToColor(state: PluginState | undefined): "success" | "warning" | "danger" | "default" {
        switch (state) {
            case PluginState.STARTED:
                return "success";
            case PluginState.DISABLED:
                return "warning";
            case PluginState.FAILED:
            case PluginState.STOPPED:
                return "danger";
            default:
                return "default";
        }
    }

    function stateToIcon(state: PluginState | undefined): ReactNode {
        switch (state) {
            case PluginState.STARTED:
                return <PlayCircleIcon/>;
            case PluginState.DISABLED:
                return <PauseCircleIcon/>;
            case PluginState.STOPPED:
            case PluginState.FAILED:
                return <StopCircleIcon/>;
            case PluginState.UNLOADED:
            case PluginState.RESOLVED:
                return <XCircleIcon/>;
            default:
                return <QuestionMarkIcon/>;
        }
    }

    function configValidationResultToChip(validationResult: PluginConfigValidationResult | undefined): ReactNode {
        switch (validationResult?.result) {
            case PluginConfigValidationResultType.VALID:
                return <Tooltip content={t('modals.pluginDetails.configValid')} placement="bottom" color="foreground">
                    <Chip size="sm" radius="sm" className="text-xs" color="success">
                        <CheckCircleIcon/>
                    </Chip>
                </Tooltip>
            case PluginConfigValidationResultType.INVALID:
                return <Tooltip content={t('modals.pluginDetails.configInvalid')} placement="bottom" color="foreground">
                    <Chip size="sm" radius="sm" className="text-xs" color="danger">
                        <WarningCircleIcon/>
                    </Chip>
                </Tooltip>;
            default:
                return <Tooltip content={t('modals.pluginDetails.configInvalid')} placement="bottom" color="foreground">
                    <Chip size="sm" radius="sm" className="text-xs">
                        <QuestionIcon/>
                    </Chip>
                </Tooltip>
        }
    }

    function trustLevelToBadge(trustLevel: PluginTrustLevel | undefined): React.ReactNode {
        switch (trustLevel) {
            case PluginTrustLevel.OFFICIAL:
                return <Tooltip color="foreground" placement="bottom" content={t('modals.pluginDetails.officialPlugin')}>
                    <SealCheckIcon className="fill-success"/>
                </Tooltip>;
            case PluginTrustLevel.BUNDLED:
                return <Tooltip color="foreground" placement="bottom" content={t('modals.pluginDetails.bundledPlugin')}>
                    <SealCheckIcon/>
                </Tooltip>;
            case PluginTrustLevel.THIRD_PARTY:
                return <Tooltip color="foreground" placement="bottom" content={t('modals.pluginDetails.thirdPartyPlugin')}>
                    <SealWarningIcon/>
                </Tooltip>;
            case PluginTrustLevel.UNTRUSTED:
                return <Tooltip color="foreground" placement="bottom" content={t('modals.pluginDetails.invalidSignature')}>
                    <SealWarningIcon className="fill-danger"/>
                </Tooltip>;
            default:
                return <Tooltip color="foreground" placement="bottom" content={t('modals.pluginDetails.unknownVerification')}>
                    <SealQuestionIcon/>
                </Tooltip>;
        }
    }

    function isDisabled(state: PluginState | undefined): boolean {
        return state === PluginState.DISABLED;
    }

    function togglePluginEnabled() {
        if (isDisabled(plugin.state)) {
            PluginEndpoint.enablePlugin(plugin.id);
        } else {
            PluginEndpoint.disablePlugin(plugin.id);
        }
    }

    // @ts-ignore
    return (
        <>
            <Card
                className={`flex flex-row justify-between p-2 border-2 border-${borderColor(plugin.state, plugin.trustLevel)}`}>
                <div className="absolute right-0 top-0 flex flex-row">
                    <Tooltip content={`${isDisabled(plugin.state) ? "Enable" : "Disable"} plugin`} placement="bottom"
                             color="foreground">
                        <Button isIconOnly
                                variant="light"
                                onPress={() => togglePluginEnabled()}
                                isDisabled={plugin.state == PluginState.UNLOADED || plugin.state == PluginState.RESOLVED}
                        >
                            <PowerIcon/>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('modals.pluginDetails.configuration')} placement="bottom" color="foreground">
                        <Button isIconOnly variant="light" onPress={pluginDetailsModal.onOpen}>
                            <SlidersHorizontalIcon/>
                        </Button>
                    </Tooltip>
                </div>
                <div className="flex flex-1 flex-col items-center gap-2">
                    <PluginLogo plugin={plugin}/>
                    <p className="flex flex-row items-center gap-1 font-semibold">
                        {plugin.name}
                        <IconContext.Provider value={{size: 18, weight: "fill"}}>
                            {trustLevelToBadge(plugin.trustLevel)}
                        </IconContext.Provider>
                    </p>
                    <div className="flex flex-row gap-2">
                        <Chip size="sm" radius="sm" className="text-xs">{plugin.version}</Chip>
                        <Chip size="sm" radius="sm" className="text-xs" color={stateToColor(plugin.state)}>
                            <Tooltip content={`Plugin ${plugin.state?.toLowerCase()}`} placement="bottom"
                                     color="foreground">
                                {stateToIcon(plugin.state)}
                            </Tooltip>
                        </Chip>
                        {configValidationResultToChip(plugin.configValidation)}
                    </div>
                </div>
            </Card>
            <PluginDetailsModal plugin={plugin}
                                isOpen={pluginDetailsModal.isOpen}
                                onOpenChange={pluginDetailsModal.onOpenChange}
            />
        </>

    )
}