import { useState } from "react";

import { IEditorInspectorFieldProps, setInspectorEffectivePropertyValue, getInspectorPropertyValue } from "./field";

export interface IEditorInspectorNumberFieldProps extends IEditorInspectorFieldProps {
    onChange?: (value: number) => void;
}

export function EditorInspectorNumberField(props: IEditorInspectorNumberFieldProps) {
    const [pointerDown, setPointerDown] = useState(false);
    const [value, setValue] = useState<string>(getInspectorPropertyValue(props.object, props.property)?.toString() ?? "");

    return (
        <div className="flex gap-2 items-center px-2">
            {props.label &&
                <div className="w-1/2 text-ellipsis overflow-hidden whitespace-nowrap">
                    {props.label}
                </div>
            }

            <input
                type="text"
                value={value}
                onChange={(ev) => {
                    setValue(ev.currentTarget.value);

                    const float = parseFloat(ev.currentTarget.value);
                    if (!isNaN(float)) {
                        setInspectorEffectivePropertyValue(props.object, props.property, float);
                        props.onChange?.(float);
                    }
                }}
                style={{
                    cursor: pointerDown ? "ew-resize" : "auto",
                }}
                className="px-5 py-2 rounded-lg bg-black/50 text-white/75 outline-none w-full"
                onPointerDown={(ev) => {
                    setPointerDown(true);

                    document.body.style.cursor = "ew-resize";

                    let v = parseFloat(value);
                    if (isNaN(v)) {
                        v = 0;
                    }

                    let startX = ev.clientX;

                    let mouseUpListener: () => void;
                    let mouseMoveListener: (ev: MouseEvent) => void;

                    document.body.addEventListener("mousemove", mouseMoveListener = (ev) => {
                        v += (ev.clientX - startX) * 0.01;
                        startX = ev.clientX;

                        setValue(v.toFixed(2));
                        setInspectorEffectivePropertyValue(props.object, props.property, v);
                        props.onChange?.(v);
                    });

                    document.body.addEventListener("mouseup", mouseUpListener = () => {
                        setPointerDown(false);
                        setValue(v.toFixed(2));

                        document.body.style.cursor = "auto";

                        document.body.removeEventListener("mouseup", mouseUpListener);
                        document.body.removeEventListener("mousemove", mouseMoveListener);
                    });
                }}
            />
        </div>
    );
}
