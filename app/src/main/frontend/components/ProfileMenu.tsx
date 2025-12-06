import {useAuth} from "Frontend/util/auth";
import { GearFineIcon, QuestionIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {useNavigate} from "react-router";
import Avatar from "Frontend/components/general/Avatar";
import {CollectionElement} from "@react-types/shared";
import {isAdmin} from "Frontend/util/utils";
import {useTranslation} from "react-i18next";

export default function ProfileMenu() {
    const auth = useAuth();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const profileMenuItems = [
        {
            label: t('profile.myProfile'),
            icon: <UserIcon/>,
            onClick: () => navigate("/settings/profile")
        },
        {
            label: t('routes.administration'),
            icon: <GearFineIcon/>,
            onClick: () => navigate("/administration/libraries"),
            showIf: isAdmin(auth)
        },
        {
            label: t('profile.help'),
            icon: <QuestionIcon/>,
            onClick: () => window.open("https://gameyfin.org", "_blank")
        },
        {
            label: t('profile.signOut'),
            icon: <SignOutIcon/>,
            onClick: auth.logout,
            color: "primary"
        },
    ];

    // @ts-ignore
    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                {/* div is necessary so dropdown menu will appear in the correct place */}
                <div>
                    <Avatar radius="full"
                            as="button"
                            className="transition-transform size-8"
                            classNames={{
                                base: "gradient-primary",
                                icon: "text-background/80"
                            }}
                    />
                </div>
            </DropdownTrigger>
            <DropdownMenu disabledKeys={["username"]}>
                <DropdownItem key="username" textValue={auth.state.user?.username}>
                    <p className="font-bold">{t('profile.signedInAs', {username: auth.state.user?.username})}</p>
                </DropdownItem>
                {profileMenuItems.filter(item => item.showIf !== false).map(({label, icon, onClick, color}) => {
                    return (
                        <DropdownItem
                            key={label}
                            onPress={onClick}
                            startContent={<div color={color}>{icon}</div>}
                            /* @ts-ignore */
                            color={color ? color : ""}
                            className={`text-${color} hover:bg-primary/20`}
                            textValue={label}
                        >
                            {label}
                        </DropdownItem>
                    );
                }) as unknown as CollectionElement<object>}
            </DropdownMenu>
        </Dropdown>
    );
}