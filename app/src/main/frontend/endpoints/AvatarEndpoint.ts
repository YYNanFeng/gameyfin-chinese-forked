import {fetchWithAuth} from "Frontend/util/utils";
import {addToast} from "@heroui/react";
import i18n from "Frontend/i18n";

export async function uploadAvatar(avatar: any) {
    const formData = new FormData();
    formData.append("file", avatar);

    const response = await fetchWithAuth("images/avatar/upload", formData);

    const result = await response.text();

    if (response.ok) {
        window.location.reload();
    } else {
        addToast({
            title: i18n.t('avatar.errorUploading'),
            description: result,
            color: "danger"
        });
    }
}

export async function removeAvatar() {
    const response = await fetchWithAuth("images/avatar/delete")

    const result = await response.text();

    if (response.ok) {
        window.location.reload();
    } else {
        addToast({
            title: i18n.t('avatar.errorRemoving'),
            description: result,
            color: "danger"
        });
    }
}

export async function removeAvatarByName(name: string) {
    const response = await fetchWithAuth("images/avatar/deleteByName?" + new URLSearchParams({name: name}))

    const result = await response.text();

    if (response.ok) {
        window.location.reload();
    } else {
        addToast({
            title: i18n.t('avatar.errorRemoving'),
            description: result,
            color: "danger"
        });
    }
}