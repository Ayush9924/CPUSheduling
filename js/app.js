import { CPUScheduler } from './scheduler.js';
import { initThreeJSBackground, initGanttChart3D, renderGanttChart3D } from './threejs.js';

document.addEventListener("DOMContentLoaded", () => {
    // Initialize UI elements
    const processTable = document.getElementById("processTable");
    const outputTable = document.getElementById("outputTable");
    const ganttChart = document.getElementById("ganttChart");
    const threejsGantt = document.getElementById("threejs-gantt");
    const processCountDisplay = document.getElementById("processCount");
    const runBtn = document.getElementById("runBtn");
    const resetBtn = document.getElementById("resetBtn");
    const increaseBtn = document.getElementById("increaseProcess");
    const decreaseBtn = document.getElementById("decreaseProcess");
    const algorithmSelect = document.getElementById("algorithm");
    const quantumContainer = document.getElementById("quantumContainer");
    const quantumInput = document.getElementById("quantumTime");
    const priorityHeader = document.getElementById("priorityHeader");
    const contextSwitchInput = document.getElementById("contextSwitchTime");
    const darkModeToggle = document.getElementById("darkModeToggle");
    
    // Performance metrics elements
    const avgTATElement = document.getElementById("avgTAT");
    const avgWTElement = document.getElementById("avgWT");
    const totalTimeElement = document.getElementById("totalTime");
    const throughputElement = document.getElementById("throughput");
    
    let processCount = 3;
    const scheduler = new CPUScheduler();
    
    // Initialize Three.js background
    initThreeJSBackground();
    initGanttChart3D(); // Initialize Gantt chart 3D
    
    // Dark mode toggle with better color scheme
    function toggleDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("darkMode", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("darkMode", "false");
        }
    }
    
    darkModeToggle.addEventListener("click", () => {
        const isDark = !document.documentElement.classList.contains("dark");
        toggleDarkMode(isDark);
    });
    
    // Check for saved dark mode preference
    if (localStorage.getItem("darkMode") === "true") {
        toggleDarkMode(true);
    }
    
    // Algorithm selection change
    function handleAlgorithmChange() {
        const algorithm = algorithmSelect.value;
        
        // Show/hide quantum input for Round Robin
        quantumContainer.classList.toggle("hidden", algorithm !== "rr");
        
        // Show/hide priority column
        const showPriority = algorithm.includes("priority");
        priorityHeader.classList.toggle("hidden", !showPriority);
        document.querySelectorAll(".priority-cell").forEach(cell => 
            cell.classList.toggle("hidden", !showPriority)
        );
    }
    
    algorithmSelect.addEventListener("change", handleAlgorithmChange);
    
    // Render process table
    function renderProcesses() {
        processTable.innerHTML = "";
        const showPriority = algorithmSelect.value.includes("priority");
        
        for (let i = 0; i < processCount; i++) {
            const tr = document.createElement("tr");
            
            // Process ID
            const tdId = document.createElement("td");
            tdId.className = "border p-2 dark:border-gray-600";
            tdId.textContent = `P${i + 1}`;
            tr.appendChild(tdId);
            
            // Arrival Time
            const tdArrival = document.createElement("td");
            tdArrival.className = "border p-2 dark:border-gray-600";
            const arrivalInput = document.createElement("input");
            arrivalInput.type = "number";
            arrivalInput.min = "0";
            arrivalInput.className = "arrival-time p-2 w-20 border rounded-md dark:bg-gray-600 dark:border-gray-500";
            arrivalInput.value = i;
            tdArrival.appendChild(arrivalInput);
            tr.appendChild(tdArrival);
            
            // Burst Time
            const tdBurst = document.createElement("td");
            tdBurst.className = "border p-2 dark:border-gray-600";
            const burstInput = document.createElement("input");
            burstInput.type = "number";
            burstInput.min = "1";
            burstInput.className = "burst-time p-2 w-20 border rounded-md dark:bg-gray-600 dark:border-gray-500";
            burstInput.value = Math.floor(Math.random() * 5) + 1;
            tdBurst.appendChild(burstInput);
            tr.appendChild(tdBurst);
            
            // Priority (conditionally shown)
            const tdPriority = document.createElement("td");
            tdPriority.className = `border p-2 dark:border-gray-600 priority-cell ${showPriority ? "" : "hidden"}`;
            const priorityInput = document.createElement("input");
            priorityInput.type = "number";
            priorityInput.min = "1";
            priorityInput.className = "priority p-2 w-20 border rounded-md dark:bg-gray-600 dark:border-gray-500";
            priorityInput.value = i + 1;
            tdPriority.appendChild(priorityInput);
            tr.appendChild(tdPriority);
            
            processTable.appendChild(tr);
        }
    }
    
    // Get processes from input table
    function getProcesses() {
        const processes = [];
        const arrivalInputs = document.querySelectorAll(".arrival-time");
        const burstInputs = document.querySelectorAll(".burst-time");
        const priorityInputs = document.querySelectorAll(".priority");
        
        for (let i = 0; i < processCount; i++) {
            const process = {
                id: `P${i + 1}`,
                arrivalTime: parseInt(arrivalInputs[i].value) || 0,
                burstTime: parseInt(burstInputs[i].value) || 1,
            };
            
            if (algorithmSelect.value.includes("priority")) {
                process.priority = parseInt(priorityInputs[i].value) || 1;
            }
            
            processes.push(process);
        }
        
        return processes;
    }
    
    // Run simulation
    function runSimulation() {
        const algorithm = algorithmSelect.value;
        const processes = getProcesses();
        const contextSwitchTime = parseInt(contextSwitchInput.value) || 0;
        
        // Validate inputs
        if (processes.some(p => isNaN(p.arrivalTime) || isNaN(p.burstTime))) {
            alert("Please enter valid numbers for all fields");
            return;
        }
        
        if (algorithm.includes("priority") && processes.some(p => isNaN(p.priority))) {
            alert("Please enter valid priority values");
            return;
        }
        
        let results;
        
        try {
            switch (algorithm) {
                case "fcfs":
                    results = scheduler.fcfs(processes, contextSwitchTime);
                    break;
                case "sjf":
                    results = scheduler.sjf(processes, contextSwitchTime);
                    break;
                case "srtf":
                    results = scheduler.srtf(processes, contextSwitchTime);
                    break;
                case "priority-np":
                    results = scheduler.priorityNP(processes, contextSwitchTime);
                    break;
                case "priority-p":
                    results = scheduler.priorityP(processes, contextSwitchTime);
                    break;
                case "rr":
                    const quantum = parseInt(quantumInput.value) || 2;
                    if (quantum <= 0) {
                        alert("Time quantum must be positive");
                        return;
                    }
                    results = scheduler.roundRobin(processes, quantum, contextSwitchTime);
                    break;
                default:
                    alert("Invalid algorithm selected");
                    return;
            }
            
            updateResults(results);
        } catch (error) {
            console.error("Simulation error:", error);
            alert("An error occurred during simulation. Please check your inputs.");
        }
    }
    
    // Update results in UI
    function updateResults({ results, ganttChart: gantt }) {
        // Update output table
        outputTable.innerHTML = "";
        results.forEach(p => {
            const tr = document.createElement("tr");
            
            const tdId = document.createElement("td");
            tdId.className = "border p-2 dark:border-gray-500";
            tdId.textContent = p.id;
            tr.appendChild(tdId);
            
            const tdArrival = document.createElement("td");
            tdArrival.className = "border p-2 dark:border-gray-500";
            tdArrival.textContent = p.arrivalTime;
            tr.appendChild(tdArrival);
            
            const tdBurst = document.createElement("td");
            tdBurst.className = "border p-2 dark:border-gray-500";
            tdBurst.textContent = p.burstTime;
            tr.appendChild(tdBurst);
            
            const tdCompletion = document.createElement("td");
            tdCompletion.className = "border p-2 dark:border-gray-500";
            tdCompletion.textContent = p.completionTime;
            tr.appendChild(tdCompletion);
            
            const tdTAT = document.createElement("td");
            tdTAT.className = "border p-2 dark:border-gray-500";
            tdTAT.textContent = p.turnAroundTime;
            tr.appendChild(tdTAT);
            
            const tdWT = document.createElement("td");
            tdWT.className = "border p-2 dark:border-gray-500";
            tdWT.textContent = p.waitingTime;
            tr.appendChild(tdWT);
            
            outputTable.appendChild(tr);
        });
        
        // Update Gantt chart
        updateGanttChart(gantt);
        
        // Update performance metrics
        avgTATElement.textContent = scheduler.performanceMetrics.avgTAT || "-";
        avgWTElement.textContent = scheduler.performanceMetrics.avgWT || "-";
        totalTimeElement.textContent = scheduler.performanceMetrics.totalTime || "-";
        throughputElement.textContent = scheduler.performanceMetrics.throughput || "-";
    }
    
    // Update Gantt chart
    function updateGanttChart(gantt) {
        if (!gantt || gantt.length === 0) {
            ganttChart.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 w-full py-10">No processes scheduled</div>';
            renderGanttChart3D([]); // Clear 3D chart
            return;
        }
        
        ganttChart.innerHTML = "";
        
        // Create color palette for processes
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
        ];
        
        const processColors = {};
        gantt.forEach((item, index) => {
            if (!processColors[item.process]) {
                processColors[item.process] = colors[Object.keys(processColors).length % colors.length];
            }
            
            const duration = item.end - item.start;
            const width = Math.max(60, duration * 30); // Minimum width of 60px
            
            const block = document.createElement("div");
            block.className = `gantt-block ${processColors[item.process]} text-white text-center p-2 mx-1 rounded-md shadow-md flex flex-col items-center justify-center`;
            block.style.minWidth = `${width}px`;
            
            const processSpan = document.createElement("span");
            processSpan.className = "font-bold";
            processSpan.textContent = item.process;
            
            const timeSpan = document.createElement("span");
            timeSpan.className = "text-xs";
            timeSpan.textContent = `${item.start}-${item.end}`;
            
            const durationSpan = document.createElement("span");
            durationSpan.className = "text-xs";
            durationSpan.textContent = `${duration} unit${duration !== 1 ? 's' : ''}`;
            
            block.appendChild(processSpan);
            block.appendChild(timeSpan);
            block.appendChild(durationSpan);
            
            ganttChart.appendChild(block);
        });
        
        // Render 3D Gantt chart
        renderGanttChart3D(gantt);
    }
    
    // Event listeners
    increaseBtn.addEventListener("click", () => {
        if (processCount < 10) { // Limit to 10 processes
            processCount++;
            processCountDisplay.textContent = processCount;
            renderProcesses();
        } else {
            alert("Maximum of 10 processes allowed");
        }
    });
    
    decreaseBtn.addEventListener("click", () => {
        if (processCount > 1) {
            processCount--;
            processCountDisplay.textContent = processCount;
            renderProcesses();
        }
    });
    
    runBtn.addEventListener("click", runSimulation);
    
    resetBtn.addEventListener("click", () => {
        processCount = 3;
        processCountDisplay.textContent = processCount;
        renderProcesses();
        
        // Reset results
        outputTable.innerHTML = `
            <tr>
                <td colspan="6" class="p-4 text-gray-500 dark:text-gray-400">Results will appear here after simulation</td>
            </tr>`;
        
        ganttChart.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 w-full py-10">Gantt chart will appear here after simulation</div>`;
        
        // Reset performance metrics
        avgTATElement.textContent = "-";
        avgWTElement.textContent = "-";
        totalTimeElement.textContent = "-";
        throughputElement.textContent = "-";
        
        // Reset 3D Gantt chart
        renderGanttChart3D([]);
    });
    
    // Initial render
    handleAlgorithmChange();
    renderProcesses();
});