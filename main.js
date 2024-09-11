// Main JavaScript file for Ocean Simulations

// Object to store all simulation functions
const simulations = {
  oceanAcidification: null,
  waves: null,
  currents: null,
  plasticPollution: null,
  tsunami: null,
  ecosystem: null,
  oilspill: null,
  salinity: null,
};

// Function to load a simulation
function loadSimulation(simName) {
  const container = document.getElementById("simulation-container");
  container.innerHTML = ""; // Clear previous simulation

  if (simulations[simName]) {
    simulations[simName](container);
  } else {
    container.innerHTML = `<p>Simulation "${simName}" not implemented yet.</p>`;
  }
}

// Event listeners for navigation
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("#nav-list a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const simName = e.target.getAttribute("data-sim");
      loadSimulation(simName);
    });
  });

  // Load default simulation
  loadSimulation("oceanAcidification");
});

// Ocean Acidification Simulation
simulations.oceanAcidification = (container) => {
  container.innerHTML = `
    <div class="simulation" id="ocean-acidification-sim">
      <div class="controls">
        <label for="co2-level">CO2 Level: <span id="co2-level-value">400</span> ppm</label>
        <input type="range" id="co2-level" min="300" max="1000" value="400">
        <label for="time-scale">Time Scale: <span id="time-scale-value">1</span>x</label>
        <input type="range" id="time-scale" min="1" max="100" step="1" value="1">
        <button id="add-shellfish">Add Shellfish</button>
        <button id="add-coral">Add Coral</button>
        <button id="add-phytoplankton">Add Phytoplankton</button>
      </div>
      <canvas id="ocean-acidification-canvas"></canvas>
      <div id="info-panel"></div>
    </div>
  `;

  const co2LevelSlider = document.getElementById("co2-level");
  const co2LevelValue = document.getElementById("co2-level-value");
  const timeScaleSlider = document.getElementById("time-scale");
  const timeScaleValue = document.getElementById("time-scale-value");
  const addShellfishBtn = document.getElementById("add-shellfish");
  const addCoralBtn = document.getElementById("add-coral");
  const addPhytoplanktonBtn = document.getElementById("add-phytoplankton");
  const canvas = document.getElementById("ocean-acidification-canvas");
  const ctx = canvas.getContext("2d");
  const infoPanel = document.getElementById("info-panel");

  canvas.width = 800;
  canvas.height = 600;

  let co2Level = 400;
  let timeScale = 1;
  let organisms = [];
  let bubbles = [];
  let currentYear = 2024;
  let temperature = 15; // Starting temperature in Celsius

  class Organism {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = type === "phytoplankton" ? 5 : 20;
      this.health = 100;
      this.age = 0;
    }

    update(pH, temp) {
      this.age += 0.1 * timeScale;

      if (this.type === "shellfish") {
        if (pH < 7.8) {
          this.health -= (7.8 - pH) * 0.2 * timeScale;
        }
        if (temp > 20) {
          this.health -= (temp - 20) * 0.1 * timeScale;
        }
      } else if (this.type === "coral") {
        if (pH < 8.0) {
          this.health -= (8.0 - pH) * 0.3 * timeScale;
        }
        if (temp > 28) {
          this.health -= (temp - 28) * 0.2 * timeScale;
        }
      } else if (this.type === "phytoplankton") {
        if (pH < 7.6) {
          this.health -= (7.6 - pH) * 0.1 * timeScale;
        }
        if (temp > 25) {
          this.health -= (temp - 25) * 0.05 * timeScale;
        }
      }

      this.health = Math.max(0, Math.min(100, this.health));
    }

    draw() {
      const alpha = this.health / 100;
      ctx.globalAlpha = alpha;
      if (this.type === "shellfish") {
        ctx.fillStyle = "brown";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "coral") {
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.closePath();
        ctx.fill();
      } else if (this.type === "phytoplankton") {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw health bar
      ctx.fillStyle = `rgb(${255 - this.health * 2.55}, ${
        this.health * 2.55
      }, 0)`;
      ctx.fillRect(
        this.x - this.size,
        this.y - this.size - 10,
        this.size * 2 * (this.health / 100),
        5
      );
    }
  }

  class Bubble {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 5 + 2;
      this.speed = Math.random() * 2 + 1;
    }

    update() {
      this.y -= this.speed * timeScale;
      if (this.y + this.size < 0) {
        this.y = canvas.height + this.size;
      }
    }

    draw() {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function addOrganism(type) {
    organisms.push(
      new Organism(
        Math.random() * canvas.width,
        Math.random() * (canvas.height / 2) + canvas.height / 2,
        type
      )
    );
  }

  function calculatePH(co2) {
    // More realistic pH calculation based on CO2 levels
    return 8.1 - Math.log(co2 / 400) * 0.3;
  }

  function updateTemperature() {
    // Simplified temperature increase based on CO2 levels
    temperature = 15 + (co2Level - 400) * 0.01;
  }

  function updateSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update temperature
    updateTemperature();

    // Draw water
    const pH = calculatePH(co2Level);
    const blueValue = Math.max(0, Math.min(255, 190 - (co2Level - 400) * 0.2));
    ctx.fillStyle = `rgb(0, ${119 - (temperature - 15) * 5}, ${blueValue})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw organisms
    organisms = organisms.filter((org) => org.health > 0);
    organisms.forEach((org) => {
      org.update(pH, temperature);
      org.draw();
    });

    // Update and draw bubbles
    bubbles.forEach((bubble) => {
      bubble.update();
      bubble.draw();
    });

    // Add new bubbles
    if (Math.random() < 0.1 * timeScale * (co2Level / 400)) {
      bubbles.push(new Bubble(Math.random() * canvas.width, canvas.height));
    }

    // Display stats
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`pH: ${pH.toFixed(2)}`, 10, 20);
    ctx.fillText(`Temperature: ${temperature.toFixed(1)}°C`, 10, 40);
    ctx.fillText(`Year: ${Math.floor(currentYear)}`, 10, 60);
    ctx.fillText(`Organisms: ${organisms.length}`, 10, 80);

    // Update current year
    currentYear += 0.1 * timeScale;

    // Update info panel
    updateInfoPanel(pH, temperature);

    requestAnimationFrame(updateSimulation);
  }

  function updateInfoPanel(pH, temperature) {
    let info = `
      <h3>Ocean Acidification Information</h3>
      <p>CO2 Level: ${co2Level} ppm</p>
      <p>pH: ${pH.toFixed(2)}</p>
      <p>Temperature: ${temperature.toFixed(1)}°C</p>
      <p>Year: ${Math.floor(currentYear)}</p>
      <h4>Effects:</h4>
      <ul>
        <li>Shellfish: ${getHealthStatus(pH, 7.8, temperature, 20)}</li>
        <li>Coral: ${getHealthStatus(pH, 8.0, temperature, 28)}</li>
        <li>Phytoplankton: ${getHealthStatus(pH, 7.6, temperature, 25)}</li>
      </ul>
    `;
    infoPanel.innerHTML = info;
  }

  function getHealthStatus(pH, criticalPH, temp, criticalTemp) {
    if (pH < criticalPH - 0.2 || temp > criticalTemp + 2) {
      return "Severe stress";
    } else if (pH < criticalPH || temp > criticalTemp) {
      return "Moderate stress";
    } else {
      return "Healthy";
    }
  }

  co2LevelSlider.addEventListener("input", () => {
    co2Level = parseInt(co2LevelSlider.value);
    co2LevelValue.textContent = co2Level;
  });

  timeScaleSlider.addEventListener("input", () => {
    timeScale = parseInt(timeScaleSlider.value);
    timeScaleValue.textContent = timeScale;
  });

  addShellfishBtn.addEventListener("click", () => addOrganism("shellfish"));
  addCoralBtn.addEventListener("click", () => addOrganism("coral"));
  addPhytoplanktonBtn.addEventListener("click", () =>
    addOrganism("phytoplankton")
  );

  // Initialize simulation
  for (let i = 0; i < 20; i++) {
    bubbles.push(
      new Bubble(Math.random() * canvas.width, Math.random() * canvas.height)
    );
  }

  // Add initial organisms
  for (let i = 0; i < 5; i++) {
    addOrganism("shellfish");
    addOrganism("coral");
    addOrganism("phytoplankton");
  }

  updateSimulation();
};

// Placeholder functions for other simulations
simulations.waves = (container) => {
  container.innerHTML = `
    <div class="simulation" id="waves-sim">
      <div class="controls">
        <label for="wind-speed">Wind Speed: <span id="wind-speed-value">10</span> m/s</label>
        <input type="range" id="wind-speed" min="0" max="30" value="10">
        <label for="wind-direction">Wind Direction: <span id="wind-direction-value">0</span>°</label>
        <input type="range" id="wind-direction" min="0" max="359" value="0">
        <label for="environment">Environment:</label>
        <select id="environment">
          <option value="deep-ocean">Deep Ocean</option>
          <option value="coastline">Coastline</option>
          <option value="shallow-water">Shallow Water</option>
        </select>
      </div>
      <div id="wave-canvas"></div>
      <div id="wave-info">
        <h3>Wave Information</h3>
        <p>Height: <span id="wave-height">0</span> m</p>
        <p>Length: <span id="wave-length">0</span> m</p>
        <p>Period: <span id="wave-period">0</span> s</p>
        <p>Energy: <span id="wave-energy">0</span> J/m²</p>
      </div>
    </div>
  `;

  const windSpeedSlider = document.getElementById("wind-speed");
  const windSpeedValue = document.getElementById("wind-speed-value");
  const windDirectionSlider = document.getElementById("wind-direction");
  const windDirectionValue = document.getElementById("wind-direction-value");
  const environmentSelect = document.getElementById("environment");

  // Three.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(800, 600);
  document.getElementById("wave-canvas").appendChild(renderer.domElement);

  // Create ocean plane
  const geometry = new THREE.PlaneGeometry(100, 100, 128, 128);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0077be,
    shininess: 100,
    transparent: true,
    opacity: 0.8,
  });
  const ocean = new THREE.Mesh(geometry, material);
  ocean.rotation.x = -Math.PI / 2;
  scene.add(ocean);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  camera.position.set(0, 30, 50);
  camera.lookAt(0, 0, 0);

  // Wave parameters
  let windSpeed = 10;
  let windDirection = 0;
  let waveHeight = 2;
  let waveFrequency = 0.1;
  let environmentFactor = 1;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update wave geometry
    const time = Date.now() * 0.001;
    const positions = ocean.geometry.attributes.position.array;

    let maxWaveHeight = 0;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];

      // Calculate wave height based on wind speed, direction, and environment
      const waveX =
        Math.sin(x * waveFrequency + time + (windDirection * Math.PI) / 180) *
        waveHeight *
        (windSpeed / 30) *
        environmentFactor;
      const waveY =
        Math.cos(y * waveFrequency + time) *
        waveHeight *
        (windSpeed / 30) *
        environmentFactor;

      const height = waveX + waveY;
      positions[i + 2] = height;

      if (Math.abs(height) > maxWaveHeight) {
        maxWaveHeight = Math.abs(height);
      }
    }

    ocean.geometry.attributes.position.needsUpdate = true;
    ocean.geometry.computeVertexNormals();

    // Update wave information
    const waveLength = Math.PI / waveFrequency;
    const wavePeriod = Math.sqrt((2 * Math.PI * waveLength) / 9.8);
    const waveEnergy = (1 / 8) * 1000 * 9.8 * maxWaveHeight * maxWaveHeight;

    document.getElementById("wave-height").textContent =
      maxWaveHeight.toFixed(2);
    document.getElementById("wave-length").textContent = waveLength.toFixed(2);
    document.getElementById("wave-period").textContent = wavePeriod.toFixed(2);
    document.getElementById("wave-energy").textContent = waveEnergy.toFixed(2);

    // Color-code waves based on height
    const colors = ocean.geometry.attributes.color;
    if (!colors) {
      ocean.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(positions.length), 3)
      );
    }

    for (let i = 0; i < positions.length; i += 3) {
      const height = positions[i + 2];
      const normalizedHeight = (height + maxWaveHeight) / (2 * maxWaveHeight);
      ocean.geometry.attributes.color.setXYZ(
        i / 3,
        0,
        normalizedHeight,
        1 - normalizedHeight
      );
    }
    ocean.geometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Start animation
  animate();

  // Event listeners for controls
  windSpeedSlider.addEventListener("input", () => {
    windSpeed = parseInt(windSpeedSlider.value);
    windSpeedValue.textContent = windSpeed;
  });

  windDirectionSlider.addEventListener("input", () => {
    windDirection = parseInt(windDirectionSlider.value);
    windDirectionValue.textContent = windDirection;
  });

  environmentSelect.addEventListener("change", () => {
    switch (environmentSelect.value) {
      case "deep-ocean":
        environmentFactor = 1;
        waveFrequency = 0.1;
        break;
      case "coastline":
        environmentFactor = 0.8;
        waveFrequency = 0.15;
        break;
      case "shallow-water":
        environmentFactor = 0.6;
        waveFrequency = 0.2;
        break;
    }
  });
};
// Main JavaScript file for Ocean Simulations

// ... (previous code remains the same)

// Ocean Currents Simulation
simulations.currents = (container) => {
  container.innerHTML = `
    <div class="simulation" id="currents-sim">
      <div class="controls">
        <label for="temperature">Global Temperature: <span id="temperature-value">15</span>°C</label>
        <input type="range" id="temperature" min="0" max="30" value="15">
        <label for="salinity">Global Salinity: <span id="salinity-value">35</span> ppt</label>
        <input type="range" id="salinity" min="30" max="40" value="35">
        <label for="wind-strength">Wind Strength: <span id="wind-strength-value">5</span> m/s</label>
        <input type="range" id="wind-strength" min="0" max="20" value="5">
        <button id="add-debris">Add Debris</button>
        <button id="add-marine-life">Add Marine Life</button>
        <button id="toggle-time-lapse">Toggle Time-Lapse</button>
      </div>
      <div id="currents-canvas"></div>
      <div id="info-panel">
        <h3>Ocean Current Information</h3>
        <p id="current-info">Hover over a current for information</p>
      </div>
      <div id="time-lapse-info">
        <h3>Time-Lapse: <span id="year">2023</span></h3>
      </div>
    </div>
  `;

  const temperatureSlider = document.getElementById("temperature");
  const temperatureValue = document.getElementById("temperature-value");
  const salinitySlider = document.getElementById("salinity");
  const salinityValue = document.getElementById("salinity-value");
  const windStrengthSlider = document.getElementById("wind-strength");
  const windStrengthValue = document.getElementById("wind-strength-value");
  const addDebrisButton = document.getElementById("add-debris");
  const addMarineLifeButton = document.getElementById("add-marine-life");
  const toggleTimeLapseButton = document.getElementById("toggle-time-lapse");
  const infoPanel = document.getElementById("current-info");
  const yearSpan = document.getElementById("year");

  // D3.js setup
  const width = 800;
  const height = 600;
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2]);

  const svg = d3
    .select("#currents-canvas")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const path = d3.geoPath().projection(projection);

  // Load world map data
  d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
  ).then(function (world) {
    // Draw world map
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#d0d0d0")
      .attr("stroke", "#ffffff");

    // Ocean currents data (expanded and more realistic)
    const currents = [
      {
        name: "Gulf Stream",
        coordinates: [
          [-80, 25],
          [-75, 35],
          [-60, 40],
          [-30, 50],
          [0, 50],
        ],
        info: "The Gulf Stream is a powerful ocean current in the Atlantic Ocean. It transports warm water from the Gulf of Mexico towards the North Atlantic, influencing climate patterns in North America and Europe.",
      },
      // ... (add more currents with detailed info)
    ];

    // Draw ocean currents
    const currentPaths = svg
      .append("g")
      .selectAll("path")
      .data(currents)
      .enter()
      .append("path")
      .attr("d", (d) =>
        path({ type: "LineString", coordinates: d.coordinates })
      )
      .attr("fill", "none")
      .attr("stroke", "#0077be")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        infoPanel.innerHTML = `<strong>${d.name}</strong><br>${d.info}<br>Temperature: ${temperatureSlider.value}°C<br>Salinity: ${salinitySlider.value} ppt<br>Wind Strength: ${windStrengthSlider.value} m/s`;
      })
      .on("mouseout", () => {
        infoPanel.innerHTML = "Hover over a current for information";
      });

    // Animation function
    function animateCurrents() {
      currentPaths
        .attr("stroke-dasharray", function () {
          const length = this.getTotalLength();
          return length + " " + length;
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", animateCurrents);
    }

    animateCurrents();

    // Debris particles
    let debris = [];

    function addDebris() {
      const newDebris = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 2,
      };
      debris.push(newDebris);
      updateDebris();
    }

    function updateDebris() {
      const debrisElements = svg.selectAll(".debris").data(debris);

      debrisElements
        .enter()
        .append("circle")
        .attr("class", "debris")
        .attr("r", (d) => d.size)
        .attr("fill", "#8B4513")
        .merge(debrisElements)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

      debrisElements.exit().remove();
    }

    addDebrisButton.addEventListener("click", addDebris);

    // Marine life
    let marineLife = [];
    const marineSpecies = [
      { name: "Whale", icon: "🐳", speed: 0.5 },
      { name: "Turtle", icon: "🐢", speed: 0.3 },
      { name: "Fish", icon: "🐠", speed: 0.7 },
    ];

    function addMarineLife() {
      const species =
        marineSpecies[Math.floor(Math.random() * marineSpecies.length)];
      const newMarineLife = {
        x: Math.random() * width,
        y: Math.random() * height,
        ...species,
      };
      marineLife.push(newMarineLife);
      updateMarineLife();
    }

    function updateMarineLife() {
      const marineLifeElements = svg.selectAll(".marine-life").data(marineLife);

      marineLifeElements
        .enter()
        .append("text")
        .attr("class", "marine-life")
        .text((d) => d.icon)
        .attr("font-size", "20px")
        .merge(marineLifeElements)
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y);

      marineLifeElements.exit().remove();
    }

    addMarineLifeButton.addEventListener("click", addMarineLife);

    // Time-lapse feature
    let timeLapseInterval;
    let currentYear = 2023;

    function toggleTimeLapse() {
      if (timeLapseInterval) {
        clearInterval(timeLapseInterval);
        timeLapseInterval = null;
        toggleTimeLapseButton.textContent = "Start Time-Lapse";
      } else {
        timeLapseInterval = setInterval(() => {
          currentYear++;
          yearSpan.textContent = currentYear;
          // Simulate climate change effects
          temperatureSlider.value = Math.min(
            30,
            parseFloat(temperatureSlider.value) + 0.1
          );
          salinitySlider.value = Math.max(
            30,
            parseFloat(salinitySlider.value) - 0.05
          );
          windStrengthSlider.value = Math.min(
            20,
            parseFloat(windStrengthSlider.value) + 0.1
          );
          updateSimulation();
        }, 1000);
        toggleTimeLapseButton.textContent = "Stop Time-Lapse";
      }
    }

    toggleTimeLapseButton.addEventListener("click", toggleTimeLapse);

    // Update function
    function updateCurrents(temperature, salinity, windStrength) {
      const speed =
        (temperature - 15) / 15 + (salinity - 35) / 5 + windStrength / 10;

      currentPaths
        .transition()
        .duration(1000)
        .attr("stroke-width", 2 + speed * 2)
        .attr("stroke", d3.interpolateRdYlBu(1 - temperature / 30));

      // Update debris positions based on currents and wind
      debris.forEach((d) => {
        const [x, y] = projection.invert([d.x, d.y]);
        const nearestCurrent = currents.reduce(
          (nearest, current) => {
            const distance = d3.geoDistance([x, y], current.coordinates[0]);
            return distance < nearest.distance
              ? { current, distance }
              : nearest;
          },
          { distance: Infinity }
        ).current;

        if (nearestCurrent) {
          const currentVector = [
            nearestCurrent.coordinates[1][0] - nearestCurrent.coordinates[0][0],
            nearestCurrent.coordinates[1][1] - nearestCurrent.coordinates[0][1],
          ];
          const currentSpeed = speed * 2;
          d.x += currentVector[0] * currentSpeed;
          d.y += currentVector[1] * currentSpeed;
        }

        // Add wind effect
        d.x += windStrength * 0.1;
        d.y += windStrength * 0.05;

        // Wrap around the map
        if (d.x > width) d.x -= width;
        if (d.x < 0) d.x += width;
        if (d.y > height) d.y -= height;
        if (d.y < 0) d.y += height;
      });

      updateDebris();

      // Update marine life positions
      marineLife.forEach((m) => {
        const [x, y] = projection.invert([m.x, m.y]);
        const nearestCurrent = currents.reduce(
          (nearest, current) => {
            const distance = d3.geoDistance([x, y], current.coordinates[0]);
            return distance < nearest.distance
              ? { current, distance }
              : nearest;
          },
          { distance: Infinity }
        ).current;

        if (nearestCurrent) {
          const currentVector = [
            nearestCurrent.coordinates[1][0] - nearestCurrent.coordinates[0][0],
            nearestCurrent.coordinates[1][1] - nearestCurrent.coordinates[0][1],
          ];
          const currentSpeed = speed * m.speed;
          m.x += currentVector[0] * currentSpeed;
          m.y += currentVector[1] * currentSpeed;
        }

        // Wrap around the map
        if (m.x > width) m.x -= width;
        if (m.x < 0) m.x += width;
        if (m.y > height) m.y -= height;
        if (m.y < 0) m.y += height;
      });

      updateMarineLife();

      // Update temperature and salinity visualization
      svg.selectAll(".temp-sal-indicator").remove();
      svg
        .append("rect")
        .attr("class", "temp-sal-indicator")
        .attr("x", 10)
        .attr("y", height - 60)
        .attr("width", 20)
        .attr("height", 50)
        .attr("fill", d3.interpolateRdYlBu(1 - temperature / 30));

      svg
        .append("text")
        .attr("class", "temp-sal-indicator")
        .attr("x", 35)
        .attr("y", height - 30)
        .text(`${temperature.toFixed(1)}°C, ${salinity.toFixed(1)} ppt`);
    }

    // Event listeners for sliders
    temperatureSlider.addEventListener("input", updateSimulation);
    salinitySlider.addEventListener("input", updateSimulation);
    windStrengthSlider.addEventListener("input", updateSimulation);

    function updateSimulation() {
      const temp = parseFloat(temperatureSlider.value);
      const sal = parseFloat(salinitySlider.value);
      const wind = parseFloat(windStrengthSlider.value);

      temperatureValue.textContent = temp.toFixed(1);
      salinityValue.textContent = sal.toFixed(1);
      windStrengthValue.textContent = wind.toFixed(1);

      updateCurrents(temp, sal, wind);
    }

    // Initial simulation update
    updateSimulation();
  });
};

// ... (rest of the code remains the same)
// Main JavaScript file for Ocean Simulations

// ... (previous code remains the same)

// Plastic Pollution Impact Simulation
simulations.plasticPollution = (container) => {
  container.innerHTML = `
    <div class="simulation" id="plastic-pollution-sim">
      <div class="controls">
        <label for="pollution-rate">Pollution Rate: <span id="pollution-rate-value">1</span>x</label>
        <input type="range" id="pollution-rate" min="0" max="5" step="0.1" value="1">
        <label for="cleanup-effort">Cleanup Effort: <span id="cleanup-effort-value">0</span>%</label>
        <input type="range" id="cleanup-effort" min="0" max="100" value="0">
        <label for="wind-speed">Wind Speed: <span id="wind-speed-value">0</span> km/h</label>
        <input type="range" id="wind-speed" min="0" max="50" value="0">
        <label for="current-strength">Current Strength: <span id="current-strength-value">0</span></label>
        <input type="range" id="current-strength" min="0" max="10" value="0">
        <button id="add-fish">Add Fish</button>
        <button id="add-turtle">Add Turtle</button>
        <button id="add-shark">Add Shark</button>
        <button id="add-skimmer">Add Skimmer</button>
        <button id="add-boom">Add Boom</button>
        <button id="add-drone">Add Drone</button>
      </div>
      <canvas id="plastic-pollution-canvas"></canvas>
      <div id="info-panel">
        <h3>Simulation Statistics</h3>
        <p>Plastic Particles: <span id="particle-count">0</span></p>
        <p>Microplastics: <span id="microplastic-count">0</span></p>
        <p>Animals: <span id="animal-count">0</span></p>
        <p>Average Animal Health: <span id="avg-animal-health">100</span>%</p>
      </div>
      <div id="educational-info">
        <h3>Plastic Pollution Facts</h3>
        <p id="fact-display"></p>
        <button id="next-fact">Next Fact</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById("plastic-pollution-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 600;

  let pollutionRate = 1;
  let cleanupEffort = 0;
  let windSpeed = 0;
  let currentStrength = 0;
  let plasticParticles = [];
  let microplastics = [];
  let animals = [];
  let cleanupMethods = [];

  const plasticTypes = [
    {
      name: "PET",
      color: "rgba(255, 0, 0, 0.7)",
      breakdownRate: 0.001,
      toxicity: 2,
    },
    {
      name: "HDPE",
      color: "rgba(0, 255, 0, 0.7)",
      breakdownRate: 0.0005,
      toxicity: 1,
    },
    {
      name: "PVC",
      color: "rgba(0, 0, 255, 0.7)",
      breakdownRate: 0.002,
      toxicity: 3,
    },
    {
      name: "LDPE",
      color: "rgba(255, 255, 0, 0.7)",
      breakdownRate: 0.0008,
      toxicity: 1,
    },
    {
      name: "PP",
      color: "rgba(255, 0, 255, 0.7)",
      breakdownRate: 0.0006,
      toxicity: 2,
    },
  ];

  class PlasticParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 5 + 2;
      this.speed = Math.random() * 0.5 + 0.1;
      this.type = plasticTypes[Math.floor(Math.random() * plasticTypes.length)];
      this.lifespan = 1000 / this.type.breakdownRate;
    }

    update() {
      this.y += this.speed;
      this.x += windSpeed / 10;
      this.y += currentStrength / 10;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      this.lifespan--;
      if (this.lifespan <= 0) {
        return this.breakDown();
      }
    }

    breakDown() {
      for (let i = 0; i < 5; i++) {
        microplastics.push(new Microplastic(this.x, this.y, this.type));
      }
      return true; // Signal to remove this particle
    }

    draw() {
      ctx.fillStyle = this.type.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Microplastic {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.size = 1;
      this.speed = Math.random() * 0.2 + 0.05;
      this.type = type;
    }

    update() {
      this.y += this.speed;
      this.x += windSpeed / 20;
      this.y += currentStrength / 20;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = this.type.color.replace("0.7", "0.5");
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  class Animal {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = type === "fish" ? 15 : type === "turtle" ? 30 : 45;
      this.speed = type === "fish" ? 2 : type === "turtle" ? 1 : 1.5;
      this.direction = Math.random() * Math.PI * 2;
      this.health = 100;
      this.plasticIngested = 0;
      this.microplasticsIngested = 0;
    }

    update() {
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;

      if (this.x < 0 || this.x > canvas.width)
        this.direction = Math.PI - this.direction;
      if (this.y < 0 || this.y > canvas.height)
        this.direction = -this.direction;

      // Check for plastic ingestion
      plasticParticles.concat(microplastics).forEach((particle, index) => {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + particle.size) {
          this.health -=
            particle instanceof Microplastic
              ? particle.type.toxicity
              : particle.type.toxicity * 5;
          if (particle instanceof Microplastic) {
            this.microplasticsIngested++;
          } else {
            this.plasticIngested++;
          }
          if (particle instanceof PlasticParticle) {
            plasticParticles.splice(index, 1);
          } else {
            microplastics.splice(index, 1);
          }
        }
      });

      this.health = Math.max(0, this.health);

      // Behavior change based on health
      this.speed =
        this.type === "fish"
          ? 2 * (this.health / 100)
          : this.type === "turtle"
          ? 1 * (this.health / 100)
          : 1.5 * (this.health / 100);

      // Food chain interaction
      if (this.type === "shark") {
        animals.forEach((prey, index) => {
          if (prey.type === "fish") {
            const dx = this.x - prey.x;
            const dy = this.y - prey.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.size + prey.size) {
              this.health = Math.min(100, this.health + 10);
              this.microplasticsIngested += prey.microplasticsIngested;
              animals.splice(index, 1);
            }
          }
        });
      }
    }

    draw() {
      ctx.fillStyle =
        this.type === "fish"
          ? "orange"
          : this.type === "turtle"
          ? "green"
          : "gray";
      ctx.beginPath();
      if (this.type === "fish") {
        ctx.moveTo(this.x + this.size, this.y);
        ctx.lineTo(this.x - this.size, this.y - this.size / 2);
        ctx.lineTo(this.x - this.size, this.y + this.size / 2);
      } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.fill();

      // Health bar
      ctx.fillStyle = `rgb(${255 - this.health * 2.55}, ${
        this.health * 2.55
      }, 0)`;
      ctx.fillRect(
        this.x - this.size,
        this.y - this.size - 10,
        this.size * 2 * (this.health / 100),
        5
      );
    }
  }

  class CleanupMethod {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = type === "skimmer" ? 40 : type === "boom" ? 100 : 20;
      this.speed = type === "skimmer" ? 1 : type === "boom" ? 0 : 2;
      this.direction = Math.random() * Math.PI * 2;
      this.efficiency = type === "skimmer" ? 0.7 : type === "boom" ? 0.9 : 0.5;
    }

    update() {
      if (this.type !== "boom") {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        if (this.x < 0 || this.x > canvas.width)
          this.direction = Math.PI - this.direction;
        if (this.y < 0 || this.y > canvas.height)
          this.direction = -this.direction;
      }

      // Clean up plastic particles
      plasticParticles = plasticParticles.filter((particle) => {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return (
          distance > this.size + particle.size ||
          Math.random() > this.efficiency
        );
      });

      // Clean up microplastics
      microplastics = microplastics.filter((particle) => {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return (
          distance > this.size + particle.size ||
          Math.random() > this.efficiency
        );
      });
    }

    draw() {
      ctx.fillStyle =
        this.type === "skimmer"
          ? "gray"
          : this.type === "boom"
          ? "yellow"
          : "white";
      if (this.type === "boom") {
        ctx.fillRect(this.x - this.size / 2, 0, this.size, canvas.height);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function addAnimal(type) {
    animals.push(
      new Animal(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        type
      )
    );
  }

  function addCleanupMethod(type) {
    cleanupMethods.push(
      new CleanupMethod(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        type
      )
    );
  }

  function updateSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water
    ctx.fillStyle = "rgba(0, 119, 190, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw plastic particles
    plasticParticles = plasticParticles.filter((particle) => {
      particle.update();
      particle.draw();
      return Math.random() >= cleanupEffort / 10000;
    });

    // Update and draw microplastics
    microplastics.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    // Add new plastic particles based on pollution rate
    if (Math.random() < 0.1 * pollutionRate) {
      plasticParticles.push(
        new PlasticParticle(Math.random() * canvas.width, 0)
      );
    }

    // Update and draw animals
    animals = animals.filter((animal) => animal.health > 0);
    animals.forEach((animal) => {
      animal.update();
      animal.draw();
    });

    // Update and draw cleanup methods
    cleanupMethods.forEach((method) => {
      method.update();
      method.draw();
    });

    // Update statistics
    document.getElementById("particle-count").textContent =
      plasticParticles.length;
    document.getElementById("microplastic-count").textContent =
      microplastics.length;
    document.getElementById("animal-count").textContent = animals.length;
    const avgHealth =
      animals.reduce((sum, animal) => sum + animal.health, 0) / animals.length;
    document.getElementById("avg-animal-health").textContent =
      avgHealth.toFixed(2);

    requestAnimationFrame(updateSimulation);
  }

  // Event listeners for controls
  document.getElementById("pollution-rate").addEventListener("input", (e) => {
    pollutionRate = parseFloat(e.target.value);
    document.getElementById("pollution-rate-value").textContent =
      pollutionRate.toFixed(1);
  });

  document.getElementById("cleanup-effort").addEventListener("input", (e) => {
    cleanupEffort = parseInt(e.target.value);
    document.getElementById("cleanup-effort-value").textContent = cleanupEffort;
  });

  document.getElementById("wind-speed").addEventListener("input", (e) => {
    windSpeed = parseFloat(e.target.value);
    document.getElementById("wind-speed-value").textContent = windSpeed;
  });

  document.getElementById("current-strength").addEventListener("input", (e) => {
    currentStrength = parseFloat(e.target.value);
    document.getElementById("current-strength-value").textContent =
      currentStrength;
  });

  document
    .getElementById("add-fish")
    .addEventListener("click", () => addAnimal("fish"));
  document
    .getElementById("add-turtle")
    .addEventListener("click", () => addAnimal("turtle"));
  document
    .getElementById("add-shark")
    .addEventListener("click", () => addAnimal("shark"));
  document
    .getElementById("add-skimmer")
    .addEventListener("click", () => addCleanupMethod("skimmer"));
  document
    .getElementById("add-boom")
    .addEventListener("click", () => addCleanupMethod("boom"));
  document
    .getElementById("add-drone")
    .addEventListener("click", () => addCleanupMethod("drone"));

  // Educational facts
  const facts = [
    "Over 8 million tons of plastic end up in our oceans every year.",
    "Plastic takes hundreds of years to decompose in the ocean.",
    "Microplastics can be ingested by marine life, leading to health problems.",
    "More than 1 million seabirds and 100,000 marine mammals die each year due to plastic pollution.",
    "Reducing plastic use and improving waste management can help mitigate ocean pollution.",
  ];
  let factIndex = 0;

  function showNextFact() {
    document.getElementById("fact-display").textContent = facts[factIndex];
    factIndex = (factIndex + 1) % facts.length;
  }

  document.getElementById("next-fact").addEventListener("click", showNextFact);

  // Start the simulation
  updateSimulation();
};

// ... (rest of the code remains the same)
// Main JavaScript file for Ocean Simulations

// ... (previous code remains the same)

// Tsunami Simulation
simulations.tsunami = (container) => {
  container.innerHTML = `
    <div class="simulation" id="tsunami-sim">
      <div class="controls">
        <button id="trigger-tsunami">Trigger Earthquake</button>
        <label for="earthquake-magnitude">Earthquake Magnitude: <span id="magnitude-value">7.0</span></label>
        <input type="range" id="earthquake-magnitude" min="5.0" max="9.0" step="0.1" value="7.0">
        <label for="water-depth">Ocean Depth: <span id="depth-value">4000</span> m</label>
        <input type="range" id="water-depth" min="1000" max="8000" step="100" value="4000">
        <label for="epicenter-distance">Epicenter Distance: <span id="distance-value">200</span> km</label>
        <input type="range" id="epicenter-distance" min="50" max="500" step="10" value="200">
        <div>
          <label>Camera View:</label>
          <button id="view-overview">Overview</button>
          <button id="view-coastal">Coastal</button>
          <button id="view-underwater">Underwater</button>
        </div>
      </div>
      <div id="tsunami-canvas"></div>
      <div id="info-panel">
        <h3>Simulation Information</h3>
        <p id="simulation-stage"></p>
        <p id="wave-height"></p>
        <p id="wave-speed"></p>
        <p id="estimated-arrival"></p>
        <p id="evacuation-status"></p>
      </div>
    </div>
  `;

  const triggerButton = document.getElementById("trigger-tsunami");
  const magnitudeSlider = document.getElementById("earthquake-magnitude");
  const magnitudeValue = document.getElementById("magnitude-value");
  const depthSlider = document.getElementById("water-depth");
  const depthValue = document.getElementById("depth-value");
  const distanceSlider = document.getElementById("epicenter-distance");
  const distanceValue = document.getElementById("distance-value");
  const simulationStage = document.getElementById("simulation-stage");
  const waveHeightInfo = document.getElementById("wave-height");
  const waveSpeedInfo = document.getElementById("wave-speed");
  const estimatedArrival = document.getElementById("estimated-arrival");
  const evacuationStatus = document.getElementById("evacuation-status");

  // Three.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 600);
  document.getElementById("tsunami-canvas").appendChild(renderer.domElement);

  // Enhanced lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Advanced ocean setup with custom shader
  const oceanGeometry = new THREE.PlaneGeometry(200, 200, 256, 256);
  const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      waveHeight: { value: 0 },
      waveSpeed: { value: 0 },
    },
    vertexShader: `
      uniform float time;
      uniform float waveHeight;
      uniform float waveSpeed;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normal;
        vPosition = position;
        float wave = sin(position.x * 0.05 + time * waveSpeed) * 
                     cos(position.z * 0.05 + time * waveSpeed) * waveHeight;
        vec3 newPosition = position + normal * wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 light = vec3(0.5, 0.2, 1.0);
        light = normalize(light);
        float dProd = max(0.0, dot(vNormal, light));
        vec3 baseColor = vec3(0.1, 0.3, 0.5);
        vec3 color = baseColor * dProd + vec3(0.1, 0.1, 0.2);
        gl_FragColor = vec4(color, 0.8);
      }
    `,
    transparent: true,
  });
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  ocean.rotation.x = -Math.PI / 2;
  scene.add(ocean);

  // Seafloor setup
  const seafloorGeometry = new THREE.PlaneGeometry(200, 200, 128, 128);
  const seafloorMaterial = new THREE.MeshPhongMaterial({ color: 0x2b5d34 });
  const seafloor = new THREE.Mesh(seafloorGeometry, seafloorMaterial);
  seafloor.rotation.x = -Math.PI / 2;
  seafloor.position.y = -20;
  scene.add(seafloor);

  // Detailed coastal topography
  const coastGeometry = new THREE.PlaneGeometry(200, 60, 256, 64);
  const coastMaterial = new THREE.MeshPhongMaterial({ color: 0xc2b280 });
  const coast = new THREE.Mesh(coastGeometry, coastMaterial);
  coast.position.set(0, -0.1, -120);
  coast.rotation.x = -Math.PI / 2;
  scene.add(coast);

  // Add terrain features
  const terrainGeometry = new THREE.PlaneGeometry(200, 60, 256, 64);
  const terrainMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.position.set(0, 0.1, -120);
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);

  // Create hills and valleys
  const terrainPositions = terrain.geometry.attributes.position.array;
  for (let i = 0; i < terrainPositions.length; i += 3) {
    const x = terrainPositions[i];
    const y = terrainPositions[i + 1];
    terrainPositions[i + 2] = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5;
  }
  terrain.geometry.attributes.position.needsUpdate = true;
  terrain.geometry.computeVertexNormals();

  // Buildings setup
  const buildingGeometry = new THREE.BoxGeometry(2, 10, 2);
  const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
  const buildings = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(
      Math.random() * 180 - 90,
      5,
      Math.random() * 30 - 135
    );
    buildings.add(building);
  }
  scene.add(buildings);

  // Enhanced debris setup with physics
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  const debrisGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const debrisMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
  const debris = new THREE.Group();
  const debrisBodies = [];

  for (let i = 0; i < 200; i++) {
    const debrisPiece = new THREE.Mesh(debrisGeometry, debrisMaterial);
    debrisPiece.position.set(
      Math.random() * 200 - 100,
      -1,
      Math.random() * 200 - 100
    );
    debris.add(debrisPiece);

    const debrisShape = new CANNON.Sphere(0.5);
    const debrisBody = new CANNON.Body({
      mass: 1,
      shape: debrisShape,
      position: new CANNON.Vec3(
        debrisPiece.position.x,
        debrisPiece.position.y,
        debrisPiece.position.z
      ),
    });
    world.addBody(debrisBody);
    debrisBodies.push({ mesh: debrisPiece, body: debrisBody });
  }
  scene.add(debris);

  // Tectonic plates
  const plate1 = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 200),
    new THREE.MeshPhongMaterial({ color: 0x8b4513, side: THREE.DoubleSide })
  );
  const plate2 = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 200),
    new THREE.MeshPhongMaterial({ color: 0xa0522d, side: THREE.DoubleSide })
  );
  plate1.rotation.x = -Math.PI / 2;
  plate2.rotation.x = -Math.PI / 2;
  plate1.position.set(-50, -21, 0);
  plate2.position.set(50, -21, 0);
  scene.add(plate1, plate2);

  // Evacuation routes and safe zones
  const routeGeometry = new THREE.BufferGeometry();
  const routeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const routePoints = [];
  for (let i = 0; i < 5; i++) {
    routePoints.push(
      new THREE.Vector3(
        Math.random() * 180 - 90,
        0.5,
        Math.random() * 30 - 135
      ),
      new THREE.Vector3(Math.random() * 180 - 90, 0.5, -150)
    );
  }
  routeGeometry.setFromPoints(routePoints);
  const evacuationRoutes = new THREE.Line(routeGeometry, routeMaterial);
  scene.add(evacuationRoutes);

  const safeZoneGeometry = new THREE.CircleGeometry(10, 32);
  const safeZoneMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5,
  });
  const safeZone = new THREE.Mesh(safeZoneGeometry, safeZoneMaterial);
  safeZone.rotation.x = -Math.PI / 2;
  safeZone.position.set(0, 0.2, -150);
  scene.add(safeZone);

  // Camera positions
  const cameraPositions = {
    overview: {
      position: new THREE.Vector3(0, 60, 120),
      lookAt: new THREE.Vector3(0, 0, -30),
    },
    coastal: {
      position: new THREE.Vector3(0, 10, -100),
      lookAt: new THREE.Vector3(0, 0, -120),
    },
    underwater: {
      position: new THREE.Vector3(0, -15, 50),
      lookAt: new THREE.Vector3(0, -20, 0),
    },
  };

  // Set initial camera position
  camera.position.copy(cameraPositions.overview.position);
  camera.lookAt(cameraPositions.overview.lookAt);

  // Tsunami parameters
  let simulationState = "idle";
  let tsunamiTime = 0;
  let tsunamiMagnitude = 7.0;
  let waterDepth = 4000;
  let epicenterDistance = 200;
  let maxWaveHeight = 0;

  function triggerTsunami() {
    simulationState = "earthquake";
    tsunamiTime = 0;
    maxWaveHeight = 0;
  }

  function updateTsunami() {
    if (simulationState === "idle") return;

    tsunamiTime += 0.016; // Assuming 60 fps

    // Calculate wave speed based on water depth (shallow water equation)
    const waveSpeed = Math.sqrt(9.8 * waterDepth);

    // Calculate wave amplitude based on magnitude and distance
    const waveAmplitude =
      Math.pow(10, tsunamiMagnitude - 5) *
      2 *
      Math.exp(-epicenterDistance / 1000);

    // Update simulation stages
    if (simulationState === "earthquake" && tsunamiTime > 5) {
      simulationState = "water_recession";
    } else if (simulationState === "water_recession" && tsunamiTime > 15) {
      simulationState = "tsunami_wave";
    }

    // Update ocean shader uniforms
    ocean.material.uniforms.time.value = tsunamiTime;
    ocean.material.uniforms.waveHeight.value = waveAmplitude;
    ocean.material.uniforms.waveSpeed.value = waveSpeed * 0.01;

    // Tectonic plate movement during earthquake
    if (simulationState === "earthquake") {
      plate1.position.y = -21 + Math.sin(tsunamiTime * 2) * 0.5;
      plate2.position.y = -21 - Math.sin(tsunamiTime * 2) * 0.5;
    }

    // Update debris physics
    world.step(1 / 60);
    debrisBodies.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);

      // Apply wave force to debris
      const waveHeight = getWaveHeight(body.position.x, body.position.z);
      body.applyForce(new CANNON.Vec3(0, waveHeight * 10, 0), body.position);
    });

    // Update building positions (simple flooding effect)
    buildings.children.forEach((building) => {
      const waveHeight = getWaveHeight(
        building.position.x,
        building.position.z
      );
      building.position.y = Math.max(5, waveHeight + 5);

      // Simple building damage based on wave height
      if (waveHeight > 10) {
        building.scale.y = Math.max(0.1, 1 - (waveHeight - 10) / 10);
      }
    });

    // Update maximum wave height
    maxWaveHeight = Math.max(maxWaveHeight, waveAmplitude);

    // Update information panel
    updateInfoPanel(waveSpeed, maxWaveHeight);

    if (tsunamiTime > 200) simulationState = "idle";
  }

  function getWaveHeight(x, z) {
    const distance = Math.sqrt(x * x + z * z);
    const wavePhase = distance - Math.sqrt(9.8 * waterDepth) * tsunamiTime;
    const waveAmplitude =
      Math.pow(10, tsunamiMagnitude - 5) *
      2 *
      Math.exp(-epicenterDistance / 1000);
    return (
      waveAmplitude * Math.exp(-0.0001 * distance) * Math.sin(0.1 * wavePhase)
    );
  }

  function updateInfoPanel(waveSpeed, maxWaveHeight) {
    waveHeightInfo.textContent = `Max Wave Height: ${maxWaveHeight.toFixed(
      2
    )} m`;
    waveSpeedInfo.textContent = `Wave Speed: ${waveSpeed.toFixed(2)} m/s`;
    estimatedArrival.textContent = `Estimated Arrival Time: ${Math.max(
      0,
      Math.ceil(epicenterDistance / waveSpeed)
    )} min`;
    evacuationStatus.textContent = `Evacuation Status: ${
      maxWaveHeight > 5 ? "EVACUATE IMMEDIATELY" : "Stay Alert"
    }`;

    // Update simulation stage information
    switch (simulationState) {
      case "idle":
        simulationStage.textContent = "Simulation Stage: Ready";
        break;
      case "earthquake":
        simulationStage.textContent = "Simulation Stage: Earthquake";
        break;
      case "water_recession":
        simulationStage.textContent = "Simulation Stage: Water Recession";
        break;
      case "tsunami_wave":
        simulationStage.textContent = "Simulation Stage: Tsunami Wave";
        break;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    updateTsunami();
    renderer.render(scene, camera);
  }

  animate();

  // Event listeners for controls
  triggerButton.addEventListener("click", triggerTsunami);

  magnitudeSlider.addEventListener("input", (event) => {
    tsunamiMagnitude = parseFloat(event.target.value);
    magnitudeValue.textContent = tsunamiMagnitude.toFixed(1);
  });

  depthSlider.addEventListener("input", (event) => {
    waterDepth = parseFloat(event.target.value);
    depthValue.textContent = waterDepth.toFixed(0);
  });

  distanceSlider.addEventListener("input", (event) => {
    epicenterDistance = parseFloat(event.target.value);
    distanceValue.textContent = epicenterDistance.toFixed(0);
  });

  // Camera control buttons
  document.getElementById("view-overview").addEventListener("click", () => {
    camera.position.set(0, 60, 120);
    camera.lookAt(0, 0, -30);
  });

  document.getElementById("view-coastal").addEventListener("click", () => {
    camera.position.set(0, 10, -100);
    camera.lookAt(0, 0, -120);
  });

  document.getElementById("view-underwater").addEventListener("click", () => {
    camera.position.set(0, -15, 50);
    camera.lookAt(0, -20, 0);
  });

  // Add mouse controls for camera
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
};

// ... (rest of the code remains the same)
// Enhanced Marine Ecosystem Simulation
simulations.ecosystem = (container) => {
  container.innerHTML = `
    <div class="simulation" id="ecosystem-sim">
      <div class="controls">
        <label for="fishing-rate">Fishing Intensity: <span id="fishing-rate-value">1</span>x</label>
        <input type="range" id="fishing-rate" min="0" max="5" step="0.1" value="1">
        <label for="pollution-level">Pollution Level: <span id="pollution-level-value">0</span>%</label>
        <input type="range" id="pollution-level" min="0" max="100" value="0">
        <label for="temperature">Water Temperature: <span id="temperature-value">15</span>°C</label>
        <input type="range" id="temperature" min="0" max="30" value="15">
        <button id="add-ship">Add Fishing Ship</button>
        <button id="add-oil-spill">Simulate Oil Spill</button>
      </div>
      <canvas id="ecosystem-canvas"></canvas>
      <div id="ecosystem-info"></div>
    </div>
  `;

  const fishingRateSlider = document.getElementById("fishing-rate");
  const fishingRateValue = document.getElementById("fishing-rate-value");
  const pollutionLevelSlider = document.getElementById("pollution-level");
  const pollutionLevelValue = document.getElementById("pollution-level-value");
  const temperatureSlider = document.getElementById("temperature");
  const temperatureValue = document.getElementById("temperature-value");
  const addShipButton = document.getElementById("add-ship");
  const addOilSpillButton = document.getElementById("add-oil-spill");
  const canvas = document.getElementById("ecosystem-canvas");
  const ctx = canvas.getContext("2d");
  const infoDiv = document.getElementById("ecosystem-info");

  canvas.width = 800;
  canvas.height = 600;

  class MarineOrganism {
    constructor(x, y, size, speed) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.size = size;
      this.speed = speed;
      this.angle = Math.random() * Math.PI * 2;
    }

    move() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (this.x < 0 || this.x > canvas.width)
        this.angle = Math.PI - this.angle;
      if (this.y < 0 || this.y > canvas.height) this.angle = -this.angle;

      this.angle += (Math.random() - 0.5) * 0.2;
    }
  }

  class Fish extends MarineOrganism {
    constructor(type) {
      super(null, null, Math.random() * 10 + 5, Math.random() * 2 + 1);
      this.type = type || (Math.random() < 0.2 ? "predator" : "prey");
      this.energy = 100;
    }

    draw() {
      ctx.fillStyle =
        this.type === "predator"
          ? "rgba(255, 0, 0, 0.8)"
          : "rgba(255, 165, 0, 0.8)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.size, this.y - this.size / 2);
      ctx.lineTo(this.x - this.size, this.y + this.size / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  class Plankton extends MarineOrganism {
    constructor() {
      super(null, null, Math.random() * 3 + 1, 0.1);
    }

    move() {
      super.move();
      this.y += Math.random() - 0.5;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Ship {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = 30;
      this.speed = 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.fishCaught = 0;
    }

    move() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (this.x < 0 || this.x > canvas.width)
        this.angle = Math.PI - this.angle;
      if (this.y < 0 || this.y > canvas.height) this.angle = -this.angle;

      this.angle += (Math.random() - 0.5) * 0.1;
    }

    draw() {
      ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.size, this.y - this.size / 2);
      ctx.lineTo(this.x - this.size, this.y + this.size / 2);
      ctx.closePath();
      ctx.fill();
    }

    fish(fishes) {
      const catchRadius = 50;
      fishes = fishes.filter((fish) => {
        const dx = this.x - fish.x;
        const dy = this.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < catchRadius) {
          this.fishCaught++;
          return false;
        }
        return true;
      });
      return fishes;
    }
  }

  class OilSpill {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 100;
      this.growthRate = 0.5;
    }

    grow() {
      if (this.radius < this.maxRadius) {
        this.radius += this.growthRate;
      }
    }

    draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let fishes = Array(100)
    .fill()
    .map(() => new Fish());
  let planktons = Array(1000)
    .fill()
    .map(() => new Plankton());
  let ships = [];
  let oilSpills = [];

  function updateEcosystem() {
    const fishingRate = parseFloat(fishingRateSlider.value);
    const pollutionLevel = parseInt(pollutionLevelSlider.value);
    const temperature = parseInt(temperatureSlider.value);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water
    const waterColor = `rgba(0, ${119 - pollutionLevel}, ${
      190 - pollutionLevel
    }, 1)`;
    ctx.fillStyle = waterColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw plankton
    planktons.forEach((plankton) => {
      plankton.move();
      plankton.draw();
    });

    // Update and draw fish
    fishes.forEach((fish, index) => {
      fish.move();
      fish.draw();

      // Fish eating plankton or other fish
      if (fish.type === "prey") {
        planktons = planktons.filter((plankton) => {
          const dx = fish.x - plankton.x;
          const dy = fish.y - plankton.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < fish.size) {
            fish.energy += 10;
            return false;
          }
          return true;
        });
      } else {
        fishes = fishes.filter((prey, preyIndex) => {
          if (prey.type === "prey") {
            const dx = fish.x - prey.x;
            const dy = fish.y - prey.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < fish.size * 2) {
              fish.energy += 50;
              return false;
            }
          }
          return true;
        });
      }

      // Fish reproduction
      if (
        fish.energy > 150 &&
        Math.random() < 0.01 * (1 - Math.abs(temperature - 15) / 15)
      ) {
        fishes.push(new Fish(fish.type));
        fish.energy -= 50;
      }

      // Fish death
      fish.energy -=
        0.1 +
        (0.1 * pollutionLevel) / 100 +
        (0.1 * Math.abs(temperature - 15)) / 15;
      if (fish.energy <= 0) {
        fishes.splice(index, 1);
      }
    });

    // Update and draw ships
    ships.forEach((ship) => {
      ship.move();
      ship.draw();
      fishes = ship.fish(fishes);
    });

    // Update and draw oil spills
    oilSpills.forEach((spill) => {
      spill.grow();
      spill.draw();

      // Oil spill effects
      fishes = fishes.filter((fish) => {
        const dx = fish.x - spill.x;
        const dy = fish.y - spill.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < spill.radius) {
          fish.energy -= 1;
          return fish.energy > 0;
        }
        return true;
      });

      planktons = planktons.filter((plankton) => {
        const dx = plankton.x - spill.x;
        const dy = plankton.y - spill.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= spill.radius;
      });
    });

    // Plankton growth
    if (
      Math.random() <
      0.1 * (1 - pollutionLevel / 100) * (1 - Math.abs(temperature - 15) / 15)
    ) {
      planktons.push(new Plankton());
    }

    // Display stats
    updateInfo();

    requestAnimationFrame(updateEcosystem);
  }

  function updateInfo() {
    const preyCount = fishes.filter((fish) => fish.type === "prey").length;
    const predatorCount = fishes.filter(
      (fish) => fish.type === "predator"
    ).length;
    const totalFishCaught = ships.reduce(
      (total, ship) => total + ship.fishCaught,
      0
    );

    infoDiv.innerHTML = `
      <h3>Ecosystem Statistics</h3>
      <p>Prey Fish: ${preyCount}</p>
      <p>Predator Fish: ${predatorCount}</p>
      <p>Plankton: ${planktons.length}</p>
      <p>Ships: ${ships.length}</p>
      <p>Fish Caught: ${totalFishCaught}</p>
      <p>Oil Spills: ${oilSpills.length}</p>
    `;
  }

  fishingRateSlider.addEventListener("input", () => {
    fishingRateValue.textContent = parseFloat(fishingRateSlider.value).toFixed(
      1
    );
  });

  pollutionLevelSlider.addEventListener("input", () => {
    pollutionLevelValue.textContent = pollutionLevelSlider.value;
  });

  temperatureSlider.addEventListener("input", () => {
    temperatureValue.textContent = temperatureSlider.value;
  });

  addShipButton.addEventListener("click", () => {
    ships.push(new Ship());
  });

  addOilSpillButton.addEventListener("click", () => {
    oilSpills.push(
      new OilSpill(Math.random() * canvas.width, Math.random() * canvas.height)
    );
  });

  updateEcosystem();
};

// Enhanced Oil Spill Cleanup Simulation
simulations.oilspill = (container) => {
  container.innerHTML = `
    <div class="simulation" id="oilspill-sim">
      <div class="controls">
        <button id="start-spill">Start Oil Spill</button>
        <button id="deploy-skimmer">Deploy Skimmer ($500)</button>
        <button id="deploy-boom">Deploy Boom ($200)</button>
        <button id="deploy-dispersant">Use Dispersant ($1000)</button>
        <label for="wind-direction">Wind Direction: <span id="wind-direction-value">0</span>°</label>
        <input type="range" id="wind-direction" min="0" max="359" value="0">
        <label for="wind-speed">Wind Speed: <span id="wind-speed-value">0</span> km/h</label>
        <input type="range" id="wind-speed" min="0" max="100" value="0">
        <label for="current-direction">Ocean Current: <span id="current-direction-value">0</span>°</label>
        <input type="range" id="current-direction" min="0" max="359" value="0">
        <label for="oil-type">Oil Type:</label>
        <select id="oil-type">
          <option value="light">Light Crude</option>
          <option value="heavy">Heavy Crude</option>
        </select>
      </div>
      <canvas id="oilspill-canvas"></canvas>
      <div id="simulation-info"></div>
    </div>
  `;

  const startSpillBtn = document.getElementById("start-spill");
  const deploySkimmerBtn = document.getElementById("deploy-skimmer");
  const deployBoomBtn = document.getElementById("deploy-boom");
  const deployDispersantBtn = document.getElementById("deploy-dispersant");
  const windDirectionSlider = document.getElementById("wind-direction");
  const windDirectionValue = document.getElementById("wind-direction-value");
  const windSpeedSlider = document.getElementById("wind-speed");
  const windSpeedValue = document.getElementById("wind-speed-value");
  const currentDirectionSlider = document.getElementById("current-direction");
  const currentDirectionValue = document.getElementById(
    "current-direction-value"
  );
  const oilTypeSelect = document.getElementById("oil-type");
  const canvas = document.getElementById("oilspill-canvas");
  const ctx = canvas.getContext("2d");
  const infoDiv = document.getElementById("simulation-info");

  canvas.width = 800;
  canvas.height = 600;

  let oilParticles = [];
  let skimmers = [];
  let booms = [];
  let dispersants = [];
  let isSpillActive = false;
  let windDirection = 0;
  let windSpeed = 0;
  let currentDirection = 0;
  let simulationTime = 0;
  let budget = 10000;
  let environmentalImpact = 0;
  let coastalAreas = [
    { x: 0, y: 0, width: 100, height: canvas.height, type: "rocky" },
    {
      x: canvas.width - 100,
      y: 0,
      width: 100,
      height: canvas.height,
      type: "sandy",
    },
    {
      x: 0,
      y: canvas.height - 100,
      width: canvas.width,
      height: 100,
      type: "marshland",
    },
  ];
  let wildlife = [];

  class OilParticle {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.type = type;
      this.size =
        type === "light" ? Math.random() * 2 + 1 : Math.random() * 4 + 2;
      this.age = 0;
      this.weatheringFactor = 0;
    }

    move() {
      const windForceX =
        (Math.cos((windDirection * Math.PI) / 180) * windSpeed) / 10;
      const windForceY =
        (Math.sin((windDirection * Math.PI) / 180) * windSpeed) / 10;
      const currentForceX =
        (Math.cos((currentDirection * Math.PI) / 180) * 5) / 10;
      const currentForceY =
        (Math.sin((currentDirection * Math.PI) / 180) * 5) / 10;

      this.vx += (windForceX + currentForceX) * 0.01;
      this.vy += (windForceY + currentForceY) * 0.01;

      // Apply drift based on oil type
      if (this.type === "light") {
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
      } else {
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Apply drag force
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      this.age++;
      this.weatheringFactor = Math.min(
        1,
        this.age / (this.type === "light" ? 1000 : 2000)
      );
    }

    draw() {
      const alpha = Math.max(0, 1 - this.weatheringFactor);
      ctx.fillStyle =
        this.type === "light"
          ? `rgba(100, 100, 100, ${alpha})`
          : `rgba(50, 50, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.size * (1 - this.weatheringFactor * 0.5),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  class Skimmer {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 30;
      this.capacity = 100;
      this.collected = 0;
      this.efficiency = 0.8 + Math.random() * 0.2; // 80-100% efficiency
    }

    move() {
      // Move towards the nearest high-density oil area
      let nearestOil = null;
      let minDistance = Infinity;
      oilParticles.forEach((particle) => {
        const distance = Math.sqrt(
          (particle.x - this.x) ** 2 + (particle.y - this.y) ** 2
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestOil = particle;
        }
      });

      if (nearestOil) {
        const dx = nearestOil.x - this.x;
        const dy = nearestOil.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / distance) * 2;
        this.y += (dy / distance) * 2;
      }

      // Apply environmental effects
      this.x += (Math.random() - 0.5) * 2;
      this.y += (Math.random() - 0.5) * 2;

      if (this.x < 0) this.x = 0;
      if (this.x > canvas.width) this.x = canvas.width;
      if (this.y < 0) this.y = 0;
      if (this.y > canvas.height) this.y = canvas.height;
    }

    draw() {
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw capacity indicator
      ctx.fillStyle = "white";
      ctx.fillRect(this.x - 15, this.y - 25, 30, 5);
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.x - 15,
        this.y - 25,
        (this.collected / this.capacity) * 30,
        5
      );
    }
  }

  class Dispersant {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 50;
      this.duration = 300;
    }

    update() {
      this.duration--;
      // Dispersant drift
      this.x += (Math.random() - 0.5) * 2;
      this.y += (Math.random() - 0.5) * 2;
    }

    draw() {
      const alpha = this.duration / 300;
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Wildlife {
    constructor(type) {
      this.type = type;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.speed = Math.random() * 2 + 1;
      this.direction = Math.random() * Math.PI * 2;
      this.contaminated = false;
    }

    move() {
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;

      // Wrap around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Randomly change direction
      if (Math.random() < 0.02) {
        this.direction += ((Math.random() - 0.5) * Math.PI) / 2;
      }

      // Check for oil contamination
      if (!this.contaminated) {
        for (let particle of oilParticles) {
          const dx = this.x - particle.x;
          const dy = this.y - particle.y;
          if (dx * dx + dy * dy < 100) {
            this.contaminated = true;
            environmentalImpact += 10;
            break;
          }
        }
      }
    }

    draw() {
      ctx.fillStyle = this.contaminated ? "brown" : "blue";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function startSpill() {
    if (!isSpillActive) {
      isSpillActive = true;
      oilParticles = [];
      const oilType = oilTypeSelect.value;
      for (let i = 0; i < 1000; i++) {
        oilParticles.push(
          new OilParticle(canvas.width / 2, canvas.height / 2, oilType)
        );
      }
      simulationTime = 0;
      environmentalImpact = 0;
      wildlife = [];
      for (let i = 0; i < 20; i++) {
        wildlife.push(new Wildlife(Math.random() < 0.5 ? "fish" : "bird"));
      }
    }
  }

  function deploySkimmer() {
    if (budget >= 500) {
      skimmers.push(
        new Skimmer(Math.random() * canvas.width, Math.random() * canvas.height)
      );
      budget -= 500;
    }
  }

  function deployBoom() {
    if (budget >= 200) {
      booms.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
      });
      budget -= 200;
    }
  }

  function deployDispersant() {
    if (budget >= 1000) {
      dispersants.push(
        new Dispersant(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
      budget -= 1000;
    }
  }

  function updateSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water
    ctx.fillStyle = "rgba(0, 119, 190, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw coastal areas
    coastalAreas.forEach((area) => {
      switch (area.type) {
        case "rocky":
          ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
          break;
        case "sandy":
          ctx.fillStyle = "rgba(194, 178, 128, 0.8)";
          break;
        case "marshland":
          ctx.fillStyle = "rgba(76, 153, 0, 0.8)";
          break;
      }
      ctx.fillRect(area.x, area.y, area.width, area.height);
    });

    // Update and draw oil particles
    oilParticles = oilParticles.filter((particle, index) => {
      particle.move();
      particle.draw();

      // Check collision with skimmers
      skimmers.forEach((skimmer) => {
        const dx = particle.x - skimmer.x;
        const dy = particle.y - skimmer.y;
        if (
          dx * dx + dy * dy < skimmer.radius * skimmer.radius &&
          skimmer.collected < skimmer.capacity
        ) {
          if (Math.random() < skimmer.efficiency) {
            skimmer.collected++;
            return false;
          }
        }
      });

      // Check collision with booms
      booms.forEach((boom) => {
        const A = { x: boom.x1, y: boom.y1 };
        const B = { x: boom.x2, y: boom.y2 };
        const C = { x: particle.x, y: particle.y };
        const AB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
        const AC = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2);
        const BC = Math.sqrt((B.x - C.x) ** 2 + (B.y - C.y) ** 2);
        const angle = Math.acos((BC ** 2 + AC ** 2 - AB ** 2) / (2 * AC * BC));

        // Check if particle is within boom influence
        if (angle < Math.PI / 8 && AC < AB && BC < AB) {
          particle.vx *= -0.5;
          particle.vy *= -0.5;
        }
      });

      // Check collision with dispersants
      dispersants.forEach((dispersant) => {
        const dx = particle.x - dispersant.x;
        const dy = particle.y - dispersant.y;
        if (dx * dx + dy * dy < dispersant.radius * dispersant.radius) {
          particle.weatheringFactor += 0.01;
          if (particle.weatheringFactor >= 1) {
            return false;
          }
        }
      });

      return true; // Keep particle in the simulation
    });

    // Update and draw skimmers
    skimmers.forEach((skimmer) => {
      skimmer.move();
      skimmer.draw();
    });

    // Update and draw dispersants
    dispersants = dispersants.filter((dispersant) => {
      dispersant.update();
      dispersant.draw();
      return dispersant.duration > 0; // Keep only active dispersants
    });

    // Update and draw wildlife
    wildlife.forEach((animal) => {
      animal.move();
      animal.draw();
    });

    // Draw booms
    booms.forEach((boom) => {
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(boom.x1, boom.y1);
      ctx.lineTo(boom.x2, boom.y2);
      ctx.stroke();
    });

    // Update simulation info
    infoDiv.innerHTML = `
      <p>Budget: $${budget}</p>
      <p>Simulation Time: ${simulationTime} seconds</p>
      <p>Environmental Impact: ${environmentalImpact}</p>
    `;

    // Update simulation time
    simulationTime++;

    // Continue the simulation loop
    requestAnimationFrame(updateSimulation);
  }

  // Event listeners
  startSpillBtn.addEventListener("click", startSpill);
  deploySkimmerBtn.addEventListener("click", deploySkimmer);
  deployBoomBtn.addEventListener("click", deployBoom);
  deployDispersantBtn.addEventListener("click", deployDispersant);

  windDirectionSlider.addEventListener("input", () => {
    windDirection = parseInt(windDirectionSlider.value);
    windDirectionValue.textContent = windDirection;
  });

  windSpeedSlider.addEventListener("input", () => {
    windSpeed = parseInt(windSpeedSlider.value);
    windSpeedValue.textContent = windSpeed;
  });

  currentDirectionSlider.addEventListener("input", () => {
    currentDirection = parseInt(currentDirectionSlider.value);
    currentDirectionValue.textContent = currentDirection;
  });

  // Start the simulation loop
  updateSimulation();
};

// Enhanced Salinity and Buoyancy Simulation
simulations.salinity = (container) => {
  container.innerHTML = `
    <div class="simulation-container">
      <canvas id="salinity-canvas"></canvas>
      <div class="controls">
        <div>
          <label for="salinity">Salinity: <span id="salinity-value">35</span> ppt</label>
          <input type="range" id="salinity" min="0" max="50" value="35">
        </div>
        <div>
          <label for="object-density">Object Density: <span id="object-density-value">1000</span> kg/m³</label>
          <input type="range" id="object-density" min="800" max="1200" value="1000">
        </div>
        <div>
          <label for="temperature">Temperature: <span id="temperature-value">20</span>°C</label>
          <input type="range" id="temperature" min="0" max="40" value="20">
        </div>
        <button id="add-object">Add Object</button>
        <button id="reset">Reset Simulation</button>
      </div>
      <div id="info-panel">
        <h3>Simulation Info</h3>
        <p id="water-density"></p>
        <p id="objects-count"></p>
        <p id="educational-info"></p>
      </div>
    </div>
  `;

  const canvas = document.getElementById("salinity-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 600;

  let objects = [];
  let salinity = 35;
  let objectDensity = 1000;
  let temperature = 20;
  let time = 0;

  class FloatingObject {
    constructor(x, y, density) {
      this.x = x;
      this.y = y;
      this.density = density;
      this.radius = 20;
      this.vy = 0;
      this.color = this.getColor();
    }

    getColor() {
      const normalizedDensity = (this.density - 800) / 400;
      const r = Math.floor(255 * (1 - normalizedDensity));
      const b = Math.floor(255 * normalizedDensity);
      return `rgb(${r}, 0, ${b})`;
    }

    update(waterDensity) {
      const buoyancyForce =
        (waterDensity - this.density) *
        9.81 *
        ((4 / 3) * Math.PI * this.radius ** 3);
      const dragForce = -0.5 * this.vy * Math.abs(this.vy);
      const netForce = buoyancyForce + dragForce;

      this.vy +=
        netForce / ((4 / 3) * Math.PI * this.radius ** 3 * this.density);
      this.y += this.vy;

      if (this.y < this.radius) {
        this.y = this.radius;
        this.vy = 0;
      } else if (this.y > canvas.height - this.radius) {
        this.y = canvas.height - this.radius;
        this.vy = 0;
      }
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function addObject() {
    objects.push(
      new FloatingObject(
        Math.random() * canvas.width,
        canvas.height / 2,
        objectDensity
      )
    );
  }

  function resetSimulation() {
    objects = [];
    salinity = 35;
    objectDensity = 1000;
    temperature = 20;
    updateSliders();
  }

  function updateSliders() {
    document.getElementById("salinity").value = salinity;
    document.getElementById("salinity-value").textContent = salinity;
    document.getElementById("object-density").value = objectDensity;
    document.getElementById("object-density-value").textContent = objectDensity;
    document.getElementById("temperature").value = temperature;
    document.getElementById("temperature-value").textContent = temperature;
  }

  function calculateWaterDensity(salinity, temperature) {
    // Simplified equation for water density based on salinity and temperature
    return 1000 + 0.8 * salinity - 0.2 * temperature;
  }

  function getWaterColor(salinity, temperature) {
    const r = Math.floor(30 + salinity * 1.5);
    const g = Math.floor(119 + salinity - temperature * 1.5);
    const b = Math.floor(190 + salinity - temperature * 2);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawWaves(ctx, time) {
    const waveAmplitude = 5;
    const waveFrequency = 0.02;
    const waveSpeed = 0.05;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let x = 0; x < canvas.width; x++) {
      const y =
        Math.sin(x * waveFrequency + time * waveSpeed) * waveAmplitude +
        canvas.height / 2;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function updateSimulation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water
    const waterDensity = calculateWaterDensity(salinity, temperature);
    const waterColor = getWaterColor(salinity, temperature);
    ctx.fillStyle = waterColor;
    drawWaves(ctx, time);

    // Update and draw objects
    objects.forEach((object) => {
      object.update(waterDensity);
      object.draw();
    });

    // Draw water surface line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Update info panel
    document.getElementById(
      "water-density"
    ).textContent = `Water Density: ${waterDensity.toFixed(2)} kg/m³`;
    document.getElementById(
      "objects-count"
    ).textContent = `Objects: ${objects.length}`;
    updateEducationalInfo();

    time += 0.1;
    requestAnimationFrame(updateSimulation);
  }

  function updateEducationalInfo() {
    const infoPanel = document.getElementById("educational-info");
    let info = "";

    if (salinity < 5) {
      info =
        "Low salinity: This represents freshwater environments like rivers and lakes.";
    } else if (salinity < 30) {
      info =
        "Moderate salinity: This is typical of brackish water in estuaries.";
    } else {
      info = "High salinity: This represents typical ocean conditions.";
    }

    if (temperature < 10) {
      info += " The low temperature increases water density.";
    } else if (temperature > 30) {
      info += " The high temperature decreases water density.";
    }

    infoPanel.textContent = info;
  }

  document.getElementById("salinity").addEventListener("input", (e) => {
    salinity = parseInt(e.target.value);
    document.getElementById("salinity-value").textContent = salinity;
  });

  document.getElementById("object-density").addEventListener("input", (e) => {
    objectDensity = parseInt(e.target.value);
    document.getElementById("object-density-value").textContent = objectDensity;
  });

  document.getElementById("temperature").addEventListener("input", (e) => {
    temperature = parseInt(e.target.value);
    document.getElementById("temperature-value").textContent = temperature;
  });

  document.getElementById("add-object").addEventListener("click", addObject);
  document.getElementById("reset").addEventListener("click", resetSimulation);

  updateSimulation();
};
