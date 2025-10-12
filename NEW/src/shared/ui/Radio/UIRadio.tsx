import * as RadioGroup from "@radix-ui/react-radio-group";
import "./UIRadio.scss";

type RadioItem = {
    label?: string;
    value: string;
    disabled?: boolean;
};
type UIRadioProps = {
    name?: string;
    direction?: string;
    items?: RadioItem[];
    defaultValue?: string; // 기본값 추가
    onItemSelect: (value: string) => void;
};

export const UIRadio = ({ onItemSelect, name, items = [], direction = "row", defaultValue }: UIRadioProps) => {
    return (
        <RadioGroup.Root
            className={`radio__root ${"flex-direction-" + direction}`}
            onValueChange={onItemSelect} // 부모에게 선택된 값을 전달
            defaultValue={defaultValue} // 기본 선택값 설정
        >
            {items.map((item) => (
                <div className={`radio__box ${item.disabled ? "is-disabled" : ""}`} key={item.value}>
                    <RadioGroup.Item
                        id={name + "-" + item.value}
                        className="radio__item"
                        value={item.value}
                        disabled={item.disabled}
                    />
                    <label htmlFor={name + "-" + item.value} className="radio__label fs-15 ml-5">
                        {item.label}
                    </label>
                </div>
            ))}
        </RadioGroup.Root>
    );
};