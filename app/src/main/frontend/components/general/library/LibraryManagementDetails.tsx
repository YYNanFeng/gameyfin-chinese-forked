import LibraryDto from "Frontend/generated/org/gameyfin/app/libraries/dto/LibraryDto";
import {CheckIcon} from "@phosphor-icons/react";
import {addToast, Button} from "@heroui/react";
import React from "react";
import {useTranslation} from "react-i18next";
import {Form, Formik} from "formik";
import {deepDiff} from "Frontend/util/utils";
import LibraryUpdateDto from "Frontend/generated/org/gameyfin/app/libraries/dto/LibraryUpdateDto";
import {LibraryEndpoint} from "Frontend/generated/endpoints";
import Input from "Frontend/components/general/input/Input";
import DirectoryMappingInput from "Frontend/components/general/input/DirectoryMappingInput";
import Section from "Frontend/components/general/Section";
import {useNavigate} from "react-router";
import * as Yup from "yup";
import ArrayInputAutocomplete from "Frontend/components/general/input/ArrayInputAutocomplete";
import {useSnapshot} from "valtio/react";
import {platformState} from "Frontend/state/PlatformState";

interface LibraryManagementDetailsProps {
    library: LibraryDto;
}

export default function LibraryManagementDetails({library}: LibraryManagementDetailsProps) {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [librarySaved, setLibrarySaved] = React.useState(false);
    const availablePlatforms = useSnapshot(platformState).available;

    async function handleSubmit(values: LibraryDto): Promise<void> {
        const changed = deepDiff(library, values) as LibraryUpdateDto;

        if (Object.keys(changed).length === 0) return;

        changed.id = library.id;
        await LibraryEndpoint.updateLibrary(changed);
        setLibrarySaved(true);
        setTimeout(() => setLibrarySaved(false), 2000);
    }

    async function handleDelete(): Promise<void> {
        try {
            await LibraryEndpoint.deleteLibrary(library.id);

            addToast({
                title: t('libraryDetails.deleted'),
                description: t('libraryDetails.deletedDesc', {name: library.name}),
                color: "success"
            });

            navigate("/administration/libraries");
        } catch (e) {
            addToast({
                title: t('libraryDetails.deleteError'),
                description: t('libraryDetails.deleteErrorDesc', {name: library.name}),
                color: "warning"
            });
        }
    }

    return <Formik
        initialValues={library}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validationSchema={Yup.object({
            name: Yup.string()
                .required("Library name is required")
                .max(255, "Library name must be 255 characters or less"),
            directories: Yup.array()
                .of(Yup.object())
                .min(1, "At least one directory is required")
        })}
    >
        {(formik) => (
            <Form>
                <div className="flex flex-row grow justify-between mb-4">
                    <h1 className="text-2xl font-bold">{t('libraryDetails.editTitle')}</h1>
                    <Button
                        color="primary"
                        isLoading={formik.isSubmitting}
                        isDisabled={formik.isSubmitting || librarySaved || !formik.dirty}
                        type="submit"
                    >
                        {formik.isSubmitting ? "" : librarySaved ? <CheckIcon/> : t('common.save')}
                    </Button>
                </div>

                <Input label={t('libraryDetails.libraryName')} name="name"/>

                <ArrayInputAutocomplete options={Array.from(availablePlatforms)} name="platforms" label={t('libraryDetails.platforms')}/>

                <DirectoryMappingInput name="directories"/>

                <Section title={t('libraryDetails.dangerZone')}/>
                <Button color="danger" onPress={handleDelete}>
                    {t('libraryDetails.deleteLibrary')}
                </Button>
            </Form>
        )}
    </Formik>;
}