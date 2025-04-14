// CPU Scheduling Algorithms Module
export class CPUScheduler {
    constructor() {
        this.processes = [];
        this.results = [];
        this.ganttChart = [];
        this.performanceMetrics = {};
    }

    // FCFS Algorithm
    fcfs(processes, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        
        for (const process of processes) {
            if (currentTime < process.arrivalTime) {
                currentTime = process.arrivalTime;
            }
            
            ganttChart.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.burstTime
            });
            
            const completionTime = currentTime + process.burstTime;
            const turnAroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnAroundTime - process.burstTime;
            
            results.push({
                ...process,
                completionTime,
                turnAroundTime,
                waitingTime
            });
            
            currentTime = completionTime + contextSwitchTime;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // SJF (Non-preemptive) Algorithm
    sjf(processes, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        const queue = [];
        let i = 0;
        
        while (i < processes.length || queue.length > 0) {
            while (i < processes.length && processes[i].arrivalTime <= currentTime) {
                queue.push(processes[i]);
                i++;
            }
            
            if (queue.length === 0) {
                currentTime = processes[i].arrivalTime;
                continue;
            }
            
            queue.sort((a, b) => a.burstTime - b.burstTime);
            const process = queue.shift();
            
            ganttChart.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.burstTime
            });
            
            const completionTime = currentTime + process.burstTime;
            const turnAroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnAroundTime - process.burstTime;
            
            results.push({
                ...process,
                completionTime,
                turnAroundTime,
                waitingTime
            });
            
            currentTime = completionTime + contextSwitchTime;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // SRTF (Preemptive SJF) Algorithm
    srtf(processes, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        const queue = [];
        let i = 0;
        let currentProcess = null;
        let remainingTime = 0;
        
        while (i < processes.length || queue.length > 0 || currentProcess !== null) {
            while (i < processes.length && processes[i].arrivalTime <= currentTime) {
                queue.push({ ...processes[i], remainingTime: processes[i].burstTime });
                i++;
            }
            
            queue.sort((a, b) => a.remainingTime - b.remainingTime);
            
            if (currentProcess !== null && queue.length > 0 && queue[0].remainingTime < remainingTime) {
                // Preempt current process
                if (currentTime > ganttChart[ganttChart.length - 1].start) {
                    ganttChart[ganttChart.length - 1].end = currentTime;
                }
                queue.push({ ...currentProcess, remainingTime });
                currentProcess = queue.shift();
                remainingTime = currentProcess.remainingTime;
            } else if (currentProcess === null && queue.length > 0) {
                currentProcess = queue.shift();
                remainingTime = currentProcess.remainingTime;
            }
            
            if (currentProcess !== null) {
                if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
                    ganttChart.push({
                        process: currentProcess.id,
                        start: currentTime,
                        end: currentTime + 1
                    });
                } else {
                    ganttChart[ganttChart.length - 1].end = currentTime + 1;
                }
                
                remainingTime--;
                if (remainingTime === 0) {
                    const completionTime = currentTime + 1;
                    const turnAroundTime = completionTime - currentProcess.arrivalTime;
                    const waitingTime = turnAroundTime - currentProcess.burstTime;
                    
                    results.push({
                        ...currentProcess,
                        completionTime,
                        turnAroundTime,
                        waitingTime,
                        burstTime: currentProcess.burstTime // Original burst time
                    });
                    
                    currentProcess = null;
                    currentTime = completionTime + contextSwitchTime;
                    continue;
                }
            }
            
            currentTime++;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // Priority Scheduling (Non-preemptive)
    priorityNP(processes, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        const queue = [];
        let i = 0;
        
        while (i < processes.length || queue.length > 0) {
            while (i < processes.length && processes[i].arrivalTime <= currentTime) {
                queue.push(processes[i]);
                i++;
            }
            
            if (queue.length === 0) {
                currentTime = processes[i].arrivalTime;
                continue;
            }
            
            queue.sort((a, b) => a.priority - b.priority);
            const process = queue.shift();
            
            ganttChart.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.burstTime
            });
            
            const completionTime = currentTime + process.burstTime;
            const turnAroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnAroundTime - process.burstTime;
            
            results.push({
                ...process,
                completionTime,
                turnAroundTime,
                waitingTime
            });
            
            currentTime = completionTime + contextSwitchTime;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // Priority Scheduling (Preemptive)
    priorityP(processes, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        const queue = [];
        let i = 0;
        let currentProcess = null;
        let remainingTime = 0;
        
        while (i < processes.length || queue.length > 0 || currentProcess !== null) {
            while (i < processes.length && processes[i].arrivalTime <= currentTime) {
                queue.push({ ...processes[i], remainingTime: processes[i].burstTime });
                i++;
            }
            
            queue.sort((a, b) => a.priority - b.priority);
            
            if (currentProcess !== null && queue.length > 0 && queue[0].priority < currentProcess.priority) {
                // Preempt current process
                if (currentTime > ganttChart[ganttChart.length - 1].start) {
                    ganttChart[ganttChart.length - 1].end = currentTime;
                }
                queue.push({ ...currentProcess, remainingTime });
                currentProcess = queue.shift();
                remainingTime = currentProcess.remainingTime;
            } else if (currentProcess === null && queue.length > 0) {
                currentProcess = queue.shift();
                remainingTime = currentProcess.remainingTime;
            }
            
            if (currentProcess !== null) {
                if (ganttChart.length === 0 || ganttChart[ganttChart.length - 1].process !== currentProcess.id) {
                    ganttChart.push({
                        process: currentProcess.id,
                        start: currentTime,
                        end: currentTime + 1
                    });
                } else {
                    ganttChart[ganttChart.length - 1].end = currentTime + 1;
                }
                
                remainingTime--;
                if (remainingTime === 0) {
                    const completionTime = currentTime + 1;
                    const turnAroundTime = completionTime - currentProcess.arrivalTime;
                    const waitingTime = turnAroundTime - currentProcess.burstTime;
                    
                    results.push({
                        ...currentProcess,
                        completionTime,
                        turnAroundTime,
                        waitingTime,
                        burstTime: currentProcess.burstTime // Original burst time
                    });
                    
                    currentProcess = null;
                    currentTime = completionTime + contextSwitchTime;
                    continue;
                }
            }
            
            currentTime++;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // Round Robin Algorithm
    roundRobin(processes, quantum, contextSwitchTime = 0) {
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const results = [];
        const ganttChart = [];
        const queue = [];
        let i = 0;
        let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
        
        while (i < remainingProcesses.length || queue.length > 0) {
            while (i < remainingProcesses.length && remainingProcesses[i].arrivalTime <= currentTime) {
                queue.push(remainingProcesses[i]);
                i++;
            }
            
            if (queue.length === 0) {
                if (i < remainingProcesses.length) {
                    currentTime = remainingProcesses[i].arrivalTime;
                    continue;
                } else {
                    break;
                }
            }
            
            const process = queue.shift();
            const executionTime = Math.min(quantum, process.remainingTime);
            
            ganttChart.push({
                process: process.id,
                start: currentTime,
                end: currentTime + executionTime
            });
            
            process.remainingTime -= executionTime;
            currentTime += executionTime;
            
            // Add newly arrived processes to the queue
            while (i < remainingProcesses.length && remainingProcesses[i].arrivalTime <= currentTime) {
                queue.push(remainingProcesses[i]);
                i++;
            }
            
            if (process.remainingTime > 0) {
                queue.push(process);
            } else {
                const completionTime = currentTime;
                const turnAroundTime = completionTime - process.arrivalTime;
                const waitingTime = turnAroundTime - process.burstTime;
                
                results.push({
                    ...process,
                    completionTime,
                    turnAroundTime,
                    waitingTime,
                    burstTime: process.burstTime // Original burst time
                });
            }
            
            currentTime += contextSwitchTime;
        }
        
        this.calculatePerformanceMetrics(results);
        return { results, ganttChart };
    }

    // Calculate performance metrics
    calculatePerformanceMetrics(results) {
        if (results.length === 0) return;
        
        const totalTAT = results.reduce((sum, p) => sum + p.turnAroundTime, 0);
        const totalWT = results.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalTime = Math.max(...results.map(p => p.completionTime));
        const throughput = results.length / totalTime;
        
        this.performanceMetrics = {
            avgTAT: (totalTAT / results.length).toFixed(2),
            avgWT: (totalWT / results.length).toFixed(2),
            totalTime,
            throughput: throughput.toFixed(4)
        };
    }
}