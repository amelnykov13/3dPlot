import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Data, getPointData } from './data.js'; //CLASS WITH OUR DATA
import { createVegaBarChart, resetVegaChart } from './hist.js';

function resetAll(resetColoring, resetVegaChart, points, global_data, //function to reset all selections
   friendsContainer, followersContainer, tweetsContainer, profilePic) {

  resetColoring(points);
  resetVegaChart(global_data['ideology'], global_data['botscores']);

  //Reset info box
  friendsContainer.innerHTML = `# of friends:`;
  followersContainer.innerHTML = `# of followers:`;
  tweetsContainer.innerHTML = `# of tweets:`;
  profilePic.src = 'profholder.jpg';

  for (let i = 0; i <= 5; i++) {
    let tempholder = document.getElementById(`nb${i + 1}`)
    tempholder.src = 'profholder.jpg'
  }

}

async function fetchFile(file)  { //To fetch all data from our JSON file
  const response = await fetch(file)

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.json()
}


function debounce(fn, delay) { //Debounce function to hold multiple interactions
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
          fn(...args)
      }, delay)
  }
}


async function createPlot(){
  try {
    
    //* DATA MANAGEMENT

    const data = await fetchFile('/sample/sample_1_data.json')
    
    new Data(data);
    Data.populateCoordinates();
    Data.populateColors();

    const { coordinates, account_data, cluster_data, global_data } = Data;
    const { x, y, z, coord_id, colors, colorMap } = Data


    const clustersContainer = document.getElementById('clusters_info')

    for (const key in cluster_data) { //passes the data about clusters to the info element
      const cluster = cluster_data[key];
      const newParagraph = document.createElement('p');
      newParagraph.textContent = `Cluster #${key}: ${cluster.size}`;
      newParagraph.style.color = colorMap[key];
      newParagraph.style.fontWeight = 600;
      newParagraph.classList = 'my-1';
      clustersContainer.appendChild(newParagraph);
    }    




    //*  PLOT MANAGEMENT

    const container = document.getElementById('middle-section');
    const canvas = document.querySelector('#plot'); //Get our plot element
    
    //get the width and height respectively to the container size
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene(); //create a scene for our plot

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setClearColor(0xffffff) //set background color

    renderer.setSize( width, height );
    camera.position.set(60, 80, 150); // Adjust the camera position to view all axes

    const controls = new OrbitControls(camera, renderer.domElement); //enable the user interaction with plot
    controls.enableDamping = true;
    renderer.render( scene, camera );


    // Function to create an axis line
    function createAxisLine(start, end, color) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]); //set the length of an axis
      const material = new THREE.LineBasicMaterial({ color }); //set the color of axis
      const line = new THREE.Line(geometry, material); //combine all of it
      line.position.y -= 20; 
      return line;
    }

    // Create and add axis lines to the scene
    const xAxis = createAxisLine(new THREE.Vector3(-70, 20, 0), new THREE.Vector3(70, 20, 0), 0xff0000); // Red X-axis
    const yAxis = createAxisLine(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, 100, 0), 0x00ff00); // Green Y-axis
    const zAxis = createAxisLine(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, 20, 90), 0x0000ff); // Blue Z-axis

    //add axises to our scene
    scene.add(xAxis);
    scene.add(yAxis);
    scene.add(zAxis);


   
    // Function to create a circular alpha map
    function createCircularAlphaMap(size) {
      const canvas = document.createElement('canvas'); // Create a canvas element
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d'); // Get the 2D drawing context
      ctx.fillStyle = '#ffffff'; // White color for the circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); // Draw a full circle
      ctx.fill();

      // Create a texture from the canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter; // Ensure the texture doesn't get blurred
      texture.magFilter = THREE.NearestFilter;
      return texture; // Return the generated texture
    }

    //Scales for Better Visualization
    const scaleX = 15;
    const scaleY = 7.5;
    const scaleZ = 8;


    // Function to create points from x, y, z coordinates
    function createPoints(x, y, z, ids) {
      const geometry = new THREE.BufferGeometry(); //will be used to define the shape
      const positions = new Float32Array(x.length * 3); // Allocate memory for coordinates 
      //(designed for the performance of WebGL) + to store x,y,z for each point
      const colorArray = new Float32Array(x.length * 3); //store the r,g,b
      const opacityArray = new Float32Array(x.length);

      for (let i = 0; i < x.length; i++) {
        //We have a flat arrays; thus, we need three positions for each point

        positions[i * 3] = x[i] * scaleX; // X coordinate  
        positions[i * 3 + 1] = y[i] * scaleY - 15; // Y coordinate
        positions[i * 3 + 2] = z[i] * scaleZ ; // Z coordinate

        colorArray[i * 3] = 0;
        colorArray[i * 3 + 1] = 0;
        colorArray[i * 3 + 2] = 1;
      }

      //Provide the position attribute (coordinates) to the geometry (points)
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
      geometry.setAttribute('alpha', new THREE.BufferAttribute(opacityArray, 0.3))
      
      // Create a circular alpha map
      const alphaMap = createCircularAlphaMap(64); // Size of the alpha map 64x64

      
      const material = new THREE.PointsMaterial({ //set the properties of points
        vertexColors: true, //enable per vertex coloring
        size: 1.2,
        opacity: 0.5,
        transparent: true,
        depthTest: false, // Avoids depth testing which may hide some points
        alphaMap: alphaMap, //add circular texture
         
      });

      const points = new THREE.Points(geometry, material); //combines everything
      points.userData = { ids }; //attach the custom data to each point
      return points;
    }

    let previousColors = [];
    let previousChosenPoint = null;

    function resetPreviousColors(points) {
      const geom = points.geometry;
      const colorAttribute = geom.getAttribute('color');
      const { ids } = points.userData;

      previousColors.forEach((id) => {
        const pntIndex = ids[id];
        if (pntIndex !== -1) {
          const orgColor = new THREE.Color('#0000ff');
          colorAttribute.setXYZ(pntIndex, orgColor.r, orgColor.g, orgColor.b)
        }
      })

      if (previousChosenPoint) {
        scene.remove(previousChosenPoint);
        previousChosenPoint = null;
      }

      colorAttribute.needsUpdate = true;
    }
    

    function changePointsColors(points, pointId, idsArray, colorHex) { //Manage the colors of points
      
      const geom = points.geometry;
      const colorAttribute = geom.getAttribute('color');
      const opacityAttribure = geom.getAttribute('alpha');
      const { ids } = points.userData;
      const positionAttribute = geom.getAttribute('position'); // Access positions to modify


      const chosenColor = new THREE.Color('#FF0000')
      colorAttribute.setXYZ(pointId, chosenColor.r, chosenColor.g, chosenColor.b);
      opacityAttribure.setX(pointId, 1.0)

       // Increase the size of the chosen point by creating a separate point with larger size
      const chosenPointPosition = new THREE.Vector3(
        positionAttribute.getX(pointId),
        positionAttribute.getY(pointId),
        positionAttribute.getZ(pointId)
      );

      // Create a new geometry for the chosen point
      const chosenPointGeometry = new THREE.BufferGeometry().setFromPoints([chosenPointPosition]);


      const alphaMap = createCircularAlphaMap(100)
      // Use the same texture and create a new material with a larger size
      const chosenMaterial = new THREE.PointsMaterial({
        color: '#FF0000',
        size: 2.0, // Larger size for the chosen point
        transparent: true,
        // opacity: 0.8,
        alphaMap: alphaMap,
      });

      // Create the chosen point with larger size and add to the scene
      const chosenPoint = new THREE.Points(chosenPointGeometry, chosenMaterial);
      points.parent.add(chosenPoint);

      previousChosenPoint = chosenPoint;

      const defColor = new THREE.Color('#D3D3D3')

      for (let i = 0; i < colorAttribute.count; i++) {
        colorAttribute.setXYZ(i, defColor.r, defColor.g, defColor.b);
        opacityAttribure.setX(i, 0.05)
      }


      idsArray.forEach((id) => { //Coloring itself
        const pntIndex = ids[id];
        if (pntIndex !== -1 && pntIndex !== pointId) {
          const newColor = new THREE.Color(colorHex);
          colorAttribute.setXYZ(pntIndex, newColor.r, newColor.g, newColor.b)
          opacityAttribure.setX(pntIndex, 0.95)
        }
      });


      opacityAttribure.needsUpdate = true;
      colorAttribute.needsUpdate = true;
      positionAttribute.needsUpdate = true;
    }

    function resetColoring(points) { //Reset all coloring
      const geom = points.geometry;
      const colorAttribute = geom.getAttribute('color');
      const opacityAttribure = geom.getAttribute('alpha');
      const defColor = new THREE.Color(0x0000ff)

      resetPreviousColors(points)

      for (let i = 0; i < colorAttribute.count; i++) {
        colorAttribute.setXYZ(i, defColor.r, defColor.g, defColor.b);
        opacityAttribure.setX(i, 0.3)
      }
      colorAttribute.needsUpdate = true;
      opacityAttribure.needsUpdate = true
    }    

    // Create points and add them to the scene
    const points = createPoints(x, y, z, coord_id);
    scene.add(points);

    let isDragging = false; //To track if user is dragging or not

    // Set up raycaster and mouse vector
    const raycaster = new THREE.Raycaster(); //is used to monitor which objects our cursor intersects
    const mouse = new THREE.Vector2(); //used to store the coordinates of the mouse click 

    raycaster.params.Points.threshold = 0.5;

    const friendsContainer = document.getElementById('friends')
    const followersContainer = document.getElementById('followers')
    const tweetsContainer = document.getElementById('tweets')
    const profilePic = document.getElementById('prf_picture')

    const onPointerDown = (evnt) => {
      isDragging = false; //when user is just clicking
    }
    const onPointerMove = (evnt) => {
      isDragging = true; //when user is jsut moving
    }

    

    resetAll(resetColoring, resetVegaChart, points, global_data, friendsContainer,
      followersContainer, tweetsContainer, profilePic)


      let activated = false; //Monitor if chart was interacted with 

    // When pointer is released 
    function onPointerUp(event) {
        activated = true;
        if (isDragging) return;
        // Calculate mouse position in normalized device coordinates (-1 to +1)

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; 
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;


        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(points);

        if (intersects.length > 0) {
          const intersect = intersects[0]; // Get the first intersected point
          const index = intersect.index; // Get the index of the clicked point
          const pointID = points.userData.ids[index]; // Retrieve the ID using the index
          
          const pointData = getPointData(pointID, account_data); // Get account data
          

          friendsContainer.innerHTML = `# of friends: ${pointData.friends}`;
          followersContainer.innerHTML = `# of followers: ${pointData.followers}`;
          tweetsContainer.innerHTML = `# of tweets: ${pointData.tweets}`;
          
          
          profilePic.src = `/sample/forTest/${pointData.picture_pth}`

          profilePic.onerror = function () {
            this.src = 'profholder.jpg'
          }

          // FETCH 6 PICTURES OF NEIGBORS
          for (let i = 0; i <= 5; i++) {
            let temp_pct = getPointData(pointData.neighbors[i], account_data)
            let tempholder = document.getElementById(`nb${i + 1}`)
            tempholder.src = `/sample/forTest/${temp_pct.picture_pth}`
            tempholder.onerror = function () {
              this.src = 'profholder.jpg'
            }
          }

          let clusterr = cluster_data[pointData.clusterLabel]['ids']



          resetPreviousColors(points)

          changePointsColors(points, pointID, clusterr, colorMap[pointData.clusterLabel])

          previousColors = clusterr;

          console.log(window.innerWidth, 
            window.innerHeight)

          createVegaBarChart(global_data['ideology'], 
            cluster_data[`${pointData.clusterLabel}`]['ideology'], 
            global_data['botscores'], 
            cluster_data[`${pointData.clusterLabel}`]['botscores'],
            pointData.ideology,
            pointData.botscore)
        } else { // On the outside click
          resetAll(resetColoring, resetVegaChart, points, global_data, friendsContainer,
             followersContainer, tweetsContainer, profilePic)

        }
      }
  
    // Add event listeners to monitor pointer actions
    window.addEventListener('pointerdown', debounce(onPointerDown), 300);
    window.addEventListener('pointermove', debounce(onPointerMove), 300);
    window.addEventListener('pointerup', debounce(onPointerUp), 500);
  
    window.addEventListener('resize', () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      if(!activated) { //initial chart rotation
        scene.rotation.y += 0.001;
      }

      controls.update(); // Update controls for damping effect
      renderer.render(scene, camera);
    }

    animate();
    
  } catch (err) {
    console.log(err)
  }

}

document.addEventListener('DOMContentLoaded', createPlot) //Initialize everything when content is loaded

