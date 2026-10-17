// --- 1. SETUP THE 3D SCENE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(0, 5, 5);
scene.add(dirLight);

// --- 3. GAME OBJECTS ---
// Player (A 3D Cube)
const playerGeo = new THREE.BoxGeometry(1, 1, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 0, 0);
scene.add(player);

// Track / Floor
const floorGeo = new THREE.PlaneGeometry(10, 50);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x16213e });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2; // Lay flat
floor.position.set(0, -0.5, -20);
scene.add(floor);

// Position camera above and behind (2.5D isometric feel)
camera.position.set(0, 4, 5);
camera.lookAt(0, 0, -5);

// --- 4. GAME VARIABLES ---
let score = 0;
let isGameOver = false;
let obstacles = [];
const keys = { Left: false, Right: false };

// --- 5. CONTROLS ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.Left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.Right = true;
    if (e.key === ' ' && isGameOver) resetGame();
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.Left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.Right = false;
});

// --- 6. OBSTACLE GENERATION ---
function spawnObstacle() {
    if (isGameOver) return;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff2e63 });
    const obs = new THREE.Mesh(geo, mat);
    
    // Random X position across the lane width (-4 to 4)
    obs.position.set((Math.random() - 0.5) * 8, 0, -40);
    scene.add(obs);
    obstacles.push(obs);
    
    // Spawn another obstacle down the road
    setTimeout(spawnObstacle, Math.random() * 1000 + 500);
}
spawnObstacle();

// --- 7. GAME LOOP & ANIMATION ---
function animate() {
    requestAnimationFrame(animate);

    if (!isGameOver) {
        // Handle player 2D side-to-side movement
        if (keys.Left && player.position.x > -4.5) player.position.x -= 0.15;
        if (keys.Right && player.position.x < 4.5) player.position.x += 0.15;

        // Subtle animation flare to make it feel 3D
        player.rotation.y += 0.01;

        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.position.z += 0.3; // Move obstacle towards player
            obs.rotation.x += 0.02;

            // Simple 3D AABB Collision check
            let playerBox = new THREE.Box3().setFromObject(player);
            let obsBox = new THREE.Box3().setFromObject(obs);

            if (playerBox.intersectsBox(obsBox)) {
                endGame();
            }

            // Remove out of bounds obstacles and add points
            if (obs.position.z > 5) {
                scene.remove(obs);
                obstacles.splice(i, 1);
                score++;
                document.getElementById('score').innerText = `Score: ${score}`;
            }
        }
    }

    renderer.render(scene, camera);
}

function endGame() {
    isGameOver = true;
    document.getElementById('gameover').style.display = 'block';
}

function resetGame() {
    isGameOver = false;
    score = 0;
    document.getElementById('score').innerText = `Score: 0`;
    document.getElementById('gameover').style.display = 'none';
    player.position.set(0, 0, 0);
    
    // Clear old obstacles
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
