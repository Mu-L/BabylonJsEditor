import { Bone, Camera, GroundMesh, Light, Mesh, Node, TransformNode } from "babylonjs";

/**
 * Returns wether or not the given object is an AbstractMesh.
 * @param object defines the reference to the object to test its class name.
 */
export function isAbstractMesh(object: any): object is Mesh {
    switch (object.getClassName?.()) {
        case "Mesh":
        case "LineMesh":
        case "GroundMesh":
        case "InstancedMesh":
            return true;
    }

    return false;
}

/**
 * Returns wether or not the given object is a Mesh.
 * @param object defines the reference to the object to test its class name.
 */
export function isMesh(object: any): object is Mesh {
    switch (object.getClassName?.()) {
        case "Mesh":
        case "GroundMesh":
            return true;
    }

    return false;
}

/**
 * Returns wether or not the given object is a Bone.
 * @param object defines the reference to the object to test its class name.
 */
export function isBone(object: any): object is Bone {
    return object.getClassName?.() === "Bone";
}

/**
 * Returns wether or not the given object is a GroundMesh.
 * @param object defines the reference to the object to test its class name.
 */
export function isGroundMesh(object: any): object is GroundMesh {
    return object.getClassName?.() === "GroundMesh";
}

/**
 * Returns wether or not the given object is a TransformNode.
 * @param object defines the reference to the object to test its class name.
 */
export function isTransformNode(object: any): object is TransformNode {
    return object.getClassName?.() === "TransformNode";
}

/**
 * Returns wether or not the given object is a Camera.
 * @param object defines the reference to the object to test its class name.
 */
export function isCamera(object: any): object is Camera {
    switch (object.getClassName?.()) {
        case "Camera":
        case "FreeCamera":
        case "TargetCamera":
        case "EditorCamera":
        case "ArcRotateCamera":
        case "UniversalCamera":
            return true;
    }

    return false;
}

/**
 * Returns wether or not the given object is a Light.
 * @param object defines the reference to the object to test its class name.
 */
export function isLight(object: any): object is Light {
    switch (object.getClassName?.()) {
        case "Light":
        case "PointLight":
        case "SpotLight":
        case "DirectionalLight":
        case "HemisphericLight":
            return true;
    }

    return false;
}

/**
 * Returns wether or not the given object is a Node.
 * @param object defines the reference to the object to test its class name.
 */
export function isNode(object: any): object is Node {
    return isAbstractMesh(object) || isTransformNode(object) || isLight(object) || isCamera(object);
}
