import ConfigEntryDto from "Frontend/generated/org/gameyfin/app/config/dto/ConfigEntryDto";
import React from "react";
import {useTranslation} from "react-i18next";
import Input from "Frontend/components/general/input/Input";
import CheckboxInput from "Frontend/components/general/input/CheckboxInput";
import SelectInput from "Frontend/components/general/input/SelectInput";
import ArrayInput from "Frontend/components/general/input/ArrayInput";
import NumberInput from "Frontend/components/general/input/NumberInput";
import SliderInput from "Frontend/components/general/input/SliderInput";

export default function ConfigFormField({configElement, ...props}: any) {
    const {t} = useTranslation();
    
    // 尝试从翻译键获取标签，如果不存在则使用原description
    const getLabel = (key: string, fallback: string) => {
        const translationKey = `config.${key.replace(/\./g, '_')}`;
        const translated = t(translationKey);
        return translated === translationKey ? fallback : translated;
    };
    
    function inputElement(configElement: ConfigEntryDto) {
        const label = getLabel(configElement.key, configElement.description);

        if (configElement.allowedValues != null && configElement.allowedValues.length > 0) {
            return (
                <SelectInput label={label} name={configElement.key}
                             values={configElement.allowedValues} {...props}/>
            );
        }

        switch (configElement.type.toLowerCase()) {
            case "boolean":
                return (
                    <CheckboxInput label={label} name={configElement.key} {...props}/>
                );
            case "string":
                return (
                    <Input label={label} name={configElement.key}
                           type={props.type && "text"} {...props}/>
                );
            case "float":
                return (
                    <NumberInput label={label} name={configElement.key}
                                 step={0.1} {...props}/>
                );
            case "int":
                if (configElement.min != null && configElement.max != null) {
                    return (
                        <SliderInput label={label} name={configElement.key}
                                     min={configElement.min}
                                     max={configElement.max}
                                     step={configElement.step ?? 1}
                                     {...props}/>
                    );
                }
                return (
                    <NumberInput label={label} name={configElement.key}
                                 step={1} {...props}/>
                );
            case "array":
                return (
                    <ArrayInput label={label} name={configElement.key} type="text" {...props}/>
                );
            default:
                return <pre>Unsupported type: {configElement.type} for key {configElement.key}</pre>;
        }
    }

    return inputElement(configElement!);
}