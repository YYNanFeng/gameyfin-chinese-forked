import {useTranslation} from 'react-i18next';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {GlobeIcon} from '@phosphor-icons/react';

export default function LanguageSwitcher() {
    const {i18n} = useTranslation();

    const languages = [
        {key: 'zh-CN', label: '简体中文'},
        {key: 'en', label: 'English'}
    ];

    const currentLanguage = languages.find(lang => lang.key === i18n.language) || languages[0];

    const changeLanguage = (key: string) => {
        i18n.changeLanguage(key);
        // 可选：将语言偏好保存到用户设置
        localStorage.setItem('preferred-language', key);
    };

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="light"
                    isIconOnly
                    aria-label="Change language"
                >
                    <GlobeIcon size={20}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Language selection"
                selectedKeys={[currentLanguage.key]}
                selectionMode="single"
                onAction={(key) => changeLanguage(key as string)}
            >
                {languages.map((lang) => (
                    <DropdownItem key={lang.key}>
                        {lang.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
