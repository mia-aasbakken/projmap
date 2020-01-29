let width, height, container, collada, camera, scene, renderer, controls, directionalLight, pointLight, hasLoaded
let mouseControl = false

function init(containerElement) {
    container = containerElement
    width = container.clientWidth
    height = container.clientHeight

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize(width, height)        
    container.appendChild(renderer.domElement)

    const loadingManager = new THREE.LoadingManager(() => {
        material = collada.children[0].material
        camera = collada.children[1]
        camera.aspect = width/height        
        camera.updateProjectionMatrix()
        controls = new THREE.OrbitControls(camera, renderer.domElement)
        controls.update()
        scene.add(collada)
        hasLoaded = true
    })

    const loader = new THREE.ColladaLoader(loadingManager)
    loader.load( './assets/heart.dae', (colladaImport) => {
        collada = colladaImport.scene
    }) 

    const ambientLight = new THREE.AmbientLight(0x00ffff, 0.2)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(1, 1, 5).normalize()
    scene.add(directionalLight)

    pointLight = new THREE.PointLight(0x00ffff, 0.4, 70, 2)
    pointLight.position.set(1, 1, 6).normalize()
    scene.add(pointLight)

}   

function render(time) {
    requestAnimationFrame(render)
    if(!hasLoaded) return

    controls.update()
    timeInSeconds = time * 0.001

    if (!mouseControl) {
        directionalLight.position.x = Math.cos(timeInSeconds)
        directionalLight.position.y = Math.sin(timeInSeconds)        
        directionalLight.position.z = Math.sin(timeInSeconds)
    }
    directionalLight.intensity = Math.sin(timeInSeconds*0.2)
    
    pointLight.position.z = Math.sin(timeInSeconds*2)+8   
    pointLight.intensity = Math.cos(timeInSeconds*2)
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
document.onkeypress = (e) => {
    if (e.key === 'l') {
        if (!showWires) {             
            showWires = true
            const wireMaterial = new THREE.MeshBasicMaterial({
                wireframe: true,
                depthTest: false
            })                     
            collada.children[0].material = wireMaterial       
        } else {
            showWires = false
            collada.children[0].material = material
        }        
    } else if (e.key === 'm' || !mouseControl) {
        mouseControl = true
        container.addEventListener('mousemove', mouseLight, true)
    } else if (e.key === 'n') { 
        mouseControl = false 
        container.removeEventListener('mousemove', mouseLight, true)
    }
}

function mouseLight(m) {
    directionalLight.position.y += m.movementX*0.01
    directionalLight.position.z += m.movementY*0.01
}

window.addEventListener('load', () => {
    init(document.getElementById('container'))
    render()
})
