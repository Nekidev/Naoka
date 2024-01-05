export enum InputType {
    Select,
    Text,
    TextArea,
    CheckboxGroup,
    RadioGroup,
}

interface Input {
    type: InputType;
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string;
}

export interface SelectInput extends Input {
    type: InputType.Select;
    icon?: JSX.Element;
    options: {
        label: string;
        value: string;
        disabled?: boolean;
    }[];
}

export interface TextInput extends Input {
    type: InputType.Text;
    icon?: JSX.Element;
    valueType?: "text" | "password";
}

export interface TextAreaInput extends Input {
    type: InputType.TextArea;
}

export interface CheckboxGroup extends Input {
    type: InputType.CheckboxGroup;
    options: {
        label: string;
        value: string;
        description?: string;
        defaultChecked?: boolean;
    }[];
}

export interface RadioGroup extends Input {
    type: InputType.RadioGroup;
    options: {
        label: string;
        value: string;
        description?: string;
    }[];
}

type DefaultInputType =
    | SelectInput
    | TextInput
    | TextAreaInput
    | CheckboxGroup
    | RadioGroup;
export default DefaultInputType;
