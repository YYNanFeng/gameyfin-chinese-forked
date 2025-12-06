import { PaletteIcon, UserIcon } from "@phosphor-icons/react";
import withSideMenu from "Frontend/components/general/withSideMenu";
import i18n from "Frontend/i18n";

const menuItems = [
    {
        title: () => i18n.t('profile.myProfile'),
        url: "profile",
        icon: <UserIcon/>
    },
    {
        title: () => i18n.t('routes.appearance'),
        url: "appearance",
        icon: <PaletteIcon/>
    },
    /* TODO: Implement account self management
    {
        title: "Manage account",
        url: "account-management",
        icon: <GearFine/>
    }*/
]

export const ProfileView = withSideMenu("/settings", menuItems);
export default ProfileView;