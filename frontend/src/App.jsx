import {useState, useRef, useEffect} from 'react';
import './App.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {LoadModel, GetModelInfo, GetVersion, SaveScreenshot} from "../wailsjs/go/main/App";

// Language translations
const translations = {
    en: {
        title: '🏆 3D Model Viewer',
        subtitle: 'View OBJ, GLB, and STL files',
        selectModel: '📁 Select 3D Model',
        loading: 'Loading model...',
        modelInfo: 'Model Information',
        format: 'Format:',
        file: 'File:',
        status: 'Status:',
        loaded: 'Loaded',
        notLoaded: 'Not loaded',
        modelStats: '📊 Model Statistics',
        vertices: 'Vertices',
        triangles: 'Triangles',
        sizeX: 'Size X',
        sizeY: 'Size Y',
        sizeZ: 'Size Z',
        volume: 'Volume',
        surface: 'Surface',
        controls: 'Controls',
        leftClickDrag: 'Left-click drag: Rotate model',
        scrollWheel: 'Scroll wheel: Zoom in/out',
        rightClickDrag: 'Right-click drag: Pan',
        poweredBy: 'Powered by Wisonlau',
        frontView: 'Front',
        leftView: 'Left',
        rightView: 'Right',
        topView: 'Top',
        screenshot: 'Screenshot',
        languageLabel: 'Language',
        consoleTitle: 'Console',
        clearLogs: 'Clear Logs',
        noLogs: 'No logs yet'
    },
    zh: {
        title: '🏆 3D模型查看器',
        subtitle: '查看 OBJ, GLB 和 STL 文件',
        selectModel: '📁 选择3D模型',
        loading: '正在加载模型...',
        modelInfo: '模型信息',
        format: '格式:',
        file: '文件:',
        status: '状态:',
        loaded: '已加载',
        notLoaded: '未加载',
        modelStats: '📊 模型统计',
        vertices: '顶点数',
        triangles: '三角形数',
        sizeX: '尺寸 X',
        sizeY: '尺寸 Y',
        sizeZ: '尺寸 Z',
        volume: '体积',
        surface: '表面积',
        controls: '控制方式',
        leftClickDrag: '左键拖动: 旋转模型',
        scrollWheel: '滚轮: 缩放',
        rightClickDrag: '右键拖动: 平移',
        poweredBy: 'Powered by Wisonlau',
        frontView: '正视图',
        leftView: '左视图',
        rightView: '右视图',
        topView: '俯视图',
        screenshot: '截图',
        languageLabel: '语言',
        consoleTitle: '控制台',
        clearLogs: '清空日志',
        noLogs: '暂无日志'
    }
};

function App() {
    const [modelPath, setModelPath] = useState('');
    const [modelInfo, setModelInfo] = useState(null);
    const [modelStats, setModelStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [version, setVersion] = useState('');
    const [language, setLanguage] = useState('zh');
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [consoleVisible, setConsoleVisible] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const canvasRef = useRef(null);
    const threeRef = useRef(null);
    const clickTimerRef = useRef(null);

    const t = translations[language];

    // Log function
    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        setConsoleLogs(prev => [...prev, { time: timestamp, message, type }].slice(-100));
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    };

    // Handle clicks on "Controls" text to show console
    const handleControlsTitleClick = () => {
        setClickCount(prev => {
            const newCount = prev + 1;

            // Clear existing timer
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }

            // Set new timer to reset count after 3 seconds
            clickTimerRef.current = setTimeout(() => {
                setClickCount(0);
            }, 3000);

            // If clicked 5 times, show console
            if (newCount === 5) {
                setConsoleVisible(true);
                addLog('🔓 Console unlocked (secret mode activated)', 'success');
                return 0; // Reset count
            }

            return newCount;
        });
    };

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

    // Load version info on mount
    useEffect(() => {
        const loadVersion = async () => {
            try {
                const appVersion = await GetVersion();
                setVersion(appVersion);
                addLog('✓ Application version: ' + appVersion);
            } catch (err) {
                console.error('Failed to load version:', err);
                addLog('✗ Failed to load version: ' + err.message, 'error');
            }
        };
        loadVersion();
    }, []);

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setModelPath(file.name);
            setError('');
            setLoading(true);

            addLog('📁 File selected: ' + file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)');

            try {
                console.log('Loading file:', file.name);
                addLog('⏳ Loading model...');

                // Load model using Wails backend
                await LoadModel(file.name);
                addLog('✓ Model loaded via Wails backend');

                // Get model info
                const info = await GetModelInfo();
                console.log('Model info:', info);
                setModelInfo(info);
                addLog('✓ Model info retrieved: ' + info.format + ' format');

                // Load 3D model in Three.js
                loadThreeJSModel(file);
            } catch (err) {
                console.error('Error loading model:', err);
                setError(err.toString());
                addLog('✗ Error loading model: ' + err.message, 'error');
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
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            preserveDrawingBuffer: true // Enable screenshot functionality
        });

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

        // Add grid helper - will be positioned after model is loaded
        const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Load file
        const reader = new FileReader();
        const fileExt = file.name.split('.').pop().toLowerCase();

        reader.onload = function(e) {
            const contents = e.target.result;
            let loader;
            let model;

            try {
                addLog('🔧 Parsing ' + fileExt.toUpperCase() + ' file...');

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
                        centerModel(model.scene, camera, scene);

                        // Calculate model statistics
                        const stats = calculateModelStats(model.scene);
                        setModelStats(stats);

                        // Store model reference for later use
                        threeRef.current = {...threeRef.current, model: model.scene};
                        addLog('✓ GLTF model rendered: ' + stats.vertices.toLocaleString() + ' vertices, ' + stats.triangles.toLocaleString() + ' triangles');
                    }
                } else if (fileExt === 'obj') {
                    loader = new OBJLoader();
                    model = loader.parse(contents);
                    scene.add(model);
                    centerModel(model, camera, scene);

                    // Calculate model statistics
                    const stats = calculateModelStats(model);
                    setModelStats(stats);

                    // Store model reference for later use
                    threeRef.current = {...threeRef.current, model};
                    addLog('✓ OBJ model rendered: ' + stats.vertices.toLocaleString() + ' vertices, ' + stats.triangles.toLocaleString() + ' triangles');
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
                        centerModel(model, camera, scene);

                        // Calculate model statistics
                        const stats = calculateModelStats(model);
                        setModelStats(stats);

                        // Store model reference for later use
                        threeRef.current = {...threeRef.current, model};
                        addLog('✓ STL model rendered: ' + stats.vertices.toLocaleString() + ' vertices, ' + stats.triangles.toLocaleString() + ' triangles');
                    } else {
                        throw new Error('Failed to parse STL geometry');
                    }
                }
            } catch (err) {
                console.error('Error loading model:', err);
                console.error('File extension:', fileExt);
                console.error('File size:', file.size);
                setError(`Failed to load 3D model: ${err.message}`);
                addLog('✗ Failed to load model: ' + err.message, 'error');
            }
        };

        reader.onerror = function(e) {
            console.error('FileReader error:', e);
            setError('Failed to read file');
            addLog('✗ Failed to read file', 'error');
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
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.enableZoom = true;
        controls.enablePan = true;

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

    const centerModel = (model, camera, scene) => {
        const box = new THREE.Box3().setFromObject(model);
        const min = box.min;
        const max = box.max;
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Position model so its bottom is at y=0 (on the grid)
        // And center it horizontally
        model.position.set(-center.x, -min.y, -center.z);
        model.rotation.set(0, 0, 0); // Reset rotation

        // Set grid helper to y=0 (ground level)
        scene.traverse((object) => {
            if (object.isGridHelper) {
                object.position.y = 0;
            }
        });

        // Adjust camera position with correct formula
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);

        // Correct formula: distance = size / (2 * tan(fov/2))
        let cameraZ = maxDim / (2 * Math.tan(fov / 2));
        cameraZ *= 2.5; // Add padding for better view

        // Ensure minimum distance
        cameraZ = Math.max(cameraZ, 5);

        camera.position.set(0, cameraZ * 0.5, cameraZ);
        camera.lookAt(0, size.y / 2, 0);

        // Update camera clipping planes
        camera.near = Math.max(0.1, cameraZ * 0.01);
        camera.far = cameraZ * 10;
        camera.updateProjectionMatrix();

        // Update controls distance limits
        if (threeRef.current && threeRef.current.controls) {
            threeRef.current.controls.minDistance = Math.max(1, cameraZ * 0.1);
            threeRef.current.controls.maxDistance = cameraZ * 5;
            threeRef.current.controls.target.set(0, size.y / 2, 0);
        }
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

    const handleCenterModel = () => {
        if (threeRef.current && threeRef.current.model && threeRef.current.camera) {
            const {model, camera} = threeRef.current;

            // Reset model position to origin
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.set(-center.x, -center.y, -center.z);
            model.rotation.set(0, 0, 0); // Reset rotation

            // Adjust camera position with correct formula
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);

            // Correct formula: distance = size / (2 * tan(fov/2))
            let cameraZ = maxDim / (2 * Math.tan(fov / 2));
            cameraZ *= 2.5; // Add padding for better view

            // Ensure minimum distance
            cameraZ = Math.max(cameraZ, 5);

            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);

            // Update camera clipping planes
            camera.near = Math.max(0.1, cameraZ * 0.01);
            camera.far = cameraZ * 10;
            camera.updateProjectionMatrix();

            // Reset controls with proper distance limits
            if (threeRef.current.controls) {
                threeRef.current.controls.reset();
                threeRef.current.controls.target.set(0, 0, 0);
                threeRef.current.controls.minDistance = Math.max(1, cameraZ * 0.1);
                threeRef.current.controls.maxDistance = cameraZ * 5;
            }
        }
    };

    const handleScreenshot = async () => {
        if (threeRef.current && threeRef.current.renderer) {
            const {renderer, scene, camera} = threeRef.current;

            try {
                addLog('📸 Taking screenshot...');

                // Render one more time to ensure current view is captured
                renderer.render(scene, camera);

                // Force a re-render and wait for it
                await new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        resolve();
                    });
                });

                // Get image data as base64
                const dataURL = renderer.domElement.toDataURL('image/png', 1.0);
                // Remove the "data:image/png;base64," prefix
                const base64Data = dataURL.split(',')[1];

                // Call backend to save file with user-selected location
                await SaveScreenshot(base64Data);
                addLog('✓ Screenshot saved successfully');
            } catch (err) {
                console.error('Error taking screenshot:', err);
                setError('Failed to take screenshot. Please try again.');
                addLog('✗ Failed to take screenshot: ' + err.message, 'error');
            }
        }
    };

    const handleFrontView = () => {
        if (threeRef.current && threeRef.current.model && threeRef.current.camera && threeRef.current.controls) {
            const {model, camera, controls} = threeRef.current;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);

            let distance = maxDim / (2 * Math.tan(fov / 2));
            distance *= 2.5;
            distance = Math.max(distance, 5);

            camera.position.set(0, size.y / 2, distance);
            camera.lookAt(0, size.y / 2, 0);
            controls.target.set(0, size.y / 2, 0);
            controls.update();
            addLog('👁️ Switched to Front View');
        }
    };

    const handleLeftView = () => {
        if (threeRef.current && threeRef.current.model && threeRef.current.camera && threeRef.current.controls) {
            const {model, camera, controls} = threeRef.current;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);

            let distance = maxDim / (2 * Math.tan(fov / 2));
            distance *= 2.5;
            distance = Math.max(distance, 5);

            camera.position.set(-distance, size.y / 2, 0);
            camera.lookAt(0, size.y / 2, 0);
            controls.target.set(0, size.y / 2, 0);
            controls.update();
            addLog('⬅️ Switched to Left View');
        }
    };

    const handleRightView = () => {
        if (threeRef.current && threeRef.current.model && threeRef.current.camera && threeRef.current.controls) {
            const {model, camera, controls} = threeRef.current;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);

            let distance = maxDim / (2 * Math.tan(fov / 2));
            distance *= 2.5;
            distance = Math.max(distance, 5);

            camera.position.set(distance, size.y / 2, 0);
            camera.lookAt(0, size.y / 2, 0);
            controls.target.set(0, size.y / 2, 0);
            controls.update();
            addLog('➡️ Switched to Right View');
        }
    };

    const handleTopView = () => {
        if (threeRef.current && threeRef.current.model && threeRef.current.camera && threeRef.current.controls) {
            const {model, camera, controls} = threeRef.current;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);

            let distance = maxDim / (2 * Math.tan(fov / 2));
            distance *= 2.5;
            distance = Math.max(distance, 5);

            camera.position.set(0, distance, 0);
            camera.lookAt(0, size.y / 2, 0);
            controls.target.set(0, size.y / 2, 0);
            controls.update();
            addLog('⬆️ Switched to Top View');
        }
    };

    return (
        <div className="App">
            <header className="header">
                <div className="header-title">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle} {version && <span className="version">({version})</span>}</p>
                </div>
                <div className="lang-control">
                    <span className="lang-label">{t.languageLabel}:</span>
                    <button
                        className="lang-btn"
                        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                        title={language === 'zh' ? 'Switch to English' : '切换到中文'}
                    >
                        {language === 'zh' ? 'EN' : '中'}
                    </button>
                </div>
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
                            {t.selectModel}
                        </label>
                    </div>

                    {loading && <div className="loading">{t.loading}</div>}
                    {error && <div className="error">{error}</div>}
                </div>

                {modelInfo && (
                    <div className="model-info">
                        <h3>{t.modelInfo}</h3>
                        <div className="info-item">
                            <span className="label">{t.format}</span>
                            <span className="value">{modelInfo.format || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t.file}</span>
                            <span className="value">{modelPath}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t.status}</span>
                            <span className="value">{modelInfo.loaded ? t.loaded : t.notLoaded}</span>
                        </div>
                    </div>
                )}

                {modelStats && (
                    <div className="model-stats">
                        <h3>{t.modelStats}</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">{t.vertices}</span>
                                <span className="stat-value">{modelStats.vertices.toLocaleString()}</span>
                                <span className="stat-unit">count</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.triangles}</span>
                                <span className="stat-value">{modelStats.triangles.toLocaleString()}</span>
                                <span className="stat-unit">count</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.sizeX}</span>
                                <span className="stat-value">{modelStats.sizeX}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.sizeY}</span>
                                <span className="stat-value">{modelStats.sizeY}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.sizeZ}</span>
                                <span className="stat-value">{modelStats.sizeZ}</span>
                                <span className="stat-unit">mm</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.volume}</span>
                                <span className="stat-value">{modelStats.volume}</span>
                                <span className="stat-unit">mm³</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">{t.surface}</span>
                                <span className="stat-value">{modelStats.surfaceArea}</span>
                                <span className="stat-unit">mm²</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="viewer">
                    <div className="viewer-container">
                        <div className="viewer-controls">
                            <button
                                className="viewer-btn"
                                onClick={handleFrontView}
                                title={t.frontView}
                                disabled={!threeRef.current}
                            >
                                👁️ {t.frontView}
                            </button>
                            <button
                                className="viewer-btn"
                                onClick={handleLeftView}
                                title={t.leftView}
                                disabled={!threeRef.current}
                            >
                                ⬅️ {t.leftView}
                            </button>
                            <button
                                className="viewer-btn"
                                onClick={handleRightView}
                                title={t.rightView}
                                disabled={!threeRef.current}
                            >
                                ➡️ {t.rightView}
                            </button>
                            <button
                                className="viewer-btn"
                                onClick={handleTopView}
                                title={t.topView}
                                disabled={!threeRef.current}
                            >
                                ⬆️ {t.topView}
                            </button>
                            <button
                                className="viewer-btn"
                                onClick={handleScreenshot}
                                title={t.screenshot}
                                disabled={!threeRef.current}
                            >
                                📸 {t.screenshot}
                            </button>
                        </div>
                        <canvas ref={canvasRef} className="canvas"></canvas>
                    </div>
                    <div className="viewer-instructions">
                        <h4 onClick={handleControlsTitleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>{t.controls}</h4>
                        <ul>
                            <li>{t.leftClickDrag}</li>
                            <li>{t.scrollWheel}</li>
                            <li>{t.rightClickDrag}</li>
                        </ul>
                    </div>
                    {consoleVisible && (
                        <div className="app-console">
                        <div className="console-header" onClick={() => setConsoleVisible(false)}>
                            <span className="console-title">🖥️ {t.consoleTitle}</span>
                            <span className="console-toggle">✕</span>
                        </div>
                        <div className="console-content">
                            <button className="console-clear" onClick={() => setConsoleLogs([])}>
                                {t.clearLogs}
                            </button>
                            <div className="console-logs">
                                {consoleLogs.length === 0 ? (
                                    <div className="console-empty">{t.noLogs}</div>
                                ) : (
                                    consoleLogs.map((log, index) => (
                                        <div key={index} className={`console-log ${log.type}`}>
                                                <span className="log-time">[{log.time}]</span>
                                                <span className="log-message">{log.message}</span>
                                            </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </main>

            <footer className="footer">
                <p>{t.poweredBy}</p>
            </footer>
        </div>
    );
}

export default App;
