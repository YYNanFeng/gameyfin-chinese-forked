import {
    DiscIcon,
    DownloadSimpleIcon,
    EnvelopeIcon,
    GameControllerIcon,
    GlobeIcon,
    LockKeyIcon,
    LogIcon,
    PlugIcon,
    UsersIcon,
    WrenchIcon
} from "@phosphor-icons/react";
import withSideMenu, {MenuItem} from "Frontend/components/general/withSideMenu";
import i18n from "Frontend/i18n";

const menuItems: MenuItem[] = [
    {
        title: () => i18n.t('admin.menu.libraries'),
        url: "libraries",
        icon: <GameControllerIcon/>
    },
    {
        title: () => i18n.t('admin.menu.requests'),
        url: "requests",
        icon: <DiscIcon/>
    },
    {
        title: () => i18n.t('admin.menu.downloads'),
        url: "downloads",
        icon: <DownloadSimpleIcon/>
    },
    {
        title: () => i18n.t('admin.menu.users'),
        url: "users",
        icon: <UsersIcon/>
    },
    {
        title: () => i18n.t('admin.menu.sso'),
        url: "sso",
        icon: <LockKeyIcon/>
    },
    {
        title: () => i18n.t('admin.menu.messages'),
        url: "messages",
        icon: <EnvelopeIcon/>
    },
    {
        title: () => i18n.t('admin.menu.plugins'),
        url: "plugins",
        icon: <PlugIcon/>
    },
    {
        title: () => i18n.t('admin.menu.proxy'),
        url: "proxy",
        icon: <GlobeIcon/>
    },
    {
        title: () => i18n.t('admin.menu.logs'),
        url: "logs",
        icon: <LogIcon/>
    },
    {
        title: () => i18n.t('admin.menu.system'),
        url: "system",
        icon: <WrenchIcon/>
    }
]

export const AdministrationView = withSideMenu("/administration", menuItems);
export default AdministrationView;