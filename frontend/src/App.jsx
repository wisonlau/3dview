import {useState, useRef, useEffect} from 'react';
import './App.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {LoadModel, GetModelInfo} from "../wailsjs/go/main/App";

function App() {
    const [modelPath, setModelPath] = useState('');
    const [modelInfo, setModelInfo] = useState(null);
    const [modelStats, setModelStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const canvasRef = useRef(null);
    const threeRef = useRef(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;

                // Update canvas size
                const container = canvas.parentElement;
                const newWidth = container.clientWidth;
                const newHeight = Math.min(newWidth * 0.75, window.innerHeight * 0.6);

                canvas.width = newWidth;
                canvas.height = newHeight;

                // Update Three.js if it exists
                if (threeRef.current) {
                    const {camera, renderer} = threeRef.current;

                    // Update camera aspect ratio
                    camera.aspect = newWidth / newHeight;
                    camera.updateProjectionMatrix();

                    // Update renderer size
                    renderer.setSize(newWidth, newHeight);
                }
            }
        };

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Initial resize after a short delay to ensure DOM is ready
        const initialResizeTimeout = setTimeout(() => {
            handleResize();
        }, 100);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(initialResizeTimeout);
        };
    }, []);

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setModelPath(file.name);
            setError('');
            setLoading(true);

            try {
                console.log('Loading file:', file.name);

                // Load model using Wails backend
                await LoadModel(file.name);

                // Get model info
                const info = await GetModelInfo();
                console.log('Model info:', info);
                setModelInfo(info);

                // Load 3D model in Three.js
                loadThreeJSModel(file);
            } catch (err) {
                console.error('Error loading model:', err);
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        }
    };

    const loadThreeJSModel = (file) => {
        // Clear previous Three.js instance completely
        if (threeRef.current) {
            const {scene, camera, renderer, animationId, controls} = threeRef.current;
            
            // Stop animation loop
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Dispose controls
            if (controls) {
                controls.dispose();
            }
            
            // Clear scene and dispose all objects
            if (scene) {
                scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) {
                            object.geometry.dispose();
                        }
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                    if (object.isLight) {
                        object.dispose();
                    }
                });
                scene.clear();
            }
            
            // Dispose renderer properly
            if (renderer) {
                renderer.dispose();
                renderer.forceContextLoss();
            }
        }

        // Get canvas and ensure it's clean
        const canvas = canvasRef.current;

        // Force WebGL context to be recreated by creating a new canvas
        // This ensures the old WebGL context is completely cleaned up
        const oldCanvas = canvas.cloneNode(true);
        canvas.parentNode.replaceChild(oldCanvas, canvas);
        canvasRef.current = oldCanvas;

        // Calculate canvas size based on container
        const container = oldCanvas.parentElement;
        const canvasWidth = container.clientWidth;
        const canvasHeight = Math.min(canvasWidth * 0.75, window.innerHeight * 0.6);
        oldCanvas.width = canvasWidth;
        oldCanvas.height = canvasHeight;

        // Initialize Three.js with new canvas
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({canvas: canvasRef.current, antialias: true});

        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setClearColor(0x1b2636);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-1, -1, -1);
        scene.add(backLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        // Load file
        const reader = new FileReader();
        const fileExt = file.name.split('.').pop().toLowerCase();

        reader.onload = function(e) {
            const contents = e.target.result;
            let loader;
            let model;

            try {
                if (fileExt === 'glb' || fileExt === 'gltf') {
                    loader = new GLTFLoader();
                    if (fileExt === 'glb') {
                        model = loader.parse(contents, '');
                    } else {
                        const json = JSON.parse(contents);
                        model = loader.parse(json, '');
                    }
                    
                    if (model.scene) {
                        scene.add(model.scene);
                        centerModel(model.scene, camera);
                        
                        // Calculate model statistics
                        const stats = calculateModelStats(model.scene);
                        setModelStats(stats);
                    }
                } else if (fileExt === 'obj') {
                    loader = new OBJLoader();
                    model = loader.parse(contents);
                    scene.add(model);
                    centerModel(model, camera);
                    
                    // Calculate model statistics
                    const stats = calculateModelStats(model);
                    setModelStats(stats);
                } else if (fileExt === 'stl') {
                    loader = new STLLoader();
                    const geometry = loader.parse(contents);
                    
                    if (geometry) {
                        const material = new THREE.MeshStandardMaterial({
                            color: 0x667eea,
                            metalness: 0.3,
                            roughness: 0.7
                        });
                        model = new THREE.Mesh(geometry, material);
                        scene.add(model);
                        centerModel(model, camera);
                        
                        // Calculate model statistics
                        const stats = calculateModelStats(model);
                        setModelStats(stats);
                    } else {
                        throw new Error('Failed to parse STL geometry');
                    }
                }
            } catch (err) {
                console.error('Error loading model:', err);
                console.error('File extension:', fileExt);
                console.error('File size:', file.size);
                setError(`Failed to load 3D model: ${err.message}`);
            }
        };

        reader.onerror = function(e) {
            console.error('FileReader error:', e);
            setError('Failed to read file');
        };

        // STL and GLB files should be read as ArrayBuffer
        if (fileExt === 'glb' || fileExt === 'stl') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }

        // Add orbit controls
        const controls = new OrbitControls(camera, canvasRef.current);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Animation loop
        const animate = () => {
            const animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            threeRef.current = {...threeRef.current, animationId};
        };

        threeRef.current = {scene, camera, renderer, controls};
        animate();
    };

    const centerModel = (model, camera) => {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        // Adjust camera position
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
        cameraZ *= 2; // Adjust for better viewing

        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);
    };

    const calculateModelStats = (model) => {
        let vertexCount = 0;
        let triangleCount = 0;
        let totalVolume = 0;
        let totalSurfaceArea = 0;

        model.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                
                // Count vertices
                if (geometry.attributes.position) {
                    vertexCount += geometry.attributes.position.count;
                }

                // Count triangles and calculate surface area
                if (geometry.index) {
                    triangleCount += geometry.index.count / 3;
                    for (let i = 0; i < geometry.index.count; i += 3) {
                        const a = geometry.index.getX(i);
                        const b = geometry.index.getX(i + 1);
                        const c = geometry.index.getX(i + 2);

                        const vA = new THREE.Vector3();
                        const vB = new THREE.Vector3();
                        const vC = new THREE.Vector3();

                        vA.fromBufferAttribute(geometry.attributes.position, a);
                        vB.fromBufferAttribute(geometry.attributes.position, b);
                        vC.fromBufferAttribute(geometry.attributes.position, c);

                        // Calculate triangle area using cross product
                        const edge1 = new THREE.Vector3().subVectors(vB, vA);
                        const edge2 = new THREE.Vector3().subVectors(vC, vA);
                        const area = new THREE.Vector3().crossVectors(edge1, edge2).length() * 0.5;
                        totalSurfaceArea += area;

                        // Calculate volume using tetrahedron formula
                        totalVolume += Math.abs(
                            (vA.x * (vB.y * vC.z - vB.z * vC.y) +
                             vB.x * (vC.y * vA.z - vC.z * vA.y) +
                             vC.x * (vA.y * vB.z - vA.z * vB.y)) / 6
                        );
                    }
                } else if (geometry.attributes.position) {
                    triangleCount += geometry.attributes.position.count / 3;
                    for (let i = 0; i < geometry.attributes.position.count; i += 3) {
                        const vA = new THREE.Vector3();
                        const vB = new THREE.Vector3();
                        const vC = new THREE.Vector3();

                        vA.fromBufferAttribute(geometry.attributes.position, i);
                        vB.fromBufferAttribute(geometry.attributes.position, i + 1);
                        vC.fromBufferAttribute(geometry.attributes.position, i + 2);

                        const edge1 = new THREE.Vector3().subVectors(vB, vA);
                        const edge2 = new THREE.Vector3().subVectors(vC, vA);
                        const area = new THREE.Vector3().crossVectors(edge1, edge2).length() * 0.5;
                        totalSurfaceArea += area;

                        totalVolume += Math.abs(
                            (vA.x * (vB.y * vC.z - vB.z * vC.y) +
                             vB.x * (vC.y * vA.z - vC.z * vA.y) +
                             vC.x * (vA.y * vB.z - vA.z * vB.y)) / 6
                        );
                    }
                }
            }
        });

        // Calculate bounding box and size
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        return {
            vertices: vertexCount,
            triangles: Math.floor(triangleCount),
            sizeX: size.x.toFixed(2),
            sizeY: size.y.toFixed(2),
            sizeZ: size.z.toFixed(2),
            volume: totalVolume.toFixed(2),
            surfaceArea: totalSurfaceArea.toFixed(2)
        };
    };

    return (
        <div className="App">
            <header className="header">
                <h1>🏆 3D Model Viewer</h1>
                <p>View OBJ, GLB, and STL files</p>
            </header>

            <main className="main">
                <div className="controls">
                    <div className="file-upload">
                        <input
                            type="file"
                            id="modelFile"
                            accept=".obj,.glb,.gltf,.stl"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="modelFile" className="upload-btn">
                            📁 Select 3D Model
                        </label>
                    </div>

                    {loading && <div className="loading">Loading model...</div>}
                    {error && <div className="error">{error}</div>}
                </div>

                {modelInfo && (
                    <div className="model-info">
                        <h3>Model Information</h3>
                        <div className="info-item">
                            <span className="label">Format:</span>
                            <span className="value">{modelInfo.format || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">File:</span>
                            <span className="value">{modelPath}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Status:</span>
                            <span className="value">{modelInfo.loaded ? 'Loaded' : 'Not loaded'}</span>
                        </div>
                    </div>
                )}

                {modelStats && (
                    <div className="model-stats">
                        <h3>📊 Model Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Vertices</span>
                                <span className="stat-value">{modelStats.vertices.toLocaleString()}</span>
                                <span className="stat-unit">count</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Triangles</span>
                                <span className="stat-value">{modelStats.triangles.toLocaleString()}</span>
                                <span className="stat-unit">count</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Size X</span>
                                <span className="stat-value">{modelStats.sizeX}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Size Y</span>
                                <span className="stat-value">{modelStats.sizeY}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Size Z</span>
                                <span className="stat-value">{modelStats.sizeZ}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Volume</span>
                                <span className="stat-value">{modelStats.volume}</span>
                                <span className="stat-unit">mm³</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Surface</span>
                                <span className="stat-value">{modelStats.surfaceArea}</span>
                                <span className="stat-unit">mm²</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="viewer">
                    <canvas ref={canvasRef} className="canvas"></canvas>
                    <div className="viewer-instructions">
                        <h4>Controls</h4>
                        <ul>
                            <li>Left-click drag: Rotate model</li>
                            <li>Scroll wheel: Zoom in/out</li>
                            <li>Right-click drag: Pan</li>
                        </ul>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <p>Powered by Wisonlau</p>
            </footer>
        </div>
    );
}

export default App;
