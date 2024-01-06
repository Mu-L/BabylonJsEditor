import { extname, basename } from "path/posix";

import { ipcRenderer } from "electron";

import { Component, ReactNode } from "react";
import { Button, Divider, Menu, MenuItem, Popover } from "@blueprintjs/core";

import { CubeTexture, Engine, GizmoCoordinatesMode, PointerEventTypes, Scene, Vector3 } from "babylonjs";

import { Editor } from "../main";

import { EditorCamera } from "../nodes/camera";

import { PositionIcon } from "../../ui/icons/position";
import { RotationIcon } from "../../ui/icons/rotation";
import { ScalingIcon } from "../../ui/icons/scaling";

import { SpinnerUIComponent } from "../../ui/spinner";

import { EditorPreviewGizmo } from "./preview/gizmo";
import { EditorPreviewIcons } from "./preview/icons";
import { configureImportedTexture, loadImportedSceneFile } from "./preview/import";
import { waitNextAnimationFrame } from "../../tools/tools";

export interface IEditorPreviewProps {
    /**
     * The editor reference.
     */
    editor: Editor;
}

export interface IEditorPreviewState {
    /**
     * Defines the active gizmo.
     */
    activeGizmo: "position" | "rotation" | "scaling" | "none";

    informationMessage: string;
}

export class EditorPreview extends Component<IEditorPreviewProps, IEditorPreviewState> {
    /**
     * The engine of the preview.
     */
    public engine: Engine;
    /**
     * The scene of the preview.
     */
    public scene: Scene;
    /**
     * The camera of the preview.
     */
    public camera: EditorCamera;

    /**
     * The gizmo manager of the preview
     */
    public gizmo: EditorPreviewGizmo;
    /**
     * The icons manager of the preview.
     */
    public icons: EditorPreviewIcons;

    private _renderScene: boolean = true;

    public constructor(props: IEditorPreviewProps) {
        super(props);

        this.state = {
            activeGizmo: "none",
            informationMessage: "",
        };

        ipcRenderer.on("gizmo:position", () => this._handleSetActiveGizmo("position"));
        ipcRenderer.on("gizmo:rotation", () => this._handleSetActiveGizmo("rotation"));
        ipcRenderer.on("gizmo:scaling", () => this._handleSetActiveGizmo("scaling"));
    }

    public render(): ReactNode {
        return (
            <div className="relative flex flex-col w-full h-full">
                {this._getToolbar()}

                <canvas
                    ref={(r) => this._onGotCanvasRef(r!)}
                    onDrop={(ev) => this._handleDrop(ev)}
                    onDragOver={(ev) => ev.preventDefault()}
                    className="w-full h-full select-none outline-none transition-all duration-300"
                />

                <EditorPreviewIcons ref={(r) => this._onGotIconsRef(r!)} editor={this.props.editor} />

                <div
                    style={{
                        opacity: this.state.informationMessage ? "1" : "0",
                        top: this.state.informationMessage ? "30px" : "-50px",
                    }}
                    className="absolute left-0 flex gap-2 items-center px-2 h-10 bg-black/50 transition-all duration-300 pointer-events-none"
                >
                    <SpinnerUIComponent width="16" />
                    <div>{this.state.informationMessage}</div>
                </div>
            </div>
        );
    }

    /**
     * Sets whether or not to render the scene.
     * @param render defines whether or not to render the scene.
     */
    public setRenderScene(render: boolean): void {
        this._renderScene = render;
    }

    private _onGotIconsRef(ref: EditorPreviewIcons): void {
        if (this.icons) {
            return;
        }

        waitNextAnimationFrame().then(() => {
            this.icons = ref;
            this.icons.run();
        });
    }

    private _onGotCanvasRef(canvas: HTMLCanvasElement): void {
        if (this.engine) {
            return;
        }

        this.engine = new Engine(canvas, true, {
            stencil: true,
            antialias: true,
            audioEngine: true,
            disableWebGL2Support: false,
            powerPreference: "high-performance",
            premultipliedAlpha: false,
            failIfMajorPerformanceCaveat: false,
            useHighPrecisionFloats: true,
            adaptToDeviceRatio: true,
            preserveDrawingBuffer: true,
        });

        this.scene = new Scene(this.engine);

        this.camera = new EditorCamera("camera", Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true);

        // require("babylonjs").SceneLoader.AppendAsync("scenes/", "scene.babylon", this.scene).then(() => {
        //     this.scene.activeCamera = this.camera;
        //     this.props.editor.layout.inspector.setEditedObject(this.scene.meshes[0]);
        // });
        this.gizmo = new EditorPreviewGizmo(this.scene);

        this.engine.hideLoadingUI();

        this.engine.runRenderLoop(() => {
            if (this._renderScene) {
                this.scene.render();
            }
        });

        this.scene.onPointerObservable.add((ev) => {
            if (ev.type !== PointerEventTypes.POINTERTAP) {
                return;
            }

            const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pick.pickedMesh) {
                this.gizmo.setAttachedNode(pick.pickedMesh);
                this.props.editor.layout.graph.setSelectedNode(pick.pickedMesh);
                this.props.editor.layout.inspector.setEditedObject(pick.pickedMesh);
            }
        });

        this.forceUpdate();
    }

    private _getToolbar(): ReactNode {
        return (
            <div className="flex justify-between h-8 bg-[#222222] w-full">
                <div className="flex gap-2 h-full">
                    <Popover minimal position="bottom-left" content={this._getCameraMenu()} onOpening={() => this.forceUpdate()}>
                        <Button minimal icon="camera" text="Camera" rightIcon="caret-down" className="text-white" />
                    </Popover>

                    <Divider />

                    <Button active={this.state.activeGizmo === "position"} onClick={() => this._handleSetActiveGizmo("position")} minimal icon={<PositionIcon width={16} color="white" />} className="transition-all duration-300" />
                    <Button active={this.state.activeGizmo === "rotation"} onClick={() => this._handleSetActiveGizmo("rotation")} minimal icon={<RotationIcon width={16} color="white" />} className="transition-all duration-300" />
                    <Button active={this.state.activeGizmo === "scaling"} onClick={() => this._handleSetActiveGizmo("scaling")} minimal icon={<ScalingIcon height={16} color="white" />} className="transition-all duration-300" />

                    <Popover minimal position="bottom-left" content={this._getGizmoCoordinatesMode()}>
                        <Button minimal text={this.gizmo?.getCoordinatesModeString().toString()} rightIcon="caret-down" className="text-white" />
                    </Popover>
                </div>
            </div>
        );
    }

    private _getCameraMenu(): JSX.Element {
        return (
            <Menu>
                {this.scene?.cameras.map((c, index) => (
                    <MenuItem
                        key={index}
                        text={c.name ?? "Unnamed Camera"}
                        onClick={() => {
                            this.scene.activeCamera?.detachControl();

                            this.scene.activeCamera = c;
                            this.scene.activeCamera.attachControl(true);
                        }}
                        icon={this.scene.activeCamera === c ? "tick" : "blank"}
                    />
                ))}
            </Menu>
        );
    }

    private _getGizmoCoordinatesMode(): JSX.Element {
        return (
            <Menu>
                <MenuItem
                    text="World"
                    onClick={() => {
                        this.gizmo?.setCoordinatesMode(GizmoCoordinatesMode.World);
                        this.forceUpdate();
                    }}
                    icon={this.gizmo?.getCoordinateMode() === GizmoCoordinatesMode.World ? "tick" : "blank"}
                />
                <MenuItem
                    text="Local"
                    onClick={() => {
                        this.gizmo?.setCoordinatesMode(GizmoCoordinatesMode.Local);
                        this.forceUpdate();
                    }}
                    icon={this.gizmo?.getCoordinateMode() === GizmoCoordinatesMode.Local ? "tick" : "blank"}
                />
            </Menu>
        );
    }

    private _handleSetActiveGizmo(gizmo: "position" | "rotation" | "scaling" | "none"): void {
        this.gizmo.setGizmoType(gizmo);
        this.setState({ activeGizmo: gizmo });
    }

    private _handleDrop(ev: React.DragEvent<HTMLCanvasElement>): void {
        const absolutePath = ev.dataTransfer.getData("asset");
        if (typeof (absolutePath) !== "string") {
            return;
        }

        const extension = extname(absolutePath).toLowerCase();
        switch (extension) {
            case ".glb":
            case ".gltf":
            case ".fbx":
            case ".babylon":
            case ".obj":
            case ".3ds":
            case ".blend":
                this.setState({ informationMessage: `Importing scene "${basename(absolutePath)}"...` });
                loadImportedSceneFile(this.props.editor.layout.preview.scene, absolutePath).then(() => {
                    this.setState({ informationMessage: "" });
                });
                break;

            case ".env":
                this.props.editor.layout.preview.scene.environmentTexture?.dispose();
                this.props.editor.layout.preview.scene.environmentTexture = configureImportedTexture(CubeTexture.CreateFromPrefilteredData(
                    absolutePath,
                    this.props.editor.layout.preview.scene,
                ));
                break;
        }
    }
}
