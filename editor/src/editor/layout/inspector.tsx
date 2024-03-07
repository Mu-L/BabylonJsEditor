import { Component, ReactNode } from "react";
import { Divider, Icon, NonIdealState } from "@blueprintjs/core";

import { Tools } from "babylonjs";

import { Editor } from "../main";

import { IEditorInspectorImplementationProps } from "./inspector/inspector";

import { EditorMeshInspector } from "./inspector/mesh";
import { EditorFileInspector } from "./inspector/file";

export interface IEditorInspectorProps {
    /**
     * The editor reference.
     */
    editor: Editor;
}

export interface IEditorInspectorState {
    editedObject: unknown | null;
}

export class EditorInspector extends Component<IEditorInspectorProps, IEditorInspectorState> {
    private static _Inspectors: ((new (props: IEditorInspectorImplementationProps<any>) => Component<IEditorInspectorImplementationProps<any>>) & { IsSupported(object: any): boolean; })[] = [
        EditorMeshInspector,
        EditorFileInspector,
    ];

    public constructor(props: IEditorInspectorProps) {
        super(props);

        this.state = {
            editedObject: null,
        };
    }

    public render(): ReactNode {
        return (
            <div className="flex flex-col gap-2 w-full h-full p-2">
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-5 py-2 rounded-lg bg-black/50 text-white/75 outline-none"
                />

                <Divider />

                <div className="flex flex-col gap-2 h-full">
                    {this._getContent()}
                </div>
            </div>
        );
    }

    /**
     * Sets the edited object.
     * @param editedObject defines the edited object.
     */
    public setEditedObject(editedObject: unknown): void {
        this.setState({ editedObject });
    }

    private _getContent(): ReactNode {
        if (!this.state.editedObject) {
            return <NonIdealState
                icon={<Icon icon="search" size={96} />}
                title={
                    <div className="text-white">
                        No object selected
                    </div>
                }
            />;
        }

        const inspectors = EditorInspector._Inspectors
            .filter((i) => i.IsSupported(this.state.editedObject))
            .map((i) => ({ inspector: i }));

        return inspectors.map((i) => (
            <i.inspector key={Tools.RandomId()} object={this.state.editedObject} />
        ));
    }
}
