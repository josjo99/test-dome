import React, { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import {  Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ActionManager, DeepImmutableObject, ExecuteCodeAction, FreeCamera, HighlightLayer, Mesh, MeshBuilder, SceneLoader, StandardMaterial, Texture } from "@babylonjs/core/Legacy/legacy";
import "@babylonjs/loaders/glTF";

const Viewer =() => {
    const reactCanvas = useRef<any>(null);
    const engine = useRef<Engine|null>(null);
    const scene = useRef<Scene|null>(null);
    const camera = useRef<FreeCamera|null>(null);
    const targetPosition = useRef<Vector3>();
    const highlighLayer = useRef<HighlightLayer|null>(null);
    const skyBox = useRef<Mesh|null>(null);

    useEffect(()=>{
        if (reactCanvas?.current) {
            initializeEnvironment();
        }
    // eslint-disable-next-line
    }, [reactCanvas]);

    const addCamera = () => {
        if(scene.current){
            camera.current = new FreeCamera(
                'Camera',
                new Vector3(0, 10, 0),
                scene.current
            );
            camera.current.inputs.remove(camera.current.inputs.attached.keyboard);
            camera.current.attachControl(reactCanvas.current, true);
            // camera.current. = 0.01; //Camera to rotate around model as if on a rotating podium
        }   
    };

    const addFloorMesh = () => {
        SceneLoader.ImportMesh(
            "", 
            "", 
            "https://raw.githubusercontent.com/josjo99/ship-resources/main/meshes/Floor.glb", 
            scene.current, 
            (meshes) => {
                const mesh = meshes[0];
                const ground = mesh.getChildMeshes(true, (node) => node.name.toLowerCase().includes("ground"));
                ground[0].setEnabled(false);
                mesh.position = new Vector3(0,-40, 0);
                mesh.scaling = new Vector3(50,1,50);
                initializeHotspots();
            }
        );
    }

    const addSkyBox = () => {
        if(scene.current){
            skyBox.current = MeshBuilder.CreateSphere("skyBox", { diameter: 500 }, scene.current);
        }
        changeSkyBoxTexture();
    }

    const changeSkyBoxTexture = (meshName?: string) => {
        if(scene.current && skyBox.current){
            let hdrTexture: Texture = new Texture("https://raw.githubusercontent.com/josjo99/ship-resources/main/textures/Circle.jpg", scene.current);
            if(meshName !== undefined){
                hdrTexture = new Texture(`https://raw.githubusercontent.com/josjo99/ship-resources/main/textures/${meshName}.jpg`, scene.current);
                skyBox.current.material?.dispose();
            }
            const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene.current);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = hdrTexture
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
            skyBox.current.material = skyboxMaterial;
        }
    }

    const initializeHotspots = () => {
        if(scene.current){
            const hotspots = scene.current.getTransformNodeByName("Hotspots");
            const hotspotMeshes = hotspots?.getChildMeshes();
            if(hotspotMeshes !== undefined){
                for(let mesh of hotspotMeshes){
                    if(mesh.actionManager === null){
                        mesh.actionManager = new ActionManager();
                    }
                    mesh.actionManager.registerAction(
                        new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
                            const endPosition = mesh.getAbsolutePosition();
                            targetPosition.current = endPosition.add(new Vector3(0,50,0));
                            changeSkyBoxTexture(mesh.name);
                        })
                    );
                    mesh.actionManager.registerAction( 
                        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
                            if(highlighLayer.current){
                                highlighLayer.current.addMesh(mesh as Mesh, Color3.White());
                            }
                        })
                    );
                    mesh.actionManager.registerAction( 
                        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
                            if(highlighLayer.current){
                                highlighLayer.current.removeMesh(mesh as Mesh);
                            }
                        })
                    )
                }
            }
        }
    }

    const cameraControl = () => {
        if(camera.current){
            if(targetPosition.current){
                camera.current.position = Vector3.Lerp(camera.current.position, targetPosition.current as DeepImmutableObject<Vector3> , 0.04);
            }
            if(camera.current.position === targetPosition.current){
                targetPosition.current = undefined;
            }
        }
    }

    const addHighlightLayer = () => {
        if(scene.current){
            highlighLayer.current = new HighlightLayer("highlightLayer", scene.current);
        }
    }

    const addLight = () => {
        if(scene.current){
            const hemisphericLight = new HemisphericLight(
                'HemisphericLight',
                new Vector3(0, 1, 0),
                scene.current
            );
            hemisphericLight.intensity = 0.4;
        }
    };
 
    const initializeEnvironment = () => {
        engine.current = new Engine(reactCanvas.current,true);
        scene.current = new Scene(engine.current);
        // scene.current.debugLayer.show({
        //     overlay:true,
        //     showExplorer: true,
        //     showInspector: true
        // });
        addCamera();
        addLight();
        addFloorMesh()
        addSkyBox();
        addHighlightLayer();
        scene.current.registerBeforeRender(function () {
            cameraControl();
        });
        engine.current.runRenderLoop(() => {
            if(scene.current){
                if (camera.current) {
                    scene.current.render();
                }
            }
        });
    }
        
    return (
        <canvas width={window.innerWidth} height={window.innerHeight}ref={reactCanvas} />
    )
}

export default Viewer;
