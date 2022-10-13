import React, { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import {  Vector3 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ArcRotateCamera, CubeTexture, EquiRectangularCubeTexture, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core/Legacy/legacy";
import "@babylonjs/loaders/glTF";

const Viewer =() => {
    const reactCanvas = useRef<any>(null);
    const engine = useRef<Engine|null>(null);
    const scene = useRef<Scene|null>(null);
    const camera = useRef<ArcRotateCamera|null>(null);

    useEffect(()=>{
        if (reactCanvas?.current) {
            initializeEnvironment();
        }
    // eslint-disable-next-line
    }, [reactCanvas]);

    const addCamera = () => {
        if(scene.current){
            camera.current = new ArcRotateCamera(
                'Camera',
                2.0944,
                1,
                5,
                new Vector3(0, 0, 0),
                scene.current
            );
            camera.current.attachControl(reactCanvas.current, true);
            camera.current.wheelDeltaPercentage = 0.01; //Camera to rotate around model as if on a rotating podium
        }   
    };

    const addFloorMesh = () => {

    }

    const initializeEnvironment = () => {
        engine.current = new Engine(reactCanvas.current,true);
        scene.current = new Scene(engine.current);
        // scene.current.debugLayer.show({
        //     overlay:true,
        //     showExplorer: true,
        //     showInspector: true
        // });
        addCamera();
        addFloorMesh()
        addLight();
        engine.current.runRenderLoop(() => {
            if(scene.current){
                if (camera.current) {
                    scene.current.render();
                }
            }
        });
    }

    const addLight = () => {
        if(scene.current){
        let hemisphericLight = new HemisphericLight(
            'HemisphericLight',
            new Vector3(0, 1, 0),
            scene.current
            );
            hemisphericLight.intensity = 0.9;

            if(scene.current){
                let hdrTexture = new Texture("https://raw.githubusercontent.com/josjo99/test-file-storage/main/texture.jpg", scene.current);

                var skybox = MeshBuilder.CreateSphere("skyBox", { diameter: 100 }, scene.current);
                var skyboxMaterial = new StandardMaterial("skyBox", scene.current);
                skyboxMaterial.backFaceCulling = false;
                skyboxMaterial.diffuseTexture = hdrTexture
                skybox.material = skyboxMaterial;
            }
        }
    };
        
    return (
        <canvas width={window.innerWidth} height={window.innerHeight}ref={reactCanvas} />
    )
}

export default Viewer;