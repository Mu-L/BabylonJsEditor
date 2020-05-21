import { join, extname } from "path";
import { copy } from "fs-extra";

import { Undefinable } from "../../../shared/types";

import * as React from "react";
import { ButtonGroup, Button, Classes } from "@blueprintjs/core";

import { Sound, PickingInfo, Vector3 } from "babylonjs";

import { Project } from "../project/project";
import { IFile } from "../project/files";

import { Tools } from "../tools/tools";

import { Assets } from "../components/assets";
import { AbstractAssets, IAssetComponentItem } from "./abstract-assets";

export class SoundAssets extends AbstractAssets {
    /**
     * Defines the size of assets to be drawn in the panel. Default is 100x100 pixels.
     * @override
     */
    protected size: number = 50;

    private _extensions: string[] = [".mp3", ".wav", ".wave"];

    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        const node = super.render();

        return (
            <>
                <div className={Classes.FILL} key="sounds-toolbar" style={{ width: "100%", height: "25px", backgroundColor: "#333333", borderRadius: "10px", marginTop: "5px" }}>
                    <ButtonGroup>
                        <Button key="refresh-folder" icon="refresh" small={true} onClick={() => this.refresh()} />
                    </ButtonGroup>
                </div>
                {node}
            </>
        );
    }

    /**
     * Refreshes the component.
     * @override
     */
    public async refresh(): Promise<void> {
        for (const s of this.editor.scene!.mainSoundTrack.soundCollection) {
            s.metadata = s.metadata ?? { };
            if (!s.metadata.id) { s.metadata.id = Tools.RandomId(); }

            const item = this.items.find((i) => i.key === s.metadata.id);
            if (item) { continue; }

            this.items.push({ key: s.metadata.id, id: s.name, base64: "../css/svg/volume-up.svg" });
        }

        return super.refresh();
    }

    /**
     * Called on the user drops files in the assets component and returns true if the files have been computed.
     * @param files the list of files being dropped.
     */
    public async onDropFiles(files: IFile[]): Promise<void> {
        for (const file of files) {
            const extension = extname(file.name).toLowerCase();
            if (this._extensions.indexOf(extension) === -1) { continue; }

            // Create sound
            new Sound(file.name, file.path, this.editor.scene!, () => {
                // Nothing to do at the moment.
            }, {
                autoplay: false,
            });

            // Copy assets
            const dest = join(Project.DirPath!, "files", file.name);
            if (dest) { await copy(file.path, dest); }
        }

        return this.refresh();
    }

    /**
     * Called on the user drops an asset in editor. (typically the preview canvas).
     * @param item the item being dropped.
     * @param pickInfo the pick info generated on the drop event.
     * @override
     */
    public onDropAsset(item: IAssetComponentItem, pickInfo: PickingInfo): void {
        if (!pickInfo.pickedMesh) { return; }

        const sound = this._getSound(item);
        if (!sound) { return; }

        if (sound["_connectedTransformNode"]) {
            sound.detachFromMesh();
            sound.setPosition(Vector3.Zero());
        }

        sound.attachToMesh(pickInfo.pickedMesh);
        sound.setPosition(Vector3.Zero());
        sound.spatialSound = true;
        
        this.editor.graph.refresh();
    }

    /**
     * Called on the user double clicks an item.
     * @param item the item being double clicked.
     * @param img the double-clicked image element.
     */
    public async onDoubleClick(item: IAssetComponentItem, img: HTMLImageElement): Promise<void> {
        super.onDoubleClick(item, img);

        const sound = this._getSound(item);
        if (!sound) { return; }

        this.editor.inspector.setSelectedObject(sound);
    }

    /**
     * Returns the sound according to the given item.
     */
    private _getSound(item: IAssetComponentItem): Undefinable<Sound> {
        return this.editor.scene!.mainSoundTrack.soundCollection.find((s) => s.metadata?.id === item.key);
    }
}

Assets.addAssetComponent({
    title: "Sounds",
    ctor: SoundAssets,
});