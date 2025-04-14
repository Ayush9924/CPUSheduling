import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ganttScene, ganttCamera, ganttRenderer;
let cpuModel, particles;

// Initialize Three.js background
export function initThreeJSBackground() {
    const container = document.getElementById('threejs-container');
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Add ambient light to softly illuminate the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add directional light for more defined shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a subtle grid helper for the background
    const gridHelper = new THREE.GridHelper(40, 40, 0x555555, 0x333333);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    // Create CPU model
    createCPUModel();

    // Create floating tech particles
    createTechParticles();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createCPUModel() {
    const cpuGroup = new THREE.Group();

    // Base chip (a box with metallic material)
    const baseGeometry = new THREE.BoxGeometry(6, 0.5, 6);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0x999999,
        shininess: 50,
        metalness: 0.7,
        roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    cpuGroup.add(base);

    // CPU cores (smaller boxes with glowing material)
    const coreGeometry = new THREE.BoxGeometry(1, 0.6, 1);
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x00a8ff,
        emissive: 0x0066cc,
        emissiveIntensity: 0.3,
        specular: 0x111111,
        shininess: 100
    });

    // Create 4 cores in a 2x2 arrangement
    for (let x = -1; x <= 1; x += 2) {
        for (let z = -1; z <= 1; z += 2) {
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            core.position.set(x * 1.5, 0.6, z * 1.5);
            cpuGroup.add(core);
        }
    }

    // Heat sink fins
    const finGeometry = new THREE.BoxGeometry(5, 0.1, 0.5);
    const finMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0x111111,
        shininess: 30
    });

    for (let i = 0; i < 15; i++) {
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(0, 0.8 + i * 0.3, 0);
        cpuGroup.add(fin);
    }

    // Position the CPU model in the scene
    cpuGroup.position.y = -5;
    cpuGroup.rotation.x = -0.2;
    scene.add(cpuGroup);
    cpuModel = cpuGroup;
}

function createTechParticles() {
    const particleCount = 1000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Create random particle positions, colors and sizes
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z

        // Blueish color scheme
        colors[i * 3] = 0.1 + Math.random() * 0.3; // r
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.5; // g
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // b

        sizes[i] = 0.1 + Math.random() * 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);
    particles = particleSystem;
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate CPU model slowly
    if (cpuModel) {
        cpuModel.rotation.y += 0.002;
    }

    // Animate particles
    if (particles) {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // Make particles float downward
            positions[i + 1] -= 0.05;
            
            // Reset particles that fall below the view
            if (positions[i + 1] < -20) {
                positions[i + 1] = 20;
                positions[i] = (Math.random() - 0.5) * 40;
                positions[i + 2] = (Math.random() - 0.5) * 40;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Initialize Gantt chart 3D visualization
export function initGanttChart3D() {
    const container = document.getElementById('threejs-gantt');
    if (!container) return;
    
    // Clear previous renderer if exists
    if (ganttRenderer) {
        container.removeChild(ganttRenderer.domElement);
    }
    
    // Create scene with dark background
    ganttScene = new THREE.Scene();
    ganttScene.background = new THREE.Color(0x111122);
    
    // Set up orthographic camera for 2D-like view
    const width = container.clientWidth;
    const height = container.clientHeight;
    ganttCamera = new THREE.OrthographicCamera(
        width / -2, width / 2, height / 2, height / -2, 1, 1000
    );
    ganttCamera.position.z = 500;
    
    // Create renderer with antialiasing
    ganttRenderer = new THREE.WebGLRenderer({ antialias: true });
    ganttRenderer.setSize(width, height);
    container.appendChild(ganttRenderer.domElement);
    
    // Add lights to the Gantt chart scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    ganttScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    ganttScene.add(directionalLight);
    
    // Handle window resize
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        ganttCamera.left = width / -2;
        ganttCamera.right = width / 2;
        ganttCamera.top = height / 2;
        ganttCamera.bottom = height / -2;
        ganttCamera.updateProjectionMatrix();
        
        ganttRenderer.setSize(width, height);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Initial empty render
    renderGanttFrame();
}

// Render 3D Gantt chart
export function renderGanttChart3D(ganttData) {
    const container = document.getElementById('threejs-gantt');
    if (!container) return;
    
    // Initialize if not already done
    if (!ganttScene) {
        initGanttChart3D();
    } else {
        // Clear previous chart
        while(ganttScene.children.length > 0) { 
            ganttScene.remove(ganttScene.children[0]); 
        }
    }
    
    if (!ganttData || ganttData.length === 0) {
        // Show empty state
        createTextLabel("No processes scheduled", 0, 0, 0xffffff, 24);
        renderGanttFrame();
        return;
    }
    
    // Calculate metrics for scaling
    const totalTime = Math.max(...ganttData.map(item => item.end));
    const uniqueProcesses = [...new Set(ganttData.map(item => item.process))];
    const processCount = uniqueProcesses.length;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create color palette for processes
    const colors = [
        0x3498db, 0x2ecc71, 0xf1c40f, 0xe74c3c, 0x9b59b6,
        0x1abc9c, 0xe67e22, 0x34495e, 0x7f8c8d, 0xd35400
    ];
    
    // Create axes and labels
    createGanttAxes(totalTime, processCount, width, height);
    
    // Create process bars
    const barHeight = 20;
    const spaceBetweenBars = 30;
    const depth = 15;
    const maxWidth = width * 0.8;
    const maxHeight = height * 0.8;
    
    ganttData.forEach((item) => {
        const processIndex = uniqueProcesses.indexOf(item.process);
        const yPos = (processCount / 2 - processIndex - 0.5) * spaceBetweenBars;
        
        const duration = item.end - item.start;
        const width = duration * (maxWidth / totalTime);
        const xPos = (item.start + duration / 2) * (maxWidth / totalTime) - maxWidth / 2;
        
        const color = colors[processIndex % colors.length];
        
        // Create 3D bar for this process segment
        const geometry = new THREE.BoxGeometry(width, barHeight, depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            specular: 0x111111,
            shininess: 30,
            emissive: color,
            emissiveIntensity: 0.1
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(xPos, yPos, 0);
        ganttScene.add(bar);
        
        // Add process label
        createTextLabel(item.process, xPos - width/2 + 15, yPos + barHeight/2 + 5, 0xffffff, 14);
        
        // Add time label
        createTextLabel(`${item.start}-${item.end}`, xPos, yPos - barHeight/2 - 5, 0xaaaaaa, 12);
    });
    
    // Render the frame
    renderGanttFrame();
}

function createGanttAxes(totalTime, processCount, width, height) {
    // X-axis (time)
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-width/2 + 20, -height/2 + 40, 0),
        new THREE.Vector3(width/2 - 20, -height/2 + 40, 0)
    ]);
    const xAxis = new THREE.Line(
        xAxisGeometry,
        new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 2 })
    );
    ganttScene.add(xAxis);
    
    // Y-axis (processes)
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-width/2 + 20, -height/2 + 40, 0),
        new THREE.Vector3(-width/2 + 20, height/2 - 40, 0)
    ]);
    const yAxis = new THREE.Line(
        yAxisGeometry,
        new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 2 })
    );
    ganttScene.add(yAxis);
    
    // Add time markers
    const timeStep = Math.max(1, Math.ceil(totalTime / 10));
    for (let t = 0; t <= totalTime; t += timeStep) {
        const xPos = t * (width / totalTime) - width/2;
        
        // Tick mark
        const tickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(xPos, -height/2 + 40, 0),
            new THREE.Vector3(xPos, -height/2 + 35, 0)
        ]);
        const tick = new THREE.Line(
            tickGeometry,
            new THREE.LineBasicMaterial({ color: 0x777777 })
        );
        ganttScene.add(tick);
        
        // Time label
        createTextLabel(t.toString(), xPos, -height/2 + 30, 0xaaaaaa, 14);
    }
    
    // Add process labels on Y-axis
    for (let i = 0; i < processCount; i++) {
        const yPos = (processCount / 2 - i - 0.5) * 30;
        createTextLabel(`P${i+1}`, -width/2 + 15, yPos, 0xffffff, 14);
    }
}

function createTextLabel(text, x, y, color, size = 16) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = size * text.length;
    canvas.height = size * 2;
    
    context.font = `Bold ${size}px Arial`;
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, 0);
    sprite.scale.set(canvas.width/2, canvas.height/2, 1);
    ganttScene.add(sprite);
}

function renderGanttFrame() {
    if (!ganttRenderer || !ganttScene || !ganttCamera) return;
    
    requestAnimationFrame(renderGanttFrame);
    ganttRenderer.render(ganttScene, ganttCamera);
}