let collada, camera, scene, renderer, controls, directionalLight, pointLight, brickMaterial, wireMaterial
let hasLoaded = false
let mouseControl = false

function init(container) {
    const width = container.clientWidth
    const height = container.clientHeight

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)        
    container.appendChild(renderer.domElement)

    const loadingManager = new THREE.LoadingManager( () => {
        material = collada.children[0].material 
        camera = collada.children[2]
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        controls = new THREE.OrbitControls(camera, renderer.domElement)
        scene.add(collada)
        hasLoaded = true
    })

    const tex = new THREE.TextureLoader().load('./assets/bricks.jpg')
    brickMaterial = new THREE.MeshPhongMaterial({map: tex})
    wireMaterial = new THREE.MeshBasicMaterial({ wireframe: true, depthTest: false })  

    const loader = new THREE.ColladaLoader(loadingManager)
    loader.load( './assets/threecubes.dae', (colladaImport) => {
        collada = colladaImport.scene
    }) 

    const ambientLight = new THREE.AmbientLight(0x00ffff, 0.2)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(1, 1, 5).normalize()
    scene.add(directionalLight)

    pointLight = new THREE.PointLight(0x00ffff, 0.4, 20, 5)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)
}   

function render(time) {
    requestAnimationFrame(render)
    if (!hasLoaded) return

    timeInSeconds = time * 0.001   
    controls.update()

    if (!mouseControl) {        
        directionalLight.position.x = Math.cos(timeInSeconds)
        directionalLight.position.y = Math.sin(timeInSeconds)        
        directionalLight.position.z = Math.sin(timeInSeconds)
    }

    directionalLight.intensity = Math.max(Math.sin(timeInSeconds*0.1)*4, 0.2)
    directionalLight.position.normalize()
    
    pointLight.position.z = Math.sin(timeInSeconds)+2
    pointLight.intensity = Math.max(Math.sin(timeInSeconds)*8, 0.2)
    pointLight.color = new THREE.Color('hsl('+changeColor(timeInSeconds)+', 100%, 50%)');

    renderer.render(scene, camera);
}

let shouldChange = true    
let color = 186
function changeColor(time) {
    if (shouldChange && Math.floor(time % 10) === 9) {
        shouldChange = false
        color = Math.floor(Math.random() * Math.floor(360))
    } else if (Math.floor(time) % 10 === 1) shouldChange = true

    return color
}

let showWires = false
let showBricks = false
document.onkeypress = (e) => {
    if(e.key === 'b') {
        if (!showBricks) {             
            showBricks = true          
            addMaterialToMeshes(brickMaterial)         
        } else {
            showBricks = false
            addMaterialToMeshes(material)
        }        
    } else if(e.key === 'l') {
        if (!showWires) {             
            showWires = true                               
            addMaterialToMeshes(wireMaterial)   
        } else {
            showWires = false
            addMaterialToMeshes(material)
        }        
    } else if(e.key === 'm' || !mouseControl) {
        mouseControl = true
        document.getElementById('container').addEventListener('mousemove', mouseLight, true)
    } else if (e.key === 'n') { 
        mouseControl = false 
        document.getElementById('container').removeEventListener('mousemove', mouseLight, true)
    } 
}

function addMaterialToMeshes(material) {    
    collada.children[0].material = material
    collada.children[1].material = material
    collada.children[3].material = material
}

function mouseLight(m) {    
    directionalLight.position.y += m.movementX*0.05
    directionalLight.position.z += m.movementY*0.05
}

window.addEventListener('load', () => {
    init(document.getElementById('container'))
    render()
})
