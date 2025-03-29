document.addEventListener("DOMContentLoaded", () => {
    const processTable = document.getElementById("processTable");
    const outputTable = document.getElementById("outputTable");
    const ganttChart = document.getElementById("ganttChart");
    const processCountDisplay = document.getElementById("processCount");
    const runBtn = document.getElementById("runBtn");
    const resetBtn = document.getElementById("resetBtn");

    let processCount = 3;
    const timeQuantum = 2; // Time quantum for Round Robin

    function renderProcesses() {
        processTable.innerHTML = "";
        for (let i = 0; i < processCount; i++) {
            processTable.innerHTML += `
                <tr>
                    <td class="border p-2">P${i + 1}</td>
                    <td class="border p-2"><input type="number" class="arrival-time p-2 w-20 border rounded-md" value="0"></td>
                    <td class="border p-2"><input type="number" class="burst-time p-2 w-20 border rounded-md" value="1"></td>
                </tr>`;
        }
    }

    function runSimulation() {
        const processes = [];
        const arrivalInputs = document.querySelectorAll(".arrival-time");
        const burstInputs = document.querySelectorAll(".burst-time");

        for (let i = 0; i < processCount; i++) {
            processes.push({
                id: `P${i + 1}`,
                arrivalTime: parseInt(arrivalInputs[i].value),
                burstTime: parseInt(burstInputs[i].value),
                remainingTime: parseInt(burstInputs[i].value),
                completionTime: 0,
                turnAroundTime: 0,
                waitingTime: 0,
            });
        }

        // Sort by Arrival Time initially
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

        let currentTime = 0;
        let queue = [];
        let ganttOrder = [];
        let executionTimes = [];
        let completed = 0;

        let i = 0;
        while (completed < processCount) {
            while (i < processCount && processes[i].arrivalTime <= currentTime) {
                queue.push(processes[i]);
                i++;
            }

            if (queue.length === 0) {
                currentTime++;
                continue;
            }

            let process = queue.shift(); // Get the next process from the queue
            let executionTime = Math.min(timeQuantum, process.remainingTime);
            ganttOrder.push(process.id);
            executionTimes.push(currentTime);

            process.remainingTime -= executionTime;
            currentTime += executionTime;

            if (process.remainingTime > 0) {
                queue.push(process); // If not completed, re-add to the queue
            } else {
                completed++;
                process.completionTime = currentTime;
                process.turnAroundTime = process.completionTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.burstTime;
            }
        }
        executionTimes.push(currentTime);

        // Update Output Table
        outputTable.innerHTML = "";
        processes.forEach(p => {
            outputTable.innerHTML += `
                <tr>
                    <td class="border p-2">${p.id}</td>
                    <td class="border p-2">${p.arrivalTime}</td>
                    <td class="border p-2">${p.burstTime}</td>
                    <td class="border p-2">${p.completionTime}</td>
                    <td class="border p-2">${p.turnAroundTime}</td>
                    <td class="border p-2">${p.waitingTime}</td>
                </tr>`;
        });

        // Update Gantt Chart
        ganttChart.innerHTML = "";
        for (let j = 0; j < ganttOrder.length; j++) {
            ganttChart.innerHTML += `<div class="bg-green-400 text-white text-center p-2 w-20 mx-1 rounded-md shadow-md">
                ${ganttOrder[j]}<br>${executionTimes[j]} - ${executionTimes[j + 1]}
            </div>`;
        }
    }

    document.getElementById("increaseProcess").addEventListener("click", () => {
        processCount++;
        processCountDisplay.textContent = processCount;
        renderProcesses();
    });

    document.getElementById("decreaseProcess").addEventListener("click", () => {
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
    });

    renderProcesses();
});
