import "babylonjs-materials";

import { createEditor } from "./editor/main";

window["CANNON"] = require("cannon");

window.addEventListener("DOMContentLoaded", () => {
    createEditor();
});
