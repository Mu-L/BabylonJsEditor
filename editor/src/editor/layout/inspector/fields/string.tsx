import { useState } from "react";

import { IEditorInspectorFieldProps, setInspectorEffectivePropertyValue, getInspectorPropertyValue } from "./field";

export function EditorInspectorStringField(props: IEditorInspectorFieldProps) {
    const [value, setValue] = useState<string>(getInspectorPropertyValue(props.object, props.property) ?? "");

    return (
        <div className="flex gap-2 items-center px-2">
            <div className="w-1/2 text-ellipsis overflow-hidden whitespace-nowrap">
                {props.label}
            </div>

            <input
                type="text"
                value={value}
                onChange={(ev) => {
                    setValue(ev.currentTarget.value);
                    setInspectorEffectivePropertyValue(props.object, props.property, ev.currentTarget.value);
                }}
                className="px-5 py-2 rounded-lg bg-black/50 text-white/75 outline-none w-full"
            />
        </div>
    );
}
