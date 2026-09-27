import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SceneBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 12);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 1.6));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
        keyLight.position.set(4, 6, 8);
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0x7dd3fc, 8, 18);
        fillLight.position.set(-5, 2, 4);
        scene.add(fillLight);

        const warmLight = new THREE.PointLight(0xfda4af, 7, 16);
        warmLight.position.set(5, -3, 3);
        scene.add(warmLight);

        const shapes = [
            { color: 0x38bdf8, position: [-4.8, 2.1, -2], scale: 1.5, rotation: [0.4, 0.2, 0.2] },
            { color: 0xf472b6, position: [4.8, 1.4, -3], scale: 1.35, rotation: [0.2, 0.8, 0.5] },
            { color: 0xfbbf24, position: [4.1, -3.1, -1], scale: 1.1, rotation: [0.7, 0.1, 0.4] },
        ];

        const objects = shapes.map(({ color, position, scale, rotation }) => {
            const geometry = new THREE.TorusKnotGeometry(1, 0.28, 96, 18, 2, 3);
            const material = new THREE.MeshPhysicalMaterial({
                color,
                roughness: 0.3,
                metalness: 0.12,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2,
                transparent: true,
                opacity: 0.2,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...position);
            mesh.scale.setScalar(scale);
            mesh.rotation.set(...rotation);
            scene.add(mesh);
            return mesh;
        });

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        resize();
        window.addEventListener('resize', resize);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let frameId;
        const animate = (time) => {
            const elapsed = time * 0.0003;
            objects.forEach((mesh, index) => {
                if (!reducedMotion) {
                    mesh.rotation.x += 0.0007 + index * 0.0002;
                    mesh.rotation.y += 0.001 + index * 0.0002;
                    mesh.position.y += Math.sin(elapsed + index * 2) * 0.00035;
                }
            });
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            objects.forEach((mesh) => {
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="scene-background" />;
};

export default SceneBackground;
